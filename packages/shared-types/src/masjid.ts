/**
 * Masjid Model Types
 *
 * Core entity representing a mosque with display infrastructure and prayer schedule configuration
 * Used across TV display app, admin dashboard, and API services
 */

// ============================================================================
// Core Masjid Types
// ============================================================================

/**
 * Main Masjid entity
 * Represents a mosque with display infrastructure and prayer schedule configuration
 */
export interface Masjid {
  /** Primary key - UUID */
  id: string;

  /** Masjid name in Bahasa Malaysia */
  name: string;

  /** Physical address */
  location: string;

  /** JAKIM API zone identifier for prayer times */
  jakim_zone_id: string;

  /** Local timezone (e.g., "Asia/Kuala_Lumpur") */
  timezone: string;

  /** Record creation timestamp */
  created_at: string;

  /** Record last update timestamp */
  updated_at: string;
}

/**
 * Data for creating a new Masjid
 * Omits auto-generated fields (id, timestamps)
 */
export interface CreateMasjidRequest {
  /** Masjid name in Bahasa Malaysia */
  name: string;

  /** Physical address */
  location: string;

  /** JAKIM API zone identifier for prayer times */
  jakim_zone_id: string;

  /** Local timezone (e.g., "Asia/Kuala_Lumpur") */
  timezone: string;
}

/**
 * Data for updating an existing Masjid
 * All fields optional for partial updates
 */
export interface UpdateMasjidRequest {
  /** Masjid name in Bahasa Malaysia */
  name?: string;

  /** Physical address */
  location?: string;

  /** JAKIM API zone identifier for prayer times */
  jakim_zone_id?: string;

  /** Local timezone (e.g., "Asia/Kuala_Lumpur") */
  timezone?: string;
}

/**
 * Extended Masjid information with related data
 * Used for admin dashboard and API responses with includes
 */
export interface MasjidWithRelations extends Masjid {
  /** Number of active display configurations */
  active_displays_count: number;

  /** Number of pending content items */
  pending_content_count: number;

  /** Total sponsorship revenue */
  total_sponsorship_revenue: number;

  /** Current prayer schedule if available */
  current_prayer_schedule?: {
    prayer_date: string;
    fajr_time: string;
    maghrib_time: string;
    source: string;
    fetched_at: string;
  };

  /** Latest display activity */
  last_display_activity?: string;
}

// ============================================================================
// JAKIM Zone Types
// ============================================================================

/**
 * JAKIM API zone information
 * Reference data for validating jakim_zone_id
 */
export interface JakimZone {
  /** Zone identifier (e.g., "WLY01") */
  id: string;

  /** Zone name in Bahasa Malaysia */
  name: string;

  /** State or region */
  state: string;

  /** Whether zone is currently active in JAKIM API */
  is_active: boolean;
}

/**
 * Commonly used JAKIM zones for validation
 */
export const JAKIM_ZONES: readonly JakimZone[] = [
  {
    id: "WLY01",
    name: "Kuala Lumpur",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
  {
    id: "WLY02",
    name: "Putrajaya",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
  {
    id: "WLY03",
    name: "Labuan",
    state: "Wilayah Persekutuan",
    is_active: true,
  },
  {
    id: "JHR01",
    name: "Pulau Aur dan Pemanggil",
    state: "Johor",
    is_active: true,
  },
  { id: "JHR02", name: "Johor Bahru", state: "Johor", is_active: true },
  { id: "JHR03", name: "Kluang", state: "Johor", is_active: true },
  { id: "JHR04", name: "Mersing", state: "Johor", is_active: true },
  { id: "KDH01", name: "Kota Setar", state: "Kedah", is_active: true },
  { id: "KDH02", name: "Kuala Muda", state: "Kedah", is_active: true },
  { id: "KDH03", name: "Padang Terap", state: "Kedah", is_active: true },
  { id: "KDH04", name: "Langkawi", state: "Kedah", is_active: true },
  { id: "KTN01", name: "Kota Bharu", state: "Kelantan", is_active: true },
  { id: "KTN03", name: "Tanah Merah", state: "Kelantan", is_active: true },
  { id: "MLK01", name: "Bandar Melaka", state: "Melaka", is_active: true },
  { id: "NGS01", name: "Jelebu", state: "Negeri Sembilan", is_active: true },
  {
    id: "NGS02",
    name: "Kuala Pilah",
    state: "Negeri Sembilan",
    is_active: true,
  },
  { id: "PHG01", name: "Kuantan", state: "Pahang", is_active: true },
  { id: "PHG02", name: "Pekan", state: "Pahang", is_active: true },
  { id: "PHG03", name: "Maran", state: "Pahang", is_active: true },
  { id: "PRK01", name: "Ipoh", state: "Perak", is_active: true },
  { id: "PRK02", name: "Kuala Kangsar", state: "Perak", is_active: true },
  { id: "PRK03", name: "Pengkalan Hulu", state: "Perak", is_active: true },
  { id: "PLS01", name: "Kangar", state: "Perlis", is_active: true },
  {
    id: "PNG01",
    name: "Timur Laut Pulau Pinang",
    state: "Pulau Pinang",
    is_active: true,
  },
  {
    id: "PNG02",
    name: "Seberang Perai",
    state: "Pulau Pinang",
    is_active: true,
  },
  { id: "SBH01", name: "Kota Kinabalu", state: "Sabah", is_active: true },
  { id: "SBH02", name: "Kudat", state: "Sabah", is_active: true },
  { id: "SBH03", name: "Sandakan", state: "Sabah", is_active: true },
  { id: "SBH04", name: "Tawau", state: "Sabah", is_active: true },
  { id: "SWK01", name: "Kuching", state: "Sarawak", is_active: true },
  { id: "SWK02", name: "Sri Aman", state: "Sarawak", is_active: true },
  { id: "SWK03", name: "Sibu", state: "Sarawak", is_active: true },
  { id: "SWK04", name: "Bintulu", state: "Sarawak", is_active: true },
  { id: "SWK05", name: "Miri", state: "Sarawak", is_active: true },
  { id: "SGR01", name: "Gombak", state: "Selangor", is_active: true },
  { id: "SGR02", name: "Klang", state: "Selangor", is_active: true },
  { id: "SGR03", name: "Kuala Selangor", state: "Selangor", is_active: true },
  {
    id: "TRG01",
    name: "Kuala Terengganu",
    state: "Terengganu",
    is_active: true,
  },
  { id: "TRG02", name: "Besut", state: "Terengganu", is_active: true },
  { id: "TRG03", name: "Dungun", state: "Terengganu", is_active: true },
  { id: "TRG04", name: "Kemaman", state: "Terengganu", is_active: true },
] as const;

/**
 * Supported timezone identifiers
 */
export const SUPPORTED_TIMEZONES: readonly string[] = [
  "Asia/Kuala_Lumpur",
  "Asia/Kuching", // For East Malaysia
] as const;

// ============================================================================
// Validation Types and Constants
// ============================================================================

/**
 * Validation constraints for Masjid fields
 */
export const MASJID_VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 100,
    required: true,
    pattern: /^[\p{L}\p{N}\s\-.,()]+$/u, // Unicode letters, numbers, spaces, and common punctuation
  },
  location: {
    minLength: 5,
    maxLength: 255,
    required: true,
  },
  jakim_zone_id: {
    required: true,
    pattern: /^[A-Z]{3}\d{2}$/, // Format: 3 letters + 2 digits (e.g., WLY01)
  },
  timezone: {
    required: true,
    allowedValues: SUPPORTED_TIMEZONES,
  },
} as const;

