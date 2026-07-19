/**
 * Tier Package & Zone Type Definitions
 * Feature: 007-tv-landing-tiers
 * Created: 2026-07-16
 *
 * Shared types for TV Landing Page tier packages, JAKIM zones, mosques, and displays
 */

import type { Masjid } from "../masjid";
import type { MasjidStatus } from "../app-types";

/**
 * Tier Package IDs
 */
export type TierId = "asas" | "maju" | "gemilang" | "istimewa";

/**
 * Tier customization types
 */
export type CustomizationType = "none" | "managed" | "self-service" | "custom";

/**
 * Support level types
 */
export type SupportLevel = "basic" | "standard" | "priority" | "custom";

/**
 * Display status types for tier content
 */
export type ContentDisplayStatus =
  | "active"
  | "inactive"
  | "pending_approval"
  | "archived";

/**
 * Region types
 */
export type RegionType = "peninsular" | "sabah" | "sarawak";

export type LandingEventName =
  | "landing_cta_click"
  | "zone_selection_success"
  | "faq_item_expand"
  | "upgrade_intent";

/**
 * Tier Package Feature
 */
export interface TierFeature {
  id: string;
  name_ms: string;
  name_en: string;
  description_ms?: string;
  description_en?: string;
  supported_tiers: TierId[];
}

/**
 * Tier Package Definition
 */
