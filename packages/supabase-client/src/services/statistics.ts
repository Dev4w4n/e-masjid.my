import { supabase } from "../index";

/**
 * Dashboard statistics response
 */
export interface DashboardStatistics {
  totalMasjids: number;
  registeredUsers: number;
}

/**
 * Generated masjid mapping verification response.
 * Mirrors the verification SQL output so the admin workflow can consume
 * the same counts from a typed service surface.
 */
export interface MappingVerificationResult {
  generatedMasjidCount: number;
  discoverableGeneratedMasjidCount: number;
  linkedDisplayCount: number;
  violationCount: number;
  excludedGeneratedMasjidIds: string[];
  deterministicZoneCount: number;
  completedAt: string;
}

type ZoneRow = {
  zone_code: string;
};

type GeneratedMasjidRow = {
  id: string;
  zone_code: string;
  created_at?: string;
};

type DisplayRow = {
  masjid_id: string;
};

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

  /**
   * Build a typed verification summary for generated masjid → display mapping.
   */
  static async getMappingVerificationResult(): Promise<MappingVerificationResult> {
    try {
      // Use an untyped client boundary for new tables that may lag generated DB typings.
      const db = supabase as any;

      const { data: zoneRows, error: zoneError } = await db
        .from("jakim_zones")
        .select("zone_code")
        .eq("is_active", true);

      if (zoneError) {
        console.error("Error fetching zone codes:", zoneError);
      }

      const activeZoneCodes = ((zoneRows ?? []) as ZoneRow[]).map(
        (zone) => zone.zone_code,
      );

      if (activeZoneCodes.length === 0) {
        return {
          generatedMasjidCount: 0,
          discoverableGeneratedMasjidCount: 0,
          linkedDisplayCount: 0,
          violationCount: 0,
          excludedGeneratedMasjidIds: [],
          deterministicZoneCount: 0,
          completedAt: new Date().toISOString(),
        };
      }

      const { data: masjidRows, error: masjidError } = await db
        .from("masjids")
        .select("id, zone_code, created_at")
        .eq("is_auto_populated", true)
        .eq("tier", "asas")
        .in("zone_code", activeZoneCodes);

      if (masjidError) {
        console.error("Error fetching generated masjids:", masjidError);
      }

      const generatedMasjids = (masjidRows ?? []) as GeneratedMasjidRow[];
      const generatedMasjidIds = generatedMasjids.map((row) => row.id);

      if (generatedMasjidIds.length === 0) {
        return {
          generatedMasjidCount: 0,
          discoverableGeneratedMasjidCount: 0,
          linkedDisplayCount: 0,
          violationCount: 0,
          excludedGeneratedMasjidIds: [],
          deterministicZoneCount: 0,
          completedAt: new Date().toISOString(),
        };
      }

      const { data: displayRows, error: displayError } = await db
        .from("tv_displays")
        .select("masjid_id")
        .in("masjid_id", generatedMasjidIds);

      if (displayError) {
        console.error("Error fetching generated displays:", displayError);
      }

      const displays = (displayRows ?? []) as DisplayRow[];
      const displayCountsByMasjid = new Map<string, number>();

      for (const display of displays) {
        displayCountsByMasjid.set(
          display.masjid_id,
          (displayCountsByMasjid.get(display.masjid_id) ?? 0) + 1,
        );
      }

      const excludedGeneratedMasjidIds = generatedMasjids
        .filter((masjid) => (displayCountsByMasjid.get(masjid.id) ?? 0) !== 1)
        .map((masjid) => masjid.id);

      const discoverableGeneratedMasjidCount =
        generatedMasjids.length - excludedGeneratedMasjidIds.length;
      const deterministicZoneCount = new Set(
        generatedMasjids
          .filter((masjid) => (displayCountsByMasjid.get(masjid.id) ?? 0) === 1)
          .map((masjid) => masjid.zone_code),
      ).size;

      return {
        generatedMasjidCount: generatedMasjids.length,
        discoverableGeneratedMasjidCount,
        linkedDisplayCount: displays.length,
        violationCount: excludedGeneratedMasjidIds.length,
        excludedGeneratedMasjidIds,
        deterministicZoneCount,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error building mapping verification result:", error);
      return {
        generatedMasjidCount: 0,
        discoverableGeneratedMasjidCount: 0,
        linkedDisplayCount: 0,
        violationCount: 0,
        excludedGeneratedMasjidIds: [],
        deterministicZoneCount: 0,
        completedAt: new Date().toISOString(),
      };
    }
  }
}
