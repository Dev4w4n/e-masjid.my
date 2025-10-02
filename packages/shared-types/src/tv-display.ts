/**
 * TV Display Types for Masjid Suite
 *
 * TypeScript interfaces for TV display functionality including
 * content management, prayer times, sponsorship, and display configuration
 */

// ============================================================================
// Content Types
// ============================================================================

export type ContentType =
  | "image"
  | "youtube_video"
  | "text_announcement"
  | "event_poster";
export type ContentStatus = "pending" | "active" | "expired" | "rejected";
export type SponsorshipTier = "bronze" | "silver" | "gold" | "platinum";

export interface DisplayContent {
  id: string;
  masjid_id: string;
  display_id: string | null;
  title: string;
  description?: string | null;
  type: ContentType;
  url: string;
  thumbnail_url?: string | null;

  // Sponsorship and financial
  sponsorship_amount: number;
  sponsorship_tier?: SponsorshipTier | null;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_reference?: string | null;

  // Display settings
  duration: number; // seconds
  start_date: string; // ISO date
  end_date: string; // ISO date

  // Content management
  status: ContentStatus;
  submitted_by: string; // user_id
  submitted_at: string; // ISO datetime
  approved_by?: string | null; // user_id
  approved_at?: string | null; // ISO datetime
  rejection_reason?: string | null;

  // Metadata
  file_size?: number | null; // bytes
  file_type?: string | null; // MIME type
  created_at: string;
  updated_at: string;

  // Per-content carousel settings (from display_content_assignments)
  // These override display-level defaults when present
  carousel_duration?: number; // seconds (5-300)
  transition_type?: "fade" | "slide" | "zoom" | "none";
  image_display_mode?: "contain" | "cover" | "fill" | "none";
  display_order?: number; // Display order in carousel (0-indexed)
}

export type CreateDisplayContent = Omit<
  DisplayContent,
  | "id"
  | "created_at"
  | "updated_at"
  | "status"
  | "submitted_at"
  | "approved_by"
  | "approved_at"
  | "rejection_reason"
> & {
  submitted_by: string;
};

export type UpdateDisplayContent = Partial<
  Omit<
    DisplayContent,
    "id" | "masjid_id" | "created_at" | "updated_at" | "submitted_by"
  >
>;

export interface ContentSubmission {
  title: string;
  description?: string;
  type: ContentType;
  file?: File | string; // File object for upload or URL for YouTube
  sponsorship_amount: number;
  duration: number;
  start_date: string;
  end_date: string;
}

export interface ContentFilters {
  status?: ContentStatus;
  type?: ContentType;
  masjid_id?: string;
  display_id?: string;
  min_sponsorship?: number;
  max_sponsorship?: number;
  date_range?: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Content Assignment Types
// ============================================================================

export interface DisplayContentAssignment {
  id: string;
  display_id: string;
  content_id: string;
  assigned_at: string; // ISO datetime
  assigned_by: string; // user_id
  display_order: number; // Order in which content appears (0-indexed)

  // Content-specific display settings (override display defaults)
  carousel_duration: number; // seconds (5-300)
  transition_type: "fade" | "slide" | "zoom" | "none";
  image_display_mode: "contain" | "cover" | "fill" | "none";
}

export type CreateContentAssignment = Omit<
  DisplayContentAssignment,
  "id" | "assigned_at"
>;

export type UpdateContentAssignment = Partial<
  Omit<DisplayContentAssignment, "id" | "display_id" | "content_id">
>;

// ============================================================================
// Prayer Times Types
// ============================================================================

export interface PrayerTimes {
  id: string;
  masjid_id: string;
  prayer_date: string; // YYYY-MM-DD

  // Prayer times
  fajr_time: string; // HH:MM
  sunrise_time: string; // HH:MM
  dhuhr_time: string; // HH:MM
  asr_time: string; // HH:MM
  maghrib_time: string; // HH:MM
  isha_time: string; // HH:MM

