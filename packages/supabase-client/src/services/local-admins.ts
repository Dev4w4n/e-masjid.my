/**
 * Local Admin Service
 * Feature: 007-multi-tenant-saas
 * Task: T029
 *
 * Supabase client methods for local admin operations
 */

import { supabase } from "..";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@masjid-suite/shared-types";

// Type aliases for local admin operations
type LocalAdmin = Tables<"local_admins">;

interface EarningsSummary {
  total: number;
  monthly: Array<{ month: string; amount: number }>;
}

interface CreateLocalAdminRequest {
  user_id: string;
  email: string;
  full_name: string;
  whatsapp_number: string;
  availability_status?: string;
  max_capacity?: number;
}

interface UpdateLocalAdminRequest {
  email?: string;
  full_name?: string;
  whatsapp_number?: string;
  availability_status?: string;
  max_capacity?: number;
}

interface AssignLocalAdminRequest {
  local_admin_id: string;
  masjid_id: string;
}

interface LocalAdminWithMasjids extends LocalAdmin {
  assigned_masjids: any[];
}

type LocalAdminRow = Tables<"local_admins">;
type LocalAdminInsert = TablesInsert<"local_admins">;
type LocalAdminUpdate = TablesUpdate<"local_admins">;
type MasjidUpdate = TablesUpdate<"masjids">;

/**
 * Get local admin by user ID
 */
export const getLocalAdmin = async (
  userId: string
): Promise<LocalAdmin | null> => {
  const { data, error } = await supabase
    .from("local_admins")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get local admin: ${error.message}`);
  }

  return data as LocalAdmin;
};

/**
 * Create a new local admin
 */
export const createLocalAdmin = async (
  request: CreateLocalAdminRequest
): Promise<LocalAdmin> => {
  const localAdminData: LocalAdminInsert = {
    user_id: request.user_id,
    email: request.email,
    full_name: request.full_name,
    whatsapp_number: request.whatsapp_number,
    availability_status: request.availability_status || "available",
    max_capacity: request.max_capacity || 5,
    earnings_summary: {
      total: 0,
      monthly: [],
    } as any,
  };

  const { data, error } = await supabase
    .from("local_admins")
    .insert(localAdminData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create local admin: ${error.message}`);
  }

  return data as LocalAdmin;
};

/**
 * Update local admin earnings after a successful payment
 */
export const updateEarnings = async (
  localAdminId: string,
  amount: number,
  month: string // Format: "2025-01"
): Promise<LocalAdmin> => {
  // Get current local admin data
  const { data: currentAdmin, error: fetchError } = await supabase
    .from("local_admins")
    .select("*")
    .eq("id", localAdminId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch local admin: ${fetchError.message}`);
  }

  const current = currentAdmin as LocalAdmin;
  const earningsSummary =
    (current.earnings_summary as any as EarningsSummary) || {
      total: 0,
      monthly: [],
    };

  // Update monthly earnings
  const monthlyEarnings = earningsSummary.monthly || [];
  const existingMonth = monthlyEarnings.find((m: any) => m.month === month);

  if (existingMonth) {
    existingMonth.amount += amount;
  } else {
    monthlyEarnings.push({ month, amount });
  }

  // Sort monthly earnings by month descending
  monthlyEarnings.sort((a: any, b: any) => b.month.localeCompare(a.month));

  // Calculate new total
  const newTotal = earningsSummary.total + amount;

  const updatedEarnings: EarningsSummary = {
    total: newTotal,
    monthly: monthlyEarnings,
  };

  // Update local admin
  const updateData: LocalAdminUpdate = {
    earnings_summary: updatedEarnings as any,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("local_admins")
    .update(updateData)
    .eq("id", localAdminId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update earnings: ${error.message}`);
  }

  return data as LocalAdmin;
};

/**
 * Get available local admins (not at capacity)
 */
export const getAvailableLocalAdmins = async (): Promise<LocalAdmin[]> => {
  const { data, error } = await supabase
    .from("local_admins")
    .select("*")
    .eq("availability_status", "available")
    .order("max_capacity", { ascending: false });

  if (error) {
    throw new Error(`Failed to get available local admins: ${error.message}`);
  }

  return data as LocalAdmin[];
};

/**
 * Assign a local admin to a masjid (Premium tier only)
 */
