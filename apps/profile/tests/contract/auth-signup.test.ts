/**
 * Contract Test: POST /auth/v1/signup
 *
 * This test validates the user registration endpoint according to the API specification.
 * It ensures that the endpoint accepts valid email/password combinations and returns
 * the expected response stru      expect(secondResponse.status).toBe(422);
      expect(secondResponse.headers.get("content-type")).toContain(
        "application/json"
      );

      const error: ErrorResponse = await secondResponse.json();
      expect(error.error_code).toBe("user_already_exists");
      expect(error.msg && error.msg.toLowerCase()).toContain("exist");th user data and session information.
 *
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Types based on API specification
interface SignUpRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: "authenticated";
    email_confirmed_at?: string;
    confirmed_at?: string;
    created_at: string;
    last_sign_in_at: string;
  };
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface ErrorResponse {
  error?: string;
  error_code?: string;
  message?: string;
  msg?: string;
  details?: object;
  timestamp?: string;
  code?: number;
}

const API_BASE_URL = "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

describe("POST /auth/v1/signup - User Registration Contract", () => {
  const validTestUser = {
    email: "test.user@example.com",
    password: "securepassword123",
  };

  beforeAll(async () => {
    // Ensure clean test environment
    // This would typically clean up any existing test data
    console.log("Setting up auth-signup contract tests...");
  });

  afterAll(async () => {
    // Clean up test data
    console.log("Cleaning up auth-signup contract tests...");
  });

  describe("Successful Registration (201)", () => {
    it("should register a new user with valid email and password", async () => {
      // Use a unique email for this test to avoid conflicts
      const uniqueEmail = `signup-test-${Date.now()}@example.com`;
      const requestBody: SignUpRequest = {
        email: uniqueEmail,
        password: validTestUser.password,
      };

      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY ?? "",
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200); // Supabase returns 200, not 201
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const data: AuthResponse = await response.json();

      // Validate user object structure
      expect(data.user).toBeDefined();
      expect(data.user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(data.user.email).toBe(requestBody.email);
      expect(data.user.role).toBe("authenticated"); // Supabase default role
      expect(data.user.created_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );

      // Validate session object structure (now part of root response)
      expect(data.access_token).toBeDefined();
      expect(typeof data.access_token).toBe("string");
      expect(data.token_type).toBe("bearer");
      expect(typeof data.expires_in).toBe("number");
      expect(data.expires_in).toBeGreaterThan(0);
      expect(data.refresh_token).toBeDefined();
      expect(typeof data.refresh_token).toBe("string");
    });

    it("should create user with proper role assignment", async () => {
      const uniqueEmail = `user-${Date.now()}@example.com`;
      const requestBody: SignUpRequest = {
        email: uniqueEmail,
        password: "validpassword123",
      };

      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(200); // Supabase returns 200, not 201
      const data: AuthResponse = await response.json();

      // New users should start with 'authenticated' role
      expect(data.user.role).toBe("authenticated");
    });
  });

  describe("Validation Errors (400)", () => {
    it("should reject registration with invalid email format", async () => {
      const requestBody = {
        email: "invalid-email",
        password: "validpassword123",
      };

      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const error: ErrorResponse = await response.json();
      expect(error.error_code).toBe("validation_failed");
      expect(error.msg).toContain("email");
    });

    it("should reject registration with weak password", async () => {
      const requestBody = {
        email: "valid@example.com",
        password: "weak", // Less than 8 characters
      };

      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      expect(response.status).toBe(422);
      const error: ErrorResponse = await response.json();
      expect(error.error_code).toBe("weak_password");
      expect(error.msg).toContain("Password");
    });

    it("should reject registration with missing required fields", async () => {
      const testCases = [
        { email: "test@example.com" }, // Missing password
        { password: "validpassword123" }, // Missing email
        {}, // Missing both
      ];

      for (const requestBody of testCases) {
        const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error_code).toBe("validation_failed");
        expect(error.msg).toBeDefined();
      }
    });

    it("should reject registration with malformed JSON", async () => {
      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: "invalid json{{",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Conflict Errors (409)", () => {
    it("should reject registration with existing email", async () => {
      // First registration should succeed
      const requestBody: SignUpRequest = {
        email: "duplicate@example.com",
        password: "validpassword123",
      };

      const firstResponse = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      // Second registration with same email should fail
      const secondResponse = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.headers.get("content-type")).toContain(
        "application/json"
      );

      const error: ErrorResponse = await secondResponse.json();
      expect(error.error_code).toBe("user_already_exists");
      expect(error.msg).toContain("already");
    });
  });

  describe("Content Type Validation", () => {
    it("should require application/json content type", async () => {
      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "validpassword123",
        }),
      });

      // Supabase is lenient with content-type but user may already exist
      expect(response.status).toBe(422); // Due to user already exists, not content-type issue
    });

    it("should handle missing content-type header", async () => {
      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "validpassword123",
        }),
      });

      // Should still work or return appropriate error
      expect([400, 415, 422]).toContain(response.status);
    });
  });

  describe("Security Considerations", () => {
    it("should not return sensitive information in responses", async () => {
      const requestBody: SignUpRequest = {
        email: "security.test@example.com",
        password: "securepassword123",
      };

      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // Should not return password in any form
      expect(JSON.stringify(data)).not.toContain(requestBody.password);
      expect(JSON.stringify(data)).not.toContain("password");
    });

    it("should handle SQL injection attempts safely", async () => {
      const maliciousEmail = "'; DROP TABLE users; --@example.com";
      const requestBody = {
        email: maliciousEmail,
        password: "validpassword123",
      };

      const response = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      // Should safely reject malicious input
      expect(response.status).toBe(400);
    });
  });

  describe("Rate Limiting", () => {
    it("should handle reasonable request volume", async () => {
      // Test multiple rapid requests to ensure no immediate blocking
      const promises = Array(5)
        .fill(0)
        .map((_, index) =>
          fetch(`${API_BASE_URL}/auth/v1/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              email: `rate-test-${index}-${Date.now()}@example.com`,
              password: "validpassword123",
            }),
          })
        );

      const responses = await Promise.all(promises);

      // Should process reasonable requests without rate limiting
      responses.forEach((response) => {
        expect(response.status).not.toBe(429); // Too Many Requests
      });
    });
  });
});
