export class ZoneClient {
  static ZONE_CACHE_KEY = "emasjid_zone_list_cache";
  static ZONE_CACHE_TTL_MS = 60 * 60 * 1000;
  static ZONE_CODE_REGEX = /^[A-Z]{3}\d{2}$/;

  static async fetchAllZones() {
    const response = await fetch("/api/zones", { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Failed to fetch zones: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const zones = data.zones || [];

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          this.ZONE_CACHE_KEY,
          JSON.stringify({ data: { zones, cached_at: new Date().toISOString() }, timestamp: Date.now(), ttl_ms: this.ZONE_CACHE_TTL_MS }),
        );
      } catch {
        // ignore cache errors
      }
    }

    return zones;
  }

  static async selectZone(zone_code) {
    if (!this.isValidZoneCode(zone_code)) {
      throw new Error(`Invalid zone code format: ${zone_code}. Expected format: JHR01`);
    }

    const response = await fetch(`/api/zones/${zone_code}`, { cache: "force-cache" });
    if (response.status === 204) {
      throw new Error(`No mosques found in zone: ${zone_code}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch zone data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.primary_display_id) {
      throw new Error(`No display ID found for zone: ${zone_code}`);
    }

    return data.primary_display_id;
  }

  static isValidZoneCode(zone_code) {
    return this.ZONE_CODE_REGEX.test(zone_code);
  }

  static clearCache() {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(this.ZONE_CACHE_KEY);
      } catch {
        // ignore cache errors
      }
    }
  }
}

export const fetchAllZones = () => ZoneClient.fetchAllZones();
export const selectZone = (zone_code) => ZoneClient.selectZone(zone_code);
export const isValidZoneCode = (zone_code) => ZoneClient.isValidZoneCode(zone_code);
export const clearZoneCache = () => ZoneClient.clearCache();

export default ZoneClient;