export const assignLocalAdmin = async (
  request: AssignLocalAdminRequest
): Promise<{ success: boolean; message: string }> => {
  // Get local admin to check capacity
  const { data: localAdmin, error: adminError } = await supabase
    .from("local_admins")
    .select("*")
    .eq("id", request.local_admin_id)
    .single();

  if (adminError) {
    throw new Error(`Failed to get local admin: ${adminError.message}`);
  }

  const admin = localAdmin as LocalAdmin;

  // Count current assignments
  const { count: currentCount } = await supabase
    .from("masjids")
    .select("*", { count: "exact", head: true })
    .eq("local_admin_id", request.local_admin_id);

  const assignmentCount = currentCount || 0;

  // Check if local admin is at capacity
  if (assignmentCount >= admin.max_capacity) {
    throw new Error(
      `Local admin is at capacity (${assignmentCount}/${admin.max_capacity} masjids)`
    );
  }

  // Check if local admin is available
  if (admin.availability_status !== "available") {
    throw new Error(`Local admin is currently ${admin.availability_status}`);
  }

  // Update masjid with local admin assignment
  const masjidUpdate: MasjidUpdate = {
    local_admin_id: request.local_admin_id,
    updated_at: new Date().toISOString(),
  };

  const { error: masjidError } = await supabase
    .from("masjids")
    .update(masjidUpdate)
    .eq("id", request.masjid_id);

  if (masjidError) {
    throw new Error(
      `Failed to assign local admin to masjid: ${masjidError.message}`
    );
  }

  // Update availability status if at capacity
  const newCount = assignmentCount + 1;
  if (newCount >= admin.max_capacity) {
    const adminUpdate: LocalAdminUpdate = {
      availability_status: "at_capacity",
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("local_admins")
      .update(adminUpdate)
      .eq("id", request.local_admin_id);
  }

  return {
    success: true,
    message: `Local admin assigned successfully (${newCount}/${admin.max_capacity} masjids)`,
  };
};

/**
 * Unassign local admin from a masjid
 */
export const unassignLocalAdmin = async (
  masjidId: string
): Promise<{ success: boolean; message: string }> => {
  // Get masjid to find current local admin
  const { data: masjid, error: masjidFetchError } = await supabase
    .from("masjids")
    .select("local_admin_id")
    .eq("id", masjidId)
    .single();

  if (masjidFetchError) {
    throw new Error(`Failed to get masjid: ${masjidFetchError.message}`);
  }

  const localAdminId = masjid.local_admin_id;

  if (!localAdminId) {
    return {
      success: true,
      message: "No local admin assigned to this masjid",
    };
  }

  // Remove local admin from masjid
  const masjidUpdate: MasjidUpdate = {
    local_admin_id: null,
    updated_at: new Date().toISOString(),
  };

  const { error: masjidError } = await supabase
    .from("masjids")
    .update(masjidUpdate)
    .eq("id", masjidId);

  if (masjidError) {
    throw new Error(`Failed to unassign local admin: ${masjidError.message}`);
  }

  // Decrement local admin's count
  const { data: localAdmin, error: adminError } = await supabase
    .from("local_admins")
    .select("*")
    .eq("id", localAdminId)
    .single();

  if (adminError) {
    throw new Error(`Failed to get local admin: ${adminError.message}`);
  }

  const admin = localAdmin as LocalAdmin;

  // Count remaining assignments
  const { count: remainingCount } = await supabase
    .from("masjids")
    .select("*", { count: "exact", head: true })
    .eq("local_admin_id", localAdminId);

  const newCount = (remainingCount || 1) - 1;

  // Update availability status to available since capacity freed up
  const adminUpdate: LocalAdminUpdate = {
    availability_status: "available",
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("local_admins")
    .update(adminUpdate)
    .eq("id", localAdminId);

  if (updateError) {
    throw new Error(
      `Failed to update local admin status: ${updateError.message}`
    );
  }

  return {
    success: true,
    message: `Local admin unassigned successfully (${newCount}/${admin.max_capacity} masjids remaining)`,
  };
};

/**
 * Get local admin with their assigned masjids
 */
export const getLocalAdminWithMasjids = async (
  localAdminId: string
): Promise<LocalAdminWithMasjids | null> => {
  const { data: admin, error: adminError } = await supabase
    .from("local_admins")
    .select("*")
    .eq("id", localAdminId)
    .single();

  if (adminError) {
    if (adminError.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get local admin: ${adminError.message}`);
  }

  const { data: masjids, error: masjidsError } = await supabase
    .from("masjids")
    .select("*")
    .eq("local_admin_id", localAdminId);

  if (masjidsError) {
    throw new Error(`Failed to get assigned masjids: ${masjidsError.message}`);
  }

  return {
    ...(admin as LocalAdmin),
    assigned_masjids: masjids || [],
  };
};

/**
 * Update local admin profile
 */
export const updateLocalAdmin = async (
  localAdminId: string,
  updates: UpdateLocalAdminRequest
): Promise<LocalAdmin> => {
  const updateData: LocalAdminUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("local_admins")
    .update(updateData)
    .eq("id", localAdminId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update local admin: ${error.message}`);
  }

  return data as LocalAdmin;
};

/**
 * Get all local admins (admin dashboard)
 */
export const getAllLocalAdmins = async (): Promise<LocalAdmin[]> => {
  const { data, error } = await supabase
    .from("local_admins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get all local admins: ${error.message}`);
  }

  return data as LocalAdmin[];
};
