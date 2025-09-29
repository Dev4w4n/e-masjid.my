/**
 * Display Configuration Model
 *
 * This module defines types and utilities for managing TV display configurations
 * in the Masjid Digital Display system. Display configurations control how
 * content is presented on the TV displays.
 */
/**
 * Duration in seconds for content display
 */
export type ContentDuration = number;
/**
 * Brightness level (0-100)
 */
export type BrightnessLevel = number;
/**
 * Volume level (0-100)
 */
export type VolumeLevel = number;
/**
 * Theme color scheme
 */
export type ThemeColor = "green" | "blue" | "purple" | "orange" | "red" | "teal" | "indigo" | "pink";
/**
 * Animation effects for content transitions
 */
export type AnimationEffect = "fade" | "slide" | "zoom" | "flip" | "none";
/**
 * Prayer times display format
 */
export type PrayerTimesFormat = "12-hour" | "24-hour";
/**
 * Date format for display
 */
export type DateFormat = "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd" | "dd MMM yyyy" | "MMM dd, yyyy";
/**
 * Language preference for display content
 */
export type DisplayLanguage = "ms" | "en" | "ar";
/**
 * Screen orientation
 */
export type ScreenOrientation = "landscape" | "portrait";
/**
 * Content layout mode
 */
export type LayoutMode = "fullscreen" | "split-screen" | "picture-in-picture" | "carousel";
/**
 * Emergency alert settings
 */
export interface EmergencyAlertConfig {
    enabled: boolean;
    soundEnabled: boolean;
    priority: "low" | "medium" | "high" | "critical";
    duration: ContentDuration;
    animationEffect: AnimationEffect;
    backgroundColor: string;
    textColor: string;
}
/**
 * Prayer times display settings
 */
export interface PrayerTimesConfig {
    enabled: boolean;
    format: PrayerTimesFormat;
    showSeconds: boolean;
    showHijriDate: boolean;
    highlightCurrentPrayer: boolean;
    showNextPrayer: boolean;
    position: "top" | "bottom" | "left" | "right" | "center";
    fontSize: number;
}
/**
 * Sponsorship display settings
 */
export interface SponsorshipConfig {
    enabled: boolean;
    showSponsorName: boolean;
    showSponsorLogo: boolean;
    displayDuration: ContentDuration;
    position: "top" | "bottom" | "overlay";
    opacity: number;
}
/**
 * Weather information display settings
 */
export interface WeatherConfig {
    enabled: boolean;
    showTemperature: boolean;
    showHumidity: boolean;
    showWindSpeed: boolean;
    showForecast: boolean;
    updateInterval: number;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}
/**
 * Content rotation settings
 */
export interface ContentRotationConfig {
    enabled: boolean;
    defaultDuration: ContentDuration;
    transitionEffect: AnimationEffect;
    pauseOnEmergency: boolean;
    shuffleContent: boolean;
    respectSponsorshipPriority: boolean;
}
/**
 * Schedule-based configuration
 */
export interface ScheduleConfig {
    timezone: string;
    autoTurnOn: boolean;
    autoTurnOff: boolean;
    turnOnTime: string;
    turnOffTime: string;
    weekendSchedule: boolean;
    weekendTurnOnTime?: string;
    weekendTurnOffTime?: string;
}
/**
 * Main display configuration interface
 */
export interface DisplayConfiguration {
    id: string;
    displayId: string;
    name: string;
    description?: string;
    isActive: boolean;
    brightness: BrightnessLevel;
    volume: VolumeLevel;
    orientation: ScreenOrientation;
    resolution: string;
    themeColor: ThemeColor;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: number;
    language: DisplayLanguage;
    dateFormat: DateFormat;
    currency: "MYR";
    layoutMode: LayoutMode;
    contentRotation: ContentRotationConfig;
    prayerTimes: PrayerTimesConfig;
    sponsorship: SponsorshipConfig;
    weather: WeatherConfig;
    emergencyAlert: EmergencyAlertConfig;
    schedule: ScheduleConfig;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
}
/**
 * Request for creating a new display configuration
 */
