/**
 * User Roles Service
 * Feature: 007-multi-tenant-saas
 * Task: T030
 *
 * Supabase client methods for user role management
 */

import { supabase } from "..";
import type {
  Tables,
  TablesInsert,
  UserRole,
} from "@masjid-suite/shared-types";

type UserRoleRow = Tables<"user_roles">;
type UserRoleInsert = TablesInsert<"user_roles">;

/**
 * Get user's role for a specific masjid
 * Returns the user's role assignment for a masjid
 */
export const getUserRole = async (
  userId: string,
  masjidId?: string
): Promise<UserRole | null> => {
  let query = supabase.from("user_roles").select("role").eq("user_id", userId);

  // If masjid_id is provided, get role for that specific masjid
  // Otherwise, get the highest privilege role (super-admin or local-admin with null masjid_id)
  if (masjidId) {
    query = query.eq("masjid_id", masjidId);
  } else {
    query = query.is("masjid_id", null);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") {
      // No role found, default to public-user
      return "public-user";
    }
    throw new Error(`Failed to get user role: ${error.message}`);
  }

  return data.role as UserRole;
};

/**
 * Get all roles for a user (across all masjids)
 */
export const getAllUserRoles = async (
  userId: string
): Promise<UserRoleRow[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get all user roles: ${error.message}`);
  }

  return data as UserRoleRow[];
};

/**
 * Assign a role to a user
 * For masjid-admin: masjid_id is required
 * For super-admin/local-admin: masjid_id should be null
 */
export const assignRole = async (
  userId: string,
  role: UserRole,
  masjidId?: string | null
): Promise<UserRoleRow> => {
  // Validate role-masjid_id relationship
  if (role === "masjid-admin" && !masjidId) {
    throw new Error("masjid_id is required for masjid-admin role");
  }

  if ((role === "super-admin" || role === "local-admin") && masjidId) {
    throw new Error(`${role} role should not have a masjid_id`);
  }

  const roleData: UserRoleInsert = {
    user_id: userId,
    role,
    masjid_id: masjidId || null,
  };

  // Check if role assignment already exists
  let query = supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .eq("role", role);

  if (masjidId) {
    query = query.eq("masjid_id", masjidId);
  } else {
    query = query.is("masjid_id", null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    return existing as UserRoleRow;
  }

  // Insert new role assignment
  const { data, error } = await supabase
    .from("user_roles")
    .insert(roleData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to assign role: ${error.message}`);
  }

  return data as UserRoleRow;
};

/**
 * Remove a role from a user
 */
export const removeRole = async (
  userId: string,
  role: UserRole,
  masjidId?: string | null
): Promise<{ success: boolean; message: string }> => {
  let query = supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);

  if (masjidId) {
    query = query.eq("masjid_id", masjidId);
  } else {
    query = query.is("masjid_id", null);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to remove role: ${error.message}`);
  }

  return {
    success: true,
    message: `Role ${role} removed successfully`,
  };
};

/**
 * Check if user is a super admin
 */
export const checkSuperAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super-admin")
    .is("masjid_id", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return false;
    }
    throw new Error(`Failed to check super admin status: ${error.message}`);
  }

  return data?.role === "super-admin";
};

/**
 * Check if user is a masjid admin for a specific masjid
 */
export const checkMasjidAdmin = async (
  userId: string,
  masjidId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("masjid_id", masjidId)
    .eq("role", "masjid-admin")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return false;
    }
    throw new Error(`Failed to check masjid admin status: ${error.message}`);
  }

  return data?.role === "masjid-admin";
};

/**
 * Check if user is a local admin
 */
export const checkLocalAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "local-admin")
    .is("masjid_id", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return false;
    }
    throw new Error(`Failed to check local admin status: ${error.message}`);
  }

  return data?.role === "local-admin";
};

/**
 * Get all users by role
 * Useful for admin dashboards
 */
export const getUsersByRole = async (
  role: UserRole,
  masjidId?: string
): Promise<UserRoleRow[]> => {
  let query = supabase.from("user_roles").select("*").eq("role", role);

  if (masjidId) {
    query = query.eq("masjid_id", masjidId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get users by role: ${error.message}`);
  }

  return data as UserRoleRow[];
};

/**
 * Get all masjid admins for a specific masjid
 */
export const getMasjidAdmins = async (
  masjidId: string
): Promise<UserRoleRow[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("masjid_id", masjidId)
    .eq("role", "masjid-admin")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get masjid admins: ${error.message}`);
  }

  return data as UserRoleRow[];
};

/**
 * Get user's highest privilege role
 * Priority: super-admin > local-admin > masjid-admin > public-user
 */
export const getHighestRole = async (userId: string): Promise<UserRole> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to get user roles: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return "public-user";
  }

  const roles = data.map((r) => r.role as UserRole);

  // Return highest privilege role
  if (roles.includes("super-admin")) return "super-admin";
  if (roles.includes("local-admin")) return "local-admin";
  if (roles.includes("masjid-admin")) return "masjid-admin";
  return "public-user";
};

/**
 * Bulk assign roles to multiple users
 * Useful for initial setup or migrations
 */
export const bulkAssignRoles = async (
  assignments: Array<{
    user_id: string;
    role: UserRole;
    masjid_id?: string | null;
  }>
): Promise<{ success: number; failed: number; errors: string[] }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const assignment of assignments) {
    try {
      await assignRole(
        assignment.user_id,
        assignment.role,
        assignment.masjid_id
      );
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Failed to assign ${assignment.role} to ${assignment.user_id}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return results;
};
