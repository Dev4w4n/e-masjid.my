import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useStore } from "zustand";
import { useCreateAuthStore, AuthStore } from "./store";
import type { ProfileWithRole, UserRole } from "./types";

// Create context
const AuthContext = createContext<
  ReturnType<typeof useCreateAuthStore> | undefined
>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [store] = useState(() => useCreateAuthStore());

  useEffect(() => {
    const unsubscribe = store.getState().initialize();
    return unsubscribe; // Clean up subscription on unmount
  }, [store]);

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context and subscribe to changes
 */
export function useAuth<T>(selector: (state: AuthStore) => T): T {
  const store = useContext(AuthContext);
  if (!store) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return useStore(store, selector);
}

/**
 * Hook to get the entire auth store (for actions)
 */
export function useAuthActions() {
  const store = useContext(AuthContext);
  if (!store) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return store.getState();
}

// Selector-based hooks for specific parts of the state
export const useUser = () => useAuth((state) => state.user);
export const useProfile = () => useAuth((state) => state.profile);
export const useSession = () => useAuth((state) => state.session);
export const useUserRole = () => useAuth((state) => state.userRole);
export const useAuthStatus = () => useAuth((state) => state.status);
export const useAuthError = () => useAuth((state) => state.error);

/**
 * Permission utilities
 */
export class PermissionService {
  /**
   * Check if a user has a specific role
   */
  static hasRole(
    profile: ProfileWithRole | null,
    role: UserRole | UserRole[]
  ): boolean {
    if (!profile?.user_role) {
      return false;
    }
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(profile.user_role);
  }

  /**
   * Check if user is super_admin
   */
  static isSuperAdmin(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "super_admin");
  }

  /**
   * Check if user is masjid_admin
   */
  static isMasjidAdmin(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "masjid_admin");
  }

  /**
   * Check if user is registered
   */
  static isRegistered(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "registered");
  }

  /**
   * Check if user is public
   */
  static isPublic(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "public");
  }

  /**
   * Check if user has admin privileges (super_admin or masjid_admin)
   */
  static hasAdminPrivileges(profile: ProfileWithRole | null): boolean {
    return this.isSuperAdmin(profile) || this.isMasjidAdmin(profile);
  }

  static canManageMasjids(profile: ProfileWithRole | null): boolean {
    return this.hasAdminPrivileges(profile);
  }
}

/**
 * Hook to use permissions
 */
export function usePermissions() {
  const profile = useProfile();
  return {
    hasRole: (role: UserRole | UserRole[]) =>
      PermissionService.hasRole(profile, role),
    isSuperAdmin: () => PermissionService.isSuperAdmin(profile),
    isMasjidAdmin: () => PermissionService.isMasjidAdmin(profile),
    isRegistered: () => PermissionService.isRegistered(profile),
    isPublic: () => PermissionService.isPublic(profile),
    hasAdminPrivileges: () => PermissionService.hasAdminPrivileges(profile),
    canManageMasjids: () => PermissionService.canManageMasjids(profile),
  };
}

/**
 * Higher-order component for role-based access control
 */
interface WithRoleProps {
  role?: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WithRole({ role, children, fallback = null }: WithRoleProps) {
  const { hasRole } = usePermissions();
  const status = useAuthStatus();

  if (status === "initializing") {
    // You might want a global loading spinner here
    return null;
  }

  if (role && hasRole(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Explicitly export types
export type { ProfileWithRole, UserRole } from "./types";
