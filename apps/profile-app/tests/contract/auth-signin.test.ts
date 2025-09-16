/**
 * Contract Test: POST /auth/sign-in
 * 
 * This test validates the user authentication endpoint according to the API specification.
 * It ensures that the endpoint accepts valid email/password combinations for existing users
 * and returns the expected response structure with user data and session information.
 * 
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Types based on API specification
interface SignInRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'super_admin' | 'masjid_admin' | 'registered' | 'public';
    email_verified: boolean;
    created_at: string;
    last_sign_in_at: string;
  };
  session: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  };
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: object;
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:54321';

describe('POST /auth/sign-in - User Authentication Contract', () => {
  const testUser = {
    email: 'signin.test@example.com',
    password: 'testpassword123'
  };

  beforeAll(async () => {
    // Setup: Create a test user for sign-in tests
    console.log('Setting up auth-signin contract tests...');
    
    // Register test user first
    await fetch(`${API_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
  });

  afterAll(async () => {
    // Clean up test data
    console.log('Cleaning up auth-signin contract tests...');
  });

  describe('Successful Authentication (200)', () => {
    it('should authenticate user with valid credentials', async () => {
      const requestBody: SignInRequest = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data: AuthResponse = await response.json();

      // Validate user object structure
      expect(data.user).toBeDefined();
      expect(data.user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(data.user.email).toBe(requestBody.email);
      expect(['super_admin', 'masjid_admin', 'registered', 'public']).toContain(data.user.role);
      expect(typeof data.user.email_verified).toBe('boolean');
      expect(data.user.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(data.user.last_sign_in_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Validate session object structure
      expect(data.session).toBeDefined();
      expect(data.session.access_token).toBeDefined();
      expect(typeof data.session.access_token).toBe('string');
      expect(data.session.access_token.length).toBeGreaterThan(0);
      expect(data.session.token_type).toBe('bearer');
      expect(typeof data.session.expires_in).toBe('number');
      expect(data.session.expires_in).toBeGreaterThan(0);
      expect(data.session.refresh_token).toBeDefined();
      expect(typeof data.session.refresh_token).toBe('string');
    });

    it('should update last_sign_in_at timestamp', async () => {
      const requestBody: SignInRequest = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200);
      const data: AuthResponse = await response.json();
      
      // last_sign_in_at should be recent (within last minute)
      const lastSignIn = new Date(data.user.last_sign_in_at);
      const now = new Date();
      const diffInMinutes = (now.getTime() - lastSignIn.getTime()) / (1000 * 60);
      
      expect(diffInMinutes).toBeLessThan(1);
    });

    it('should handle case-insensitive email addresses', async () => {
      const requestBody: SignInRequest = {
        email: testUser.email.toUpperCase(),
        password: testUser.password
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200);
      const data: AuthResponse = await response.json();
      expect(data.user.email).toBe(testUser.email.toLowerCase());
    });
  });

  describe('Authentication Failures (401)', () => {
    it('should reject sign-in with non-existent email', async () => {
      const requestBody: SignInRequest = {
        email: 'nonexistent@example.com',
        password: 'anypassword123'
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(401);
      expect(response.headers.get('content-type')).toContain('application/json');

      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('unauthorized');
      expect(error.message).toBeDefined();
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should reject sign-in with incorrect password', async () => {
      const requestBody: SignInRequest = {
        email: testUser.email,
        password: 'wrongpassword123'
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('unauthorized');
      expect(error.message).toBeDefined();
    });

    it('should reject sign-in with empty password', async () => {
      const requestBody: SignInRequest = {
        email: testUser.email,
        password: ''
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('unauthorized');
    });
  });

  describe('Validation Errors (400)', () => {
    it('should reject sign-in with invalid email format', async () => {
      const requestBody = {
        email: 'invalid-email-format',
        password: 'validpassword123'
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe('validation_error');
      expect(error.message).toContain('email');
    });

    it('should reject sign-in with missing required fields', async () => {
      const testCases = [
        { email: 'test@example.com' }, // Missing password
        { password: 'validpassword123' }, // Missing email
        {} // Missing both
      ];

      for (const requestBody of testCases) {
        const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe('validation_error');
        expect(error.message).toBeDefined();
      }
    });

    it('should reject malformed JSON payload', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json content{{'
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Security Requirements', () => {
    it('should not expose authentication details in error responses', async () => {
      const requestBody: SignInRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      
      // Should not expose password or internal auth details
      expect(responseText).not.toContain(requestBody.password);
      expect(responseText).not.toContain('hash');
      expect(responseText).not.toContain('bcrypt');
      expect(responseText).not.toContain('salt');
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousPayload = {
        email: "admin'; DROP TABLE users; --@example.com",
        password: "' OR '1'='1"
      };

      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(maliciousPayload)
      });

      // Should safely handle and reject malicious input
      expect([400, 401]).toContain(response.status);
    });

    it('should implement proper timing for authentication attempts', async () => {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Authentication should take reasonable time (not instant to prevent timing attacks)
      expect(duration).toBeGreaterThan(100); // At least 100ms
      expect(response.status).toBe(401);
    });
  });

  describe('Content Type Validation', () => {
    it('should require application/json content type', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      expect(response.status).toBe(400);
    });

    it('should handle missing content-type header appropriately', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      // Should return appropriate error for missing content type
      expect([400, 415]).toContain(response.status);
    });
  });

  describe('Rate Limiting and Brute Force Protection', () => {
    it('should handle multiple failed attempts appropriately', async () => {
      const invalidRequest = {
        email: testUser.email,
        password: 'definitelywrong'
      };

      // Make multiple failed attempts
      const attempts = Array(3).fill(0).map(() =>
        fetch(`${API_BASE_URL}/auth/sign-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invalidRequest)
        })
      );

      const responses = await Promise.all(attempts);
      
      // All should fail with 401
      responses.forEach(response => {
        expect(response.status).toBe(401);
      });

      // But should not immediately rate limit (would need more sophisticated testing)
      // This is a basic check - production would implement proper rate limiting
    });

    it('should handle reasonable successful request volume', async () => {
      // Test that legitimate users can sign in multiple times
      const promises = Array(3).fill(0).map(() =>
        fetch(`${API_BASE_URL}/auth/sign-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        })
      );

      const responses = await Promise.all(promises);
      
      // Should allow reasonable number of legitimate requests
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('No Authentication Required', () => {
    it('should not require any authentication headers', async () => {
      // According to API spec, /auth/sign-in has security: [] (no auth required)
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      expect(response.status).toBe(200);
    });

    it('should ignore bearer tokens if provided', async () => {
      // Should work even if bearer token is provided (but not required)
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      expect(response.status).toBe(200);
    });
  });
});
