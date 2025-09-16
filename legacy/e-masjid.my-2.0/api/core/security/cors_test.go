package security

import (
	"testing"
)

func TestIsAllowedOrigin(t *testing.T) {
	tests := []struct {
		origin  string
		pattern string
		want    bool
	}{
		// Test cases
		{"http://sub.e-masjid.my", "*.e-masjid.my", true},
		{"https://sub.e-masjid.my", "*.e-masjid.my", true},
		{"http://another.sub.e-masjid.my", "*.e-masjid.my", true},
		{"http://allowed.com", "*", true},
		{"http://sub.allowed.com", "*", true},
		{"http://localhost:3000", "*", true},
		{"http://localhost:8080", "*", true},
		{"http://e-masjid.my", "e-masjid.my", false},
		{"http://e-masjid.my", "*.e-masjid.my", false},
		{"http://fb.facebook.com", "*.e-masjid.my", false},
		{"https://fb.facebook.com", "*.e-masjid.my", false},
		{"http://notallowed.com", "*.e-masjid.my", false},
		{"http://sub.otherdomain.com", "*.e-masjid.my", false},
		{"http://sub.e-masjid.my", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.origin, func(t *testing.T) {
			if got := IsAllowedOrigin(tt.origin, tt.pattern); got != tt.want {
				t.Errorf("IsAllowedOrigin(%q, %q) = %v; want %v", tt.origin, tt.pattern, got, tt.want)
			}
		})
	}
}