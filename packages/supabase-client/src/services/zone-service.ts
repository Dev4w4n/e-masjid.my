/**
 * Zone Selection Service
 * Implements IZoneSelectionService from shared-types
 * Feature: 007-tv-landing-tiers
 * Path: packages/supabase-client/src/services/zone-service.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  JAKIMZone,
  IZoneSelectionService,
  ZoneSelectionResponse,
  ServiceError,
  ServiceErrorCode,
} from "@masjid-suite/shared-types";

// Re-export the interface for convenience
export type { IZoneSelectionService };

// Type for database masjid row
interface DatabaseMasjid {
  id: string;
  name: string;
  display_id?: string;
  [key: string]: unknown;
}

export class ZoneSelectionService implements IZoneSelectionService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private zoneCache: Map<string, any> = new Map();
  private zoneCacheTimeout: number = 3600000; // 1 hour in ms

  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch all active JAKIM zones
   */
  async fetchAllZones(): Promise<JAKIMZone[]> {
    try {
      // Check cache first
      const cacheKey = "all_zones";
      const cached = this.zoneCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from("jakim_zones")
        .select("*")
        .eq("is_active", true)
        .order("zone_code", { ascending: true });

      if (error) {
        throw new ServiceError(
          ServiceErrorCode.SERVICE_UNAVAILABLE,
          `Failed to fetch zones: ${error.message}`,
          500,
          { original_error: error },
        );
      }

      if (!data || data.length === 0) {
        throw new ServiceError(
          ServiceErrorCode.ZONE_NOT_FOUND,
          "No active JAKIM zones found",
          404,
        );
      }

      // Cache the result
      this.zoneCache.set(cacheKey, data as JAKIMZone[]);
      setTimeout(() => this.zoneCache.delete(cacheKey), this.zoneCacheTimeout);

      return data as JAKIMZone[];
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        ServiceErrorCode.DATABASE_ERROR,
        `Zone fetch error: ${error}`,
        500,
        { error },
      );
    }
  }

  /**
   * Fetch single zone by zone_code
   */
  async fetchZoneByCode(zone_code: string): Promise<JAKIMZone | null> {
    try {
      // Validate official JAKIM zone_code format (e.g. WLY01, JHR02)
      if (!zone_code || !/^[A-Z]{3}\d{2}$/.test(zone_code)) {
        throw new ServiceError(
          ServiceErrorCode.ZONE_NOT_FOUND,
          `Invalid zone code format: ${zone_code}`,
          400,
        );
      }

      const { data, error } = await this.supabase
        .from("jakim_zones")
        .select("*")
        .eq("zone_code", zone_code)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found (expected for missing zones)
        throw new ServiceError(
          ServiceErrorCode.SERVICE_UNAVAILABLE,
          `Failed to fetch zone: ${error.message}`,
          500,
          { original_error: error },
        );
      }

      return (data as JAKIMZone) || null;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        ServiceErrorCode.DATABASE_ERROR,
        `Zone fetch error: ${error}`,
        500,
        { error },
      );
    }
  }

  /**
   * Fetch all Asas tier mosques for a zone
   */
  async fetchMasjidsByZone(
    zone_code: string,
  ): Promise<Record<string, unknown>[]> {
    try {
      // Verify zone exists
      const zone = await this.fetchZoneByCode(zone_code);
      if (!zone) {
        throw new ServiceError(
          ServiceErrorCode.ZONE_NOT_FOUND,
          `Zone not found: ${zone_code}`,
          404,
        );
      }

      const { data, error } = await this.supabase
        .from("masjids")
        .select("*")
        .eq("zone_code", zone_code)
        .eq("is_auto_populated", true)
        .eq("tier", "asas")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (error) {
        throw new ServiceError(
          ServiceErrorCode.SERVICE_UNAVAILABLE,
          `Failed to fetch masjids: ${error.message}`,
          500,
          { original_error: error },
        );
      }

      if (!data || data.length === 0) {
        throw new ServiceError(
          ServiceErrorCode.NO_MOSQUES_IN_ZONE,
          `No mosques found for zone: ${zone_code}`,
          404,
          { zone_code },
        );
      }

      return (data as Record<string, unknown>[]).sort((left, right) => {
        const leftCreated = String(left.created_at ?? "");
        const rightCreated = String(right.created_at ?? "");
        const createdComparison = leftCreated.localeCompare(rightCreated);

        if (createdComparison !== 0) {
          return createdComparison;
        }

        return String(left.id ?? "").localeCompare(String(right.id ?? ""));
      });
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        ServiceErrorCode.DATABASE_ERROR,
        `Masjid fetch error: ${error}`,
        500,
        { error },
      );
    }
  }

  /**
   * Resolve an active display linked to a masjid.
   * Discovery only routes to masjids whose linked display is active.
   */
  private async resolveActiveDisplayId(
    masjidId: string,
    displayId?: string,
  ): Promise<string> {
    if (!displayId) {
      throw new ServiceError(
        ServiceErrorCode.NO_MOSQUES_IN_ZONE,
        `No linked display available for masjid: ${masjidId}`,
        404,
        { masjidId },
      );
    }

    const { data, error } = await this.supabase
      .from("tv_displays")
      .select("id")
      .eq("id", displayId)
      .eq("masjid_id", masjidId)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new ServiceError(
        ServiceErrorCode.SERVICE_UNAVAILABLE,
        `Failed to resolve active display: ${error.message}`,
        500,
        { original_error: error },
      );
    }

    if (!data?.id) {
      throw new ServiceError(
        ServiceErrorCode.NO_MOSQUES_IN_ZONE,
        `No active linked display available for masjid: ${masjidId}`,
        404,
        { masjidId, displayId },
      );
    }

    return data.id;
  }

  /**
   * Search zones by partial name match
   */
  async searchZones(
    query: string,
    language: "ms" | "en",
  ): Promise<JAKIMZone[]> {
    try {
      const zones = await this.fetchAllZones();
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return zones;
      }

      const nameColumn = language === "ms" ? "zone_name_ms" : "zone_name_en";

      return zones.filter((zone) => {
        const zoneName = String(
          zone[nameColumn as keyof JAKIMZone] ?? "",
        ).toLowerCase();
        const zoneCode = String(zone.zone_code ?? "").toLowerCase();

        return (
          zoneName.includes(normalizedQuery) ||
          zoneCode.includes(normalizedQuery)
        );
      });
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        ServiceErrorCode.DATABASE_ERROR,
        `Zone search error: ${error}`,
        500,
        { error },
      );
    }
  }

  /**
   * Select zone and get primary display for navigation
   */
  async selectZone(zone_code: string): Promise<ZoneSelectionResponse> {
    try {
      // Fetch zone
      const zone = await this.fetchZoneByCode(zone_code);
      if (!zone) {
        throw new ServiceError(
          ServiceErrorCode.ZONE_NOT_FOUND,
          `Zone not found: ${zone_code}`,
          404,
        );
      }

      // Fetch first masjid in zone
      const masjids = await this.fetchMasjidsByZone(zone_code);
      const primary_masjid = masjids[0] as any;

      if (!primary_masjid) {
        throw new ServiceError(
          ServiceErrorCode.NO_MOSQUES_IN_ZONE,
          `No mosques available in zone: ${zone_code}`,
          404,
          { zone_code },
        );
      }

      const display_id = await this.resolveActiveDisplayId(
        primary_masjid.id,
        primary_masjid.display_id as string | undefined,
      );

      return {
        zone,
        primary_masjid,
        display_id,
      };
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        ServiceErrorCode.DATABASE_ERROR,
        `Zone selection error: ${error}`,
        500,
        { error },
      );
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.zoneCache.clear();
  }
}