export interface CreateDisplayConfigRequest {
    displayId: string;
    name: string;
    description?: string;
    brightness?: BrightnessLevel;
    volume?: VolumeLevel;
    orientation?: ScreenOrientation;
    resolution?: string;
    themeColor?: ThemeColor;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: number;
    language?: DisplayLanguage;
    dateFormat?: DateFormat;
    layoutMode?: LayoutMode;
    contentRotation?: Partial<ContentRotationConfig>;
    prayerTimes?: Partial<PrayerTimesConfig>;
    sponsorship?: Partial<SponsorshipConfig>;
    weather?: Partial<WeatherConfig>;
    emergencyAlert?: Partial<EmergencyAlertConfig>;
    schedule?: Partial<ScheduleConfig>;
}
/**
 * Request for updating display configuration
 */
export interface UpdateDisplayConfigRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
    brightness?: BrightnessLevel;
    volume?: VolumeLevel;
    orientation?: ScreenOrientation;
    resolution?: string;
    themeColor?: ThemeColor;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: number;
    language?: DisplayLanguage;
    dateFormat?: DateFormat;
    layoutMode?: LayoutMode;
    contentRotation?: Partial<ContentRotationConfig>;
    prayerTimes?: Partial<PrayerTimesConfig>;
    sponsorship?: Partial<SponsorshipConfig>;
    weather?: Partial<WeatherConfig>;
    emergencyAlert?: Partial<EmergencyAlertConfig>;
    schedule?: Partial<ScheduleConfig>;
}
/**
 * Display configuration with additional relations
 */
export interface DisplayConfigurationWithRelations extends DisplayConfiguration {
    display: {
        id: string;
        name: string;
        location: string;
        masjidId: string;
    };
    createdByUser: {
        id: string;
        name: string;
        email: string;
    };
    lastModifiedByUser: {
        id: string;
        name: string;
        email: string;
    };
}
/**
 * Configuration validation error codes
 */
export type DisplayConfigErrorCode = "DISPLAY_CONFIG_NOT_FOUND" | "DISPLAY_CONFIG_ALREADY_EXISTS" | "INVALID_DISPLAY_ID" | "INVALID_BRIGHTNESS_LEVEL" | "INVALID_VOLUME_LEVEL" | "INVALID_RESOLUTION" | "INVALID_COLOR_CODE" | "INVALID_FONT_SIZE" | "INVALID_DURATION" | "INVALID_TIME_FORMAT" | "INVALID_TIMEZONE" | "UNAUTHORIZED_ACCESS" | "CONFIG_VERSION_CONFLICT" | "VALIDATION_ERROR";
/**
 * Default values for display configuration
 */
export declare const DEFAULT_DISPLAY_CONFIG: {
    readonly BRIGHTNESS: 80;
    readonly VOLUME: 70;
    readonly ORIENTATION: ScreenOrientation;
    readonly RESOLUTION: "1920x1080";
    readonly THEME_COLOR: ThemeColor;
    readonly BACKGROUND_COLOR: "#ffffff";
    readonly TEXT_COLOR: "#000000";
    readonly FONT_FAMILY: "Inter, sans-serif";
    readonly FONT_SIZE: 16;
    readonly LANGUAGE: DisplayLanguage;
    readonly DATE_FORMAT: DateFormat;
    readonly LAYOUT_MODE: LayoutMode;
    readonly CURRENCY: "MYR";
};
/**
 * Default content rotation configuration
 */
export declare const DEFAULT_CONTENT_ROTATION: ContentRotationConfig;
/**
 * Default prayer times configuration
 */
export declare const DEFAULT_PRAYER_TIMES: PrayerTimesConfig;
/**
 * Default sponsorship configuration
 */
export declare const DEFAULT_SPONSORSHIP: SponsorshipConfig;
/**
 * Default weather configuration
 */
export declare const DEFAULT_WEATHER: WeatherConfig;
/**
 * Default emergency alert configuration
 */
export declare const DEFAULT_EMERGENCY_ALERT: EmergencyAlertConfig;
/**
 * Default schedule configuration
 */
export declare const DEFAULT_SCHEDULE: ScheduleConfig;
/**
 * Validation constraints
 */
