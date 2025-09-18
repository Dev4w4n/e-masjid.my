// Contract test for authentication hooks and utilities
// This test validates the authentication package implementation

import { describe, it, expect } from 'vitest';

describe('Authentication Package Contract', () => {
  describe('useAuth Hook', () => {
    it('should export useAuth hook', async () => {
      const { useAuth } = await import('../src/index.js');
      
      expect(useAuth).toBeDefined();
      expect(typeof useAuth).toBe('function');
    });
  });

  describe('AuthProvider Component', () => {
    it('should export AuthProvider component', async () => {
      const { AuthProvider } = await import('../src/index.js');
      
      expect(AuthProvider).toBeDefined();
      expect(typeof AuthProvider).toBe('function');
    });
  });

  describe('User and Profile Hooks', () => {
    it('should export user-related hooks', async () => {
      const { 
        useUser, 
        useProfile, 
        useSession, 
        useAuthLoading, 
        useAuthError 
      } = await import('../src/index.js');
      
      expect(useUser).toBeDefined();
      expect(useProfile).toBeDefined();
      expect(useSession).toBeDefined();
      expect(useAuthLoading).toBeDefined();
      expect(useAuthError).toBeDefined();
      
      expect(typeof useUser).toBe('function');
      expect(typeof useProfile).toBe('function');
      expect(typeof useSession).toBe('function');
      expect(typeof useAuthLoading).toBe('function');
      expect(typeof useAuthError).toBe('function');
    });
  });

  describe('Permission System', () => {
    it('should export PermissionService class', async () => {
      const { PermissionService } = await import('../src/index.js');
      
      expect(PermissionService).toBeDefined();
      expect(typeof PermissionService).toBe('function');
    });

    it('should provide permission check methods', async () => {
      const { PermissionService } = await import('../src/index.js');
      
      expect(PermissionService.hasRole).toBeDefined();
      expect(PermissionService.isSuperAdmin).toBeDefined();
      expect(PermissionService.isMasjidAdmin).toBeDefined();
      expect(PermissionService.isRegistered).toBeDefined();
      expect(PermissionService.isPublic).toBeDefined();
      expect(PermissionService.hasAdminPrivileges).toBeDefined();
      expect(PermissionService.canManageMasjids).toBeDefined();
      expect(PermissionService.canManageSpecificMasjid).toBeDefined();
      expect(PermissionService.canViewProfile).toBeDefined();
      expect(PermissionService.canEditProfile).toBeDefined();
      
      expect(typeof PermissionService.hasRole).toBe('function');
      expect(typeof PermissionService.isSuperAdmin).toBe('function');
      expect(typeof PermissionService.isMasjidAdmin).toBe('function');
      expect(typeof PermissionService.isRegistered).toBe('function');
      expect(typeof PermissionService.isPublic).toBe('function');
      expect(typeof PermissionService.hasAdminPrivileges).toBe('function');
      expect(typeof PermissionService.canManageMasjids).toBe('function');
      expect(typeof PermissionService.canManageSpecificMasjid).toBe('function');
      expect(typeof PermissionService.canViewProfile).toBe('function');
      expect(typeof PermissionService.canEditProfile).toBe('function');
    });

    it('should export usePermissions hook', async () => {
      const { usePermissions } = await import('../src/index.js');
      
      expect(usePermissions).toBeDefined();
      expect(typeof usePermissions).toBe('function');
    });
  });

  describe('Role-Based Components', () => {
    it('should export role-based wrapper components', async () => {
      const { 
        WithRole, 
        AdminOnly, 
        SuperAdminOnly, 
        AuthenticatedOnly 
      } = await import('../src/index.js');
      
      expect(WithRole).toBeDefined();
      expect(AdminOnly).toBeDefined();
      expect(SuperAdminOnly).toBeDefined();
      expect(AuthenticatedOnly).toBeDefined();
      
      expect(typeof WithRole).toBe('function');
      expect(typeof AdminOnly).toBe('function');
      expect(typeof SuperAdminOnly).toBe('function');
      expect(typeof AuthenticatedOnly).toBe('function');
    });
  });

  describe('Protected Routes', () => {
    it('should export useProtectedRoute hook', async () => {
      const { useProtectedRoute } = await import('../src/index.js');
      
      expect(useProtectedRoute).toBeDefined();
      expect(typeof useProtectedRoute).toBe('function');
    });
  });

  describe('Type Exports', () => {
    it('should export ProfileWithRole type', async () => {
      const authModule = await import('../src/index.js');
      
      // We can't directly test type exports in runtime, but we can ensure the module loads
      expect(authModule).toBeDefined();
    });
  });
});
