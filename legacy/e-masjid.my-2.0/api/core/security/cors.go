package security

import (
	"strings"
)

// Function to check if the origin matches the allowed pattern
func IsAllowedOrigin(origin, pattern string) bool {
	if pattern == "" {
		return false
	}

	if pattern == "*" {
		return true
	}

	if strings.HasPrefix(pattern, "*.") {
		domain := strings.TrimPrefix(pattern, "*.")
		if strings.HasSuffix(origin, domain) && (len(origin) == len(domain) || origin[len(origin)-len(domain)-1] == '.') {
			return true
		}
	}

	return false
}