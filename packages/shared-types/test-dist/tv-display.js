"use strict";
/**
 * TV Display Types for Masjid Suite
 *
 * TypeScript interfaces for TV display functionality including
 * content management, prayer times, sponsorship, and display configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEX_COLOR_REGEX = exports.DISPLAY_NAME_REGEX = exports.YOUTUBE_URL_REGEX = exports.CONTENT_VALIDATION = exports.DEFAULT_DISPLAY_CONFIG = exports.DEFAULT_SPONSORSHIP_PACKAGES = exports.PRAYER_TIME_POSITIONS = exports.SPONSORSHIP_TIERS = exports.CONTENT_TYPES = void 0;
// ============================================================================
// Constants
// ============================================================================
exports.CONTENT_TYPES = [
    "image",
    "youtube_video",
    "text_announcement",
    "event_poster",
];
exports.SPONSORSHIP_TIERS = [
    "bronze",
    "silver",
    "gold",
    "platinum",
];
exports.PRAYER_TIME_POSITIONS = [
    "top",
    "bottom",
    "left",
    "right",
    "center",
    "hidden",
];
exports.DEFAULT_SPONSORSHIP_PACKAGES = [
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
exports.DEFAULT_DISPLAY_CONFIG = {
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
    show_sponsorship_amounts: false,
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
exports.CONTENT_VALIDATION = {
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
};
exports.YOUTUBE_URL_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
exports.DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s\-_]+$/;
exports.HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
