/**
 * Zone Client Logic - Zone Selection & Routing
 * Feature: 007-tv-landing-tiers
 *
 * Package-owned client used by apps to fetch and select JAKIM zones via
 * the app's API routes while keeping the routing/caching contract reusable.
 */

export interface Zone {
  zone_code: string;
  zone_name_ms: string;
  zone_name_en: string;
  state_ms: string;
  state_en: string;
  region?: string;
  masjid_count?: number;
  is_active?: boolean;
}

export interface ZoneListResponse {
  zones: Zone[];
  cached_at?: string;
}

export interface ZoneDetailResponse {
  zone_code: string;
  mosques: Array<{
    id: string;
    name: string;
    display_id: string;
  }>;
  primary_display_id: string;
}

interface CacheEntry {
  data: ZoneListResponse;
  timestamp: number;
  ttl_ms: number;
}

export class ZoneClient {
  private static readonly ZONE_CACHE_KEY = "emasjid_zone_list_cache";
  private static readonly ZONE_CACHE_TTL_MS = 60 * 60 * 1000;
  private static readonly ZONE_CODE_REGEX = /^[A-Z]{3}\d{2}$/;
  private static readonly ZONES_INDEX_ENDPOINTS = [
    "/functions/v1/zones-index",
    "/api/zones",
  ];
  private static readonly ZONES_BY_CODE_ENDPOINTS = [
    "/functions/v1/zones-by-code",
    "/api/zones",
  ];

  private static readonly OFFICIAL_ZONE_CODES = [
    "JHR01",
    "JHR02",
    "JHR03",
    "JHR04",
    "KDH01",
    "KDH02",
    "KDH03",
    "KDH04",
    "KDH05",
    "KDH06",
    "KDH07",
    "KTN01",
    "KTN03",
    "MLK01",
    "NGS01",
    "NGS02",
    "PHG01",
    "PHG02",
    "PHG03",
    "PHG04",
    "PHG05",
    "PHG06",
    "PNG01",
    "PRK01",
    "PRK02",
    "PRK03",
    "PRK04",
    "PRK05",
    "PRK06",
    "PRK07",
    "PLS01",
    "SGR01",
    "SGR02",
    "SGR03",
    "TRG01",
    "TRG02",
    "TRG03",
    "TRG04",
    "WLY01",
    "WLY02",
    "SBH01",
    "SBH02",
    "SBH03",
    "SBH04",
    "SBH05",
    "SBH06",
    "SBH07",
    "SBH08",
    "SBH09",
    "SWK01",
    "SWK02",
    "SWK03",
    "SWK04",
    "SWK05",
    "SWK06",
    "SWK07",
    "SWK08",
    "SWK09",
  ];

  static async fetchAllZones(): Promise<Zone[]> {
    try {
      const cached = this.getFromLocalCache();
      if (cached) {
        console.log("[ZoneClient] Using cached zone list");
        return cached.zones;
      }

      console.log("[ZoneClient] Fetching zones from API");
      const data = await this.fetchZonesWithFallback();
      const zones = data.zones || [];

      this.setLocalCache(zones);
      return zones;
    } catch (error) {
      console.error("[ZoneClient] Error fetching zones:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch zones",
      );
    }
  }

  static async selectZone(zone_code: string): Promise<string> {
    try {
      if (!this.isValidZoneCode(zone_code)) {
        throw new Error(
          `Invalid zone code format: ${zone_code}. Expected format: JHR01`,
        );
      }

      console.log(`[ZoneClient] Selecting zone: ${zone_code}`);

      const data = await this.fetchZoneDetailWithFallback(zone_code);

      if (!data.primary_display_id) {
        throw new Error(`No display ID found for zone: ${zone_code}`);
      }

      console.log(
        `[ZoneClient] Zone ${zone_code} routed to display: ${data.primary_display_id}`,
      );
      return data.primary_display_id;
    } catch (error) {
      console.error("[ZoneClient] Error selecting zone:", error);
      throw error;
    }
  }

  static isValidZoneCode(zone_code: string): boolean {
    if (!this.ZONE_CODE_REGEX.test(zone_code)) {
      console.warn(`[ZoneClient] Invalid zone code format: ${zone_code}`);
      return false;
    }

    if (!this.OFFICIAL_ZONE_CODES.includes(zone_code)) {
      console.warn(`[ZoneClient] Zone code not in official list: ${zone_code}`);
      return false;
    }

    return true;
  }

  static clearCache(): void {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(this.ZONE_CACHE_KEY);
        console.log("[ZoneClient] Cache cleared");
      } catch (error) {
        console.warn("[ZoneClient] Failed to clear cache:", error);
      }
    }
  }

  private static getFromLocalCache(): ZoneListResponse | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const cached = sessionStorage.getItem(this.ZONE_CACHE_KEY);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();

      if (now - entry.timestamp > entry.ttl_ms) {
        console.log("[ZoneClient] Cache expired");
        sessionStorage.removeItem(this.ZONE_CACHE_KEY);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn("[ZoneClient] Failed to get cache:", error);
      return null;
    }
  }

  private static setLocalCache(zones: Zone[]): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const entry: CacheEntry = {
        data: { zones, cached_at: new Date().toISOString() },
        timestamp: Date.now(),
        ttl_ms: this.ZONE_CACHE_TTL_MS,
      };

      sessionStorage.setItem(this.ZONE_CACHE_KEY, JSON.stringify(entry));
      console.log(`[ZoneClient] Cached ${zones.length} zones for 1 hour`);
    } catch (error) {
      console.warn("[ZoneClient] Failed to set cache:", error);
    }
  }

  private static async fetchZonesWithFallback(): Promise<ZoneListResponse> {
    for (const endpoint of this.ZONES_INDEX_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, { cache: "force-cache" });
        if (!response.ok) {
          continue;
        }

        const data = (await response.json()) as ZoneListResponse;
        if (Array.isArray(data.zones)) {
          return data;
        }
      } catch {
        continue;
      }
    }

    throw new Error("Failed to fetch zones from all configured endpoints");
  }

  private static async fetchZoneDetailWithFallback(
    zone_code: string,
  ): Promise<ZoneDetailResponse> {
    const encodedCode = encodeURIComponent(zone_code);
    const attempts = [
      `${this.ZONES_BY_CODE_ENDPOINTS[0]}?zone_code=${encodedCode}`,
      `${this.ZONES_BY_CODE_ENDPOINTS[1]}/${encodedCode}`,
    ];

    for (const endpoint of attempts) {
      try {
        const response = await fetch(endpoint, { cache: "force-cache" });

        if (response.status === 204) {
          throw new Error(`No mosques found in zone: ${zone_code}`);
        }

        if (!response.ok) {
          continue;
        }

        const data = (await response.json()) as ZoneDetailResponse;
        if (data.primary_display_id) {
          return data;
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("No mosques found")
        ) {
          throw error;
        }
        continue;
      }
    }

    throw new Error(`Failed to fetch zone data for: ${zone_code}`);
  }
}

export const fetchAllZones = () => ZoneClient.fetchAllZones();
export const selectZone = (zone_code: string) =>
  ZoneClient.selectZone(zone_code);
export const isValidZoneCode = (zone_code: string) =>
  ZoneClient.isValidZoneCode(zone_code);
export const clearZoneCache = () => ZoneClient.clearCache();

export default ZoneClient;
