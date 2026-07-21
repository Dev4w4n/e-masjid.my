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

export declare class ZoneClient {
  static fetchAllZones(): Promise<Zone[]>;
  static selectZone(zone_code: string): Promise<string>;
  static isValidZoneCode(zone_code: string): boolean;
  static clearCache(): void;
}

export declare const fetchAllZones: () => Promise<Zone[]>;
export declare const selectZone: (zone_code: string) => Promise<string>;
export declare const isValidZoneCode: (zone_code: string) => boolean;
export declare const clearZoneCache: () => void;

export default ZoneClient;
