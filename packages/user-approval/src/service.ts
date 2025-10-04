import supabase from "@masjid-suite/supabase-client";
import type {
  UserApproval,
  UserApprovalWithDetails,
  UserApprovalHistory,
  ApproveUserRequest,
  RejectUserRequest,
  HomeMasjidLockStatus,
} from "./types";

/**
 * Service for managing user approval workflow
 */
export class UserApprovalService {
  /**
   * Get pending user approvals for a specific masjid
   */
  static async getPendingApprovals(
    masjidId: string
  ): Promise<UserApprovalWithDetails[]> {

    const { data, error } = await supabase.rpc("get_pending_user_approvals", {
      target_masjid_id: masjidId,
    });

    if (error) {
      throw new Error(`Failed to fetch pending approvals: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all user approvals (with history) for a specific masjid
   */
  static async getApprovalsHistory(
    masjidId: string
  ): Promise<UserApprovalHistory[]> {

    const { data, error } = await supabase.rpc("get_user_approvals_history", {
      target_masjid_id: masjidId,
    });

    if (error) {
      throw new Error(`Failed to fetch approvals history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get user's current approval status
   */
  static async getUserApprovalStatus(
    userId: string
  ): Promise<UserApproval | null> {

    const { data, error } = await supabase
      .from("user_approvals")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch user approval status: ${error.message}`);
    }

    return data;
  }

  /**
   * Approve a user registration request
   */
  static async approveUser(
    request: ApproveUserRequest
  ): Promise<boolean> {

    const params: any = {
      approval_id: request.approval_id,
      approver_id: request.approver_id,
    };
    
    if (request.notes) {
      params.approval_notes = request.notes;
    }

    const { data, error } = await supabase.rpc("approve_user_registration", params);

    if (error) {
      throw new Error(`Failed to approve user: ${error.message}`);
    }

    return data || false;
  }

  /**
   * Reject a user registration request
   */
  static async rejectUser(
    request: RejectUserRequest
  ): Promise<boolean> {

    // Validate rejection notes
    if (!request.notes || request.notes.trim().length < 5) {
      throw new Error("Rejection notes are required (minimum 5 characters)");
    }

    const { data, error } = await supabase.rpc("reject_user_registration", {
      approval_id: request.approval_id,
      rejector_id: request.rejector_id,
      rejection_notes: request.notes,
    });

    if (error) {
      throw new Error(`Failed to reject user: ${error.message}`);
    }

    return data || false;
  }

  /**
   * Check if user's home masjid is locked (approved)
   */
  static async getHomeMasjidLockStatus(
    userId: string
  ): Promise<HomeMasjidLockStatus> {

    const { data, error } = await supabase
      .from("profiles")
      .select("home_masjid_id, home_masjid_approved_at")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch lock status: ${error.message}`);
    }

    return {
      is_locked: data.home_masjid_approved_at !== null,
      approved_at: data.home_masjid_approved_at,
      home_masjid_id: data.home_masjid_id,
    };
  }

  /**
   * Get pending approval count for a masjid
   */
  static async getPendingCount(masjidId: string): Promise<number> {

    const { count, error } = await supabase
      .from("user_approvals")
      .select("*", { count: "exact", head: true })
      .eq("home_masjid_id", masjidId)
      .eq("status", "pending");

    if (error) {
      throw new Error(`Failed to fetch pending count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Subscribe to real-time updates for pending approvals
   */
  static subscribeToApprovals(
    masjidId: string,
    callback: (payload: any) => void
  ) {

    const channel = supabase
      .channel(`user-approvals-${masjidId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_approvals",
          filter: `home_masjid_id=eq.${masjidId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
