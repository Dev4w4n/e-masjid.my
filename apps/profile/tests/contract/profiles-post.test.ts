/**
 * Contract Test: POST /profiles
 *
 * This test validates the user profile creation endpoint according to the API specification.
 * It ensures that authenticated users can create their profile with proper Malaysian validation
 * for phone numbers, addresses, and postcodes.
 *
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Types based on API specification
interface Address {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state:
    | "Johor"
    | "Kedah"
    | "Kelantan"
    | "Malacca"
    | "Negeri Sembilan"
    | "Pahang"
    | "Penang"
    | "Perak"
    | "Perlis"
    | "Sabah"
    | "Sarawak"
    | "Selangor"
    | "Terengganu"
    | "Kuala Lumpur"
    | "Labuan"
    | "Putrajaya";
  postcode: string;
  country: string;
}

interface CreateProfileRequest {
  full_name: string;
  phone_number: string;
  preferred_language: "en" | "ms" | "zh" | "ta";
  home_masjid_id?: string;
  address: Address;
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
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

describe("POST /profiles - Profile Creation Contract", () => {
  let authToken: string;
  let testUserId: string;
  const testUserCredentials = {
    email: "profilecreate.test@example.com",
    password: "testpassword123",
  };

  const validProfileData: CreateProfileRequest = {
    full_name: "Ahmad bin Abdullah",
    phone_number: "+60123456789",
    preferred_language: "en",
    address: {
      address_line_1: "123 Jalan Utama",
      address_line_2: "Taman Harmoni",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postcode: "50100",
      country: "MYS",
    },
  };

  beforeAll(async () => {
    console.log("Setting up profiles-post contract tests...");

    // Create and authenticate test user
    const signUpResponse = await fetch(`${API_BASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: `profilecreate-test-${Date.now()}@example.com`, // Use unique email
        password: testUserCredentials.password,
      }),
    });

    const signUpData = await signUpResponse.json();
    testUserId = signUpData.user.id;
    authToken = signUpData.access_token;
  });

  afterAll(async () => {
    console.log("Cleaning up profiles-post contract tests...");
  });

  describe("Successful Profile Creation (201)", () => {
    it("should create profile with valid Malaysian data", async () => {
      // Use the RPC function for profile completion
      const response = await fetch(
        `${REST_API_BASE_URL}/rpc/complete_user_profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            profile_data: {
              full_name: validProfileData.full_name,
              phone_number: validProfileData.phone_number,
              preferred_language: validProfileData.preferred_language,
              home_masjid_id: validProfileData.home_masjid_id,
            },
            address_data: {
              address_line_1: validProfileData.address.address_line_1,
              address_line_2: validProfileData.address.address_line_2,
              city: validProfileData.address.city,
              state: validProfileData.address.state,
              postcode: validProfileData.address.postcode,
              country: validProfileData.address.country,
            },
          }),
        }
      );

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
      expect(profile.full_name).toBe(validProfileData.full_name);
      expect(profile.phone_number).toBe(validProfileData.phone_number);
      expect(profile.preferred_language).toBe(
        validProfileData.preferred_language
      );
      expect(profile.is_complete).toBe(true);
      expect(profile.created_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
      expect(profile.updated_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );

      // Validate address data
      expect(profile.address.address_line_1).toBe(
        validProfileData.address.address_line_1
      );
      expect(profile.address.address_line_2).toBe(
        validProfileData.address.address_line_2
      );
      expect(profile.address.city).toBe(validProfileData.address.city);
      expect(profile.address.state).toBe(validProfileData.address.state);
      expect(profile.address.postcode).toBe(validProfileData.address.postcode);
      expect(profile.address.country).toBe(validProfileData.address.country);
    });

    it("should create profile with minimal required fields", async () => {
      // Create new user for this test
      const newUserCreds = {
        email: "minimal.profile@example.com",
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

      const minimalProfile: CreateProfileRequest = {
        full_name: "Siti Aminah",
        phone_number: "0123456789",
        preferred_language: "ms",
        address: {
          address_line_1: "456 Jalan Baru",
          city: "Johor Bahru",
          state: "Johor",
          postcode: "80100",
          country: "MYS",
        },
      };

      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${newUserToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(minimalProfile),
      });

      expect(response.status).toBe(201);
      const profile: ProfileResponse = await response.json();

      expect(profile.full_name).toBe(minimalProfile.full_name);
      expect(profile.phone_number).toBe(minimalProfile.phone_number);
      expect(profile.preferred_language).toBe(
        minimalProfile.preferred_language
      );
      expect(profile.is_complete).toBe(true);
    });

    it("should set default language when not specified", async () => {
      // Create new user for this test
      const newUserCreds = {
        email: "defaultlang@example.com",
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

      const profileWithoutLang = {
        full_name: "Test User",
        phone_number: "+60987654321",
        address: {
          address_line_1: "789 Jalan Default",
          city: "Penang",
          state: "Penang",
          postcode: "10450",
          country: "MYS",
        },
        // preferred_language omitted
      };

      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${newUserToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(profileWithoutLang),
      });

      expect(response.status).toBe(201);
      const profile: ProfileResponse = await response.json();

      // Should default to 'en' as per API spec
      expect(profile.preferred_language).toBe("en");
    });
  });

  describe("Malaysian Validation Tests", () => {
    it("should validate Malaysian phone number formats", async () => {
      const validPhoneNumbers = [
        "+60123456789", // Mobile with country code
        "+60387654321", // Landline with country code
        "0123456789", // Mobile without country code
        "0387654321", // Landline without country code
        "+601234567890", // Longer mobile number
      ];

      for (const phoneNumber of validPhoneNumbers) {
        const profileData = {
          ...validProfileData,
          phone_number: phoneNumber,
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(201);
      }
    });

    it("should reject invalid Malaysian phone number formats", async () => {
      const invalidPhoneNumbers = [
        "+1234567890", // Non-Malaysian country code
        "12345678", // Too short
        "+60012345678", // Invalid area code (starts with 0)
        "1234567890", // No country code, doesn't start with 0
        "+60 12 345 6789", // Contains spaces
        "+60-123-456-789", // Contains dashes
        "abc123456789", // Contains letters
      ];

      for (const phoneNumber of invalidPhoneNumbers) {
        const profileData = {
          ...validProfileData,
          phone_number: phoneNumber,
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toContain("phone");
      }
    });

    it("should validate Malaysian postcode format", async () => {
      const validPostcodes = ["50100", "10450", "80100", "93350", "01000"];

      for (const postcode of validPostcodes) {
        const profileData = {
          ...validProfileData,
          address: {
            ...validProfileData.address,
            postcode,
          },
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(201);
      }
    });

    it("should reject invalid postcode formats", async () => {
      const invalidPostcodes = [
        "1234",
        "123456",
        "ABC12",
        "12AB3",
        " 50100",
        "50100 ",
      ];

      for (const postcode of invalidPostcodes) {
        const profileData = {
          ...validProfileData,
          address: {
            ...validProfileData.address,
            postcode,
          },
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toContain("postcode");
      }
    });

    it("should validate Malaysian states", async () => {
      const validStates: Array<Address["state"]> = [
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

      for (const state of validStates) {
        const profileData = {
          ...validProfileData,
          address: {
            ...validProfileData.address,
            state,
          },
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(201);
      }
    });

    it("should reject invalid states", async () => {
      const invalidStates = [
        "Singapore",
        "Jakarta",
        "Bangkok",
        "Invalid State",
      ];

      for (const state of invalidStates) {
        const profileData = {
          ...validProfileData,
          address: {
            ...validProfileData.address,
            state: state as any,
          },
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toContain("state");
      }
    });
  });

  describe("Validation Errors (400)", () => {
    it("should reject profile with missing required fields", async () => {
      const incompleteProfiles = [
        { ...validProfileData, full_name: undefined },
        { ...validProfileData, phone_number: undefined },
        { ...validProfileData, address: undefined },
        {
          ...validProfileData,
          address: { ...validProfileData.address, address_line_1: undefined },
        },
        {
          ...validProfileData,
          address: { ...validProfileData.address, city: undefined },
        },
        {
          ...validProfileData,
          address: { ...validProfileData.address, state: undefined },
        },
        {
          ...validProfileData,
          address: { ...validProfileData.address, postcode: undefined },
        },
      ];

      for (const incompleteProfile of incompleteProfiles) {
        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(incompleteProfile),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toBeDefined();
      }
    });

    it("should reject profile with invalid field lengths", async () => {
      const invalidLengthProfiles = [
        {
          ...validProfileData,
          full_name: "A", // Too short (minLength: 2)
        },
        {
          ...validProfileData,
          full_name: "A".repeat(256), // Too long (maxLength: 255)
        },
        {
          ...validProfileData,
          address: {
            ...validProfileData.address,
            address_line_1: "A".repeat(256), // Too long (maxLength: 255)
          },
        },
        {
          ...validProfileData,
          address: {
            ...validProfileData.address,
            city: "A".repeat(101), // Too long (maxLength: 100)
          },
        },
      ];

      for (const invalidProfile of invalidLengthProfiles) {
        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(invalidProfile),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
      }
    });

    it("should reject profile with invalid language codes", async () => {
      const invalidLanguages = ["fr", "de", "jp", "invalid"];

      for (const language of invalidLanguages) {
        const profileData = {
          ...validProfileData,
          preferred_language: language as any,
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toContain("language");
      }
    });

    it("should reject malformed JSON", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: "invalid json{{",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Authentication Requirements (401)", () => {
    it("should reject profile creation without authentication", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(validProfileData),
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
    });

    it("should reject profile creation with invalid token", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid-token",
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(validProfileData),
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
    });
  });

  describe("Conflict Errors (409)", () => {
    it("should reject creation of duplicate profile for same user", async () => {
      // Create new user
      const newUserCreds = {
        email: "duplicate.profile@example.com",
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

      // First profile creation should succeed
      const firstResponse = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${newUserToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(validProfileData),
      });

      expect(firstResponse.status).toBe(201);

      // Second profile creation should fail
      const secondResponse = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${newUserToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(validProfileData),
      });

      expect(secondResponse.status).toBe(409);
      const error: ErrorResponse = await secondResponse.json();
      expect(error.error).toBe("conflict");
      expect(error.message).toContain("profile");
    });
  });

  describe("Content Type Validation", () => {
    it("should require application/json content type", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(validProfileData),
      });

      expect(response.status).toBe(400);
    });

    it("should handle missing content-type header", async () => {
      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(validProfileData),
      });

      expect([400, 415]).toContain(response.status);
    });
  });

  describe("Unicode and Internationalization", () => {
    it("should handle Unicode characters in names", async () => {
      const unicodeNames = [
        "عبد الله بن أحمد", // Arabic
        "李小明", // Chinese
        "முஹம்மது அலி", // Tamil
        "José María", // Spanish with accents
        "François Müller", // French/German with accents
      ];

      for (const name of unicodeNames) {
        const profileData = {
          ...validProfileData,
          full_name: name,
        };

        const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(profileData),
        });

        expect(response.status).toBe(201);
        const profile: ProfileResponse = await response.json();
        expect(profile.full_name).toBe(name);
      }
    });

    it("should handle Unicode characters in addresses", async () => {
      const unicodeAddress = {
        ...validProfileData.address,
        address_line_1: "جالان الحرمين",
        address_line_2: "花园城市",
        city: "كوالا لومبور",
      };

      const profileData = {
        ...validProfileData,
        address: unicodeAddress,
      };

      const response = await fetch(`${REST_API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(profileData),
      });

      expect(response.status).toBe(201);
      const profile: ProfileResponse = await response.json();
      expect(profile.address.address_line_1).toBe(
        unicodeAddress.address_line_1
      );
      expect(profile.address.address_line_2).toBe(
        unicodeAddress.address_line_2
      );
      expect(profile.address.city).toBe(unicodeAddress.city);
    });
  });
});
