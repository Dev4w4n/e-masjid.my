/**
 * Display settings and configuration types
 * For TV display customization and content filtering
 */

export type TransitionType = "fade" | "slide" | "zoom" | "none";
export type PrayerTimePosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center"
  | "hidden";

/**
 * Display configuration interface
 */
export interface DisplayConfiguration {
  id: string;
  masjid_id: string;
  display_name: string;
  description?: string;

  // Content carousel settings
  carousel_interval: number; // seconds between content changes
  max_content_items: number; // maximum items in rotation
  content_transition_type: TransitionType;
  auto_refresh_interval: number; // minutes between API refreshes

  // Prayer times display
  prayer_time_position: PrayerTimePosition;
  prayer_time_font_size: "small" | "medium" | "large" | "extra_large";
  prayer_time_color: string; // hex color
  prayer_time_background_opacity: number; // 0-1

  // Sponsorship display
  show_sponsorship_amounts: boolean;
  sponsorship_tier_colors: Record<string, string>;

  // Content filtering
  content_filters: ContentFilterSettings;

  // System settings
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Content filtering settings for displays
 */
export interface ContentFilterSettings {
  // Sponsorship filtering
  min_sponsorship_amount?: number;

  // Content type filtering
  allowed_content_types: string[];

  // Duration filtering
  max_content_duration?: number; // seconds
  min_content_duration?: number; // seconds

  // Date filtering
  show_expired_content: boolean;

  // Quality filtering
  min_image_resolution?: {
    width: number;
    height: number;
  };

  // Content moderation
  require_manual_approval: boolean;
  auto_approve_trusted_users: boolean;
}

/**
 * Request interface for updating display settings
 */
export interface UpdateDisplaySettingsRequest {
  carousel_interval?: number;
  max_content_items?: number;
  content_transition_type?: TransitionType;
  auto_refresh_interval?: number;
  prayer_time_position?: PrayerTimePosition;
  prayer_time_font_size?: "small" | "medium" | "large" | "extra_large";
  prayer_time_color?: string;
  prayer_time_background_opacity?: number;
  show_sponsorship_amounts?: boolean;
  sponsorship_tier_colors?: Record<string, string>;
  content_filters?: Partial<ContentFilterSettings>;
}

/**
 * Display settings validation rules
 */
export interface DisplaySettingsValidation {
  carousel_interval: {
    min: number;
    max: number;
    default: number;
  };
  max_content_items: {
    min: number;
    max: number;
    default: number;
  };
  auto_refresh_interval: {
    min: number;
    max: number;
    default: number;
  };
  prayer_time_background_opacity: {
    min: number;
    max: number;
    default: number;
  };
}

/**
 * Default display settings
 */
export const DEFAULT_DISPLAY_SETTINGS: Partial<DisplayConfiguration> = {
  carousel_interval: 10,
  max_content_items: 20,
  content_transition_type: "fade",
  auto_refresh_interval: 5,
  prayer_time_position: "top",
  prayer_time_font_size: "large",
  prayer_time_color: "#FFFFFF",
  prayer_time_background_opacity: 0.8,
  show_sponsorship_amounts: false,
  sponsorship_tier_colors: {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
  },
  content_filters: {
    allowed_content_types: ["image", "youtube_video"],
    show_expired_content: false,
    require_manual_approval: true,
    auto_approve_trusted_users: false,
  },
  is_active: true,
};

/**
 * Display settings form validation rules
 */
export const DISPLAY_SETTINGS_VALIDATION: DisplaySettingsValidation = {
  carousel_interval: {
    min: 5,
    max: 60,
    default: 10,
  },
  max_content_items: {
    min: 5,
    max: 50,
    default: 20,
  },
  auto_refresh_interval: {
    min: 1,
    max: 30,
    default: 5,
  },
  prayer_time_background_opacity: {
    min: 0,
    max: 1,
    default: 0.8,
  },
};
