/**
 * Display Configuration Model
 *
 * This module defines types and utilities for managing TV display configurations
 * in the Masjid Digital Display system. Display configurations control how
 * content is presented on the TV displays.
 */

// ============================================================================
// Core Types
// ============================================================================

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
export type ThemeColor =
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "red"
  | "teal"
  | "indigo"
  | "pink";

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
export type DateFormat =
  | "dd/mm/yyyy"
  | "mm/dd/yyyy"
  | "yyyy-mm-dd"
  | "dd MMM yyyy"
  | "MMM dd, yyyy";

/**
 * Language preference for display content
 */
export type DisplayLanguage =
  | "ms" // Bahasa Malaysia
  | "en" // English
  | "ar"; // Arabic

/**
 * Screen orientation
 */
export type ScreenOrientation = "landscape" | "portrait";

/**
 * Content layout mode
 */
export type LayoutMode =
  | "fullscreen"
  | "split-screen"
  | "picture-in-picture"
  | "carousel";

/**
 * Emergency alert settings
 */
export interface EmergencyAlertConfig {
  enabled: boolean;
  soundEnabled: boolean;
  priority: "low" | "medium" | "high" | "critical";
  duration: ContentDuration; // seconds
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
  fontSize: number; // percentage
}

/**
 * Sponsorship display settings
 */
export interface SponsorshipConfig {
  enabled: boolean;
  showSponsorName: boolean;
  showSponsorLogo: boolean;
  displayDuration: ContentDuration; // seconds
  position: "top" | "bottom" | "overlay";
  opacity: number; // 0-100
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
  updateInterval: number; // minutes
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * Content rotation settings
 */
export interface ContentRotationConfig {
  enabled: boolean;
  defaultDuration: ContentDuration; // seconds
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
  turnOnTime: string; // HH:mm format
  turnOffTime: string; // HH:mm format
  weekendSchedule: boolean; // Different schedule for weekends
  weekendTurnOnTime?: string;
  weekendTurnOffTime?: string;
}

/**
 * Main display configuration interface
 */
export interface DisplayConfiguration {
  id: string;
  displayId: string;

  // Basic Settings
  name: string;
  description?: string;
  isActive: boolean;

  // Display Settings
  brightness: BrightnessLevel;
  volume: VolumeLevel;
  orientation: ScreenOrientation;
  resolution: string; // e.g., "1920x1080"

  // Theme and Appearance
  themeColor: ThemeColor;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number; // base font size in pixels

  // Localization
  language: DisplayLanguage;
  dateFormat: DateFormat;
  currency: "MYR"; // Fixed to Malaysian Ringgit

  // Layout and Content
  layoutMode: LayoutMode;
  contentRotation: ContentRotationConfig;

  // Feature Configurations
  prayerTimes: PrayerTimesConfig;
  sponsorship: SponsorshipConfig;
  weather: WeatherConfig;
  emergencyAlert: EmergencyAlertConfig;

  // Schedule
  schedule: ScheduleConfig;

  // Metadata
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user ID
  lastModifiedBy: string; // user ID
}

/**
 * Request for creating a new display configuration
 */
export interface CreateDisplayConfigRequest {
  displayId: string;
  name: string;
  description?: string;

  // Optional overrides - will use defaults if not provided
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