  // Source and metadata
  source: "JAKIM_API" | "MANUAL_ENTRY" | "CACHED_FALLBACK";
  fetched_at: string; // ISO datetime
  manual_adjustments?: {
    [key in "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha"]?: number; // minutes offset
  };

  created_at: string;
  updated_at: string;
}

export interface PrayerTimeConfig {
  masjid_id: string;

  // Location for JAKIM API
  zone_code: string; // e.g., "WLY01" for Kuala Lumpur
  location_name: string; // e.g., "Kuala Lumpur"
  latitude?: number;
  longitude?: number;

  // Display preferences
  show_seconds: boolean;
  highlight_current_prayer: boolean;
  next_prayer_countdown: boolean;

  // Manual adjustments (in minutes)
  adjustments: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Display Configuration Types
// ============================================================================

export type PrayerTimePosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center"
  | "hidden";
export type PrayerTimeLayout = "horizontal" | "vertical";
export type PrayerTimeAlignment =
  | "left"
  | "center"
  | "right"
  | "top"
  | "bottom"
  | "space-between"
  | "space-around";
export type ImageDisplayMode =
  | "contain" // Fit image within container, maintain aspect ratio (letterbox/pillarbox)
  | "cover" // Fill container, maintain aspect ratio (may crop)
  | "fill" // Stretch to fill container, may distort aspect ratio
  | "none"; // Display at original size
export type DisplayOrientation = "landscape" | "portrait";
export type DisplayResolution =
  | "1920x1080"
  | "3840x2160"
  | "1366x768"
  | "2560x1440";

export interface DisplayConfig {
  id: string;
  masjid_id: string;
  display_name: string;
  description?: string | null;

  // Physical display settings
  resolution: DisplayResolution;
  orientation: DisplayOrientation;
  is_touch_enabled: boolean;
  location_description?: string | null; // e.g., "Main Hall", "Entrance"

  // Content settings
  carousel_interval: number; // seconds between content transitions
  max_content_items: number; // maximum items in rotation
  content_transition_type: "fade" | "slide" | "zoom" | "none";
  auto_refresh_interval: number; // minutes between content refresh

  // Prayer times display
  prayer_time_position: PrayerTimePosition;
  prayer_time_font_size: "small" | "medium" | "large" | "extra_large";
  prayer_time_color: string; // hex color
  prayer_time_background_opacity: number; // 0-1
  prayer_time_layout: PrayerTimeLayout; // horizontal or vertical arrangement
  prayer_time_alignment: PrayerTimeAlignment; // alignment within container

  // Image display settings
  image_display_mode: ImageDisplayMode; // How images should be displayed
  image_background_color: string; // Background color for letterboxed images (hex)

  // Sponsorship display
  show_sponsorship_amounts: boolean;
  sponsorship_tier_colors: {
    bronze: string;
    silver: string;
    gold: string;
    platinum: string;
  };

  // Network and caching
  offline_cache_duration: number; // hours
  heartbeat_interval: number; // seconds
  max_retry_attempts: number;
  retry_backoff_multiplier: number;

  // Debug and development
  show_debug_info: boolean; // Controls visibility of debugging views (Display Status, Display Info, Configuration Updated, Offline Mode)

  // Status
  is_active: boolean;
  last_heartbeat?: string | null; // ISO datetime

  created_at: string;
  updated_at: string;
}

export type CreateDisplay = Omit<
  DisplayConfig,
  "id" | "created_at" | "updated_at" | "last_heartbeat"
>;
export type UpdateDisplay = Partial<
  Omit<DisplayConfig, "id" | "masjid_id" | "created_at" | "updated_at">
>;

export interface DisplayStatus {
  id: string;
  display_id: string;

  // Status information
  is_online: boolean;
  last_seen: string; // ISO datetime
  current_content_id?: string;

  // Performance metrics
  content_load_time: number; // milliseconds
  api_response_time: number; // milliseconds
  error_count_24h: number;
  uptime_percentage: number; // last 24 hours