/**
 * Error codes specific to Masjid operations
 */
export type MasjidErrorCode =
  | "MASJID_NOT_FOUND"
  | "INVALID_JAKIM_ZONE"
  | "INVALID_TIMEZONE"
  | "MASJID_NAME_REQUIRED"
  | "MASJID_LOCATION_REQUIRED"
  | "MASJID_NAME_TOO_LONG"
  | "MASJID_LOCATION_TOO_LONG"
  | "DUPLICATE_MASJID_NAME"
  | "MASJID_HAS_ACTIVE_DISPLAYS"
  | "MASJID_HAS_PENDING_CONTENT";

/**
 * Helper function to validate JAKIM zone ID
 */
export function isValidJakimZone(zoneId: string): boolean {
  return JAKIM_ZONES.some((zone) => zone.id === zoneId && zone.is_active);
}

/**
 * Helper function to validate timezone
 */
export function isValidTimezone(timezone: string): boolean {
  return SUPPORTED_TIMEZONES.includes(timezone as any);
}

/**
 * Helper function to get JAKIM zone by ID
 */
export function getJakimZone(zoneId: string): JakimZone | undefined {
  return JAKIM_ZONES.find((zone) => zone.id === zoneId);
}

/**
 * Helper function to get zones by state
 */
export function getZonesByState(state: string): JakimZone[] {
  return JAKIM_ZONES.filter((zone) => zone.state === state && zone.is_active);
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if object is a valid Masjid
 */
export function isMasjid(obj: any): obj is Masjid {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.location === "string" &&
    typeof obj.jakim_zone_id === "string" &&
    typeof obj.timezone === "string" &&
    typeof obj.created_at === "string" &&
    typeof obj.updated_at === "string"
  );
}

/**
 * Type guard to check if object is a valid CreateMasjidRequest
 */
export function isCreateMasjidRequest(obj: any): obj is CreateMasjidRequest {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.name === "string" &&
    typeof obj.location === "string" &&
    typeof obj.jakim_zone_id === "string" &&
    typeof obj.timezone === "string"
  );
}

/**
 * Type guard to check if object is a valid UpdateMasjidRequest
 */
export function isUpdateMasjidRequest(obj: any): obj is UpdateMasjidRequest {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj.name === undefined || typeof obj.name === "string") &&
    (obj.location === undefined || typeof obj.location === "string") &&
    (obj.jakim_zone_id === undefined ||
      typeof obj.jakim_zone_id === "string") &&
    (obj.timezone === undefined || typeof obj.timezone === "string")
  );
}

// ============================================================================
// Default Values and Utilities
// ============================================================================

/**
 * Default timezone for Malaysian masjids
 */
export const DEFAULT_TIMEZONE = "Asia/Kuala_Lumpur";

/**
 * Helper function to create a new Masjid with defaults
 */
export function createMasjid(
  data: CreateMasjidRequest
): Omit<Masjid, "id" | "created_at" | "updated_at"> {
  return {
    name: data.name.trim(),
    location: data.location.trim(),
    jakim_zone_id: data.jakim_zone_id.toUpperCase(),
    timezone: data.timezone || DEFAULT_TIMEZONE,
  };
}

/**
 * Helper function to format masjid display name
 */
export function formatMasjidDisplayName(masjid: Masjid): string {
  const zone = getJakimZone(masjid.jakim_zone_id);
  if (zone) {
    return `${masjid.name} (${zone.name}, ${zone.state})`;
  }
  return masjid.name;
}

/**
 * Helper function to extract state from masjid via JAKIM zone
 */
export function getMasjidState(masjid: Masjid): string {
  const zone = getJakimZone(masjid.jakim_zone_id);
  return zone?.state || "Unknown";
}
