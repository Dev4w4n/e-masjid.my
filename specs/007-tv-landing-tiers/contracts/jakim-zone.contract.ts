/**
 * Contract: JAKIM Zone Selection Service
 * Purpose: Define the contract for fetching JAKIM zones and discovering mosques by zone
 * 
 * This contract defines the interface for zone-based discovery that enables users to
 * find their local mosque without knowing the mosque name, using only their JAKIM zone.
 */

// ============================================================================
// INPUT / REQUEST CONTRACTS
// ============================================================================

/**
 * Request: Fetch all available JAKIM zones
 * Used on initial landing page load to populate the zone selection modal
 */
export interface FetchZonesRequest {
  // No parameters; all zones returned
}

/**
 * Response: Array of all JAKIM zones organized by region
 */
export interface FetchZonesResponse {
  zones: JAKIMZoneDTO[];
  total_count: number;
  regions: {
    peninsular: JAKIMZoneDTO[];
    sabah: JAKIMZoneDTO[];
    sarawak: JAKIMZoneDTO[];
  };
}

/**
 * Request: Fetch mosques for a specific JAKIM zone
 * Used after user selects a zone in the modal
 */
export interface FetchMasjidhByZoneRequest {
  zone_code: string;
}

/**
 * Response: First masjid (and optionally additional mosques) in the selected zone
 */
export interface FetchMasjidsByZoneResponse {
  zone_code: string;
  zone_name_ms: string;
  zone_name_en: string;
  masjids: MasjidDTO[];
  primary_display_id: string;  // UUID of first/primary masjid for this zone
}

/**
 * Request: Route user to a specific display
 * Called after zone selection to navigate to /display/[display_id]
 */
export interface RouteToDisplayRequest {
  display_id: string;
  zone_code?: string;  // Optional: for analytics/logging
}

/**
 * Response: Routing confirmation with display details
 */
export interface RouteToDisplayResponse {
  display_id: string;
  masjid_id: string;
  zone_code: string;
  tier: 'asas' | 'maju' | 'gemilang' | 'istimewa';
  route: string;  // e.g., "/display/[display_id]"
  success: boolean;
}

// ============================================================================
// DATA TRANSFER OBJECTS
// ============================================================================

export interface JAKIMZoneDTO {
  zone_code: string;        // e.g., "johor", "selangor", "kedah"
  zone_name_ms: string;     // e.g., "Johor", "Selangor"
  zone_name_en: string;     // e.g., "Johor", "Selangor"
  state_ms: string;         // e.g., "Johor", "Selangor"
  state_en: string;         // e.g., "Johor", "Selangor"
  region: 'peninsular' | 'sabah' | 'sarawak';
  masjid_count: number;     // Number of mosques available in this zone
  is_active: boolean;       // Whether zone is accepting new registrations
  prayer_times_offset?: number;  // UTC offset for reference (informational only)
}

export interface MasjidDTO {
  id: string;               // UUID (internal use)
  display_id: string;       // UUID (public-facing for /display/[display_id])
  name: string;             // Mosque name in Bahasa Malaysia
  name_en?: string;         // Mosque name in English (optional)
  zone_code: string;
  tier: 'asas' | 'maju' | 'gemilang' | 'istimewa';
  is_primary: boolean;      // Whether this is the default/first mosque for the zone
  is_auto_populated: boolean;  // Whether this was seeded by database migration
}

// ============================================================================
// EXAMPLE DATA (from spec)
// ============================================================================

/**
 * Example: All Malaysia JAKIM Zones
 */
