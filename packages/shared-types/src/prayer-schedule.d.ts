/**
 * Prayer Schedule Model
 *
 * This module defines types and utilities for managing Islamic prayer schedules
 * in the Masjid Digital Display system. It integrates with JAKIM API for Malaysian
 * prayer times and provides comprehensive prayer time management.
 */
/**
 * Islamic prayer names in English
 */
export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
/**
 * Prayer names in Bahasa Malaysia
 */
export type PrayerNameMalay = "subuh" | "syuruk" | "zohor" | "asar" | "maghrib" | "isyak";
/**
 * Prayer names in Arabic
 */
export type PrayerNameArabic = "الفجر" | "الشروق" | "الظهر" | "العصر" | "المغرب" | "العشاء";
/**
 * Prayer status for tracking
 */
export type PrayerStatus = "upcoming" | "current" | "past" | "missed";
/**
 * Prayer calculation method
 */
export type CalculationMethod = "jakim" | "mwl" | "isna" | "egypt" | "makkah" | "karachi" | "tehran" | "jafari";
/**
 * Time format preference
 */
export type TimeFormat = "12-hour" | "24-hour";
/**
 * Individual prayer time entry
 */
export interface PrayerTime {
    prayer: PrayerName;
    time: string;
    timestamp: Date;
    status: PrayerStatus;
    isJumuah?: boolean;
}
/**
 * Prayer times for a specific date
 */
export interface DailyPrayerTimes {
    date: Date;
    hijriDate: string;
    location: {
        city: string;
        state: string;
        country: string;
        jakimZone: string;
        timezone: string;
    };
    prayers: PrayerTime[];
    sunrise: string;
    calculationMethod: CalculationMethod;
    lastUpdated: Date;
}
/**
 * Prayer schedule configuration
 */
export interface PrayerScheduleConfig {
    jakimZone: string;
    calculationMethod: CalculationMethod;
    timeFormat: TimeFormat;
    showHijriDate: boolean;
    showSunrise: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    notificationSettings: {
        enabled: boolean;
        beforeMinutes: number;
        prayers: PrayerName[];
    };
    jumuahSettings: {
        enabled: boolean;
        time: string;
        replacesDhuhr: boolean;
    };
}
/**
 * Main prayer schedule interface
 */
export interface PrayerSchedule {
    id: string;
    masjidId: string;
    displayId?: string;
    config: PrayerScheduleConfig;
    currentDate: Date;
    dailyTimes: DailyPrayerTimes;
    nextPrayer: PrayerTime | null;
    currentPrayer: PrayerTime | null;
    isActive: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    lastSyncedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
}
/**
 * Request for creating a prayer schedule
 */
export interface CreatePrayerScheduleRequest {
    masjidId: string;
    displayId?: string;
    jakimZone: string;
    calculationMethod?: CalculationMethod;
    timeFormat?: TimeFormat;
    showHijriDate?: boolean;
    showSunrise?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
    notificationSettings?: Partial<PrayerScheduleConfig["notificationSettings"]>;
    jumuahSettings?: Partial<PrayerScheduleConfig["jumuahSettings"]>;
}
/**
 * Request for updating prayer schedule
 */
export interface UpdatePrayerScheduleRequest {
    jakimZone?: string;
    calculationMethod?: CalculationMethod;
    timeFormat?: TimeFormat;
    showHijriDate?: boolean;
    showSunrise?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
    notificationSettings?: Partial<PrayerScheduleConfig["notificationSettings"]>;
    jumuahSettings?: Partial<PrayerScheduleConfig["jumuahSettings"]>;
    isActive?: boolean;
}
/**
 * Prayer schedule with relations
 */
export interface PrayerScheduleWithRelations extends PrayerSchedule {
    masjid: {
        id: string;
        name: string;
        jakimZone: string;
        timezone: string;
        address: {
            city: string;
            state: string;
        };
    };
    display?: {
        id: string;
        name: string;
        location: string;
    };
}
/**
 * JAKIM API response structure
 */
export interface JakimApiResponse {
    prayerTime: Array<{
        date: string;
        day: string;
        fajr: string;
        syuruk: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
        hijri: string;
    }>;
    status: string;
    serverTime: string;
    periodType: string;
    lang: string;
    zone: string;
    bearing: string;
}
/**
 * Prayer schedule error codes
 */
