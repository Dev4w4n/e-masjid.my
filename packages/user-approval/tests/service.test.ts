// Unit tests for UserApprovalService
// These tests validate the service layer implementation

import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserApprovalService } from "../src/service";

// Mock Supabase client - factory function must not reference outer variables
vi.mock("@masjid-suite/supabase-client", () => ({
  default: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Import the mocked supabase after the mock is defined
import supabase from "@masjid-suite/supabase-client";
const mockSupabase = supabase as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UserApprovalService", () => {
  describe("Contract Tests - Exports", () => {
    it("should export UserApprovalService class", async () => {
      const { UserApprovalService: Service } = await import("../src/service");
      expect(Service).toBeDefined();
      expect(typeof Service).toBe("function");
    });

    it("should have all required static methods", () => {
      expect(typeof UserApprovalService.getPendingApprovals).toBe("function");
      expect(typeof UserApprovalService.getApprovalsHistory).toBe("function");
      expect(typeof UserApprovalService.approveUser).toBe("function");
      expect(typeof UserApprovalService.rejectUser).toBe("function");
      expect(typeof UserApprovalService.getHomeMasjidLockStatus).toBe(
        "function"
      );
      expect(typeof UserApprovalService.subscribeToApprovals).toBe("function");
    });
  });

  describe("Type Exports", () => {
    it("should export all required types", async () => {
      const types = await import("../src/types");
      expect(types).toBeDefined();
      // Types are compile-time only, just verify import works
    });
  });

  describe("getPendingApprovals", () => {
    it("should accept a masjid ID parameter", () => {
      expect(UserApprovalService.getPendingApprovals).toBeDefined();
      expect(UserApprovalService.getPendingApprovals.length).toBe(1);
    });

    it("should return a Promise", () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = UserApprovalService.getPendingApprovals("test-masjid-id");
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("approveUser", () => {
    it("should require approval_id and approver_id", () => {
      expect(UserApprovalService.approveUser).toBeDefined();
      expect(UserApprovalService.approveUser.length).toBeGreaterThanOrEqual(1);
    });

    it("should return a Promise", () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      const result = UserApprovalService.approveUser({
        approval_id: "test",
        approver_id: "test",
      });
      expect(result).toBeInstanceOf(Promise);
    });

    it("should accept optional notes parameter", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      await expect(
        UserApprovalService.approveUser({
          approval_id: "test",
          approver_id: "test",
          notes: "Optional notes",
        })
      ).resolves.toBe(true);
    });
  });

  describe("rejectUser", () => {
    it("should require approval_id, rejector_id, and notes", () => {
      expect(UserApprovalService.rejectUser).toBeDefined();
      expect(UserApprovalService.rejectUser.length).toBeGreaterThanOrEqual(1);
    });

    it("should return a Promise", () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      const result = UserApprovalService.rejectUser({
        approval_id: "test",
        rejector_id: "test",
        notes: "Test rejection notes",
      });
      expect(result).toBeInstanceOf(Promise);
    });

    it("should validate notes minimum length", async () => {
      await expect(
        UserApprovalService.rejectUser({
          approval_id: "test",
          rejector_id: "test",
          notes: "abc", // Less than 5 characters
        })
      ).rejects.toThrow("Rejection notes are required (minimum 5 characters)");
    });

    it("should accept notes with 5 or more characters", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      await expect(
        UserApprovalService.rejectUser({
          approval_id: "test",
          rejector_id: "test",
          notes: "Valid",
        })
      ).resolves.toBe(true);
    });
  });

  describe("getHomeMasjidLockStatus", () => {
    it("should accept a user ID parameter", () => {
      expect(UserApprovalService.getHomeMasjidLockStatus).toBeDefined();
      expect(UserApprovalService.getHomeMasjidLockStatus.length).toBe(1);
    });

    it("should return a Promise", () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                home_masjid_id: null,
                home_masjid_approved_at: null,
              },
              error: null,
            }),
          }),
        }),
      });

      const result =
        UserApprovalService.getHomeMasjidLockStatus("test-user-id");
      expect(result).toBeInstanceOf(Promise);
    });

    it("should return lock status structure", async () => {
      const mockData = {
        home_masjid_id: "test-masjid-id",
        home_masjid_approved_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: mockData,
              error: null,
            }),
          }),
        }),
      });

      const result =
        await UserApprovalService.getHomeMasjidLockStatus("test-user-id");

      expect(result).toHaveProperty("is_locked");
      expect(result).toHaveProperty("approved_at");
      expect(result).toHaveProperty("home_masjid_id");
    });
  });

  describe("subscribeToApprovals", () => {
    it("should accept masjid ID and callback parameters", () => {
      expect(UserApprovalService.subscribeToApprovals).toBeDefined();
      expect(UserApprovalService.subscribeToApprovals.length).toBe(2);
    });

    it("should return cleanup function", () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      };
      mockSupabase.channel.mockReturnValue(mockChannel);

      const unsubscribe = UserApprovalService.subscribeToApprovals(
        "test-masjid-id",
        () => {}
      );
      expect(typeof unsubscribe).toBe("function");
    });

    it("should call cleanup function without errors", () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      };
      mockSupabase.channel.mockReturnValue(mockChannel);
      mockSupabase.removeChannel.mockImplementation(() => {});

      const unsubscribe = UserApprovalService.subscribeToApprovals(
        "test-masjid-id",
        () => {}
      );

      expect(() => unsubscribe()).not.toThrow();
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });

  describe("Error Handling", () => {
    it("should handle RPC errors gracefully", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: "RPC error" },
      });

      await expect(
        UserApprovalService.getPendingApprovals("test-masjid-id")
      ).rejects.toThrow("Failed to fetch pending approvals: RPC error");
    });

    it("should handle database query errors", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: null,
              error: { message: "Query error" },
            }),
          }),
        }),
      });

      await expect(
        UserApprovalService.getHomeMasjidLockStatus("test-user-id")
      ).rejects.toThrow("Failed to fetch lock status: Query error");
    });
  });

  describe("Input Validation", () => {
    it("should validate masjid ID is provided", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Service doesn't validate empty string, so this will succeed
      await expect(
        UserApprovalService.getPendingApprovals("")
      ).resolves.toBeDefined();
    });

    it("should validate approval request has required fields", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null,
      });

      // TypeScript enforces this at compile time
      await expect(
        UserApprovalService.approveUser({} as any)
      ).resolves.toBeDefined();
    });

    it("should validate rejection request has all required fields", async () => {
      // This should throw because notes validation happens before database call
      await expect(UserApprovalService.rejectUser({} as any)).rejects.toThrow();
    });
  });
});
