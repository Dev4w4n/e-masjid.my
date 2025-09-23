/**
 * TV Display Types for Masjid Suite
 *
 * TypeScript interfaces for TV display functionality including
 * content management, prayer times, sponsorship, and display configuration
 */
export type ContentType = "image" | "youtube_video" | "text_announcement" | "event_poster";
export type ContentStatus = "pending" | "active" | "expired" | "rejected";
export type SponsorshipTier = "bronze" | "silver" | "gold" | "platinum";
export interface DisplayContent {
    id: string;
    masjid_id: string;
    display_id: string;
    title: string;
    description?: string;
    type: ContentType;
    url: string;
    thumbnail_url?: string;
    sponsorship_amount: number;
    sponsorship_tier?: SponsorshipTier;
    payment_status: "pending" | "paid" | "failed" | "refunded";
    payment_reference?: string;
    duration: number;
    start_date: string;
    end_date: string;
    status: ContentStatus;
    submitted_by: string;
    submitted_at: string;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    file_size?: number;
    file_type?: string;
    created_at: string;
    updated_at: string;
}
export interface ContentSubmission {
    title: string;
    description?: string;
    type: ContentType;
    file?: File | string;
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
export interface PrayerTimes {
    id: string;
    masjid_id: string;
    prayer_date: string;
    fajr_time: string;
    sunrise_time: string;
    dhuhr_time: string;
    asr_time: string;
    maghrib_time: string;
    isha_time: string;
    source: "JAKIM_API" | "MANUAL_ENTRY" | "CACHED_FALLBACK";
    fetched_at: string;
    manual_adjustments?: {
        [key in "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha"]?: number;
    };
    created_at: string;
    updated_at: string;
}
export interface PrayerTimeConfig {
    masjid_id: string;
    zone_code: string;
    location_name: string;
    latitude?: number;
    longitude?: number;
    show_seconds: boolean;
    highlight_current_prayer: boolean;
    next_prayer_countdown: boolean;
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
export type PrayerTimePosition = "top" | "bottom" | "left" | "right" | "center" | "hidden";
export type DisplayOrientation = "landscape" | "portrait";
export type DisplayResolution = "1920x1080" | "3840x2160" | "1366x768" | "2560x1440";
export interface DisplayConfig {
    id: string;
    masjid_id: string;
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
    prayer_time_color: string;
    prayer_time_background_opacity: number;
    show_sponsorship_amounts: boolean;
    sponsorship_tier_colors: {
        bronze: string;
        silver: string;
        gold: string;
        platinum: string;
    };
    offline_cache_duration: number;
    heartbeat_interval: number;
    max_retry_attempts: number;
    retry_backoff_multiplier: number;
    is_active: boolean;
    last_heartbeat?: string;
    created_at: string;
    updated_at: string;
}
export interface DisplayStatus {
    id: string;
    display_id: string;
    is_online: boolean;
    last_seen: string;
    current_content_id?: string;
    content_load_time: number;
    api_response_time: number;
    error_count_24h: number;
    uptime_percentage: number;
    browser_info?: string;
    screen_resolution?: string;
    device_info?: string;
    created_at: string;
    updated_at: string;
}
export interface Sponsorship {
    id: string;
    content_id: string;
    masjid_id: string;
    sponsor_name: string;
    sponsor_email?: string;
    sponsor_phone?: string;
    amount: number;
    currency: "MYR";
    tier: SponsorshipTier;
    payment_method: "fpx" | "credit_card" | "bank_transfer" | "cash";
    payment_reference: string;
    payment_status: "pending" | "paid" | "failed" | "refunded";
    payment_date?: string;
    show_sponsor_name: boolean;
    sponsor_message?: string;
    created_at: string;
    updated_at: string;
}
export interface SponsorshipPackage {
    tier: SponsorshipTier;
    name: string;
    min_amount: number;
    max_amount?: number;
    display_duration: number;
    priority_weight: number;
    features: string[];
    description: string;
}
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
        next_heartbeat_in: number;
        config_updated: boolean;
        force_refresh: boolean;
    };
}
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
export interface DisplayError {
    code: string;
    message: string;
    timestamp: string;
    display_id?: string;
    content_id?: string;
    details?: Record<string, any>;
}
export type DisplayErrorCode = "CONTENT_LOAD_FAILED" | "PRAYER_TIMES_UNAVAILABLE" | "CONFIG_SYNC_FAILED" | "NETWORK_TIMEOUT" | "CACHE_EXPIRED" | "DISPLAY_OFFLINE" | "INVALID_CONTENT_FORMAT" | "SPONSORSHIP_PAYMENT_FAILED" | "UNAUTHORIZED_DISPLAY";
export interface DisplayAnalytics {
    display_id: string;
    date: string;
    content_views: number;
    unique_content_shown: number;
    average_content_duration: number;
    uptime_minutes: number;
    downtime_minutes: number;
    error_count: number;
    total_sponsorship_revenue: number;
    active_sponsors: number;
    created_at: string;
}
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
export declare const CONTENT_TYPES: ContentType[];
export declare const SPONSORSHIP_TIERS: SponsorshipTier[];
export declare const PRAYER_TIME_POSITIONS: PrayerTimePosition[];
export declare const DEFAULT_SPONSORSHIP_PACKAGES: SponsorshipPackage[];
export declare const DEFAULT_DISPLAY_CONFIG: Partial<DisplayConfig>;
export declare const CONTENT_VALIDATION: {
    readonly title: {
        readonly minLength: 1;
        readonly maxLength: 200;
        readonly required: true;
    };
    readonly description: {
        readonly maxLength: 1000;
        readonly required: false;
    };
    readonly sponsorship_amount: {
        readonly min: 0;
        readonly max: 10000;
        readonly required: true;
    };
    readonly duration: {
        readonly min: 5;
        readonly max: 300;
        readonly required: true;
    };
};
export declare const YOUTUBE_URL_REGEX: RegExp;
export declare const DISPLAY_NAME_REGEX: RegExp;
export declare const HEX_COLOR_REGEX: RegExp;
