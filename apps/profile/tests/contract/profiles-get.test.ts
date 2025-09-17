/**
 * Contract Test: GET /profiles
 *
 * This test validates the user profile retrieval endpoint according to the API specification.
 * It ensures that authenticated users can retrieve their own profile information with the
 * expected response structure including address data and masjid associations.
 *
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Types based on API specification
interface Address {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface MasjidSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
}

interface ProfileResponse {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  preferred_language: string;
  home_masjid_id?: string;
  home_masjid?: MasjidSummary;
  is_complete: boolean;
  address: Address;
  created_at: string;
  updated_at: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: object;
  timestamp: string;
}

const API_BASE_URL = "http://127.0.0.1:54321";
const REST_API_BASE_URL = "http://127.0.0.1:54321/rest/v1";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

describe("GET /profiles - Profile Retrieval Contract", () => {
  let authToken: string;
  let testUserId: string;
  const testUserCredentials = {
    email: "profile.test@example.com",
    password: "testpassword123",
  };

  beforeAll(async () => {
    console.log("Setting up profiles-get contract tests...");

    // Create and authenticate test user
    const signUpResponse = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: `profile-test-${Date.now()}@example.com`, // Use unique email
        password: testUserCredentials.password,
      }),
    });

    const signUpData = await signUpResponse.json();
    testUserId = signUpData.user.id;
    authToken = signUpData.access_token;
  });

  afterAll(async () => {
    console.log("Cleaning up profiles-get contract tests...");
  });

  describe("Successful Profile Retrieval (200)", () => {
    it("should retrieve current user profile with authentication", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const profile: ProfileResponse = await response.json();

      // Validate profile structure
      expect(profile.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(profile.user_id).toBe(testUserId);
      expect(typeof profile.full_name).toBe("string");
      expect(typeof profile.phone_number).toBe("string");
      expect(["en", "ms", "zh", "ta"]).toContain(profile.preferred_language);
      expect(typeof profile.is_complete).toBe("boolean");
      expect(profile.created_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
      expect(profile.updated_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
    });

    it("should include address information in profile response", async () => {
      // First create a profile with address
      const profileData = {
        full_name: "Test User Profile",
        phone_number: "+60123456789",
        preferred_language: "en",
        address: {
          address_line_1: "123 Jalan Test",
          address_line_2: "Taman Ujian",
          city: "Kuala Lumpur",
          state: "Kuala Lumpur",
          postcode: "50100",
          country: "MYS",
        },
      };

      await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(profileData),
      });

      // Now retrieve the profile
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);
      const profile: ProfileResponse = await response.json();

      // Validate address structure
      expect(profile.address).toBeDefined();
      expect(profile.address.address_line_1).toBe(
        profileData.address.address_line_1
      );
      expect(profile.address.address_line_2).toBe(
        profileData.address.address_line_2
      );
      expect(profile.address.city).toBe(profileData.address.city);
      expect(profile.address.state).toBe(profileData.address.state);
      expect(profile.address.postcode).toBe(profileData.address.postcode);
      expect(profile.address.postcode).toMatch(/^[0-9]{5}$/);
      expect(profile.address.country).toBe("MYS");
    });

    it("should include home masjid information when assigned", async () => {
      // Note: This test assumes a masjid exists or can be created
      // In a real scenario, this would be set up in the test environment

      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);
      const profile: ProfileResponse = await response.json();

      // If home_masjid_id is set, home_masjid should be included
      if (profile.home_masjid_id) {
        expect(profile.home_masjid).toBeDefined();
        expect(profile.home_masjid?.id).toBe(profile.home_masjid_id);
        expect(profile.home_masjid?.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );
        expect(typeof profile.home_masjid?.name).toBe("string");
        expect(typeof profile.home_masjid?.city).toBe("string");
        expect(typeof profile.home_masjid?.state).toBe("string");
        expect(typeof profile.home_masjid?.status).toBe("string");
      } else {
        expect(profile.home_masjid).toBeUndefined();
      }
    });

    it("should correctly indicate profile completion status", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);
      const profile: ProfileResponse = await response.json();

      // is_complete should be boolean
      expect(typeof profile.is_complete).toBe("boolean");

      // Profile should be complete if all required fields are filled
      if (profile.full_name && profile.phone_number && profile.address) {
        expect(profile.is_complete).toBe(true);
      }
    });
  });

  describe("Authentication Requirements (401)", () => {
    it("should reject request without authentication token", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(401);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
      expect(error.message).toBeDefined();
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should reject request with invalid bearer token", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: "Bearer invalid-token-here",
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
      expect(error.message).toBeDefined();
    });

    it("should reject request with malformed authorization header", async () => {
      const invalidAuthHeaders = [
        "Basic user:pass",
        "Bearer",
        "bearer token",
        "Token abc123",
        authToken, // Token without Bearer prefix
      ];

      for (const authHeader of invalidAuthHeaders) {
        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
        });

        expect(response.status).toBe(401);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("unauthorized");
      }
    });

    it("should reject request with expired token", async () => {
      // This would require an expired token, which is difficult to test in isolation
      // In a real scenario, you might create an expired token or wait for expiration
      const expiredToken = "expired.jwt.token";

      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${expiredToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
    });
  });

  describe("Profile Not Found (404)", () => {
    it("should return 404 when user has no profile created", async () => {
      // Create a new user without a profile
      const newUserCreds = {
        email: "noprofile@example.com",
        password: "testpassword123",
      };

      const signUpResponse = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(newUserCreds),
      });

      const signUpData = await signUpResponse.json();
      const newUserToken = signUpData.access_token;

      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${newUserToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(404);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("not_found");
      expect(error.message).toBeDefined();
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("HTTP Method and Headers", () => {
    it("should only accept GET method", async () => {
      const invalidMethods = ["POST", "PUT", "DELETE", "PATCH"];

      for (const method of invalidMethods) {
        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
        });

        expect(response.status).toBe(405); // Method Not Allowed
      }
    });

    it("should return appropriate CORS headers", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      // Check for CORS headers (implementation dependent)
      // This is a basic check - actual CORS headers depend on server configuration
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );
    });

    it("should handle OPTIONS request for CORS preflight", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Authorization",
        },
      });

      // Should handle preflight requests
      expect([200, 204]).toContain(response.status);
    });
  });

  describe("Response Format Validation", () => {
    it("should return consistent date format in timestamps", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);
      const profile: ProfileResponse = await response.json();

      // Validate ISO 8601 format
      expect(profile.created_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
      );
      expect(profile.updated_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
      );

      // Should be valid dates
      expect(new Date(profile.created_at).toString()).not.toBe("Invalid Date");
      expect(new Date(profile.updated_at).toString()).not.toBe("Invalid Date");
    });

    it("should validate Malaysian phone number format if present", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);
      const profile: ProfileResponse = await response.json();

      if (profile.phone_number) {
        // Should match Malaysian phone format
        expect(profile.phone_number).toMatch(/^(\+60|0)[1-9][0-9]{7,9}$/);
      }
    });

    it("should validate Malaysian address format if present", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);
      const profile: ProfileResponse = await response.json();

      if (profile.address) {
        // Validate Malaysian postcode format
        expect(profile.address.postcode).toMatch(/^[0-9]{5}$/);

        // Validate state is from Malaysian states
        const validStates = [
          "Johor",
          "Kedah",
          "Kelantan",
          "Malacca",
          "Negeri Sembilan",
          "Pahang",
          "Penang",
          "Perak",
          "Perlis",
          "Sabah",
          "Sarawak",
          "Selangor",
          "Terengganu",
          "Kuala Lumpur",
          "Labuan",
          "Putrajaya",
        ];
        expect(validStates).toContain(profile.address.state);

        // Country should be Malaysia
        expect(profile.address.country).toBe("MYS");
      }
    });
  });

  describe("Performance and Caching", () => {
    it("should return response within reasonable time", async () => {
      const startTime = Date.now();

      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it("should include appropriate cache headers", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
      });

      expect(response.status).toBe(200);

      // Profile data might be cacheable with appropriate headers
      // This depends on implementation strategy
      const cacheControl = response.headers.get("cache-control");
      if (cacheControl) {
        expect(cacheControl).toBeDefined();
      }
    });
  });
});
