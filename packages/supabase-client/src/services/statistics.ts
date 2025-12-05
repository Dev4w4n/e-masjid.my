import { supabase } from "../index";

/**
 * Dashboard statistics response
 */
export interface DashboardStatistics {
  totalMasjids: number;
  registeredUsers: number;
}

/**
 * Statistics service for fetching dashboard metrics
 */
export class StatisticsService {
  /**
   * Get dashboard statistics for admin users
   * Includes total masjids and registered users
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

      // Handle errors
      if (masjidsResult.error) {
        console.error("Error fetching masjid count:", masjidsResult.error);
      }
      if (usersResult.error) {
        console.error("Error fetching user count:", usersResult.error);
      }

      return {
        totalMasjids: masjidsResult.count ?? 0,
        registeredUsers: usersResult.count ?? 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      return {
        totalMasjids: 0,
        registeredUsers: 0,
      };
    }
  }
}
