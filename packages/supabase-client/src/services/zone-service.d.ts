/**
 * Zone Selection Service
 * Implements IZoneSelectionService from shared-types
 * Feature: 007-tv-landing-tiers
 * Path: packages/supabase-client/src/services/zone-service.ts
 */
import { SupabaseClient } from "@supabase/supabase-js";
import { JAKIMZone, IZoneSelectionService, ZoneSelectionResponse } from "@masjid-suite/shared-types";
export type { IZoneSelectionService };
export declare class ZoneSelectionService implements IZoneSelectionService {
    private supabase;
    private zoneCache;
    private zoneCacheTimeout;
    constructor(supabase: SupabaseClient);
    /**
     * Fetch all active JAKIM zones
     */
    fetchAllZones(): Promise<JAKIMZone[]>;
    /**
     * Fetch single zone by zone_code
     */
    fetchZoneByCode(zone_code: string): Promise<JAKIMZone | null>;
    /**
     * Fetch all Asas tier mosques for a zone
     */
    fetchMasjidsByZone(zone_code: string): Promise<Record<string, unknown>[]>;
    /**
     * Search zones by partial name match
     */
    searchZones(query: string, language: "ms" | "en"): Promise<JAKIMZone[]>;
    /**
     * Select zone and get primary display for navigation
     */
    selectZone(zone_code: string): Promise<ZoneSelectionResponse>;
    /**
     * Clear cache
     */
    clearCache(): void;
}
//# sourceMappingURL=zone-service.d.ts.map