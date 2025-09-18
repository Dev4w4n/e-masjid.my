package security

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestFormatConstants(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		host                 string
		path                 string
		expectedManagerRole  string
		expectedUserRole     string
		expectedClientId     string
		expectedServer       string
		expectedJWKSURL      string
	}{
		{
			host:                 "subdomain1.masjid.com",
			path:                 "/testName/apiname/endpoint",
			expectedManagerRole:  "SUBDOMAIN1_MANAGER",
			expectedUserRole:     "SUBDOMAIN1_USER",
			expectedClientId:     "subdomain1-auth",
			expectedServer:       "https://loginv2.e-masjid.my/realms/subdomain1/protocol/openid-connect/userinfo",
			expectedJWKSURL:      "https://loginv2.e-masjid.my/realms/subdomain1/protocol/openid-connect/certs",
		},
		{
			host:                 "subdomain2.masjid.com",
			path:                 "/anotherName/apiname2/endpoint2",
			expectedManagerRole:  "SUBDOMAIN2_MANAGER",
			expectedUserRole:     "SUBDOMAIN2_USER",
			expectedClientId:     "subdomain2-auth",
			expectedServer:       "https://loginv2.e-masjid.my/realms/subdomain2/protocol/openid-connect/userinfo",
			expectedJWKSURL:      "https://loginv2.e-masjid.my/realms/subdomain2/protocol/openid-connect/certs",
		},
	}

	for _, tt := range tests {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		req, _ := http.NewRequest("GET", tt.path, nil)
		req.Host = tt.host
		c.Request = req

		formatConstants(c)

		assert.Equal(t, tt.expectedManagerRole, formattedSettings.ManagerRole)
		assert.Equal(t, tt.expectedUserRole, formattedSettings.UserRole)
		assert.Equal(t, tt.expectedClientId, formattedSettings.KeycloakClientId)
		assert.Equal(t, tt.expectedServer, formattedSettings.KeycloakServer)
		assert.Equal(t, tt.expectedJWKSURL, formattedSettings.KeycloakJWKSURL)
	}
}