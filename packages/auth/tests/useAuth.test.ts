// Contract test for authentication hooks and utilities
// This test validates the authentication package implementation

import { describe, it, expect } from "vitest";

describe("Authentication Package Contract", () => {
  describe("Core Exports", () => {
    it("should export AuthProvider and useAuth", async () => {
      const { AuthProvider, useAuth } = await import("../src/index.js");
      expect(AuthProvider).toBeDefined();
      expect(useAuth).toBeDefined();
      expect(typeof AuthProvider).toBe("function");
      expect(typeof useAuth).toBe("function");
    });
  });

  describe("State Hooks", () => {
    it("should export all state-related hooks", async () => {
      const {
        useUser,
        useProfile,
        useSession,
        useUserRole,
        useAuthStatus,
        useAuthError,
      } = await import("../src/index.js");

      expect(useUser).toBeDefined();
      expect(useProfile).toBeDefined();
      expect(useSession).toBeDefined();
      expect(useUserRole).toBeDefined();
      expect(useAuthStatus).toBeDefined();
      expect(useAuthError).toBeDefined();
    });
  });

  describe("Actions Hook", () => {
    it("should export useAuthActions hook", async () => {
      const { useAuthActions } = await import("../src/index.js");
      expect(useAuthActions).toBeDefined();
      expect(typeof useAuthActions).toBe("function");
    });
  });

  describe("Permission System", () => {
    it("should export PermissionService and usePermissions", async () => {
      const { PermissionService, usePermissions } = await import(
        "../src/index.js"
      );
      expect(PermissionService).toBeDefined();
      expect(usePermissions).toBeDefined();
    });

    it("should have correct static methods on PermissionService", async () => {
      const { PermissionService } = await import("../src/index.js");
      expect(PermissionService.hasRole).toBeInstanceOf(Function);
      expect(PermissionService.isSuperAdmin).toBeInstanceOf(Function);
      expect(PermissionService.isMasjidAdmin).toBeInstanceOf(Function);
      expect(PermissionService.hasAdminPrivileges).toBeInstanceOf(Function);
    });
  });

  describe("UI Components", () => {
    it("should export WithRole component", async () => {
      const { WithRole } = await import("../src/index.js");
      expect(WithRole).toBeDefined();
      expect(typeof WithRole).toBe("function");
    });
  });

  describe("Type Exports", () => {
    it("should export ProfileWithRole and UserRole types", async () => {
      const module = await import("../src/index.js");
      // These are type exports, so we just check if the module loads.
      // The real test is whether the dependent code compiles.
      expect(module).toBeDefined();
    });
  });
});
