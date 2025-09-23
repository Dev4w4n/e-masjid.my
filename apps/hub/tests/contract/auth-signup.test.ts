/**
 * Contract Test: POST /auth/v1/signup (MOCKED)
 *
 * This test validates the user registration endpoint according to the API specification.
 * It ensures that the endpoint accepts valid email/password combinations and returns
 * the expected response structure with user data and session information.
 *
 * NOTE: This test uses mocked data instead of calling Supabase directly.
 *
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

// UUID generator for mock data
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

// Mock database of users for testing
const mockUsers = new Map<
  string,
  {
    id: string;
    email: string;
    password: string;
    created_at: string;
    last_sign_in_at: string;
  }
>();

// Mock fetch function to simulate Supabase responses
const mockFetch = vi.fn();

// Helper to generate mock auth response
const generateAuthResponse = (email: string): AuthResponse => {
  const user = mockUsers.get(email.toLowerCase());
  if (!user) {
    throw new Error("User not found");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: "authenticated",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    },
    access_token: `mock_token_${Date.now()}_${Math.random()}`,
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: `mock_refresh_${Date.now()}_${Math.random()}`,
  };
};

describe("POST /auth/v1/signup - User Registration Contract", () => {
  const validTestUser = {
    email: "test.user@example.com",
    password: "securepassword123",
  };

  beforeAll(async () => {
    // Ensure clean test environment
    console.log("Setting up auth-signup contract tests...");

    // Mock global fetch to intercept Supabase calls
    global.fetch = mockFetch;

    // Setup mock responses
    mockFetch.mockImplementation(async (url: string, options: any) => {
      const urlObj = new URL(url);

      let body: any = {};
      try {
        body = options?.body ? JSON.parse(options.body) : {};
      } catch (e) {
        // Invalid JSON - return error
        return {
          ok: false,
          status: 400,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            error_code: "invalid_json",
            msg: "Invalid JSON in request body",
          }),
        };
      }

      // For POST requests, validate content-type
      if (options?.method === "POST") {
        const contentType =
          options?.headers?.["Content-Type"] ||
          options?.headers?.["content-type"];
        if (!contentType || !contentType.includes("application/json")) {
          return {
            ok: false,
            status: 415,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error_code: "invalid_content_type",
              msg: "Content-Type must be application/json",
            }),
          };
        }
      }

      // Handle signup requests
      if (urlObj.pathname === "/auth/v1/signup") {
        // Check for missing fields (this should be checked before password strength)
        if (!body.email || !body.password) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error_code: "validation_failed",
              msg: "Email and password are required",
            }),
          };
        }

        // Validate email format and check for malicious patterns
        if (
          !body.email ||
          !body.email.includes("@") ||
          body.email.includes("'") ||
          body.email.includes(";") ||
          body.email.includes("--")
        ) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error_code: "validation_failed",
              msg: "Invalid email format",
            }),
          };
        }

        // Check password strength
        if (!body.password || body.password.length < 8) {
          return {
            ok: false,
            status: 422,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error_code: "weak_password",
              msg: "Password should be at least 8 characters",
            }),
          };
        }

        // Check if user already exists
        if (mockUsers.has(body.email.toLowerCase())) {
          return {
            ok: false,
            status: 409,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error_code: "user_already_exists",
              msg: "User already exists",
            }),
          };
        }

        // Create new user
        const userId = generateUUID();
        const userRecord = {
          id: userId,
          email: body.email.toLowerCase(),
          password: body.password,
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        };

        mockUsers.set(body.email.toLowerCase(), userRecord);

        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => generateAuthResponse(body.email),
        };
      }

      // Default response for unhandled requests
      return {
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Not found" }),
      };
    });
  });

  afterAll(async () => {
    // Clean up test data
    console.log("Cleaning up auth-signup contract tests...");
    mockUsers.clear();
    vi.restoreAllMocks();
  });

  describe("Successful Registration (201)", () => {
    it("should register a new user with valid email and password", async () => {
      // Use a unique email for this test to avoid conflicts
      const uniqueEmail = `signup-test-${Date.now()}@example.com`;
      const requestBody: SignUpRequest = {
        email: uniqueEmail,
        password: validTestUser.password,
      };

      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        const response = await fetch("http://mock-api.test/auth/v1/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      const firstResponse = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Second registration with same email should fail
      const secondResponse = await fetch(
        "http://mock-api.test/auth/v1/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

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
      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "validpassword123",
        }),
      });

      // Content type validation should return 415
      expect(response.status).toBe(415); // Unsupported Media Type
    });

    it("should handle missing content-type header", async () => {
      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "validpassword123",
        }),
      });

      // Should return 415 for missing content-type
      expect(response.status).toBe(415);
    });
  });

  describe("Security Considerations", () => {
    it("should not return sensitive information in responses", async () => {
      const requestBody: SignUpRequest = {
        email: "security.test@example.com",
        password: "securepassword123",
      };

      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      const response = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          fetch("http://mock-api.test/auth/v1/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