export interface TierPackage {
  id: TierId;
  name_ms: string;
  name_en: string;
  description_ms: string;
  description_en: string;
  price_ms: string; // e.g., "Percuma", "RM ~75/bulan"
  price_en: string; // e.g., "Free", "~RM 75/month"
  max_screens: number | null; // null for unlimited
  requires_login: boolean;
  customization_type: CustomizationType;
  support_level: SupportLevel;
  features: TierFeature[];
  display_order: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * JAKIM Prayer Time Zone
 */
export interface JAKIMZone {
  zone_code: string; // official uppercase code (e.g., "JHR01", "WLY01")
  zone_name_ms: string;
  zone_name_en: string; // English name
  state_ms: string; // State name in Bahasa Malaysia
  state_en: string; // State name in English
  region: RegionType; // Region classification
  masjid_count: number; // Number of mosques in zone
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Zone Selection Request/Response
 */
export interface ZoneSelectionRequest {
  zone_code: string;
  language: "ms" | "en";
}

export interface ZoneSelectionResponse {
  zone: JAKIMZone;
  primary_masjid: Masjid;
  display_id: string; // Ready to navigate to /display/[display_id]
}

/**
 * Tier Upgrade Request/Response
 */
export interface TierUpgradeRequest {
  masjid_id: string;
  current_tier: TierId;
  target_tier: TierId;
  user_id?: string;
}

export interface TierUpgradeResponse {
  success: boolean;
  message_ms: string;
  message_en: string;
  action: "contact_sales" | "admin_signup" | "checkout" | "error";
  contact_url?: string; // URL to contact form or WhatsApp
  checkout_url?: string; // URL to checkout page
}

export interface BaseLandingAnalyticsEvent {
  event_name: LandingEventName;
  event_time: string; // UTC ISO-8601 timestamp
  session_id: string;
  actor_id: string;
  page_path: string;
  locale: "ms" | "en";
}

export interface LandingCtaClickEvent extends BaseLandingAnalyticsEvent {
  event_name: "landing_cta_click";
  cta_id: string;
  cta_label: string;
  tier_context: TierId;
}

export interface ZoneSelectionSuccessEvent extends BaseLandingAnalyticsEvent {
  event_name: "zone_selection_success";
  selected_zone_code: string;
  target_display_id: string;
}

export interface FaqItemExpandEvent extends BaseLandingAnalyticsEvent {
  event_name: "faq_item_expand";
  faq_id: string;
}

export interface UpgradeIntentEvent extends BaseLandingAnalyticsEvent {
  event_name: "upgrade_intent";
  from_tier: TierId;
  target_tier: TierId;
}

export type LandingAnalyticsEvent =
  | LandingCtaClickEvent
  | ZoneSelectionSuccessEvent
  | FaqItemExpandEvent
  | UpgradeIntentEvent;

/**
 * Service Error Types
 */
export enum ServiceErrorCode {
  ZONE_NOT_FOUND = "ZONE_NOT_FOUND",
  TIER_NOT_FOUND = "TIER_NOT_FOUND",
  NO_MOSQUES_IN_ZONE = "NO_MOSQUES_IN_ZONE",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  PRAYER_TIMES_UNAVAILABLE = "PRAYER_TIMES_UNAVAILABLE",
  INVALID_TIER_UPGRADE = "INVALID_TIER_UPGRADE",
  DATABASE_ERROR = "DATABASE_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN = "UNKNOWN",
}

export class ServiceError extends Error {
  constructor(
    public code: ServiceErrorCode,
    message: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

/**
 * Zone Service Interface
 */
export interface IZoneSelectionService {
  fetchAllZones(): Promise<JAKIMZone[]>;
  fetchZoneByCode(zone_code: string): Promise<JAKIMZone | null>;
  fetchMasjidsByZone(zone_code: string): Promise<Record<string, unknown>[]>;
  searchZones(query: string, language: "ms" | "en"): Promise<JAKIMZone[]>;
  selectZone(zone_code: string): Promise<ZoneSelectionResponse>;
}

/**
 * Tier Service Interface
 */
export interface ITierPackageService {
  fetchAllTiers(): Promise<TierPackage[]>;
  fetchTierById(tierId: TierId): Promise<TierPackage | null>;
  fetchTiersForLanding(): Promise<TierPackage[]>;
  compareTiers(tiers: TierId[]): Promise<Map<string, Record<TierId, unknown>>>;
}

/**
 * Prayer Times Service Interface
 */
export interface IPrayerTimesService {
  fetchPrayerTimes(zone_code: string): Promise<Record<string, unknown>>;
  refreshPrayerTimes(zone_code: string): Promise<Record<string, unknown>>;
  getPrayerTimesForDisplay(
    display_id: string,
  ): Promise<Record<string, unknown>>;
}

/**
 * Display Service Interface
 */
export interface IDisplayService {
  getDisplayConfig(display_id: string): Promise<Record<string, unknown>>;
  updateDisplayContent(
    display_id: string,
    content: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  switchZone(
    display_id: string,
    new_zone_code: string,
  ): Promise<Record<string, unknown>>;
}

/**
 * Tier Upgrade Service Interface
 */
export interface ITierUpgradeService {
  validateUpgrade(current_tier: TierId, target_tier: TierId): Promise<boolean>;
  initiateUpgrade(request: TierUpgradeRequest): Promise<TierUpgradeResponse>;
}

/**
 * Default tier feature set
 */
export const DEFAULT_TIER_FEATURES: Record<TierId, TierFeature[]> = {
  asas: [
    {
      id: "prayer_times",
      name_ms: "Waktu Solat JAKIM",
      name_en: "JAKIM Prayer Times",
      supported_tiers: ["asas", "maju", "gemilang", "istimewa"],
    },
    {
      id: "fixed_background",
      name_ms: "Latar Belakang Tetap",
      name_en: "Fixed Background",
      supported_tiers: ["asas", "maju"],
    },
    {
      id: "no_login",
      name_ms: "Tanpa Pendaftaran",
      name_en: "No Sign-up",
      supported_tiers: ["asas"],
    },
  ],
  maju: [
    {
      id: "prayer_times",
      name_ms: "Waktu Solat JAKIM",
      name_en: "JAKIM Prayer Times",
      supported_tiers: ["asas", "maju", "gemilang", "istimewa"],
    },
    {
      id: "managed_content",
      name_ms: "Kandungan Terurus (WhatsApp)",
      name_en: "Managed Content (WhatsApp)",
      supported_tiers: ["maju", "gemilang", "istimewa"],
    },
    {
      id: "single_screen",
      name_ms: "1 Skrin",
      name_en: "1 Screen",
      supported_tiers: ["asas", "maju"],
    },
  ],
  gemilang: [
    {
      id: "prayer_times",
      name_ms: "Waktu Solat JAKIM",
      name_en: "JAKIM Prayer Times",
      supported_tiers: ["asas", "maju", "gemilang", "istimewa"],
    },
    {
      id: "admin_dashboard",
      name_ms: "Papan Pemuka Pentadbir",
      name_en: "Admin Dashboard",
      supported_tiers: ["gemilang", "istimewa"],
    },
    {
      id: "custom_content",
      name_ms: "Kandungan Tersuai",
      name_en: "Custom Content",
      supported_tiers: ["gemilang", "istimewa"],
    },
    {
      id: "unlimited_screens",
      name_ms: "Skrin Tanpa Had",
      name_en: "Unlimited Screens",
      supported_tiers: ["gemilang", "istimewa"],
    },
  ],
  istimewa: [
    {
      id: "prayer_times",
      name_ms: "Waktu Solat JAKIM",
      name_en: "JAKIM Prayer Times",
      supported_tiers: ["asas", "maju", "gemilang", "istimewa"],
    },
    {
      id: "admin_dashboard",
      name_ms: "Papan Pemuka Pentadbir",
      name_en: "Admin Dashboard",
      supported_tiers: ["gemilang", "istimewa"],
    },
    {
      id: "api_integration",
      name_ms: "Penyepaduan API",
      name_en: "API Integration",
      supported_tiers: ["istimewa"],
    },
    {
      id: "multi_branch",
      name_ms: "Berbilang Cawangan",
      name_en: "Multi-branch",
      supported_tiers: ["istimewa"],
    },
    {
      id: "dedicated_support",
      name_ms: "Sokongan Khusus",
      name_en: "Dedicated Support",
      supported_tiers: ["istimewa"],
    },
  ],
};
