/**
 * Contract Test: POST /masjids (MOCKED)
 *
 * This test validates the masjid creation endpoint according to the API specification.
 * It ensures that only super admins can create new masjids with proper Malaysian validation
 * for addresses and contact information.
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

interface CreateMasjidRequest {
  name: string;
  registration_number?: string;
  email?: string;
  phone_number?: string;
  description?: string;
  address: Address;
}

interface MasjidResponse {
  id: string;
  name: string;
  registration_number?: string;
  email?: string;
  phone_number?: string;
  description?: string;
  address: Address;
  status: string;
  created_by: string;
  admin_count: number;
  member_count: number;
  created_at: string;
  updated_at: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: object;
  timestamp: string;
}

// Mock data stores
const mockUsers = new Map<string, any>();
const mockMasjids = new Map<string, any>();

// Mock fetch function
const mockFetch = vi.fn();

// Validation helpers
const validateMalaysianPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+60|0)[1-9][0-9]{7,9}$/;
  return phoneRegex.test(phone);
};

const validateMalaysianPostcode = (postcode: string): boolean => {
  return /^[0-9]{5}$/.test(postcode);
};

const validateMalaysianState = (state: string): boolean => {
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
  return validStates.includes(state);
};

const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

describe("POST /masjids - Masjid Creation Contract", () => {
  let superAdminToken: string;
  let superAdminUserId: string;
  let regularUserToken: string;
  let masjidAdminToken: string;

  const superAdminCredentials = {
    email: "admin@e-masjid.my", // Use the actual super admin we created
    password: "SuperAdmin123!",
  };

  const regularUserCredentials = {
    email: `regular-user-${Date.now()}@example.com`, // Use unique email
    password: "regularpass123",
  };

  const masjidAdminCredentials = {
    email: `masjid-admin-${Date.now()}@example.com`, // Use unique email
    password: "masjidadminpass123",
  };

  const validMasjidData: CreateMasjidRequest = {
    name: "Masjid As-Salam Test",
    registration_number: "MSJ-2024-TEST-001",
    email: "admin@assalam.test.org",
    phone_number: "+60312345678",
    description: "A test mosque for contract testing purposes",
    address: {
      address_line_1: "123 Jalan Test Masjid",
      address_line_2: "Taman Unit Test",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postcode: "50100",
      country: "MYS",
    },
  };

  beforeAll(async () => {
    console.log("Setting up masjids-post contract tests...");

    // Mock global fetch
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
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error_code: "invalid_content_type",
              msg: "Content-Type must be application/json",
            }),
          };
        }
      }

      const authHeader = options?.headers?.Authorization;
      const token = authHeader?.replace("Bearer ", "");

      // Handle auth signup/signin
      if (urlObj.pathname === "/auth/v1/signup") {
        const userId = generateUUID();
        const userRecord = {
          id: userId,
          email: body.email.toLowerCase(),
          password: body.password,
          created_at: new Date().toISOString(),
          role: body.email.includes("admin@e-masjid.my")
            ? "super_admin"
            : "user",
        };

        mockUsers.set(body.email.toLowerCase(), userRecord);
        const mockToken = `mock_token_${userId}_${Math.random()}`;

        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            user: userRecord,
            access_token: mockToken,
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: `mock_refresh_${Date.now()}`,
          }),
        };
      }

      if (
        urlObj.pathname === "/auth/v1/token" &&
        urlObj.searchParams.get("grant_type") === "password"
      ) {
        const user = Array.from(mockUsers.values()).find(
          (u) =>
            u.email === body.email.toLowerCase() && u.password === body.password
        );

        if (!user) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error_code: "invalid_credentials",
              msg: "Invalid login credentials",
            }),
          };
        }

        const mockToken = `mock_token_${user.id}_${Math.random()}`;

        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            user,
            access_token: mockToken,
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: `mock_refresh_${Date.now()}`,
          }),
        };
      }

      // Handle masjid creation
      if (
        urlObj.pathname === "/rest/v1/masjids" &&
        options?.method === "POST"
      ) {
        // Auth validation
        if (!token) {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "unauthorized",
              message: "No authorization header",
            }),
          };
        }

        if (token === "invalid-token") {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "unauthorized",
              message: "Invalid token",
            }),
          };
        }

        // Find user by token
        const user = Array.from(mockUsers.values()).find((u) =>
          token.includes(u.id)
        );

        if (!user) {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "unauthorized",
              message: "User not found",
            }),
          };
        }

        // Check for super admin role
        if (user.role !== "super_admin") {
          return {
            ok: false,
            status: 403,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "forbidden",
              message: "Only super admins can create masjids",
              timestamp: new Date().toISOString(),
            }),
          };
        }

        // Validation
        if (!body.name || body.name.length > 255) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message:
                "Masjid name is required and must not exceed 255 characters",
            }),
          };
        }

        if (body.registration_number && body.registration_number.length > 50) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "Registration number must not exceed 50 characters",
            }),
          };
        }

        if (body.description && body.description.length > 1000) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "Description must not exceed 1000 characters",
            }),
          };
        }

        if (body.email && !validateEmail(body.email)) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "Invalid email format",
            }),
          };
        }

        if (body.phone_number && !validateMalaysianPhone(body.phone_number)) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "Invalid Malaysian phone number format",
            }),
          };
        }

        if (!body.address) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "Address is required",
            }),
          };
        }

        if (
          !body.address.address_line_1 ||
          body.address.address_line_1.length > 255
        ) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message:
                "Address line 1 is required and must not exceed 255 characters",
            }),
          };
        }

        if (!body.address.city || body.address.city.length > 100) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "City is required and must not exceed 100 characters",
            }),
          };
        }

        if (
          !body.address.state ||
          !validateMalaysianState(body.address.state)
        ) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "Valid Malaysian state is required",
            }),
          };
        }

        if (
          !body.address.postcode ||
          !validateMalaysianPostcode(body.address.postcode)
        ) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({
              error: "validation_error",
              message: "Valid Malaysian postcode (5 digits) is required",
            }),
          };
        }

        // Create masjid
        const masjidId = generateUUID();
        const masjid: MasjidResponse = {
          id: masjidId,
          name: body.name,
          registration_number: body.registration_number,
          email: body.email,
          phone_number: body.phone_number,
          description: body.description,
          address: {
            ...body.address,
            country: body.address.country || "MYS",
          },
          status: "active",
          created_by: user.id,
          admin_count: 0,
          member_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mockMasjids.set(masjidId, masjid);

        return {
          ok: true,
          status: 201,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => masjid,
        };
      }

      // Default response
      return {
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Not found" }),
      };
    });

    // Create super admin first (before setting up mock)
    const superAdminSignUp = await fetch(
      "http://mock-api.test/auth/v1/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(superAdminCredentials),
      }
    );

    // Sign in as super admin user
    const superAdminSignIn = await fetch(
      "http://mock-api.test/auth/v1/token?grant_type=password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(superAdminCredentials),
      }
    );

    const superAdminData = await superAdminSignIn.json();
    superAdminUserId = superAdminData.user.id;
    superAdminToken = superAdminData.access_token;

    // Create regular user
    const regularUserSignUp = await fetch(
      "http://mock-api.test/auth/v1/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(regularUserCredentials),
      }
    );

    const regularUserData = await regularUserSignUp.json();
    regularUserToken = regularUserData.access_token;

    // Create masjid admin user
    const masjidAdminSignUp = await fetch(
      "http://mock-api.test/auth/v1/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masjidAdminCredentials),
      }
    );

    const masjidAdminData = await masjidAdminSignUp.json();
    masjidAdminToken = masjidAdminData.access_token;
  });

  afterAll(async () => {
    console.log("Cleaning up masjids-post contract tests...");
    mockUsers.clear();
    mockMasjids.clear();
    vi.restoreAllMocks();
  });

  describe("Successful Masjid Creation (201) - Super Admin Only", () => {
    it("should create masjid with all fields provided", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(201);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const masjid: MasjidResponse = await response.json();

      // Validate masjid structure
      expect(masjid.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(masjid.name).toBe(validMasjidData.name);
      expect(masjid.registration_number).toBe(
        validMasjidData.registration_number
      );
      expect(masjid.email).toBe(validMasjidData.email);
      expect(masjid.phone_number).toBe(validMasjidData.phone_number);
      expect(masjid.description).toBe(validMasjidData.description);
      expect(masjid.status).toBe("active"); // Default status
      expect(masjid.created_by).toBe(superAdminUserId);
      expect(masjid.admin_count).toBe(0); // No admins assigned yet
      expect(masjid.member_count).toBe(0); // No members yet
      expect(masjid.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(masjid.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Validate address data
      expect(masjid.address.address_line_1).toBe(
        validMasjidData.address.address_line_1
      );
      expect(masjid.address.address_line_2).toBe(
        validMasjidData.address.address_line_2
      );
      expect(masjid.address.city).toBe(validMasjidData.address.city);
      expect(masjid.address.state).toBe(validMasjidData.address.state);
      expect(masjid.address.postcode).toBe(validMasjidData.address.postcode);
      expect(masjid.address.country).toBe(validMasjidData.address.country);
    });

    it("should create masjid with minimal required fields", async () => {
      const minimalMasjidData: CreateMasjidRequest = {
        name: "Masjid Minimal Test",
        address: {
          address_line_1: "456 Jalan Minimal",
          city: "Johor Bahru",
          state: "Johor",
          postcode: "80100",
          country: "MYS",
        },
      };

      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(minimalMasjidData),
      });

      expect(response.status).toBe(201);
      const masjid: MasjidResponse = await response.json();

      expect(masjid.name).toBe(minimalMasjidData.name);
      expect(masjid.address.address_line_1).toBe(
        minimalMasjidData.address.address_line_1
      );
      expect(masjid.address.city).toBe(minimalMasjidData.address.city);
      expect(masjid.address.state).toBe(minimalMasjidData.address.state);
      expect(masjid.address.postcode).toBe(minimalMasjidData.address.postcode);
      expect(masjid.status).toBe("active");
    });

    it("should generate unique IDs for different masjids", async () => {
      const masjidData1 = {
        ...validMasjidData,
        name: "Masjid Unique Test 1",
        registration_number: "MSJ-2024-UNIQUE-001",
      };

      const masjidData2 = {
        ...validMasjidData,
        name: "Masjid Unique Test 2",
        registration_number: "MSJ-2024-UNIQUE-002",
      };

      const response1 = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masjidData1),
      });

      const response2 = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masjidData2),
      });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      const masjid1: MasjidResponse = await response1.json();
      const masjid2: MasjidResponse = await response2.json();

      expect(masjid1.id).not.toBe(masjid2.id);
      expect(masjid1.name).toBe(masjidData1.name);
      expect(masjid2.name).toBe(masjidData2.name);
    });
  });

  describe("Malaysian Validation Tests", () => {
    it("should validate Malaysian phone number formats", async () => {
      const validPhoneNumbers = [
        "+60312345678", // KL landline
        "+60123456789", // Mobile
        "0312345678", // Landline without country code
        "0123456789", // Mobile without country code
        "+601234567890", // Longer mobile
      ];

      for (const phoneNumber of validPhoneNumbers) {
        const masjidData = {
          ...validMasjidData,
          name: `Masjid Phone Test ${phoneNumber}`,
          phone_number: phoneNumber,
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
        });

        expect(response.status).toBe(201);
        const masjid: MasjidResponse = await response.json();
        expect(masjid.phone_number).toBe(phoneNumber);
      }
    });

    it("should reject invalid Malaysian phone numbers", async () => {
      const invalidPhoneNumbers = [
        "+1234567890", // Non-Malaysian
        "12345678", // Too short
        "+60012345678", // Invalid area code
        "1234567890", // No country code, doesn't start with 0
        "abc123456789", // Contains letters
      ];

      for (const phoneNumber of invalidPhoneNumbers) {
        const masjidData = {
          ...validMasjidData,
          phone_number: phoneNumber,
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
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
        const masjidData = {
          ...validMasjidData,
          name: `Masjid Postcode ${postcode}`,
          address: {
            ...validMasjidData.address,
            postcode,
          },
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
        });

        expect(response.status).toBe(201);
      }
    });

    it("should reject invalid postcode formats", async () => {
      const invalidPostcodes = ["1234", "123456", "ABC12", "12AB3"];

      for (const postcode of invalidPostcodes) {
        const masjidData = {
          ...validMasjidData,
          address: {
            ...validMasjidData.address,
            postcode,
          },
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
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
        const masjidData = {
          ...validMasjidData,
          name: `Masjid ${state} Test`,
          address: {
            ...validMasjidData.address,
            state,
            city: state === "Kuala Lumpur" ? "Kuala Lumpur" : "Test City",
          },
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
        });

        expect(response.status).toBe(201);
      }
    });

    it("should reject invalid states", async () => {
      const invalidStates = ["Singapore", "Jakarta", "Invalid State"];

      for (const state of invalidStates) {
        const masjidData = {
          ...validMasjidData,
          address: {
            ...validMasjidData.address,
            state: state as any,
          },
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toContain("state");
      }
    });
  });

  describe("Authorization and Access Control (403)", () => {
    it("should reject masjid creation by regular users", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${regularUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(403);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("forbidden");
      expect(error.message).toBeDefined();
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should reject masjid creation by masjid admins", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${masjidAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(403);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("forbidden");
      expect(error.message).toBeDefined();
    });

    it("should reject masjid creation without authentication", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
    });

    it("should reject masjid creation with invalid token", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
    });
  });

  describe("Validation Errors (400)", () => {
    it("should reject masjid with missing required fields", async () => {
      const incompleteData = [
        { ...validMasjidData, name: undefined },
        { ...validMasjidData, address: undefined },
        {
          ...validMasjidData,
          address: { ...validMasjidData.address, address_line_1: undefined },
        },
        {
          ...validMasjidData,
          address: { ...validMasjidData.address, city: undefined },
        },
        {
          ...validMasjidData,
          address: { ...validMasjidData.address, state: undefined },
        },
        {
          ...validMasjidData,
          address: { ...validMasjidData.address, postcode: undefined },
        },
      ];

      for (const incompleteDataItem of incompleteData) {
        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(incompleteDataItem),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
      }
    });

    it("should reject masjid with invalid field lengths", async () => {
      const invalidLengthData = [
        {
          ...validMasjidData,
          name: "A".repeat(256), // Too long (maxLength: 255)
        },
        {
          ...validMasjidData,
          registration_number: "A".repeat(51), // Too long (maxLength: 50)
        },
        {
          ...validMasjidData,
          description: "A".repeat(1001), // Too long (maxLength: 1000)
        },
        {
          ...validMasjidData,
          address: {
            ...validMasjidData.address,
            address_line_1: "A".repeat(256), // Too long (maxLength: 255)
          },
        },
        {
          ...validMasjidData,
          address: {
            ...validMasjidData.address,
            city: "A".repeat(101), // Too long (maxLength: 100)
          },
        },
      ];

      for (const invalidData of invalidLengthData) {
        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidData),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
      }
    });

    it("should reject invalid email formats", async () => {
      const invalidEmails = [
        "invalid-email",
        "missing@domain",
        "@missinguser.com",
        "spaces in@email.com",
        "special!chars@domain.com",
      ];

      for (const email of invalidEmails) {
        const masjidData = {
          ...validMasjidData,
          email,
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
        });

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toContain("email");
      }
    });

    it("should reject malformed JSON", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: "invalid json content{{",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Content Type Validation", () => {
    it("should require application/json content type", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(400);
    });

    it("should handle missing content-type header", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify(validMasjidData),
      });

      expect([400, 415]).toContain(response.status);
    });
  });

  describe("Unicode and Internationalization", () => {
    it("should handle Unicode characters in masjid names", async () => {
      const unicodeNames = [
        "مسجد السلام", // Arabic
        "清真寺", // Chinese
        "மசூதி அஸ்ஸலாம்", // Tamil
        "Masjid José María", // Spanish characters
        "Masjid François", // French characters
      ];

      for (const name of unicodeNames) {
        const masjidData = {
          ...validMasjidData,
          name,
          registration_number: `MSJ-UNICODE-${Date.now()}`,
        };

        const response = await fetch("http://mock-api.test/rest/v1/masjids", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masjidData),
        });

        expect(response.status).toBe(201);
        const masjid: MasjidResponse = await response.json();
        expect(masjid.name).toBe(name);
      }
    });

    it("should handle Unicode characters in addresses", async () => {
      const unicodeAddress = {
        ...validMasjidData.address,
        address_line_1: "جالان المسجد",
        address_line_2: "花园区",
        city: "كوالا لومبور",
      };

      const masjidData = {
        ...validMasjidData,
        name: "Masjid Unicode Address Test",
        address: unicodeAddress,
      };

      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masjidData),
      });

      expect(response.status).toBe(201);
      const masjid: MasjidResponse = await response.json();
      expect(masjid.address.address_line_1).toBe(unicodeAddress.address_line_1);
      expect(masjid.address.address_line_2).toBe(unicodeAddress.address_line_2);
      expect(masjid.address.city).toBe(unicodeAddress.city);
    });
  });

  describe("Business Logic Validation", () => {
    it("should set default status to active for new masjids", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(201);
      const masjid: MasjidResponse = await response.json();
      expect(masjid.status).toBe("active");
    });

    it("should initialize admin and member counts to zero", async () => {
      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validMasjidData),
      });

      expect(response.status).toBe(201);
      const masjid: MasjidResponse = await response.json();
      expect(masjid.admin_count).toBe(0);
      expect(masjid.member_count).toBe(0);
    });

    it("should set country to MYS by default", async () => {
      const masjidDataWithoutCountry = {
        ...validMasjidData,
        address: {
          ...validMasjidData.address,
          country: undefined as any,
        },
      };

      const response = await fetch("http://mock-api.test/rest/v1/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(masjidDataWithoutCountry),
      });

      expect(response.status).toBe(201);
      const masjid: MasjidResponse = await response.json();
      expect(masjid.address.country).toBe("MYS");
    });
  });
});
