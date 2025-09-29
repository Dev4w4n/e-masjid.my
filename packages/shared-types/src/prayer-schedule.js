/**
 * Prayer Schedule Model
 *
 * This module defines types and utilities for managing Islamic prayer schedules
 * in the Masjid Digital Display system. It integrates with JAKIM API for Malaysian
 * prayer times and provides comprehensive prayer time management.
 */
// ============================================================================
// Constants and Validation
// ============================================================================
/**
 * Prayer names mapping
 */
export const PRAYER_NAMES = {
    ENGLISH: ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"],
    MALAY: ["subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"],
    ARABIC: ["الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"],
};
/**
 * Prayer name translations
 */
export const PRAYER_TRANSLATIONS = {
    fajr: { ms: "Subuh", ar: "الفجر" },
    sunrise: { ms: "Syuruk", ar: "الشروق" },
    dhuhr: { ms: "Zohor", ar: "الظهر" },
    asr: { ms: "Asar", ar: "العصر" },
    maghrib: { ms: "Maghrib", ar: "المغرب" },
    isha: { ms: "Isyak", ar: "العشاء" },
};
/**
 * Available calculation methods
 */
export const CALCULATION_METHODS = [
    "jakim",
    "mwl",
    "isna",
    "egypt",
    "makkah",
    "karachi",
    "tehran",
    "jafari",
];
/**
 * Calculation method details
 */
export const CALCULATION_METHOD_INFO = {
    jakim: {
        name: "JAKIM",
        fullName: "Jabatan Kemajuan Islam Malaysia",
        description: "Official Malaysian prayer times",
        country: "Malaysia",
        fajrAngle: 20,
        ishaAngle: 18,
    },
    mwl: {
        name: "MWL",
        fullName: "Muslim World League",
        description: "Widely used international standard",
        country: "Saudi Arabia",
        fajrAngle: 18,
        ishaAngle: 17,
    },
    isna: {
        name: "ISNA",
        fullName: "Islamic Society of North America",
        description: "Used in North America",
        country: "USA/Canada",
        fajrAngle: 15,
        ishaAngle: 15,
    },
    egypt: {
        name: "Egypt",
        fullName: "Egyptian General Authority of Survey",
        description: "Used in Egypt and nearby countries",
        country: "Egypt",
        fajrAngle: 19.5,
        ishaAngle: 17.5,
    },
    makkah: {
        name: "Makkah",
        fullName: "Umm Al-Qura University, Makkah",
        description: "Used in Saudi Arabia",
        country: "Saudi Arabia",
        fajrAngle: 18.5,
        ishaAngle: "90 min",
    },
    karachi: {
        name: "Karachi",
        fullName: "University of Islamic Sciences, Karachi",
        description: "Used in Pakistan and India",
        country: "Pakistan",
        fajrAngle: 18,
        ishaAngle: 18,
    },
    tehran: {
        name: "Tehran",
        fullName: "Institute of Geophysics, University of Tehran",
        description: "Used in Iran",
        country: "Iran",
        fajrAngle: 17.7,
        ishaAngle: 14,
    },
    jafari: {
        name: "Jafari",
        fullName: "Shia Ithna-Ashari, Leva Institute, Qum",
        description: "Shia calculation method",
        country: "Iran/Iraq",
        fajrAngle: 16,
        ishaAngle: 14,
    },
};
/**
 * Default prayer schedule configuration
 */
export const DEFAULT_PRAYER_SCHEDULE_CONFIG = {
    jakimZone: "SGR01", // Default to Johor
    calculationMethod: "jakim",
    timeFormat: "12-hour",
    showHijriDate: true,
    showSunrise: true,
    autoRefresh: true,
    refreshInterval: 60, // 1 hour
    notificationSettings: {
        enabled: true,
        beforeMinutes: 15,
        prayers: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
    },
    jumuahSettings: {
        enabled: true,
        time: "13:00",
        replacesDhuhr: true,
    },
};
/**
 * Validation constraints
 */
export const PRAYER_SCHEDULE_VALIDATION = {
    REFRESH_INTERVAL: {
        MIN: 5, // 5 minutes
        MAX: 1440, // 24 hours
    },
    NOTIFICATION_MINUTES: {
        MIN: 1,
        MAX: 60,
    },
    JUMUAH_TIME: {
        MIN: "11:00",
        MAX: "15:00",
    },
};
/**
 * Default refresh interval in minutes
 */
export const DEFAULT_REFRESH_INTERVAL = 60;
/**
 * Maximum days to fetch prayer times in advance
 */
export const MAX_ADVANCE_DAYS = 30;
/**
 * JAKIM API endpoints
 */
export const JAKIM_API = {
    BASE_URL: "https://www.e-solat.gov.my/index.php",
    ENDPOINTS: {
        TODAY: "r=esolatApi/TakwimSolat",
        MONTH: "r=esolatApi/takwimsolat",
        ZONES: "r=esolatApi/zonejadual",
    },
};
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Check if a value is a valid prayer name
 */