export declare const DISPLAY_CONFIG_VALIDATION: {
    readonly NAME: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 100;
    };
    readonly DESCRIPTION: {
        readonly MAX_LENGTH: 500;
    };
    readonly BRIGHTNESS: {
        readonly MIN: 0;
        readonly MAX: 100;
    };
    readonly VOLUME: {
        readonly MIN: 0;
        readonly MAX: 100;
    };
    readonly FONT_SIZE: {
        readonly MIN: 8;
        readonly MAX: 72;
    };
    readonly DURATION: {
        readonly MIN: 1;
        readonly MAX: 300;
    };
    readonly OPACITY: {
        readonly MIN: 0;
        readonly MAX: 100;
    };
};
/**
 * Available theme colors
 */
export declare const THEME_COLORS: readonly ThemeColor[];
/**
 * Available animation effects
 */
export declare const ANIMATION_EFFECTS: readonly AnimationEffect[];
/**
 * Available display languages
 */
export declare const DISPLAY_LANGUAGES: readonly DisplayLanguage[];
/**
 * Available date formats
 */
export declare const DATE_FORMATS: readonly DateFormat[];
/**
 * Common screen resolutions
 */
export declare const COMMON_RESOLUTIONS: readonly ["1920x1080", "1366x768", "1280x720", "3840x2160", "2560x1440", "1600x900", "1440x900", "1024x768"];
/**
 * Check if a value is a valid brightness level
 */
export declare function isValidBrightnessLevel(value: unknown): value is BrightnessLevel;
/**
 * Check if a value is a valid volume level
 */
export declare function isValidVolumeLevel(value: unknown): value is VolumeLevel;
/**
 * Check if a value is a valid theme color
 */
export declare function isValidThemeColor(value: unknown): value is ThemeColor;
/**
 * Check if a value is a valid animation effect
 */
export declare function isValidAnimationEffect(value: unknown): value is AnimationEffect;
/**
 * Check if a value is a valid display language
 */
export declare function isValidDisplayLanguage(value: unknown): value is DisplayLanguage;
/**
 * Check if a value is a valid date format
 */
export declare function isValidDateFormat(value: unknown): value is DateFormat;
/**
 * Check if a value is a valid screen resolution
 */
export declare function isValidResolution(value: unknown): value is string;
/**
 * Check if a value is a valid hex color
 */
export declare function isValidHexColor(value: unknown): value is string;
/**
 * Check if a value is a valid time in HH:mm format
 */
export declare function isValidTimeFormat(value: unknown): value is string;
/**
 * Check if a value is a valid content duration
 */
export declare function isValidContentDuration(value: unknown): value is ContentDuration;
/**
 * Check if a value is a valid opacity level
 */
export declare function isValidOpacity(value: unknown): value is number;
/**
 * Type guard for DisplayConfiguration
 */
export declare function isDisplayConfiguration(value: unknown): value is DisplayConfiguration;
/**
 * Type guard for CreateDisplayConfigRequest
 */
export declare function isCreateDisplayConfigRequest(value: unknown): value is CreateDisplayConfigRequest;
/**
 * Type guard for UpdateDisplayConfigRequest
 */
export declare function isUpdateDisplayConfigRequest(value: unknown): value is UpdateDisplayConfigRequest;
/**
 * Create a new display configuration with defaults
 */
export declare function createDisplayConfiguration(request: CreateDisplayConfigRequest, createdBy: string): DisplayConfiguration;
/**
 * Get theme color display name in multiple languages
 */
export declare function getThemeColorDisplayName(color: ThemeColor, language?: DisplayLanguage): string;
/**
 * Get language display name
 */
export declare function getLanguageDisplayName(language: DisplayLanguage): string;
/**
 * Format resolution for display
 */
export declare function formatResolution(resolution: string): string;
/**
 * Calculate recommended font size based on resolution
 */
export declare function getRecommendedFontSize(resolution: string): number;
/**
 * Validate display configuration
 */
export declare function validateDisplayConfiguration(config: Partial<DisplayConfiguration>): string[];
//# sourceMappingURL=display-config.d.ts.map