  // Feature configurations (optional)
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
export interface DisplayConfigurationWithRelations
  extends DisplayConfiguration {
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
export type DisplayConfigErrorCode =
  | "DISPLAY_CONFIG_NOT_FOUND"
  | "DISPLAY_CONFIG_ALREADY_EXISTS"
  | "INVALID_DISPLAY_ID"
  | "INVALID_BRIGHTNESS_LEVEL"
  | "INVALID_VOLUME_LEVEL"
  | "INVALID_RESOLUTION"
  | "INVALID_COLOR_CODE"
  | "INVALID_FONT_SIZE"
  | "INVALID_DURATION"
  | "INVALID_TIME_FORMAT"
  | "INVALID_TIMEZONE"
  | "UNAUTHORIZED_ACCESS"
  | "CONFIG_VERSION_CONFLICT"
  | "VALIDATION_ERROR";

// ============================================================================
// Constants and Validation
// ============================================================================

/**
 * Default values for display configuration
 */
export const DEFAULT_DISPLAY_CONFIG = {
  BRIGHTNESS: 80,
  VOLUME: 70,
  ORIENTATION: "landscape" as ScreenOrientation,
  RESOLUTION: "1920x1080",
  THEME_COLOR: "green" as ThemeColor,
  BACKGROUND_COLOR: "#ffffff",
  TEXT_COLOR: "#000000",
  FONT_FAMILY: "Inter, sans-serif",
  FONT_SIZE: 16,
  LANGUAGE: "ms" as DisplayLanguage,
  DATE_FORMAT: "dd/mm/yyyy" as DateFormat,
  LAYOUT_MODE: "fullscreen" as LayoutMode,
  CURRENCY: "MYR" as const,
} as const;

/**
 * Default content rotation configuration
 */
export const DEFAULT_CONTENT_ROTATION: ContentRotationConfig = {
  enabled: true,
  defaultDuration: 10,
  transitionEffect: "fade",
  pauseOnEmergency: true,
  shuffleContent: false,
  respectSponsorshipPriority: true,
};

/**
 * Default prayer times configuration
 */
export const DEFAULT_PRAYER_TIMES: PrayerTimesConfig = {
  enabled: true,
  format: "12-hour",
  showSeconds: false,
  showHijriDate: true,
  highlightCurrentPrayer: true,
  showNextPrayer: true,
  position: "top",
  fontSize: 100,
};

/**
 * Default sponsorship configuration
 */
export const DEFAULT_SPONSORSHIP: SponsorshipConfig = {
  enabled: true,
  showSponsorName: true,
  showSponsorLogo: true,
  displayDuration: 5,
  position: "bottom",
  opacity: 80,
};

/**
 * Default weather configuration
 */
export const DEFAULT_WEATHER: WeatherConfig = {
  enabled: false,
  showTemperature: true,
  showHumidity: false,
  showWindSpeed: false,
  showForecast: false,
  updateInterval: 30,
  position: "top-right",
};

/**
 * Default emergency alert configuration
 */
export const DEFAULT_EMERGENCY_ALERT: EmergencyAlertConfig = {
  enabled: true,
  soundEnabled: true,
  priority: "high",
  duration: 30,
  animationEffect: "fade",
  backgroundColor: "#ff0000",
  textColor: "#ffffff",
};

/**
 * Default schedule configuration
 */
export const DEFAULT_SCHEDULE: ScheduleConfig = {
  timezone: "Asia/Kuala_Lumpur",
  autoTurnOn: true,
  autoTurnOff: true,
  turnOnTime: "05:00",
  turnOffTime: "23:00",
  weekendSchedule: false,
};

/**
 * Validation constraints
 */
export const DISPLAY_CONFIG_VALIDATION = {
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  BRIGHTNESS: {
    MIN: 0,
    MAX: 100,
  },
  VOLUME: {
    MIN: 0,
    MAX: 100,
  },
  FONT_SIZE: {
    MIN: 8,
    MAX: 72,
  },
  DURATION: {
    MIN: 1,
    MAX: 300, // 5 minutes max
  },
  OPACITY: {
    MIN: 0,
    MAX: 100,
  },
} as const;

/**
 * Available theme colors
 */
export const THEME_COLORS: readonly ThemeColor[] = [
  "green",
  "blue",
  "purple",
  "orange",
  "red",
  "teal",
  "indigo",
  "pink",
] as const;

/**
 * Available animation effects
 */
export const ANIMATION_EFFECTS: readonly AnimationEffect[] = [
  "fade",
  "slide",
  "zoom",
  "flip",
  "none",
] as const;

/**
 * Available display languages
 */
export const DISPLAY_LANGUAGES: readonly DisplayLanguage[] = [
  "ms",
  "en",
  "ar",
] as const;

/**
 * Available date formats
 */
export const DATE_FORMATS: readonly DateFormat[] = [
  "dd/mm/yyyy",
  "mm/dd/yyyy",
  "yyyy-mm-dd",
  "dd MMM yyyy",
  "MMM dd, yyyy",
] as const;

/**
 * Common screen resolutions
 */
export const COMMON_RESOLUTIONS = [
  "1920x1080", // Full HD
  "1366x768", // HD
  "1280x720", // HD 720p
  "3840x2160", // 4K UHD
  "2560x1440", // QHD
  "1600x900", // HD+
  "1440x900", // WXGA+
  "1024x768", // XGA
] as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a value is a valid brightness level
 */
export function isValidBrightnessLevel(
  value: unknown
): value is BrightnessLevel {
  return (
    typeof value === "number" &&
    value >= DISPLAY_CONFIG_VALIDATION.BRIGHTNESS.MIN &&
    value <= DISPLAY_CONFIG_VALIDATION.BRIGHTNESS.MAX
  );
}

/**
 * Check if a value is a valid volume level
 */
export function isValidVolumeLevel(value: unknown): value is VolumeLevel {
  return (
    typeof value === "number" &&
    value >= DISPLAY_CONFIG_VALIDATION.VOLUME.MIN &&
    value <= DISPLAY_CONFIG_VALIDATION.VOLUME.MAX
  );
}

/**
 * Check if a value is a valid theme color
 */
export function isValidThemeColor(value: unknown): value is ThemeColor {
  return (
    typeof value === "string" && THEME_COLORS.includes(value as ThemeColor)
  );
}

/**
 * Check if a value is a valid animation effect
 */
export function isValidAnimationEffect(
  value: unknown
): value is AnimationEffect {
  return (
    typeof value === "string" &&
    ANIMATION_EFFECTS.includes(value as AnimationEffect)
  );
}

/**
 * Check if a value is a valid display language
 */
export function isValidDisplayLanguage(
  value: unknown
): value is DisplayLanguage {
  return (
    typeof value === "string" &&
    DISPLAY_LANGUAGES.includes(value as DisplayLanguage)
  );
}

/**
 * Check if a value is a valid date format
 */
export function isValidDateFormat(value: unknown): value is DateFormat {
  return (
    typeof value === "string" && DATE_FORMATS.includes(value as DateFormat)
  );
}

/**
 * Check if a value is a valid screen resolution
 */
export function isValidResolution(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const resolution = value.toLowerCase();
  const pattern = /^\d{3,4}x\d{3,4}$/;

  return pattern.test(resolution);
}

/**
 * Check if a value is a valid hex color
 */
export function isValidHexColor(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(value);
}

/**
 * Check if a value is a valid time in HH:mm format
 */
export function isValidTimeFormat(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(value);
}

/**
 * Check if a value is a valid content duration
 */
export function isValidContentDuration(
  value: unknown
): value is ContentDuration {
  return (
    typeof value === "number" &&
    value >= DISPLAY_CONFIG_VALIDATION.DURATION.MIN &&
    value <= DISPLAY_CONFIG_VALIDATION.DURATION.MAX
  );
}

/**
 * Check if a value is a valid opacity level
 */
export function isValidOpacity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    value >= DISPLAY_CONFIG_VALIDATION.OPACITY.MIN &&
    value <= DISPLAY_CONFIG_VALIDATION.OPACITY.MAX
  );
}

/**
 * Type guard for DisplayConfiguration
 */
export function isDisplayConfiguration(
  value: unknown
): value is DisplayConfiguration {
  if (!value || typeof value !== "object") return false;

  const config = value as any;

  return (
    typeof config.id === "string" &&
    typeof config.displayId === "string" &&
    typeof config.name === "string" &&
    typeof config.isActive === "boolean" &&
    isValidBrightnessLevel(config.brightness) &&
    isValidVolumeLevel(config.volume) &&
    isValidThemeColor(config.themeColor) &&
    isValidDisplayLanguage(config.language) &&
    typeof config.createdAt === "object" &&
    typeof config.updatedAt === "object"
  );
}

/**
 * Type guard for CreateDisplayConfigRequest
 */
export function isCreateDisplayConfigRequest(
  value: unknown
): value is CreateDisplayConfigRequest {
  if (!value || typeof value !== "object") return false;

  const request = value as any;

  return (
    typeof request.displayId === "string" &&
    typeof request.name === "string" &&
    request.name.length >= DISPLAY_CONFIG_VALIDATION.NAME.MIN_LENGTH &&
    request.name.length <= DISPLAY_CONFIG_VALIDATION.NAME.MAX_LENGTH
  );
}

/**
 * Type guard for UpdateDisplayConfigRequest
 */
export function isUpdateDisplayConfigRequest(
  value: unknown
): value is UpdateDisplayConfigRequest {
  if (!value || typeof value !== "object") return false;

  const request = value as any;

  // At least one field must be present
  const hasValidField = Object.keys(request).some((key) => {
    const val = request[key];
    switch (key) {
      case "name":
        return (
          typeof val === "string" &&
          val.length >= DISPLAY_CONFIG_VALIDATION.NAME.MIN_LENGTH &&
          val.length <= DISPLAY_CONFIG_VALIDATION.NAME.MAX_LENGTH
        );
      case "description":
        return (
          val === undefined ||
          val === null ||
          (typeof val === "string" &&
            val.length <= DISPLAY_CONFIG_VALIDATION.DESCRIPTION.MAX_LENGTH)
        );
      case "isActive":
        return typeof val === "boolean";
      case "brightness":
        return isValidBrightnessLevel(val);
      case "volume":
        return isValidVolumeLevel(val);
      case "themeColor":
        return isValidThemeColor(val);
      case "language":
        return isValidDisplayLanguage(val);
      default:
        return true; // Allow other fields for now
    }
  });

  return hasValidField;
}

/**
 * Create a new display configuration with defaults
 */
export function createDisplayConfiguration(
  request: CreateDisplayConfigRequest,
  createdBy: string
): DisplayConfiguration {
  const now = new Date();
  const configId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const baseConfig = {
    id: configId,
    displayId: request.displayId,
    name: request.name,
    isActive: true,

    // Display Settings
    brightness: request.brightness ?? DEFAULT_DISPLAY_CONFIG.BRIGHTNESS,
    volume: request.volume ?? DEFAULT_DISPLAY_CONFIG.VOLUME,
    orientation: request.orientation ?? DEFAULT_DISPLAY_CONFIG.ORIENTATION,
    resolution: request.resolution ?? DEFAULT_DISPLAY_CONFIG.RESOLUTION,

    // Theme and Appearance
    themeColor: request.themeColor ?? DEFAULT_DISPLAY_CONFIG.THEME_COLOR,
    backgroundColor:
      request.backgroundColor ?? DEFAULT_DISPLAY_CONFIG.BACKGROUND_COLOR,
    textColor: request.textColor ?? DEFAULT_DISPLAY_CONFIG.TEXT_COLOR,
    fontFamily: request.fontFamily ?? DEFAULT_DISPLAY_CONFIG.FONT_FAMILY,
    fontSize: request.fontSize ?? DEFAULT_DISPLAY_CONFIG.FONT_SIZE,

    // Localization
    language: request.language ?? DEFAULT_DISPLAY_CONFIG.LANGUAGE,
    dateFormat: request.dateFormat ?? DEFAULT_DISPLAY_CONFIG.DATE_FORMAT,
    currency: DEFAULT_DISPLAY_CONFIG.CURRENCY,

    // Layout and Content
    layoutMode: request.layoutMode ?? DEFAULT_DISPLAY_CONFIG.LAYOUT_MODE,
    contentRotation: {
      ...DEFAULT_CONTENT_ROTATION,
      ...request.contentRotation,
    },

    // Feature Configurations
    prayerTimes: { ...DEFAULT_PRAYER_TIMES, ...request.prayerTimes },
    sponsorship: { ...DEFAULT_SPONSORSHIP, ...request.sponsorship },
    weather: { ...DEFAULT_WEATHER, ...request.weather },
    emergencyAlert: { ...DEFAULT_EMERGENCY_ALERT, ...request.emergencyAlert },

    // Schedule
    schedule: { ...DEFAULT_SCHEDULE, ...request.schedule },

    // Metadata
    version: 1,
    createdAt: now,
    updatedAt: now,
    createdBy,
    lastModifiedBy: createdBy,
  };

  // Add description only if provided
  if (request.description !== undefined) {
    return { ...baseConfig, description: request.description };
  }

  return baseConfig;
}

/**
 * Get theme color display name in multiple languages
 */
export function getThemeColorDisplayName(
  color: ThemeColor,
  language: DisplayLanguage = "ms"
): string {
  const translations = {
    ms: {
      green: "Hijau",
      blue: "Biru",
      purple: "Ungu",
      orange: "Oren",
      red: "Merah",
      teal: "Teal",
      indigo: "Indigo",
      pink: "Merah Jambu",
    },
    en: {
      green: "Green",
      blue: "Blue",
      purple: "Purple",
      orange: "Orange",
      red: "Red",
      teal: "Teal",
      indigo: "Indigo",
      pink: "Pink",
    },
    ar: {
      green: "أخضر",
      blue: "أزرق",
      purple: "بنفسجي",
      orange: "برتقالي",
      red: "أحمر",
      teal: "تركوازي",
      indigo: "نيلي",
      pink: "وردي",
    },
  };

  return translations[language][color] || color;
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(language: DisplayLanguage): string {
  const displayNames = {
    ms: "Bahasa Malaysia",
    en: "English",
    ar: "العربية",
  };

  return displayNames[language] || language;
}

/**
 * Format resolution for display
 */
export function formatResolution(resolution: string): string {
  const [width, height] = resolution.split("x");
  return `${width} × ${height}`;
}

/**
 * Calculate recommended font size based on resolution
 */
export function getRecommendedFontSize(resolution: string): number {
  const parts = resolution.split("x");
  const width = parts[0] ? Number(parts[0]) : 0;

  if (width >= 3840) return 24; // 4K
  if (width >= 2560) return 20; // QHD
  if (width >= 1920) return 16; // Full HD
  if (width >= 1366) return 14; // HD
  return 12; // Lower resolutions
}

/**
 * Validate display configuration
 */
export function validateDisplayConfiguration(
  config: Partial<DisplayConfiguration>
): string[] {
  const errors: string[] = [];

  if (
    config.name &&
    (config.name.length < DISPLAY_CONFIG_VALIDATION.NAME.MIN_LENGTH ||
      config.name.length > DISPLAY_CONFIG_VALIDATION.NAME.MAX_LENGTH)
  ) {
    errors.push(
      `Name must be between ${DISPLAY_CONFIG_VALIDATION.NAME.MIN_LENGTH} and ${DISPLAY_CONFIG_VALIDATION.NAME.MAX_LENGTH} characters`
    );
  }

  if (
    config.description &&
    config.description.length > DISPLAY_CONFIG_VALIDATION.DESCRIPTION.MAX_LENGTH
  ) {
    errors.push(
      `Description must not exceed ${DISPLAY_CONFIG_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`
    );
  }

  if (
    config.brightness !== undefined &&
    !isValidBrightnessLevel(config.brightness)
  ) {
    errors.push(
      `Brightness must be between ${DISPLAY_CONFIG_VALIDATION.BRIGHTNESS.MIN} and ${DISPLAY_CONFIG_VALIDATION.BRIGHTNESS.MAX}`
    );
  }

  if (config.volume !== undefined && !isValidVolumeLevel(config.volume)) {
    errors.push(
      `Volume must be between ${DISPLAY_CONFIG_VALIDATION.VOLUME.MIN} and ${DISPLAY_CONFIG_VALIDATION.VOLUME.MAX}`
    );
  }

  if (
    config.fontSize !== undefined &&
    (config.fontSize < DISPLAY_CONFIG_VALIDATION.FONT_SIZE.MIN ||
      config.fontSize > DISPLAY_CONFIG_VALIDATION.FONT_SIZE.MAX)
  ) {
    errors.push(
      `Font size must be between ${DISPLAY_CONFIG_VALIDATION.FONT_SIZE.MIN} and ${DISPLAY_CONFIG_VALIDATION.FONT_SIZE.MAX} pixels`
    );
  }

  if (
    config.resolution !== undefined &&
    !isValidResolution(config.resolution)
  ) {
    errors.push(
      'Resolution must be in format "widthxheight" (e.g., "1920x1080")'
    );
  }

  if (
    config.backgroundColor !== undefined &&
    !isValidHexColor(config.backgroundColor)
  ) {
    errors.push('Background color must be a valid hex color (e.g., "#ffffff")');
  }

  if (config.textColor !== undefined && !isValidHexColor(config.textColor)) {
    errors.push('Text color must be a valid hex color (e.g., "#000000")');
  }

  if (
    config.schedule?.turnOnTime &&
    !isValidTimeFormat(config.schedule.turnOnTime)
  ) {
    errors.push("Turn on time must be in HH:mm format");
  }

  if (
    config.schedule?.turnOffTime &&
    !isValidTimeFormat(config.schedule.turnOffTime)
  ) {
    errors.push("Turn off time must be in HH:mm format");
  }

  return errors;
}