export const EXAMPLE_ZONES_RESPONSE: FetchZonesResponse = {
  zones: [
    // Peninsular Malaysia
    {
      zone_code: 'johor',
      zone_name_ms: 'Johor',
      zone_name_en: 'Johor',
      state_ms: 'Johor',
      state_en: 'Johor',
      region: 'peninsular',
      masjid_count: 3,
      is_active: true
    },
    {
      zone_code: 'kedah',
      zone_name_ms: 'Kedah',
      zone_name_en: 'Kedah',
      state_ms: 'Kedah',
      state_en: 'Kedah',
      region: 'peninsular',
      masjid_count: 2,
      is_active: true
    },
    {
      zone_code: 'kelantan',
      zone_name_ms: 'Kelantan',
      zone_name_en: 'Kelantan',
      state_ms: 'Kelantan',
      state_en: 'Kelantan',
      region: 'peninsular',
      masjid_count: 1,
      is_active: true
    },
    {
      zone_code: 'klang',
      zone_name_ms: 'Klang',
      zone_name_en: 'Klang',
      state_ms: 'Selangor',
      state_en: 'Selangor',
      region: 'peninsular',
      masjid_count: 1,
      is_active: true
    },
    {
      zone_code: 'kualalumpur',
      zone_name_ms: 'Kuala Lumpur & Labuan',
      zone_name_en: 'Kuala Lumpur & Labuan',
      state_ms: 'Kuala Lumpur',
      state_en: 'Kuala Lumpur',
      region: 'peninsular',
      masjid_count: 2,
      is_active: true
    },
    {
      zone_code: 'perak',
      zone_name_ms: 'Perak',
      zone_name_en: 'Perak',
      state_ms: 'Perak',
      state_en: 'Perak',
      region: 'peninsular',
      masjid_count: 1,
      is_active: true
    },
    {
      zone_code: 'penang',
      zone_name_ms: 'Penang',
      zone_name_en: 'Penang',
      state_ms: 'Penang',
      state_en: 'Penang',
      region: 'peninsular',
      masjid_count: 2,
      is_active: true
    },
    {
      zone_code: 'selangor_tengah',
      zone_name_ms: 'Selangor Tengah',
      zone_name_en: 'Selangor Tengah',
      state_ms: 'Selangor',
      state_en: 'Selangor',
      region: 'peninsular',
      masjid_count: 2,
      is_active: true
    },
    {
      zone_code: 'terengganu',
      zone_name_ms: 'Terengganu',
      zone_name_en: 'Terengganu',
      state_ms: 'Terengganu',
      state_en: 'Terengganu',
      region: 'peninsular',
      masjid_count: 1,
      is_active: true
    },
    // ... (more zones)
    // Sabah
    {
      zone_code: 'sabah',
      zone_name_ms: 'Sabah',
      zone_name_en: 'Sabah',
      state_ms: 'Sabah',
      state_en: 'Sabah',
      region: 'sabah',
      masjid_count: 1,
      is_active: true
    },
    // Sarawak
    {
      zone_code: 'sarawak',
      zone_name_ms: 'Sarawak',
      zone_name_en: 'Sarawak',
      state_ms: 'Sarawak',
      state_en: 'Sarawak',
      region: 'sarawak',
      masjid_count: 1,
      is_active: true
    }
  ],
  total_count: 18,
  regions: {
    peninsular: [],  // Populated by zone filtering
    sabah: [],
    sarawak: []
  }
};

/**
 * Example: Mosques for Johor zone
 */
export const EXAMPLE_MASJIDS_FOR_ZONE: FetchMasjidsByZoneResponse = {
  zone_code: 'johor',
  zone_name_ms: 'Johor',
  zone_name_en: 'Johor',
  masjids: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      display_id: '660e8400-e29b-41d4-a716-446655440002',
      name: 'Masjid Al-Hana, Johor Bahru',
      zone_code: 'johor',
      tier: 'asas',
      is_primary: true,
      is_auto_populated: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      display_id: '660e8400-e29b-41d4-a716-446655440004',
      name: 'Surau Nur, Kota Tinggi',
      zone_code: 'johor',
      tier: 'asas',
      is_primary: false,
      is_auto_populated: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      display_id: '660e8400-e29b-41d4-a716-446655440006',
      name: 'Masjid Jame, Muar',
      zone_code: 'johor',
      tier: 'asas',
      is_primary: false,
      is_auto_populated: true
    }
  ],
  primary_display_id: '660e8400-e29b-41d4-a716-446655440002'
};

/**
 * Example: Routing confirmation
 */
export const EXAMPLE_ROUTE_TO_DISPLAY: RouteToDisplayResponse = {
  display_id: '660e8400-e29b-41d4-a716-446655440002',
  masjid_id: '550e8400-e29b-41d4-a716-446655440001',
  zone_code: 'johor',
  tier: 'asas',
  route: '/display/660e8400-e29b-41d4-a716-446655440002',
  success: true
};

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface IZoneSelectionService {
  /**
   * Fetch all available JAKIM zones
   * @returns Promise resolving to all zones, organized by region
   */
  fetchAllZones(): Promise<FetchZonesResponse>;
  
  /**
   * Fetch a single zone by code
   * @param zone_code - e.g., "johor", "selangor"
   * @returns Promise resolving to the single zone, or null if not found
   */
  fetchZoneByCode(zone_code: string): Promise<JAKIMZoneDTO | null>;
  
  /**
   * Fetch all mosques in a zone
   * @param zone_code - e.g., "johor"
   * @returns Promise resolving to mosques in the zone
   */
  fetchMasjidsByZone(zone_code: string): Promise<FetchMasjidsByZoneResponse>;
  
  /**
   * Route user to a display page
   * @param display_id - UUID of the display to route to
   * @returns Promise resolving to routing confirmation with display details
   */
  routeToDisplay(display_id: string): Promise<RouteToDisplayResponse>;
  
  /**
   * Search zones by partial name (for autocomplete functionality)
   * @param query - Partial zone name (e.g., "joh" for "Johor")
   * @param language - 'ms' for Bahasa Malaysia, 'en' for English
   * @returns Promise resolving to matching zones
   */
  searchZones(query: string, language: 'ms' | 'en'): Promise<JAKIMZoneDTO[]>;
}

// ============================================================================
// ERROR CONTRACTS
// ============================================================================

export interface ZoneSelectionError {
  code: 'ZONE_NOT_FOUND' | 'NO_MOSQUES_IN_ZONE' | 'ZONE_SERVICE_UNAVAILABLE' | 'DISPLAY_NOT_FOUND';
  message: string;
  zone_code?: string;
  display_id?: string;
}