  // System information
  browser_info?: string;
  screen_resolution?: string;
  device_info?: string;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Sponsorship Types
// ============================================================================

export interface Sponsorship {
  id: string;
  content_id: string;
  masjid_id: string;
  sponsor_name: string;
  sponsor_email?: string;
  sponsor_phone?: string;

  // Financial details
  amount: number;
  currency: "MYR";
  tier: SponsorshipTier;

  // Payment information
  payment_method: "fpx" | "credit_card" | "bank_transfer" | "cash";
  payment_reference: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_date?: string; // ISO datetime

  // Display preferences
  show_sponsor_name: boolean;
  sponsor_message?: string; // Optional message to display

  created_at: string;
  updated_at: string;
}

export interface SponsorshipPackage {
  tier: SponsorshipTier;
  name: string;
  min_amount: number;
  max_amount?: number;
  display_duration: number; // days
  priority_weight: number; // for content ordering
  features: string[];
  description: string;
}

// ============================================================================
// TV Display API Response Types (Basic - See api-responses.ts for extended types)
// ============================================================================

export interface ContentCarouselResponseData {
  data: DisplayContent[];
  meta: {
    total: number;
    carousel_interval: number;
    last_updated: string;
    next_refresh: string;
  };
}

export interface PrayerTimesResponseData {
  data: PrayerTimes;
  meta: {
    position: PrayerTimePosition;
    next_prayer: {
      name: string;
      time: string;
      countdown_minutes: number;
    };
    source_last_updated: string;
  };
}

export interface DisplayConfigResponseData {
  data: DisplayConfig;
  meta: {
    masjid_name: string;
    total_active_displays: number;
    config_version: string;
  };
}

export interface HeartbeatRequestData {
  display_id: string;
  current_content_id?: string;
  performance_metrics: {
    content_load_time: number;
    api_response_time: number;
    error_count: number;
  };
  system_info: {
    browser_info: string;
    screen_resolution: string;
    device_info?: string;
  };
}

export interface HeartbeatResponseData {
  data: {
    acknowledged: boolean;
    next_heartbeat_in: number; // seconds
    config_updated: boolean;
    force_refresh: boolean;
  };
}

// ============================================================================
// Caching Types
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: string;
  expires_at: string;
  cache_key: string;
}

export interface OfflineCache {
  content: CacheEntry<DisplayContent[]>;
  prayer_times: CacheEntry<PrayerTimes>;
  config: CacheEntry<DisplayConfig>;
  last_sync: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface DisplayError {
  code: string;
  message: string;
  timestamp: string;
  display_id?: string;
  content_id?: string;
  details?: Record<string, any>;
}

export type DisplayErrorCode =
  | "CONTENT_LOAD_FAILED"
  | "PRAYER_TIMES_UNAVAILABLE"
  | "CONFIG_SYNC_FAILED"
  | "NETWORK_TIMEOUT"
  | "CACHE_EXPIRED"
  | "DISPLAY_OFFLINE"
  | "INVALID_CONTENT_FORMAT"
  | "SPONSORSHIP_PAYMENT_FAILED"
  | "UNAUTHORIZED_DISPLAY";

// ============================================================================
// Analytics Types
// ============================================================================

export interface DisplayAnalytics {
  display_id: string;
  date: string; // YYYY-MM-DD

  // Content metrics
  content_views: number;
  unique_content_shown: number;
  average_content_duration: number;

  // Performance metrics
  uptime_minutes: number;
  downtime_minutes: number;
  error_count: number;

  // Sponsorship metrics
  total_sponsorship_revenue: number;
  active_sponsors: number;

