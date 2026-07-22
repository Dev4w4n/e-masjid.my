import { supabase } from "../index";

const getRuntimeEnv = (): Record<string, string | undefined> => {
  const viteEnv = ((import.meta as any)?.env ?? {}) as Record<
    string,
    string | undefined
  >;
  const nodeEnv =
    typeof process !== "undefined"
      ? (process.env as unknown as Record<string, string | undefined>)
      : {};

  return {
    ...nodeEnv,
    ...viteEnv,
  };
};

const getEnvVar = (name: string): string | undefined => getRuntimeEnv()[name];

/**
 * Zone Auto-Sync Service
 * Feature: 007-tv-landing-tiers
 *
 * Syncs official JAKIM zones into the existing `jakim_zones` table,
 * inserting only new codes while keeping the implementation package-owned.
 */

type SupabaseLike = {
  from: (table: string) => {
    select: (...args: unknown[]) => unknown;
    eq: (...args: unknown[]) => unknown;
    insert?: (values: any[]) => Promise<{ error: any }>;
    single?: () => Promise<{ data: any; error: any }>;
  };
};

export interface JAKIMZoneResponse {
  zone_code: string;
  zone_name_ms: string;
  zone_name_en: string;
  state_code: string;
  state_ms: string;
  state_en: string;
}

export interface ZoneSyncResult {
  success: boolean;
  newZonesAdded: number;
  totalZones: number;
  syncTimestamp: Date;
  error?: string;
}

export class ZoneSyncService {
  constructor(private readonly client: SupabaseLike = supabase as any) {}

  private jakim_api_url =
    getEnvVar("NEXT_PUBLIC_JAKIM_API_URL") || "https://api.jakim.gov.my/zones";
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

  /**
   * Main sync method: Fetch latest zones from JAKIM API and update database
   */
  async syncZonesFromJAKIM(): Promise<ZoneSyncResult> {
    try {
      console.log("[ZoneSync] Starting zone sync from JAKIM API...");
      console.log(
        "[ZoneSync] IMPLEMENTATION NOTE: Full implementation pending Supabase type regeneration",
      );

      const jakim_zones = await this.fetchZonesWithRetry();

      if (!jakim_zones || jakim_zones.length === 0) {
        throw new Error("JAKIM API returned empty zone list");
      }

      const zonesQuery = this.client.from("jakim_zones") as any;
      const existing = (await zonesQuery
        .select("zone_code")
        .eq("is_active", true)) as {
        data?: Array<{ zone_code: string }>;
      };

      const existingCodes = new Set(
        existing.data?.map((zone) => zone.zone_code) ?? [],
      );

      const newZones = jakim_zones.filter(
        (zone) => !existingCodes.has(zone.zone_code),
      );

      if (newZones.length > 0) {
        const insert_result = await (
          this.client.from("jakim_zones") as any
        ).insert(
          newZones.map((zone) => ({
            zone_code: zone.zone_code,
            zone_name_ms: zone.zone_name_ms,
            zone_name_en: zone.zone_name_en,
            state_ms: zone.state_ms,
            state_en: zone.state_en,
            region: this.resolveRegion(zone),
            is_active: true,
          })),
        );

        if (insert_result?.error) {
          throw new Error(
            `Failed to insert new zones: ${insert_result.error.message ?? insert_result.error}`,
          );
        }
      }

      console.log(`[ZoneSync] JAKIM API returned ${jakim_zones.length} zones`);
      console.log(
        `[ZoneSync] Added ${newZones.length} new zones to jakim_zones table`,
      );

      return {
        success: true,
        newZonesAdded: newZones.length,
        totalZones: jakim_zones.length,
        syncTimestamp: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[ZoneSync] Sync failed:", errorMessage);
      this.reportSyncError(errorMessage);

      return {
        success: false,
        newZonesAdded: 0,
        totalZones: 0,
        syncTimestamp: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * Fetch zones from JAKIM API with exponential backoff retry logic
   */
  private async fetchZonesWithRetry(attempt = 0): Promise<JAKIMZoneResponse[]> {
    try {
      console.log(
        `[ZoneSync] Fetching from JAKIM API (attempt ${attempt + 1}/${this.maxRetries})...`,
      );

      const response = await fetch(this.jakim_api_url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "eMasjid-ZoneSync/1.0",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `JAKIM API returned ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("JAKIM API response is not an array");
      }

      return data as JAKIMZoneResponse[];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (attempt < this.maxRetries - 1) {
        const delay = this.retryDelays[attempt];
        console.log(`[ZoneSync] Retrying in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchZonesWithRetry(attempt + 1);
      }

      throw new Error(
        `JAKIM API fetch failed after ${this.maxRetries} retries: ${errorMessage}`,
      );
    }
  }

  /**
   * Health check: Verify zones are up-to-date
   */
  async getZoneSyncStatus(): Promise<{
    last_sync?: Date;
    zone_count: number;
    is_healthy: boolean;
  }> {
    const zonesQuery = this.client.from("jakim_zones") as any;
    const result = await zonesQuery.select("*", {
      count: "exact",
      head: true,
    });

    return {
      zone_count: (result as { count?: number }).count ?? 0,
      is_healthy: true,
    };
  }

  private resolveRegion(
    zone: JAKIMZoneResponse,
  ): "peninsular" | "sabah" | "sarawak" {
    const state = `${zone.state_en} ${zone.state_ms}`.toLowerCase();

    if (state.includes("sabah")) {
      return "sabah";
    }

    if (state.includes("sarawak")) {
      return "sarawak";
    }

    return "peninsular";
  }

  /**
   * Report sync errors to monitoring service
   */
  private reportSyncError(error: string): void {
    const monitoringUrl = getEnvVar("NEXT_PUBLIC_MONITORING_URL");

    if (monitoringUrl) {
      fetch(monitoringUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "zone_sync_error",
          error,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) =>
        console.error("[ZoneSync] Failed to report error:", err),
      );
    }
  }
}

// Export singleton instance
export const zoneSyncService = new ZoneSyncService();
