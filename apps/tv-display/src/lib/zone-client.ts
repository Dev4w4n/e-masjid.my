/**
 * Zone Client Logic - Zone Selection & Routing
 * Feature: 007-tv-landing-tiers
 *
 * App-local client used by the landing page UI. The package-owned version
 * lives in packages/supabase-client and is used by the API routes.
 */

interface Zone {
  zone_code: string;
  zone_name_ms: string;
  zone_name_en: string;
  state_ms: string;
  state_en: string;
  region?: string;
  masjid_count?: number;
  is_active?: boolean;
}

interface ZoneListResponse {
  zones: Zone[];
  cached_at?: string;
}

interface ZoneDetailResponse {
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
  private static readonly ZONE_CACHE_KEY = 'emasjid_zone_list_cache';
  private static readonly ZONE_CACHE_TTL_MS = 60 * 60 * 1000;
  private static readonly ZONE_CODE_REGEX = /^[A-Z]{3}\d{2}$/;

  private static readonly OFFICIAL_ZONE_CODES = [
    'JHR01', 'JHR02', 'JHR03', 'JHR04',
    'KDH01', 'KDH02', 'KDH03', 'KDH04', 'KDH05', 'KDH06', 'KDH07',
    'KTN01', 'KTN03',
    'MLK01',
    'NSN01', 'NSN02',
    'PNG01', 'PNG02', 'PNG03', 'PNG04', 'PNG05',
    'PSG01',
    'PRK01', 'PRK02', 'PRK03', 'PRK04',
    'SGR01', 'SGR02', 'SGR03', 'SGR04', 'SGR05', 'SGR06', 'SGR07',
    'TRG01', 'TRG02',
    'SBH01', 'SBH02', 'SBH03',
    'SWK01', 'SWK02',
  ];

  static async fetchAllZones(): Promise<Zone[]> {
    try {
      const cached = this.getFromLocalCache();
      if (cached) {
        return cached.zones;
      }

      const response = await fetch('/api/zones', {
        cache: 'force-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch zones: ${response.status} ${response.statusText}`);
      }

      const data: ZoneListResponse = await response.json();
      const zones = data.zones || [];

      this.setLocalCache(zones);
      return zones;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch zones');
    }
  }

  static async selectZone(zone_code: string): Promise<string> {
    if (!this.isValidZoneCode(zone_code)) {
      throw new Error(`Invalid zone code format: ${zone_code}. Expected format: JHR01`);
    }

    const response = await fetch(`/api/zones/${zone_code}`, {
      cache: 'force-cache',
    });

    if (response.status === 204) {
      throw new Error(`No mosques found in zone: ${zone_code}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch zone data: ${response.status} ${response.statusText}`);
    }

    const data: ZoneDetailResponse = await response.json();
    if (!data.primary_display_id) {
      throw new Error(`No display ID found for zone: ${zone_code}`);
    }

    return data.primary_display_id;
  }

  static isValidZoneCode(zone_code: string): boolean {
    if (!this.ZONE_CODE_REGEX.test(zone_code)) {
      return false;
    }

    return this.OFFICIAL_ZONE_CODES.includes(zone_code);
  }

  static clearCache(): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(this.ZONE_CACHE_KEY);
      } catch {
        // ignore cache errors
      }
    }
  }

  private static getFromLocalCache(): ZoneListResponse | null {
    if (typeof window === 'undefined') {
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
        sessionStorage.removeItem(this.ZONE_CACHE_KEY);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  private static setLocalCache(zones: Zone[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const entry: CacheEntry = {
        data: { zones, cached_at: new Date().toISOString() },
        timestamp: Date.now(),
        ttl_ms: this.ZONE_CACHE_TTL_MS,
      };

      sessionStorage.setItem(this.ZONE_CACHE_KEY, JSON.stringify(entry));
    } catch {
      // ignore cache errors
    }
  }
}

export const fetchAllZones = () => ZoneClient.fetchAllZones();
export const selectZone = (zone_code: string) => ZoneClient.selectZone(zone_code);
export const isValidZoneCode = (zone_code: string) => ZoneClient.isValidZoneCode(zone_code);
export const clearZoneCache = () => ZoneClient.clearCache();

export default ZoneClient;