  created_at: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ContentUploadForm {
  title: string;
  description?: string;
  type: ContentType;
  file?: File;
  youtube_url?: string;
  sponsorship_amount: number;
  duration: number;
  start_date: string;
  end_date: string;
  sponsor_name?: string;
  sponsor_email?: string;
  show_sponsor_name: boolean;
  sponsor_message?: string;
}

export interface PrayerTimeAdjustmentForm {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface DisplayConfigForm {
  display_name: string;
  description?: string;
  resolution: DisplayResolution;
  orientation: DisplayOrientation;
  is_touch_enabled: boolean;
  location_description?: string;
  carousel_interval: number;
  max_content_items: number;
  content_transition_type: "fade" | "slide" | "zoom" | "none";
  auto_refresh_interval: number;
  prayer_time_position: PrayerTimePosition;
  prayer_time_font_size: "small" | "medium" | "large" | "extra_large";
  show_sponsorship_amounts: boolean;
  offline_cache_duration: number;
  heartbeat_interval: number;
}

// ============================================================================
// Constants
// ============================================================================

export const CONTENT_TYPES: ContentType[] = [
  "image",
  "youtube_video",
  "text_announcement",
  "event_poster",
];

export const SPONSORSHIP_TIERS: SponsorshipTier[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
];

export const PRAYER_TIME_POSITIONS: PrayerTimePosition[] = [
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "hidden",
];

export const PRAYER_TIME_LAYOUTS: PrayerTimeLayout[] = [
  "horizontal",
  "vertical",
];

export const PRAYER_TIME_ALIGNMENTS: PrayerTimeAlignment[] = [
  "left",
  "center",
  "right",
  "top",
  "bottom",
  "space-between",
  "space-around",
];

export const DEFAULT_SPONSORSHIP_PACKAGES: SponsorshipPackage[] = [
  {
    tier: "bronze",
    name: "Bronze Sponsor",
    min_amount: 10,
    max_amount: 49,
    display_duration: 7,
    priority_weight: 1,
    features: ["Basic display", "7 days duration"],
    description: "Entry-level sponsorship for community announcements",
  },
  {
    tier: "silver",
    name: "Silver Sponsor",
    min_amount: 50,
    max_amount: 99,
    display_duration: 14,
    priority_weight: 2,
    features: ["Priority display", "14 days duration", "Sponsor name shown"],
    description: "Enhanced visibility for important announcements",
  },
  {
    tier: "gold",
    name: "Gold Sponsor",
    min_amount: 100,
    max_amount: 199,
    display_duration: 30,
    priority_weight: 3,
    features: [
      "High priority",
      "30 days duration",
      "Sponsor message",
      "Premium placement",
    ],
    description: "Premium sponsorship with extended display time",
  },
  {
    tier: "platinum",
    name: "Platinum Sponsor",
    min_amount: 200,
    display_duration: 60,
    priority_weight: 4,
    features: [
      "Highest priority",
      "60 days duration",
      "Custom sponsor message",
      "Prime time slots",
    ],
    description: "Top-tier sponsorship with maximum visibility",
  },
];

export const DEFAULT_DISPLAY_CONFIG: Partial<DisplayConfig> = {
  resolution: "1920x1080",
  orientation: "landscape",
  is_touch_enabled: false,
  carousel_interval: 10,
  max_content_items: 20,
  content_transition_type: "fade",
  auto_refresh_interval: 5,
  prayer_time_position: "top",
  prayer_time_font_size: "large",
  prayer_time_color: "#FFFFFF",
  prayer_time_background_opacity: 0.8,
  prayer_time_layout: "horizontal",
  prayer_time_alignment: "center",
  image_display_mode: "contain",
  image_background_color: "#000000",
  show_sponsorship_amounts: false,
  show_debug_info: false,
  sponsorship_tier_colors: {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
  },
  offline_cache_duration: 24,
  heartbeat_interval: 30,
  max_retry_attempts: 3,
  retry_backoff_multiplier: 2,
  is_active: true,
};

// ============================================================================
// Validation Schemas (for use with validation libraries)
// ============================================================================

export const CONTENT_VALIDATION = {
  title: {
    minLength: 1,
    maxLength: 200,
    required: true,
  },
  description: {
    maxLength: 1000,
    required: false,
  },
  sponsorship_amount: {
    min: 0,
    max: 10000,
    required: true,
  },
  duration: {
    min: 5,
    max: 300,
    required: true,
  },
} as const;

export const YOUTUBE_URL_REGEX =
  /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
export const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s\-_]+$/;
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
