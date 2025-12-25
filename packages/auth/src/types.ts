import type {
  Database,
  UserRole as AppUserRole,
} from "@masjid-suite/shared-types";

export type UserRole = AppUserRole;

// Extended profile type with user role and UI properties
export type ProfileWithRole =
  Database["public"]["Tables"]["profiles"]["Row"] & {
    user_role?: UserRole;
    role?: UserRole; // Alias for compatibility with UI components
    email?: string; // From users table
    avatar_url?: string; // For future implementation
  };

/**
 * User Roles Type Definitions
 * Feature: 007-multi-tenant-saas
 * Task: T026
 *
 * Extended authentication types for the new multi-tenant role system
 */

/**
 * User role assignment from user_roles table
 */
export interface UserRoleAssignment {
  id: number;
  user_id: string;
  role: UserRole;
  masjid_id: string | null; // null for super-admin and local-admin
  created_at: string;
}

/**
 * User with all their role assignments
 */
export interface UserWithRoles {
  user_id: string;
  email: string;
  roles: UserRoleAssignment[];
  primary_role: UserRole; // Highest privilege role
}

/**
 * Role hierarchy for permission checking
 * Lower number = higher privilege
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  "super-admin": 1,
  "masjid-admin": 2,
  "local-admin": 3,
  "public-user": 4,
};

/**
 * Check if user has a specific role
 */
export interface HasRoleRequest {
  user_id: string;
  required_role: UserRole;
  masjid_id?: string; // Required for masjid-admin role checks
}

/**
 * Check if user has permission for an action
 */
export interface CheckPermissionRequest {
  user_id: string;
  action: string;
  resource: string;
  masjid_id?: string;
}

/**
 * Permission check response
 */
export interface PermissionCheckResponse {
  allowed: boolean;
  reason?: string;
  user_role: UserRole;
}

/**
 * Role capabilities mapping
 */
export interface RoleCapabilities {
  role: UserRole;
  can_create_masjids: boolean;
  can_manage_users: boolean;
  can_manage_subscriptions: boolean;
  can_assign_local_admins: boolean;
  can_view_earnings: boolean;
  can_manage_content: boolean;
  can_manage_displays: boolean;
}

/**
 * Role capabilities by role type
 */
export const ROLE_CAPABILITIES: Record<
  UserRole,
  Omit<RoleCapabilities, "role">
> = {
  "super-admin": {
    can_create_masjids: true,
    can_manage_users: true,
    can_manage_subscriptions: true,
    can_assign_local_admins: true,
    can_view_earnings: true,
    can_manage_content: true,
    can_manage_displays: true,
  },
  "masjid-admin": {
    can_create_masjids: false,
    can_manage_users: false,
    can_manage_subscriptions: false,
    can_assign_local_admins: false,
    can_view_earnings: false,
    can_manage_content: true,
    can_manage_displays: true,
  },
  "local-admin": {
    can_create_masjids: false,
    can_manage_users: false,
    can_manage_subscriptions: false,
    can_assign_local_admins: false,
    can_view_earnings: true, // Can view their own earnings
    can_manage_content: true, // For assigned masjids
    can_manage_displays: true, // For assigned masjids
  },
  "public-user": {
    can_create_masjids: false,
    can_manage_users: false,
    can_manage_subscriptions: false,
    can_assign_local_admins: false,
    can_view_earnings: false,
    can_manage_content: false,
    can_manage_displays: false,
  },
};
