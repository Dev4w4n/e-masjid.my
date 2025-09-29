/**
 * Shared Mock Data Factory
 *
 * Generates mock data that exactly matches the Supabase schema for consistent testing
 * across all apps in the monorepo. This ensures unit tests use realistic data
 * that matches database constraints and validations.
 */
import type { Tables } from "./database";
type User = Tables<"users">;
type Profile = Tables<"profiles">;
type ProfileAddress = Tables<"profile_addresses">;
type Masjid = Tables<"masjids">;
type TvDisplay = Tables<"tv_displays">;
type DisplayContent = Tables<"display_content">;
declare const MALAYSIAN_STATES: readonly ["Johor", "Kedah", "Kelantan", "Malacca", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"];
declare const CONTENT_TYPES: readonly ["image", "youtube_video", "text_announcement", "event_poster"];
/**
 * User mock data factory
 */
export declare class UserMockFactory {
    static create(overrides?: Partial<User>): User;
    static createMany(count: number, overrides?: Partial<User>): User[];
    static createSuperAdmin(overrides?: Partial<User>): User;
    static createMasjidAdmin(overrides?: Partial<User>): User;
    static createRegisteredUser(overrides?: Partial<User>): User;
}
/**
 * Profile mock data factory
 */
export declare class ProfileMockFactory {
    static create(overrides?: Partial<Profile>): Profile;
    static createComplete(overrides?: Partial<Profile>): Profile;
    static createIncomplete(overrides?: Partial<Profile>): Profile;
    static createMany(count: number, overrides?: Partial<Profile>): Profile[];
}
/**
 * Profile Address mock data factory
 */
export declare class ProfileAddressMockFactory {
    static create(overrides?: Partial<ProfileAddress>): ProfileAddress;
    static createMany(count: number, overrides?: Partial<ProfileAddress>): ProfileAddress[];
    static createPrimary(profileId: string, overrides?: Partial<ProfileAddress>): ProfileAddress;
}
/**
 * Masjid mock data factory
 */
export declare class MasjidMockFactory {
    static create(overrides?: Partial<Masjid>): Masjid;
    static createMany(count: number, overrides?: Partial<Masjid>): Masjid[];
    static createByState(state: (typeof MALAYSIAN_STATES)[number], overrides?: Partial<Masjid>): Masjid;
}
/**
 * TV Display mock data factory
 */
export declare class TvDisplayMockFactory {
    static create(overrides?: Partial<TvDisplay>): TvDisplay;
    static createMany(count: number, overrides?: Partial<TvDisplay>): TvDisplay[];
    static createActive(masjidId: string, overrides?: Partial<TvDisplay>): TvDisplay;
}
/**
 * Display Content mock data factory
 */
export declare class DisplayContentMockFactory {
    static create(overrides?: Partial<DisplayContent>): DisplayContent;
    static createMany(count: number, overrides?: Partial<DisplayContent>): DisplayContent[];
    static createActive(overrides?: Partial<DisplayContent>): DisplayContent;
    static createByType(type: (typeof CONTENT_TYPES)[number], overrides?: Partial<DisplayContent>): DisplayContent;
}
/**
 * Comprehensive test data generator that creates related data
 */
export declare class TestDataGenerator {
    /**
     * Create a complete masjid setup with related data
     */
    static createMasjidSetup(overrides?: {
        masjid?: Partial<Masjid>;
        admin?: Partial<User>;
        profile?: Partial<Profile>;
        address?: Partial<ProfileAddress>;
        displays?: number;
        content?: number;
    }): {
        superAdmin: {
            created_at: string;
            email: string;
            email_verified: boolean | null;
            id: string;
            last_sign_in_at: string | null;
            role: import("./database").Database["public"]["Enums"]["user_role"];
            updated_at: string;
        };
        masjid: {
            address: import("./database").Json;
            capacity: number | null;
            created_at: string;
            created_by: string;
            description: string | null;
            email: string | null;
            id: string;
            jakim_zone_code: string | null;
            name: string;
            phone_number: string | null;
            prayer_times_source: import("./database").Database["public"]["Enums"]["prayer_source_enum"] | null;
            registration_number: string | null;
            status: import("./database").Database["public"]["Enums"]["masjid_status"];
            updated_at: string;
            website_url: string | null;
        };
        adminUser: {
            created_at: string;
            email: string;
            email_verified: boolean | null;
            id: string;
            last_sign_in_at: string | null;
            role: import("./database").Database["public"]["Enums"]["user_role"];
            updated_at: string;
        };
        adminProfile: {
            created_at: string;
            full_name: string;
            home_masjid_id: string | null;
            id: string;
            is_complete: boolean | null;
            phone_number: string | null;
            preferred_language: import("./database").Database["public"]["Enums"]["language_code"];
            updated_at: string;
            user_id: string;
        };
        adminAddress: {
            address_line_1: string;
            address_line_2: string | null;
            address_type: import("./database").Database["public"]["Enums"]["address_type"];
            city: string;
            country: string;
            created_at: string;
            id: string;
            is_primary: boolean | null;
            postcode: string;
            profile_id: string;
            state: import("./database").Database["public"]["Enums"]["malaysian_state"];
            updated_at: string;
        };
        displays: {
            auto_refresh_interval: number;
            carousel_interval: number;
            content_transition_type: string;
            created_at: string | null;
            description: string | null;
            display_name: string;
            heartbeat_interval: number;
            id: string;
            is_active: boolean;
            is_touch_enabled: boolean;
            last_heartbeat: string | null;
            location_description: string | null;
            masjid_id: string;
            max_content_items: number;
            max_retry_attempts: number;
            offline_cache_duration: number;
            orientation: import("./database").Database["public"]["Enums"]["display_orientation"];
            prayer_time_background_opacity: number;
            prayer_time_color: string;
            prayer_time_font_size: string;
            prayer_time_position: import("./database").Database["public"]["Enums"]["prayer_time_position"];
            resolution: import("./database").Database["public"]["Enums"]["display_resolution"];
            retry_backoff_multiplier: number;
            show_sponsorship_amounts: boolean;
            sponsorship_tier_colors: import("./database").Json;
            updated_at: string | null;
        }[];
        content: {
            approval_notes: string | null;
            approved_at: string | null;
            approved_by: string | null;
            created_at: string | null;
            description: string | null;
            display_id: string | null;
            duration: number;
            end_date: string;
            file_size: number | null;
            file_type: string | null;
            id: string;
            masjid_id: string;
            payment_reference: string | null;
            payment_status: import("./database").Database["public"]["Enums"]["payment_status"];
            rejection_reason: string | null;
            resubmission_of: string | null;
            sponsorship_amount: number;
            sponsorship_tier: import("./database").Database["public"]["Enums"]["sponsorship_tier"] | null;
            start_date: string;
            status: import("./database").Database["public"]["Enums"]["content_status"];
            submitted_at: string | null;
            submitted_by: string;
            thumbnail_url: string | null;
            title: string;
            type: import("./database").Database["public"]["Enums"]["content_type"];
            updated_at: string | null;
            url: string;
        }[];
    };
    /**
     * Create test data for E2E scenarios
     */
    static createE2EScenario(): {
        activeContent: {
            approval_notes: string | null;
            approved_at: string | null;
            approved_by: string | null;
            created_at: string | null;
            description: string | null;
            display_id: string | null;
            duration: number;
            end_date: string;
            file_size: number | null;
            file_type: string | null;
            id: string;
            masjid_id: string;
            payment_reference: string | null;
            payment_status: import("./database").Database["public"]["Enums"]["payment_status"];
            rejection_reason: string | null;
            resubmission_of: string | null;
            sponsorship_amount: number;
            sponsorship_tier: import("./database").Database["public"]["Enums"]["sponsorship_tier"] | null;
            start_date: string;
            status: import("./database").Database["public"]["Enums"]["content_status"];
            submitted_at: string | null;
            submitted_by: string;
            thumbnail_url: string | null;
            title: string;
            type: import("./database").Database["public"]["Enums"]["content_type"];
            updated_at: string | null;
            url: string;
        }[];
        superAdmin: {
            created_at: string;
            email: string;
            email_verified: boolean | null;
            id: string;
            last_sign_in_at: string | null;
            role: import("./database").Database["public"]["Enums"]["user_role"];
            updated_at: string;
        };
        masjid: {
            address: import("./database").Json;
            capacity: number | null;
            created_at: string;
            created_by: string;
            description: string | null;
            email: string | null;
            id: string;
            jakim_zone_code: string | null;
            name: string;
            phone_number: string | null;
            prayer_times_source: import("./database").Database["public"]["Enums"]["prayer_source_enum"] | null;
            registration_number: string | null;
            status: import("./database").Database["public"]["Enums"]["masjid_status"];
            updated_at: string;
            website_url: string | null;
        };
        adminUser: {
            created_at: string;
            email: string;
            email_verified: boolean | null;
            id: string;
            last_sign_in_at: string | null;
            role: import("./database").Database["public"]["Enums"]["user_role"];
            updated_at: string;
        };
        adminProfile: {
            created_at: string;
            full_name: string;
            home_masjid_id: string | null;
            id: string;
            is_complete: boolean | null;
            phone_number: string | null;
            preferred_language: import("./database").Database["public"]["Enums"]["language_code"];
            updated_at: string;
            user_id: string;
        };
        adminAddress: {
            address_line_1: string;
            address_line_2: string | null;
            address_type: import("./database").Database["public"]["Enums"]["address_type"];
            city: string;
            country: string;
            created_at: string;
            id: string;
            is_primary: boolean | null;
            postcode: string;
            profile_id: string;
            state: import("./database").Database["public"]["Enums"]["malaysian_state"];
            updated_at: string;
        };
        displays: {
            auto_refresh_interval: number;
            carousel_interval: number;
            content_transition_type: string;
            created_at: string | null;
            description: string | null;
            display_name: string;
            heartbeat_interval: number;
            id: string;
            is_active: boolean;
            is_touch_enabled: boolean;
            last_heartbeat: string | null;
            location_description: string | null;
            masjid_id: string;
            max_content_items: number;
            max_retry_attempts: number;
            offline_cache_duration: number;
            orientation: import("./database").Database["public"]["Enums"]["display_orientation"];
            prayer_time_background_opacity: number;
            prayer_time_color: string;
            prayer_time_font_size: string;
            prayer_time_position: import("./database").Database["public"]["Enums"]["prayer_time_position"];
            resolution: import("./database").Database["public"]["Enums"]["display_resolution"];
            retry_backoff_multiplier: number;
            show_sponsorship_amounts: boolean;
            sponsorship_tier_colors: import("./database").Json;
            updated_at: string | null;
        }[];
        content: {
            approval_notes: string | null;
            approved_at: string | null;
            approved_by: string | null;
            created_at: string | null;
            description: string | null;
            display_id: string | null;
            duration: number;
            end_date: string;
            file_size: number | null;
            file_type: string | null;
            id: string;
            masjid_id: string;
            payment_reference: string | null;
            payment_status: import("./database").Database["public"]["Enums"]["payment_status"];
            rejection_reason: string | null;
            resubmission_of: string | null;
            sponsorship_amount: number;
            sponsorship_tier: import("./database").Database["public"]["Enums"]["sponsorship_tier"] | null;
            start_date: string;
            status: import("./database").Database["public"]["Enums"]["content_status"];
            submitted_at: string | null;
            submitted_by: string;
            thumbnail_url: string | null;
            title: string;
            type: import("./database").Database["public"]["Enums"]["content_type"];
            updated_at: string | null;
            url: string;
        }[];
    };
}
/**
 * Export all mock factories for easy access
 */
export declare const MockFactories: {
    User: typeof UserMockFactory;
    Profile: typeof ProfileMockFactory;
    ProfileAddress: typeof ProfileAddressMockFactory;
    Masjid: typeof MasjidMockFactory;
    TvDisplay: typeof TvDisplayMockFactory;
    DisplayContent: typeof DisplayContentMockFactory;
    TestDataGenerator: typeof TestDataGenerator;
};
export {};
//# sourceMappingURL=mock-data.d.ts.map