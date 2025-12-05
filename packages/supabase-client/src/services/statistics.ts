import { supabase } from "../index";

/**
 * Dashboard statistics response
 */
export interface DashboardStatistics {
  totalMasjids: number;
  registeredUsers: number;
  pendingUserApprovals: number;
}

/**
 * Statistics service for fetching dashboard metrics
 */
export class StatisticsService {
  /**
   * Get dashboard statistics for admin users
   * Includes total masjids, registered users, and pending user approvals
   */
  static async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      // Fetch statistics in parallel
      const [masjidsResult, usersResult] = await Promise.all([
        // Count total masjids
        supabase.from("masjids").select("*", { count: "exact", head: true }),

        // Count registered users
        supabase.from("users").select("*", { count: "exact", head: true }),
      ]);

      // Fetch pending user approvals count using direct query
      // Note: Using 'any' cast because user_approvals table types are not yet generated
      const approvalsResult = await (supabase as any)
        .from("user_approvals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Handle errors
      if (masjidsResult.error) {
        console.error("Error fetching masjid count:", masjidsResult.error);
      }
      if (usersResult.error) {
        console.error("Error fetching user count:", usersResult.error);
      }
      if (approvalsResult.error) {
        console.error("Error fetching approval count:", approvalsResult.error);
      }

      return {
        totalMasjids: masjidsResult.count ?? 0,
        registeredUsers: usersResult.count ?? 0,
        pendingUserApprovals: approvalsResult.count ?? 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      return {
        totalMasjids: 0,
        registeredUsers: 0,
        pendingUserApprovals: 0,
      };
    }
  }
}