export function isValidPrayerName(value) {
    return (typeof value === "string" &&
        PRAYER_NAMES.ENGLISH.includes(value));
}
/**
 * Check if a value is a valid calculation method
 */
export function isValidCalculationMethod(value) {
    return (typeof value === "string" &&
        CALCULATION_METHODS.includes(value));
}
/**
 * Check if a value is a valid time format
 */
export function isValidTimeFormat(value) {
    return value === "12-hour" || value === "24-hour";
}
/**
 * Check if a value is a valid refresh interval
 */
export function isValidRefreshInterval(value) {
    return (typeof value === "number" &&
        value >= PRAYER_SCHEDULE_VALIDATION.REFRESH_INTERVAL.MIN &&
        value <= PRAYER_SCHEDULE_VALIDATION.REFRESH_INTERVAL.MAX);
}
/**
 * Type guard for PrayerTime
 */
export function isPrayerTime(value) {
    if (!value || typeof value !== "object")
        return false;
    const prayer = value;
    return (isValidPrayerName(prayer.prayer) &&
        typeof prayer.time === "string" &&
        prayer.timestamp instanceof Date &&
        typeof prayer.status === "string");
}
/**
 * Type guard for DailyPrayerTimes
 */
export function isDailyPrayerTimes(value) {
    if (!value || typeof value !== "object")
        return false;
    const daily = value;
    return (daily.date instanceof Date &&
        typeof daily.hijriDate === "string" &&
        Array.isArray(daily.prayers) &&
        daily.prayers.every(isPrayerTime) &&
        isValidCalculationMethod(daily.calculationMethod));
}
/**
 * Type guard for PrayerSchedule
 */
export function isPrayerSchedule(value) {
    if (!value || typeof value !== "object")
        return false;
    const schedule = value;
    return (typeof schedule.id === "string" &&
        typeof schedule.masjidId === "string" &&
        typeof schedule.config === "object" &&
        isDailyPrayerTimes(schedule.dailyTimes) &&
        typeof schedule.isActive === "boolean");
}
/**
 * Type guard for CreatePrayerScheduleRequest
 */
export function isCreatePrayerScheduleRequest(value) {
    if (!value || typeof value !== "object")
        return false;
    const request = value;
    return (typeof request.masjidId === "string" &&
        typeof request.jakimZone === "string");
}
/**
 * Get prayer name in specified language
 */
export function getPrayerName(prayer, language = "ms") {
    if (language === "en")
        return prayer;
    return PRAYER_TRANSLATIONS[prayer][language] || prayer;
}
/**
 * Get all prayer names in specified language
 */
export function getAllPrayerNames(language = "ms") {
    return PRAYER_NAMES.ENGLISH.map((prayer) => getPrayerName(prayer, language));
}
/**
 * Format time based on format preference
 */
