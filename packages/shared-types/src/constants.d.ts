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
export declare const JAKIM_ZONES: readonly JakimZone[];
/**
 * A transformed version of JAKIM_ZONES for UI select/option elements.
 */
export declare const jakimZones: {
    value: string;
    label: string;
    state: string;
}[];
export type UiJakimZone = (typeof jakimZones)[number];
export declare const SUPPORTED_TIMEZONES: readonly string[];
export declare const malaysianStates: readonly ["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Pulau Pinang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan"];
export declare const prayerTimeSources: {
    value: string;
    label: string;
}[];
export declare const statusOptions: {
    value: string;
    label: string;
}[];
//# sourceMappingURL=constants.d.ts.map