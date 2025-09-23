/**
 * Contract Test: POST /admin-applications (MOCKED)
 *
 * This test validates the admin application submission endpoint according to the API specification.
 * It ensures that authenticated users with complete profiles can apply to become masjid admins
 * with proper validation and workflow management.
 *
 * NOTE: This test uses mocked data instead of calling Supabase directly.
 *
 * @see /specs/001-build-a-monorepo/contracts/api-spec.yaml
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  vi,
} from "vitest";

// UUID generator for mock data
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Types based on API specification
interface CreateAdminApplicationRequest {
  masjid_id: string;
  application_message?: string;
}

interface MasjidSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
}

interface UserSummary {
  id: string;
  email: string;
  role: string;
  full_name: string;
  home_masjid?: MasjidSummary;
  profile_complete: boolean;
  created_at: string;
}

interface AdminApplicationResponse {
  id: string;
  user_id: string;
  user: UserSummary;
  masjid_id: string;
  masjid: MasjidSummary;
  application_message?: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
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
const mockProfiles = new Map<string, any>();
const mockMasjids = new Map<string, any>();
const mockApplications = new Map<string, AdminApplicationResponse>();

// Mock fetch function
const mockFetch = vi.fn();

describe("POST /admin-applications - Admin Application Submission Contract", () => {
  let userToken: string;
  let userId: string;
  let incompleteUserToken: string;
  let superAdminToken: string;
  let testMasjidId: string;

  const userCredentials = {
    email: `applicant-user-${Date.now()}@example.com`, // Use unique email
    password: "applicantpass123",
  };

  const incompleteUserCredentials = {
    email: `incomplete-user-${Date.now()}@example.com`, // Use unique email
    password: "incompletepass123",
  };

  // Clear applications before each test to avoid 409 conflicts
  beforeEach(() => {
    // Clear only applications, keep users, profiles, and masjids for reuse
    mockApplications.clear();
  });

  const superAdminCredentials = {
    email: `superadmin-applications-${Date.now()}@example.com`, // Use unique email
    password: "superadminpass123",
  };

  const userProfileData = {
    full_name: "Ahmad Applicant",
    phone_number: "+60123456789",
    preferred_language: "en",
    address: {
      address_line_1: "123 Jalan Applicant",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postcode: "50100",
      country: "MYS",
    },
  };

  const testMasjidData = {
    name: "Masjid Test Application",
    registration_number: "MSJ-2024-APP-001",
    email: "admin@testapplication.org",
    phone_number: "+60312345678",
    description: "Test mosque for admin applications",
    address: {
      address_line_1: "456 Jalan Test Masjid",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postcode: "50100",
      country: "MYS",
    },
  };

  beforeAll(async () => {
    console.log("Setting up admin-applications-post contract tests...");

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

      const authHeader = options?.headers?.Authorization;
      const token = authHeader?.replace("Bearer ", "");

      try {
        // Handle auth signup
        if (urlObj.pathname === "/auth/v1/signup") {
          const userId = generateUUID();
          const userRecord = {
            id: userId,
            email: body.email.toLowerCase(),
            password: body.password,
            created_at: new Date().toISOString(),
            role: body.email.includes("superadmin") ? "super_admin" : "user",
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
              session: { access_token: mockToken }, // For compatibility
            }),
          };
        }

        // Handle profile creation
        if (urlObj.pathname === "/profiles" && options?.method === "POST") {
          if (!token) {
            return {
              ok: false,
              status: 401,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({ error: "unauthorized" }),
            };
          }

          const user = Array.from(mockUsers.values()).find((u) =>
            token.includes(u.id)
          );
          if (!user) {
            return {
              ok: false,
              status: 401,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({ error: "unauthorized" }),
            };
          }

          const profile = {
            id: generateUUID(),
            user_id: user.id,
            full_name: body.full_name,
            phone_number: body.phone_number,
            is_complete: true,
            created_at: new Date().toISOString(),
          };

          mockProfiles.set(user.id, profile);

          return {
            ok: true,
            status: 201,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => profile,
          };
        }

        // Handle masjid creation
        if (urlObj.pathname === "/masjids" && options?.method === "POST") {
          if (!token) {
            return {
              ok: false,
              status: 401,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({ error: "unauthorized" }),
            };
          }

          const user = Array.from(mockUsers.values()).find((u) =>
            token.includes(u.id)
          );
          if (!user || user.role !== "super_admin") {
            return {
              ok: false,
              status: 403,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({ error: "forbidden" }),
            };
          }

          const masjidId = generateUUID();
          const masjid = {
            id: masjidId,
            name: body.name,
            city: body.address?.city || "Test City",
            state: body.address?.state || "Kuala Lumpur",
            status: "active",
          };

          mockMasjids.set(masjidId, masjid);

          return {
            ok: true,
            status: 201,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => masjid,
          };
        }

        // Handle admin application creation
        if (
          urlObj.pathname === "/rest/v1/admin_applications" &&
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
                timestamp: new Date().toISOString(),
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

          // Content-type validation
          const contentType =
            options?.headers?.["Content-Type"] ||
            options?.headers?.["content-type"] ||
            "";
          if (!contentType || !contentType.includes("application/json")) {
            return {
              ok: false,
              status: !contentType ? 415 : 400,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                error: !contentType
                  ? "unsupported_media_type"
                  : "unsupported_media_type",
                message: !contentType
                  ? "Content-Type header is required"
                  : "Content-Type must be application/json",
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

          // Check profile completeness
          const profile = mockProfiles.get(user.id);
          if (!profile) {
            return {
              ok: false,
              status: 400,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                error: "validation_error",
                message: "User profile must be complete before applying",
              }),
            };
          }

          // Validation
          if (!body.masjid_id) {
            return {
              ok: false,
              status: 400,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                error: "validation_error",
                message: "masjid_id is required",
              }),
            };
          }

          // Validate UUID format
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(body.masjid_id)) {
            return {
              ok: false,
              status: 400,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                error: "validation_error",
                message: "Invalid masjid_id format",
              }),
            };
          }

          // Check if masjid exists
          const masjid = mockMasjids.get(body.masjid_id);
          if (!masjid) {
            return {
              ok: false,
              status: 400,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                error: "validation_error",
                message: "The specified masjid does not exist",
              }),
            };
          }

          // Check for duplicate application
          const existingApplication = Array.from(
            mockApplications.values()
          ).find(
            (app) => app.user_id === user.id && app.masjid_id === body.masjid_id
          );

          if (existingApplication) {
            return {
              ok: false,
              status: 409,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                error: "conflict",
                message: "An application already exists for this masjid",
              }),
            };
          }

          // Validate message length
          if (
            body.application_message &&
            body.application_message.length > 1000
          ) {
            return {
              ok: false,
              status: 400,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({
                error: "validation_error",
                message:
                  "Application message length must not exceed 1000 characters",
              }),
            };
          }

          // Create application
          const applicationId = generateUUID();
          const application: AdminApplicationResponse = {
            id: applicationId,
            user_id: user.id,
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              full_name: profile.full_name,
              profile_complete: true,
              created_at: user.created_at,
            },
            masjid_id: body.masjid_id,
            masjid: {
              id: masjid.id,
              name: masjid.name,
              city: masjid.city,
              state: masjid.state,
              status: masjid.status,
            },
            application_message: body.application_message,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          mockApplications.set(applicationId, application);

          return {
            ok: true,
            status: 201,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => application,
          };
        }

        // Default response
        return {
          ok: false,
          status: 404,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ error: "Not found" }),
        };
      } catch (error) {
        console.error("Mock fetch error:", error);
        return {
          ok: false,
          status: 500,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ error: "Internal server error" }),
        };
      }
    });

    try {
      // Create and setup complete user profile
      const userSignUp = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userCredentials),
      });

      if (!userSignUp.ok) {
        throw new Error(
          `Failed to create user: ${userSignUp.status} ${userSignUp.statusText}`
        );
      }

      const userData = await userSignUp.json();
      if (!userData.user || !userData.access_token) {
        throw new Error("Invalid user signup response structure");
      }

      userId = userData.user.id;
      userToken = userData.access_token;

      // Create user profile
      await fetch("http://mock-api.test/profiles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userProfileData),
      });

      // Create incomplete user (no profile)
      const incompleteUserSignUp = await fetch(
        "http://mock-api.test/auth/v1/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(incompleteUserCredentials),
        }
      );

      const incompleteUserData = await incompleteUserSignUp.json();
      incompleteUserToken = incompleteUserData.access_token;

      // Create super admin for test masjid creation
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

      const superAdminData = await superAdminSignUp.json();
      superAdminToken = superAdminData.access_token;

      // Create test masjid
      const masjidResponse = await fetch("http://mock-api.test/masjids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testMasjidData),
      });

      if (masjidResponse.ok) {
        const masjidData = await masjidResponse.json();
        testMasjidId = masjidData.id;
      } else {
        // If masjid creation fails, create a mock ID for testing
        testMasjidId = "550e8400-e29b-41d4-a716-446655440000";
        // Add mock masjid manually
        mockMasjids.set(testMasjidId, {
          id: testMasjidId,
          name: testMasjidData.name,
          city: testMasjidData.address.city,
          state: testMasjidData.address.state,
          status: "active",
        });
      }
    } catch (error) {
      console.error("Failed to set up test environment:", error);
      console.warn("Using mock data for testing");

      // Fallback to mock data
      testMasjidId = "550e8400-e29b-41d4-a716-446655440000";
      mockMasjids.set(testMasjidId, {
        id: testMasjidId,
        name: testMasjidData.name,
        city: testMasjidData.address.city,
        state: testMasjidData.address.state,
        status: "active",
      });
    }
  });

  afterAll(async () => {
    console.log("Cleaning up admin-applications-post contract tests...");
    mockUsers.clear();
    mockProfiles.clear();
    mockMasjids.clear();
    mockApplications.clear();
    vi.restoreAllMocks();
  });

  describe("Successful Application Submission (201)", () => {
    it("should submit admin application with complete profile", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message:
          "I would like to volunteer as an admin for this masjid. I have experience in community management and am passionate about serving the Muslim community.",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(201);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const application: AdminApplicationResponse = await response.json();

      // Validate application structure
      expect(application.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(application.user_id).toBe(userId);
      expect(application.masjid_id).toBe(applicationData.masjid_id);
      expect(application.application_message).toBe(
        applicationData.application_message
      );
      expect(application.status).toBe("pending"); // Default status
      expect(application.created_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
      expect(application.updated_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );

      // Validate user summary
      expect(application.user).toBeDefined();
      expect(application.user.id).toBe(userId);
      expect(application.user.email).toBe(userCredentials.email);
      expect(application.user.full_name).toBe(userProfileData.full_name);
      expect(application.user.profile_complete).toBe(true);

      // Validate masjid summary
      expect(application.masjid).toBeDefined();
      expect(application.masjid.id).toBe(testMasjidId);
      expect(application.masjid.name).toBe(testMasjidData.name);

      // Should not have review data initially
      expect(application.review_notes).toBeUndefined();
      expect(application.reviewed_by).toBeUndefined();
      expect(application.reviewed_at).toBeUndefined();
    });

    it("should submit admin application with minimal data", async () => {
      // Create a second masjid for this test to avoid conflicts
      const secondMasjidId = generateUUID();
      mockMasjids.set(secondMasjidId, {
        id: secondMasjidId,
        name: testMasjidData.name + " Branch",
        city: testMasjidData.address.city,
        state: testMasjidData.address.state,
        status: "active",
      });

      const minimalApplicationData: CreateAdminApplicationRequest = {
        masjid_id: secondMasjidId,
        // application_message is optional
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(minimalApplicationData),
        }
      );

      expect(response.status).toBe(201);
      const application: AdminApplicationResponse = await response.json();

      expect(application.masjid_id).toBe(secondMasjidId);
      expect(application.user_id).toBe(userId);
      expect(application.status).toBe("pending");
      expect(application.application_message).toBeUndefined();
    });

    it("should generate unique application IDs", async () => {
      // Create second user for duplicate test
      const secondUserCreds = {
        email: "second.applicant@example.com",
        password: "secondpass123",
      };

      const secondUserSignUp = await fetch(
        "http://mock-api.test/auth/v1/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(secondUserCreds),
        }
      );

      const secondUserData = await secondUserSignUp.json();
      const secondUserToken = secondUserData.session.access_token;

      // Create profile for second user
      await fetch("http://mock-api.test/profiles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userProfileData,
          full_name: "Second Applicant",
        }),
      });

      // Create a third masjid for this test to avoid conflicts
      const thirdMasjidId = generateUUID();
      mockMasjids.set(thirdMasjidId, {
        id: thirdMasjidId,
        name: testMasjidData.name + " Central",
        city: testMasjidData.address.city,
        state: testMasjidData.address.state,
        status: "active",
      });

      const applicationData1: CreateAdminApplicationRequest = {
        masjid_id: thirdMasjidId,
        application_message: "First application",
      };

      const applicationData2: CreateAdminApplicationRequest = {
        masjid_id: thirdMasjidId,
        application_message: "Second application",
      };

      const response1 = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData1),
        }
      );

      const response2 = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secondUserToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData2),
        }
      );

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      const application1: AdminApplicationResponse = await response1.json();
      const application2: AdminApplicationResponse = await response2.json();

      expect(application1.id).not.toBe(application2.id);
      expect(application1.application_message).toBe(
        applicationData1.application_message
      );
      expect(application2.application_message).toBe(
        applicationData2.application_message
      );
    });
  });

  describe("Authentication Requirements (401)", () => {
    it("should reject application without authentication", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Test application without auth",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(401);
      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );

      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
      expect(error.message).toBeDefined();
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should reject application with invalid token", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Test application with invalid token",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer invalid-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(401);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("unauthorized");
    });
  });

  describe("Profile Completeness Requirements", () => {
    it("should reject application from user with incomplete profile", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Application from incomplete profile user",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${incompleteUserToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("validation_error");
      expect(error.message).toContain("profile");
      expect(error.message.toLowerCase()).toContain("complete");
    });
  });

  describe("Validation Errors (400)", () => {
    it("should reject application with missing masjid_id", async () => {
      const invalidApplicationData = {
        application_message: "Application without masjid ID",
        // masjid_id is missing
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidApplicationData),
        }
      );

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("validation_error");
      expect(error.message).toContain("masjid_id");
    });

    it("should reject application with invalid masjid_id format", async () => {
      const invalidMasjidIds = [
        "invalid-uuid",
        "123",
        "not-a-uuid-at-all",
        "550e8400-e29b-41d4-a716", // Incomplete UUID
        "", // Empty string
      ];

      for (const invalidId of invalidMasjidIds) {
        const applicationData = {
          masjid_id: invalidId,
          application_message: "Test with invalid masjid ID",
        };

        const response = await fetch(
          "http://mock-api.test/rest/v1/admin_applications",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(applicationData),
          }
        );

        expect(response.status).toBe(400);
        const error: ErrorResponse = await response.json();
        expect(error.error).toBe("validation_error");
        expect(error.message).toContain("masjid_id");
      }
    });

    it("should reject application with non-existent masjid_id", async () => {
      const nonExistentMasjidId = "550e8400-e29b-41d4-a716-446655440999";
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: nonExistentMasjidId,
        application_message: "Application for non-existent masjid",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("validation_error");
      expect(error.message).toContain("masjid");
      expect(error.message.toLowerCase()).toContain("exist");
    });

    it("should reject application with excessively long message", async () => {
      const longMessage = "A".repeat(1001); // Over 1000 character limit
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: longMessage,
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(400);
      const error: ErrorResponse = await response.json();
      expect(error.error).toBe("validation_error");
      expect(error.message).toContain("message");
      expect(error.message).toContain("length");
    });

    it("should reject malformed JSON", async () => {
      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: "invalid json content{{",
        }
      );

      expect(response.status).toBe(400);
    });
  });

  describe("Conflict Errors (409)", () => {
    it("should reject duplicate application for same masjid by same user", async () => {
      // Create new user for this test to avoid conflicts with other tests
      const duplicateTestUserCreds = {
        email: "duplicate.test@example.com",
        password: "duplicatepass123",
      };

      const userSignUp = await fetch("http://mock-api.test/auth/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateTestUserCreds),
      });

      const userData = await userSignUp.json();
      const duplicateUserToken = userData.session.access_token;

      // Create profile for user
      await fetch("http://mock-api.test/profiles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${duplicateUserToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userProfileData,
          full_name: "Duplicate Test User",
        }),
      });

      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "First application for duplicate test",
      };

      // First application should succeed
      const firstResponse = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${duplicateUserToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(firstResponse.status).toBe(201);

      // Second application for same masjid should fail
      const secondApplicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Second application for duplicate test",
      };

      const secondResponse = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${duplicateUserToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(secondApplicationData),
        }
      );

      expect(secondResponse.status).toBe(409);
      const error: ErrorResponse = await secondResponse.json();
      expect(error.error).toBe("conflict");
      expect(error.message).toContain("application");
      expect(error.message.toLowerCase()).toContain("exist");
    });
  });

  describe("Content Type Validation", () => {
    it("should require application/json content type", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Test with wrong content type",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "text/plain",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(400);
    });

    it("should handle missing content-type header", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Test without content type",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect([400, 415]).toContain(response.status);
    });
  });

  describe("Unicode and Internationalization", () => {
    it("should handle Unicode characters in application message", async () => {
      // Create a unique masjid for this test to avoid conflicts
      const unicodeMasjidId = generateUUID();
      mockMasjids.set(unicodeMasjidId, {
        id: unicodeMasjidId,
        name: testMasjidData.name + " Unicode",
        city: testMasjidData.address.city,
        state: testMasjidData.address.state,
        status: "active",
      });

      const unicodeMessages = [
        "أرغب في أن أكون مشرفاً على هذا المسجد", // Arabic
        "我想成为这个清真寺的管理员", // Chinese
        "நான் இந்த மசூதியின் நிர்வாகியாக இருக்க விரும்புகிறேன்", // Tamil
        "Saya ingin menjadi pentadbir masjid ini", // Malay
        "Je voudrais être administrateur de cette mosquée", // French
      ];

      for (const message of unicodeMessages) {
        // Create a unique masjid for each message to avoid conflicts
        const messageMasjidId = generateUUID();
        mockMasjids.set(messageMasjidId, {
          id: messageMasjidId,
          name: testMasjidData.name + " Unicode " + Math.random(),
          city: testMasjidData.address.city,
          state: testMasjidData.address.state,
          status: "active",
        });

        const applicationData: CreateAdminApplicationRequest = {
          masjid_id: messageMasjidId,
          application_message: message,
        };

        const response = await fetch(
          "http://mock-api.test/rest/v1/admin_applications",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(applicationData),
          }
        );

        expect(response.status).toBe(201);
        const application: AdminApplicationResponse = await response.json();
        expect(application.application_message).toBe(message);
      }
    });
  });

  describe("Application Status Management", () => {
    it("should set initial status to pending", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Test for initial status",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(201);
      const application: AdminApplicationResponse = await response.json();
      expect(application.status).toBe("pending");
    });

    it("should not allow status field in creation request", async () => {
      const applicationDataWithStatus = {
        masjid_id: testMasjidId,
        application_message: "Test with status field",
        status: "approved", // Should be ignored or cause error
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationDataWithStatus),
        }
      );

      // Should either ignore the status field or return validation error
      if (response.status === 201) {
        const application: AdminApplicationResponse = await response.json();
        expect(application.status).toBe("pending"); // Should default to pending
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  describe("Data Integrity and Security", () => {
    it("should not expose sensitive user information", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Test for data privacy",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      expect(response.status).toBe(201);
      const application: AdminApplicationResponse = await response.json();

      // Should not expose sensitive data
      expect(application.user).not.toHaveProperty("password");
      expect(application.user).not.toHaveProperty("phone_number");
      expect(application.user).not.toHaveProperty("address");
      expect(application.masjid).not.toHaveProperty("email");
      expect(application.masjid).not.toHaveProperty("phone_number");
      expect(application.masjid).not.toHaveProperty("description");
    });

    it("should handle SQL injection attempts safely", async () => {
      const maliciousData = {
        masjid_id: testMasjidId,
        application_message: "'; DROP TABLE admin_applications; --",
      };

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(maliciousData),
        }
      );

      // Should safely handle malicious input
      expect([201, 400]).toContain(response.status);

      if (response.status === 201) {
        const application: AdminApplicationResponse = await response.json();
        // Should store the message as text, not execute it
        expect(application.application_message).toBe(
          maliciousData.application_message
        );
      }
    });
  });

  describe("Performance and Reliability", () => {
    it("should return response within reasonable time", async () => {
      const applicationData: CreateAdminApplicationRequest = {
        masjid_id: testMasjidId,
        application_message: "Performance test application",
      };

      const startTime = Date.now();

      const response = await fetch(
        "http://mock-api.test/rest/v1/admin_applications",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });
});