export type PrayerScheduleErrorCode = "PRAYER_SCHEDULE_NOT_FOUND" | "PRAYER_SCHEDULE_ALREADY_EXISTS" | "INVALID_MASJID_ID" | "INVALID_DISPLAY_ID" | "INVALID_JAKIM_ZONE" | "INVALID_CALCULATION_METHOD" | "INVALID_TIME_FORMAT" | "INVALID_REFRESH_INTERVAL" | "JAKIM_API_ERROR" | "TIMEZONE_MISMATCH" | "UNAUTHORIZED_ACCESS" | "SYNC_FAILED" | "VALIDATION_ERROR";
/**
 * Prayer names mapping
 */
export declare const PRAYER_NAMES: {
    readonly ENGLISH: readonly ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    readonly MALAY: readonly ["subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"];
    readonly ARABIC: readonly ["الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"];
};
/**
 * Prayer name translations
 */
export declare const PRAYER_TRANSLATIONS: {
    readonly fajr: {
        readonly ms: "Subuh";
        readonly ar: "الفجر";
    };
    readonly sunrise: {
        readonly ms: "Syuruk";
        readonly ar: "الشروق";
    };
    readonly dhuhr: {
        readonly ms: "Zohor";
        readonly ar: "الظهر";
    };
    readonly asr: {
        readonly ms: "Asar";
        readonly ar: "العصر";
    };
    readonly maghrib: {
        readonly ms: "Maghrib";
        readonly ar: "المغرب";
    };
    readonly isha: {
        readonly ms: "Isyak";
        readonly ar: "العشاء";
    };
};
/**
 * Available calculation methods
 */
export declare const CALCULATION_METHODS: readonly CalculationMethod[];
/**
 * Calculation method details
 */
export declare const CALCULATION_METHOD_INFO: {
    readonly jakim: {
        readonly name: "JAKIM";
        readonly fullName: "Jabatan Kemajuan Islam Malaysia";
        readonly description: "Official Malaysian prayer times";
        readonly country: "Malaysia";
        readonly fajrAngle: 20;
        readonly ishaAngle: 18;
    };
    readonly mwl: {
        readonly name: "MWL";
        readonly fullName: "Muslim World League";
        readonly description: "Widely used international standard";
        readonly country: "Saudi Arabia";
        readonly fajrAngle: 18;
        readonly ishaAngle: 17;
    };
    readonly isna: {
        readonly name: "ISNA";
        readonly fullName: "Islamic Society of North America";
        readonly description: "Used in North America";
        readonly country: "USA/Canada";
        readonly fajrAngle: 15;
        readonly ishaAngle: 15;
    };
    readonly egypt: {
        readonly name: "Egypt";
        readonly fullName: "Egyptian General Authority of Survey";
        readonly description: "Used in Egypt and nearby countries";
        readonly country: "Egypt";
        readonly fajrAngle: 19.5;
        readonly ishaAngle: 17.5;
    };
    readonly makkah: {
        readonly name: "Makkah";
        readonly fullName: "Umm Al-Qura University, Makkah";
        readonly description: "Used in Saudi Arabia";
        readonly country: "Saudi Arabia";
        readonly fajrAngle: 18.5;
        readonly ishaAngle: "90 min";
    };
    readonly karachi: {
        readonly name: "Karachi";
        readonly fullName: "University of Islamic Sciences, Karachi";
        readonly description: "Used in Pakistan and India";
        readonly country: "Pakistan";
        readonly fajrAngle: 18;
        readonly ishaAngle: 18;
    };
    readonly tehran: {
        readonly name: "Tehran";
        readonly fullName: "Institute of Geophysics, University of Tehran";
        readonly description: "Used in Iran";
        readonly country: "Iran";
        readonly fajrAngle: 17.7;
        readonly ishaAngle: 14;
    };
    readonly jafari: {
        readonly name: "Jafari";
        readonly fullName: "Shia Ithna-Ashari, Leva Institute, Qum";
        readonly description: "Shia calculation method";
        readonly country: "Iran/Iraq";
        readonly fajrAngle: 16;
        readonly ishaAngle: 14;
    };
};
/**
 * Default prayer schedule configuration
 */