export function formatTime(time, format = "12-hour") {
    if (format === "24-hour")
        return time;
    const parts = time.split(":");
    const hours = parts[0] ? Number(parts[0]) : 0;
    const minutes = parts[1] ? Number(parts[1]) : 0;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
/**
 * Calculate prayer status based on current time
 */
export function calculatePrayerStatus(prayerTime, currentTime = new Date(), nextPrayerTime) {
    const now = currentTime.getTime();
    const prayer = prayerTime.getTime();
    const next = nextPrayerTime?.getTime();
    if (now < prayer) {
        return "upcoming";
    }
    else if (next && now < next) {
        return "current";
    }
    else {
        return "past";
    }
}
/**
 * Find current prayer based on time
 */
export function getCurrentPrayer(prayers, currentTime = new Date()) {
    const sortedPrayers = [...prayers].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    for (let i = 0; i < sortedPrayers.length; i++) {
        const prayer = sortedPrayers[i];
        const nextPrayer = sortedPrayers[i + 1];
        if (prayer &&
            currentTime >= prayer.timestamp &&
            (!nextPrayer || currentTime < nextPrayer.timestamp)) {
            return prayer;
        }
    }
    return null;
}
/**
 * Find next prayer based on time
 */
export function getNextPrayer(prayers, currentTime = new Date()) {
    const upcomingPrayers = prayers
        .filter((prayer) => prayer.timestamp > currentTime)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return upcomingPrayers[0] || null;
}
/**
 * Create prayer schedule with defaults
 */
export function createPrayerSchedule(request, createdBy) {
    const now = new Date();
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const config = {
        jakimZone: request.jakimZone,
        calculationMethod: request.calculationMethod ??
            DEFAULT_PRAYER_SCHEDULE_CONFIG.calculationMethod,
        timeFormat: request.timeFormat ?? DEFAULT_PRAYER_SCHEDULE_CONFIG.timeFormat,
        showHijriDate: request.showHijriDate ?? DEFAULT_PRAYER_SCHEDULE_CONFIG.showHijriDate,
        showSunrise: request.showSunrise ?? DEFAULT_PRAYER_SCHEDULE_CONFIG.showSunrise,
        autoRefresh: request.autoRefresh ?? DEFAULT_PRAYER_SCHEDULE_CONFIG.autoRefresh,
        refreshInterval: request.refreshInterval ?? DEFAULT_PRAYER_SCHEDULE_CONFIG.refreshInterval,
        notificationSettings: {
            ...DEFAULT_PRAYER_SCHEDULE_CONFIG.notificationSettings,
            ...request.notificationSettings,
        },
        jumuahSettings: {
            ...DEFAULT_PRAYER_SCHEDULE_CONFIG.jumuahSettings,
            ...request.jumuahSettings,
        },
    };
    const baseSchedule = {
        id: scheduleId,
        masjidId: request.masjidId,
        config,
        currentDate: now,
        isActive: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
        lastSyncedAt: now,
        createdBy,
        lastModifiedBy: createdBy,
    };
    // Add displayId only if provided
    if (request.displayId !== undefined) {
        return { ...baseSchedule, displayId: request.displayId };
    }
    return baseSchedule;
}
/**
 * Convert JAKIM API response to DailyPrayerTimes
 */
export function convertJakimResponse(response, timezone = "Asia/Kuala_Lumpur") {
    return response.prayerTime.map((day) => {
        const date = new Date(day.date);
        const prayers = [
            {
                prayer: "fajr",
                time: day.fajr,
                timestamp: new Date(`${day.date}T${day.fajr}:00+08:00`),
                status: "upcoming",
            },
            {
                prayer: "sunrise",
                time: day.syuruk,
                timestamp: new Date(`${day.date}T${day.syuruk}:00+08:00`),
                status: "upcoming",
            },
            {
                prayer: "dhuhr",
                time: day.dhuhr,
                timestamp: new Date(`${day.date}T${day.dhuhr}:00+08:00`),
                status: "upcoming",
                isJumuah: date.getDay() === 5, // Friday
            },
            {
                prayer: "asr",
                time: day.asr,
                timestamp: new Date(`${day.date}T${day.asr}:00+08:00`),
                status: "upcoming",
            },
            {
                prayer: "maghrib",
                time: day.maghrib,
                timestamp: new Date(`${day.date}T${day.maghrib}:00+08:00`),
                status: "upcoming",
            },
            {
                prayer: "isha",
                time: day.isha,
                timestamp: new Date(`${day.date}T${day.isha}:00+08:00`),
                status: "upcoming",
            },
        ];
        return {
            date,
            hijriDate: day.hijri,
            location: {
                city: "",
                state: "",
                country: "Malaysia",
                jakimZone: response.zone,
                timezone,
            },
            prayers,
            sunrise: day.syuruk,
            calculationMethod: "jakim",
            lastUpdated: new Date(),
        };
    });
}
/**
 * Get calculation method display name
 */
export function getCalculationMethodName(method, language = "ms") {
    const info = CALCULATION_METHOD_INFO[method];
    if (language === "ms") {
        const translations = {
            jakim: "JAKIM Malaysia",
            mwl: "Liga Dunia Islam",
            isna: "Persatuan Islam Amerika Utara",
            egypt: "Mesir",
            makkah: "Universiti Umm Al-Qura, Makkah",
            karachi: "Universiti Sains Islam, Karachi",
            tehran: "Institut Geofizik, Universiti Tehran",
            jafari: "Kaedah Jafari (Syiah)",
        };
        return translations[method] || info.name;
    }
    return info.fullName;
}
/**
 * Validate prayer schedule configuration
 */
export function validatePrayerScheduleConfig(config) {
    const errors = [];
    if (config.refreshInterval !== undefined &&
        !isValidRefreshInterval(config.refreshInterval)) {
        errors.push(`Refresh interval must be between ${PRAYER_SCHEDULE_VALIDATION.REFRESH_INTERVAL.MIN} and ${PRAYER_SCHEDULE_VALIDATION.REFRESH_INTERVAL.MAX} minutes`);
    }
    if (config.notificationSettings?.beforeMinutes !== undefined) {
        const minutes = config.notificationSettings.beforeMinutes;
        if (minutes < PRAYER_SCHEDULE_VALIDATION.NOTIFICATION_MINUTES.MIN ||
            minutes > PRAYER_SCHEDULE_VALIDATION.NOTIFICATION_MINUTES.MAX) {
            errors.push(`Notification minutes must be between ${PRAYER_SCHEDULE_VALIDATION.NOTIFICATION_MINUTES.MIN} and ${PRAYER_SCHEDULE_VALIDATION.NOTIFICATION_MINUTES.MAX}`);
        }
    }
    if (config.jumuahSettings?.time !== undefined) {
        const time = config.jumuahSettings.time;
        if (time < PRAYER_SCHEDULE_VALIDATION.JUMUAH_TIME.MIN ||
            time > PRAYER_SCHEDULE_VALIDATION.JUMUAH_TIME.MAX) {
            errors.push(`Jumuah time must be between ${PRAYER_SCHEDULE_VALIDATION.JUMUAH_TIME.MIN} and ${PRAYER_SCHEDULE_VALIDATION.JUMUAH_TIME.MAX}`);
        }
    }
    return errors;
}
//# sourceMappingURL=prayer-schedule.js.map