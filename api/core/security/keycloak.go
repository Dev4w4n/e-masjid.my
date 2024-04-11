package security

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
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
	keycloakServer   = "https://login.e-masjid.my/realms/%s/protocol/openid-connect/userinfo"
	keycloakJWKSURL  = "https://login.e-masjid.my/realms/%s/protocol/openid-connect/certs"
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
	requiredRoles := []string{formattedSettings.ManagerRole, formattedSettings.UserRole}
	if !hasAnyRole(roles, requiredRoles) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		c.Abort()
		return
	}

	c.Next()
}

func formatConstants(c *gin.Context) {
	c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, "/")
	formattedSettings.ManagerRole = fmt.Sprintf(managerRole, c.Request.URL.Path)
	formattedSettings.UserRole = fmt.Sprintf(managerRole, c.Request.URL.Path)
	formattedSettings.KeycloakClientId = fmt.Sprintf(managerRole, c.Request.URL.Path)
	formattedSettings.KeycloakServer = fmt.Sprintf(managerRole, c.Request.URL.Path)
	formattedSettings.KeycloakJWKSURL = fmt.Sprintf(managerRole, c.Request.URL.Path)
}

func validateToken(token string) (bool, []string) {
	client := resty.New()
	resp, err := client.R().
		SetHeader("Authorization", "Bearer "+token).
		Get(formattedSettings.KeycloakServer)

	if err != nil {
		fmt.Println("Error validating token:", err)
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
		fmt.Println("Invalid JWT format")
		return nil
	}

	// Decode the second part (payload) of the JWT
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		fmt.Println("Error decoding JWT payload:", err)
		return nil
	}

	// Parse the payload into CustomClaims struct
	var customClaims CustomClaims
	if err := json.Unmarshal(payload, &customClaims); err != nil {
		fmt.Println("Error decoding custom claims:", err)
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
