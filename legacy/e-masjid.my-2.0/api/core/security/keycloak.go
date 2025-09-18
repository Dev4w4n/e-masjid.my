package security

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/golang-jwt/jwt"
)

const (
	managerRole      = "%s_MANAGER"
	userRole         = "%s_USER"
	keycloakClientId = "%s-auth"
	keycloakServer   = "https://loginv2.e-masjid.my/realms/%s/protocol/openid-connect/userinfo"
	keycloakJWKSURL  = "https://loginv2.e-masjid.my/realms/%s/protocol/openid-connect/certs"
)

type FormattedSettings struct {
	ManagerRole      string
	UserRole         string
	KeycloakClientId string
	KeycloakServer   string
	KeycloakJWKSURL  string
}

var formattedSettings FormattedSettings

type CustomClaims struct {
	ResourceAccess map[string]struct {
		Roles []string `json:"roles"`
	} `json:"resource_access"`
	jwt.StandardClaims
}

func AuthMiddleware(c *gin.Context) {
	formatConstants(c)

	token := c.GetHeader("Authorization")

	token = strings.TrimPrefix(token, "Bearer ")

	// Dummy validation logic, replace with actual validation
	isValid, roles := validateToken(token)
	if !isValid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	// Check if the user has the required roles
	log.Printf("\nCheck if the user has the required roles: %s & %s", formattedSettings.ManagerRole, formattedSettings.UserRole)
	requiredRoles := []string{formattedSettings.ManagerRole, formattedSettings.UserRole}
	if !hasAnyRole(roles, requiredRoles) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		c.Abort()
		return
	}

	c.Next()
}

func formatConstants(c *gin.Context) {
	hostParts := strings.Split(c.Request.Host, ".")
	if len(hostParts) < 1 {
		log.Printf("Invalid host: %s", c.Request.Host)
		return
	}
	subdomain := hostParts[0]
	log.Printf("\nFormatting for subdomain: %s", subdomain)
	
	formattedSettings.ManagerRole = fmt.Sprintf(managerRole, strings.ToUpper(subdomain))
	formattedSettings.UserRole = fmt.Sprintf(userRole, strings.ToUpper(subdomain))
	formattedSettings.KeycloakClientId = fmt.Sprintf(keycloakClientId, subdomain)
	formattedSettings.KeycloakServer = fmt.Sprintf(keycloakServer, subdomain)
	formattedSettings.KeycloakJWKSURL = fmt.Sprintf(keycloakJWKSURL, subdomain)

	log.Printf("\nFormatted settings: %s", formattedSettings)
}

func validateToken(token string) (bool, []string) {
	client := resty.New()
	resp, err := client.R().
		SetHeader("Authorization", "Bearer "+token).
		Get(formattedSettings.KeycloakServer)

	if err != nil {
		log.Printf("Error validating token: %s", err)
		return false, nil
	}

	if resp.StatusCode() != http.StatusOK {
		return false, nil
	}

	// Extract roles from the token or any other relevant information
	roles := extractRolesFromToken(token)

	return true, roles
}

func extractRolesFromToken(jwtToken string) []string {
	// Split the JWT into its three parts
	parts := strings.Split(jwtToken, ".")
	if len(parts) != 3 {
		log.Printf("Invalid JWT format")
		return nil
	}

	// Decode the second part (payload) of the JWT
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		log.Printf("Error decoding JWT payload: %s", err)
		return nil
	}

	// Parse the payload into CustomClaims struct
	var customClaims CustomClaims
	if err := json.Unmarshal(payload, &customClaims); err != nil {
		log.Printf("Error decoding custom claims: %s", err)
		return nil
	}

	// Extract roles from the custom claims
	if resourceAccess, ok := customClaims.ResourceAccess[formattedSettings.KeycloakClientId]; ok {
		return resourceAccess.Roles
	}

	return nil
}

func hasAnyRole(userRoles, requiredRoles []string) bool {
	for _, requiredRole := range requiredRoles {
		for _, userRole := range userRoles {
			if userRole == requiredRole {
				return true
			}
		}
	}
	return false
}