export declare const DEFAULT_PRAYER_SCHEDULE_CONFIG: PrayerScheduleConfig;
/**
 * Validation constraints
 */
export declare const PRAYER_SCHEDULE_VALIDATION: {
    readonly REFRESH_INTERVAL: {
        readonly MIN: 5;
        readonly MAX: 1440;
    };
    readonly NOTIFICATION_MINUTES: {
        readonly MIN: 1;
        readonly MAX: 60;
    };
    readonly JUMUAH_TIME: {
        readonly MIN: "11:00";
        readonly MAX: "15:00";
    };
};
/**
 * Default refresh interval in minutes
 */
export declare const DEFAULT_REFRESH_INTERVAL = 60;
/**
 * Maximum days to fetch prayer times in advance
 */
export declare const MAX_ADVANCE_DAYS = 30;
/**
 * JAKIM API endpoints
 */
export declare const JAKIM_API: {
    readonly BASE_URL: "https://www.e-solat.gov.my/index.php";
    readonly ENDPOINTS: {
        readonly TODAY: "r=esolatApi/TakwimSolat";
        readonly MONTH: "r=esolatApi/takwimsolat";
        readonly ZONES: "r=esolatApi/zonejadual";
    };
};
/**
 * Check if a value is a valid prayer name
 */
export declare function isValidPrayerName(value: unknown): value is PrayerName;
/**
 * Check if a value is a valid calculation method
 */
export declare function isValidCalculationMethod(value: unknown): value is CalculationMethod;
/**
 * Check if a value is a valid time format
 */
export declare function isValidTimeFormat(value: unknown): value is TimeFormat;
/**
 * Check if a value is a valid refresh interval
 */
export declare function isValidRefreshInterval(value: unknown): value is number;
/**
 * Type guard for PrayerTime
 */
export declare function isPrayerTime(value: unknown): value is PrayerTime;
/**
 * Type guard for DailyPrayerTimes
 */
export declare function isDailyPrayerTimes(value: unknown): value is DailyPrayerTimes;
/**
 * Type guard for PrayerSchedule
 */
export declare function isPrayerSchedule(value: unknown): value is PrayerSchedule;
/**
 * Type guard for CreatePrayerScheduleRequest
 */
export declare function isCreatePrayerScheduleRequest(value: unknown): value is CreatePrayerScheduleRequest;
/**
 * Get prayer name in specified language
 */
export declare function getPrayerName(prayer: PrayerName, language?: "ms" | "en" | "ar"): string;
/**
 * Get all prayer names in specified language
 */
export declare function getAllPrayerNames(language?: "ms" | "en" | "ar"): string[];
/**
 * Format time based on format preference
 */
export declare function formatTime(time: string, format?: TimeFormat): string;
/**
 * Calculate prayer status based on current time
 */
export declare function calculatePrayerStatus(prayerTime: Date, currentTime?: Date, nextPrayerTime?: Date): PrayerStatus;
/**
 * Find current prayer based on time
 */
export declare function getCurrentPrayer(prayers: PrayerTime[], currentTime?: Date): PrayerTime | null;
/**
 * Find next prayer based on time
 */
export declare function getNextPrayer(prayers: PrayerTime[], currentTime?: Date): PrayerTime | null;
/**
 * Create prayer schedule with defaults
 */
export declare function createPrayerSchedule(request: CreatePrayerScheduleRequest, createdBy: string): Omit<PrayerSchedule, "dailyTimes" | "nextPrayer" | "currentPrayer">;
/**
 * Convert JAKIM API response to DailyPrayerTimes
 */
export declare function convertJakimResponse(response: JakimApiResponse, timezone?: string): DailyPrayerTimes[];
/**
 * Get calculation method display name
 */
export declare function getCalculationMethodName(method: CalculationMethod, language?: "ms" | "en"): string;
/**
 * Validate prayer schedule configuration
 */
export declare function validatePrayerScheduleConfig(config: Partial<PrayerScheduleConfig>): string[];
//# sourceMappingURL=prayer-schedule.d.ts.map