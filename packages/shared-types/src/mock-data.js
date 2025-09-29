/**
 * Shared Mock Data Factory
 *
 * Generates mock data that exactly matches the Supabase schema for consistent testing
 * across all apps in the monorepo. This ensures unit tests use realistic data
 * that matches database constraints and validations.
 */
// Enum values from Supabase schema
const MALAYSIAN_STATES = [
    "Johor",
    "Kedah",
    "Kelantan",
    "Malacca",
    "Negeri Sembilan",
    "Pahang",
    "Penang",
    "Perak",
    "Perlis",
    "Sabah",
    "Sarawak",
    "Selangor",
    "Terengganu",
    "Kuala Lumpur",
    "Labuan",
    "Putrajaya",
];
const LANGUAGE_CODES = ["en", "ms", "zh", "ta"];
const USER_ROLES = [
    "super_admin",
    "masjid_admin",
    "registered",
    "public",
];
const CONTENT_TYPES = [
    "image",
    "youtube_video",
    "text_announcement",
    "event_poster",
];
const CONTENT_STATUSES = ["pending", "active", "expired", "rejected"];
const SPONSORSHIP_TIERS = ["bronze", "silver", "gold", "platinum"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const PAYMENT_METHODS = [
    "fpx",
    "credit_card",
    "bank_transfer",
    "cash",
];
const PRAYER_TIME_POSITIONS = [
    "top",
    "bottom",
    "left",
    "right",
    "center",
    "hidden",
];
const DISPLAY_ORIENTATIONS = ["landscape", "portrait"];
const DISPLAY_RESOLUTIONS = [
    "1920x1080",
    "3840x2160",
    "1366x768",
    "2560x1440",
];
const PRAYER_TIME_SOURCES = ["manual", "jakim", "auto"];
/**
 * Simple mock data utilities
 */
class MockUtils {
    static generateId() {
        return `mock-id-${Date.now()}-${++this.counter}`;
    }
    static randomElement(array) {
        if (array.length === 0) {
            throw new Error("Cannot select random element from empty array");
        }
        return array[Math.floor(Math.random() * array.length)];
    }
    static randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static randomFloat(min, max, precision = 2) {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(precision));
    }
    static randomBoolean() {
        return Math.random() > 0.5;
    }
    static randomEmail() {
        const domains = ["example.com", "test.com", "mock.org"];
        const names = ["user", "test", "admin", "john", "jane"];
        return `${this.randomElement(names)}${this.randomNumber(1, 999)}@${this.randomElement(domains)}`;
    }
    static randomName() {
        const firstNames = [
            "Ahmad",
            "Siti",
            "Ali",
            "Fatimah",
            "Hassan",
            "Aishah",
            "Omar",
            "Zainab",
        ];
        const lastNames = [
            "Abdullah",
            "Rahman",
            "Ibrahim",
            "Hassan",
            "Ahmad",
            "Ali",
            "Omar",
            "Yusof",
        ];
        return `${this.randomElement(firstNames)} ${this.randomElement(lastNames)}`;
    }
    static randomMasjidName() {
        const prefixes = ["Masjid", "Surau"];
        const names = [
            "Al-Hidayah",
            "At-Taqwa",
            "An-Nur",
            "Al-Falah",
            "Ar-Rahman",
            "As-Salam",
        ];
        return `${this.randomElement(prefixes)} ${this.randomElement(names)}`;
    }
    static randomStreetAddress() {
        const numbers = this.randomNumber(1, 999);
        const streets = [
            "Jalan Utama",
            "Jalan Besar",
            "Jalan Harmoni",
            "Jalan Merdeka",
            "Jalan Damai",
        ];
        return `${numbers} ${this.randomElement(streets)}`;
    }
    static randomCity() {
        const cities = [
            "Kuala Lumpur",
            "Petaling Jaya",
            "Johor Bahru",
            "Penang",
            "Ipoh",
            "Shah Alam",
        ];
        return this.randomElement(cities);
    }
    static randomPostcode() {
        return this.randomNumber(10000, 98000).toString().padStart(5, "0");
    }
    static randomPhone() {
        const formats = [
            `+60${this.randomNumber(10, 19)}${this.randomNumber(1000000, 9999999)}`,
            `0${this.randomNumber(10, 19)}-${this.randomNumber(100, 999)}-${this.randomNumber(1000, 9999)}`,
        ];
        return this.randomElement(formats);
    }
    static randomYouTubeUrl() {
        const videoId = Math.random().toString(36).substring(2, 13);
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    static randomImageUrl() {
        const width = this.randomElement([1920, 1280, 1024]);
        const height = this.randomElement([1080, 720, 768]);
        return `https://picsum.photos/${width}/${height}`;
    }
    static randomJakimZone() {
        const stateCodes = [
            "WLY",
            "JHR",
            "KDH",
            "KTN",
            "MLK",
            "N9",
            "PHG",
            "PNG",
            "PRK",
            "PLS",
            "SBH",
            "SWK",
            "SGR",
            "TRG",
        ];
        const stateCode = this.randomElement(stateCodes);
        const zoneNumber = this.randomNumber(1, 5).toString().padStart(2, "0");
        return `${stateCode}${zoneNumber}`;
    }
    static randomDate() {
        const date = new Date();
        date.setDate(date.getDate() - this.randomNumber(0, 365));
        return date.toISOString();
    }
    static randomRecentDate() {
        const date = new Date();
        date.setDate(date.getDate() - this.randomNumber(0, 30));
        return date.toISOString();
    }
    static randomFutureDate() {
        const date = new Date();
        date.setDate(date.getDate() + this.randomNumber(1, 365));
        return date.toISOString();
    }
    static randomDateOnly() {
        const date = new Date();
        date.setDate(date.getDate() - this.randomNumber(0, 365));
        return date.toISOString().split("T")[0];
    }
}
MockUtils.counter = 0;
/**
 * User mock data factory
 */
export class UserMockFactory {
    static create(overrides = {}) {
        return {
            id: MockUtils.generateId(),
            email: MockUtils.randomEmail(),
            role: MockUtils.randomElement(USER_ROLES),
            email_verified: MockUtils.randomBoolean(),
            last_sign_in_at: MockUtils.randomBoolean()
                ? MockUtils.randomRecentDate()
                : null,
            created_at: MockUtils.randomDate(),
            updated_at: MockUtils.randomRecentDate(),
            ...overrides,
        };
    }
    static createMany(count, overrides = {}) {
        return Array.from({ length: count }, () => this.create(overrides));
    }
    static createSuperAdmin(overrides = {}) {
        return this.create({ role: "super_admin", ...overrides });
    }
    static createMasjidAdmin(overrides = {}) {
        return this.create({ role: "masjid_admin", ...overrides });
    }
    static createRegisteredUser(overrides = {}) {
        return this.create({ role: "registered", ...overrides });
    }
}
/**
 * Profile mock data factory
 */
export class ProfileMockFactory {
    static create(overrides = {}) {
        return {
            id: MockUtils.generateId(),
            user_id: MockUtils.generateId(),
            full_name: MockUtils.randomName(),
            phone_number: MockUtils.randomBoolean() ? MockUtils.randomPhone() : null,
            preferred_language: MockUtils.randomElement(LANGUAGE_CODES),
            home_masjid_id: MockUtils.randomBoolean() ? MockUtils.generateId() : null,
            is_complete: MockUtils.randomBoolean(),
            created_at: MockUtils.randomDate(),
            updated_at: MockUtils.randomRecentDate(),
            ...overrides,
        };
    }
    static createComplete(overrides = {}) {
        return this.create({
            is_complete: true,
            full_name: MockUtils.randomName(),
            phone_number: MockUtils.randomPhone(),
            ...overrides,
        });
    }
    static createIncomplete(overrides = {}) {
        return this.create({
            is_complete: false,
            full_name: "Unnamed User",
            phone_number: null,
            ...overrides,
        });
    }
    static createMany(count, overrides = {}) {
        return Array.from({ length: count }, () => this.create(overrides));
    }
}
/**
 * Profile Address mock data factory
 */
export class ProfileAddressMockFactory {
    static create(overrides = {}) {
        const state = MockUtils.randomElement(MALAYSIAN_STATES);
        return {
            id: MockUtils.generateId(),
            profile_id: MockUtils.generateId(),
            address_line_1: MockUtils.randomStreetAddress(),
            address_line_2: MockUtils.randomBoolean() ? "Taman Harmoni" : null,
            city: MockUtils.randomCity(),
            state,
            postcode: MockUtils.randomPostcode(),
            country: "MYS",
            address_type: "home",
            is_primary: true,
            created_at: MockUtils.randomDate(),
            updated_at: MockUtils.randomRecentDate(),
            ...overrides,
        };
    }
    static createMany(count, overrides = {}) {
        return Array.from({ length: count }, () => this.create(overrides));
    }
    static createPrimary(profileId, overrides = {}) {
        return this.create({
            profile_id: profileId,
            is_primary: true,
            ...overrides,
        });
    }
}
/**
 * Masjid mock data factory
 */
export class MasjidMockFactory {
    static create(overrides = {}) {
        const state = MockUtils.randomElement(MALAYSIAN_STATES);
        const baseMasjid = {
            id: MockUtils.generateId(),
            name: MockUtils.randomMasjidName(),
            registration_number: MockUtils.randomBoolean()
                ? `REG${MockUtils.randomNumber(100000, 999999)}`
                : null,
            email: MockUtils.randomBoolean() ? MockUtils.randomEmail() : null,
            phone_number: MockUtils.randomBoolean() ? MockUtils.randomPhone() : null,
            description: MockUtils.randomBoolean()
                ? "A peaceful place of worship for the community."
                : null,
            address: {
                address_line_1: MockUtils.randomStreetAddress(),
                address_line_2: MockUtils.randomBoolean() ? "Taman Masjid" : null,
                city: MockUtils.randomCity(),
                state,
                postcode: MockUtils.randomPostcode(),
                country: "MYS",
            },
            status: "active",
            created_by: MockUtils.generateId(),
            created_at: MockUtils.randomDate(),
            updated_at: MockUtils.randomRecentDate(),
            capacity: MockUtils.randomNumber(100, 2000),
            website_url: MockUtils.randomBoolean() ? "https://masjid.my" : null,
            jakim_zone_code: MockUtils.randomJakimZone(),
            prayer_times_source: MockUtils.randomElement(PRAYER_TIME_SOURCES),
        };
        return {
            ...baseMasjid,
            ...overrides,
        };
    }
    static createMany(count, overrides = {}) {
        return Array.from({ length: count }, () => this.create(overrides));
    }
    static createByState(state, overrides = {}) {
        return this.create({
            address: {
                address_line_1: MockUtils.randomStreetAddress(),
                address_line_2: MockUtils.randomBoolean() ? "Taman Masjid" : null,
                city: MockUtils.randomCity(),
                state,
                postcode: MockUtils.randomPostcode(),
                country: "MYS",
            },
            ...overrides,
        });
    }
}
/**
 * TV Display mock data factory
 */
export class TvDisplayMockFactory {
    static create(overrides = {}) {
        return {
            id: MockUtils.generateId(),
            masjid_id: MockUtils.generateId(),
            display_name: `Display ${MockUtils.randomNumber(1, 10)}`,
            description: MockUtils.randomBoolean()
                ? "Main display for prayer hall"
                : null,
            resolution: MockUtils.randomElement(DISPLAY_RESOLUTIONS),
            orientation: MockUtils.randomElement(DISPLAY_ORIENTATIONS),
            is_touch_enabled: MockUtils.randomBoolean(),
            location_description: MockUtils.randomBoolean()
                ? MockUtils.randomElement([
                    "Main Hall",
                    "Entrance",
                    "Prayer Area",
                    "Lobby",
                ])
                : null,
            carousel_interval: MockUtils.randomNumber(5, 30),
            max_content_items: MockUtils.randomNumber(10, 50),
            content_transition_type: MockUtils.randomElement([
                "fade",
                "slide",
                "zoom",
                "none",
            ]),
            auto_refresh_interval: MockUtils.randomNumber(1, 10),
            prayer_time_position: MockUtils.randomElement(PRAYER_TIME_POSITIONS),
            prayer_time_font_size: MockUtils.randomElement([
                "small",
                "medium",
                "large",
                "extra_large",
            ]),
            prayer_time_color: "#FFFFFF",
            prayer_time_background_opacity: MockUtils.randomFloat(0, 1, 1),
            show_sponsorship_amounts: MockUtils.randomBoolean(),
            sponsorship_tier_colors: {
                bronze: "#CD7F32",
                silver: "#C0C0C0",
                gold: "#FFD700",
                platinum: "#E5E4E2",
            },
            offline_cache_duration: MockUtils.randomNumber(12, 72),
            heartbeat_interval: MockUtils.randomNumber(15, 60),
            max_retry_attempts: MockUtils.randomNumber(3, 10),
            retry_backoff_multiplier: MockUtils.randomFloat(1.5, 3.0, 1),
            is_active: MockUtils.randomBoolean(),
            last_heartbeat: MockUtils.randomBoolean()
                ? MockUtils.randomRecentDate()
                : null,
            created_at: MockUtils.randomDate(),
            updated_at: MockUtils.randomRecentDate(),
            ...overrides,
        };
    }
    static createMany(count, overrides = {}) {
        return Array.from({ length: count }, () => this.create(overrides));
    }
    static createActive(masjidId, overrides = {}) {
        return this.create({
            masjid_id: masjidId,
            is_active: true,
            last_heartbeat: MockUtils.randomRecentDate(),
            ...overrides,
        });
    }
}
/**
 * Display Content mock data factory
 */
export class DisplayContentMockFactory {
    static create(overrides = {}) {
        const contentType = MockUtils.randomElement(CONTENT_TYPES);
        let url;
        let file_type;
        switch (contentType) {
            case "youtube_video":
                url = MockUtils.randomYouTubeUrl();
                file_type = "video/youtube";
                break;
            case "image":
            case "event_poster":
                url = MockUtils.randomImageUrl();
                file_type = "image/jpeg";
                break;
            default:
                url = "https://example.com/content";
                file_type = "text/plain";
        }
        const sponsorshipAmount = MockUtils.randomFloat(0, 500, 2);
        const baseContent = {
            id: MockUtils.generateId(),
            masjid_id: MockUtils.generateId(),
            display_id: MockUtils.randomBoolean() ? MockUtils.generateId() : null,
            title: `Content ${MockUtils.randomNumber(1, 100)}`,
            description: MockUtils.randomBoolean()
                ? "Sample content description"
                : null,
            type: contentType,
            url,
            thumbnail_url: MockUtils.randomBoolean()
                ? MockUtils.randomImageUrl()
                : null,
            sponsorship_amount: sponsorshipAmount,
            sponsorship_tier: sponsorshipAmount >= 200
                ? "platinum"
                : sponsorshipAmount >= 100
                    ? "gold"
                    : sponsorshipAmount >= 50
                        ? "silver"
                        : "bronze",
            payment_status: MockUtils.randomElement(PAYMENT_STATUSES),
            payment_reference: MockUtils.randomBoolean()
                ? MockUtils.generateId()
                : null,
            duration: MockUtils.randomNumber(5, 300),
            start_date: MockUtils.randomDateOnly(),
            end_date: MockUtils.randomFutureDate().split("T")[0],
            status: MockUtils.randomElement(CONTENT_STATUSES),
            submitted_by: MockUtils.generateId(),
            submitted_at: MockUtils.randomDate(),
            approved_by: MockUtils.randomBoolean() ? MockUtils.generateId() : null,
            approved_at: MockUtils.randomBoolean()
                ? MockUtils.randomRecentDate()
                : null,
            rejection_reason: MockUtils.randomBoolean()
                ? "Content does not meet guidelines"
                : null,
            file_size: MockUtils.randomBoolean()
                ? MockUtils.randomNumber(1024, 10485760)
                : null,
            file_type,
            created_at: MockUtils.randomDate(),
            updated_at: MockUtils.randomRecentDate(),
            approval_notes: null,
            resubmission_of: null,
        };
        return {
            ...baseContent,
            ...overrides,
        };
    }
    static createMany(count, overrides = {}) {
        return Array.from({ length: count }, () => this.create(overrides));
    }
    static createActive(overrides = {}) {
        const today = new Date().toISOString().split("T")[0];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        return this.create({
            status: "active",
            start_date: today,
            end_date: futureDate.toISOString().split("T")[0],
            approved_by: MockUtils.generateId(),
            approved_at: MockUtils.randomRecentDate(),
            ...overrides,
        });
    }
    static createByType(type, overrides = {}) {
        let url;
        let file_type;
        switch (type) {
            case "youtube_video":
                url = MockUtils.randomYouTubeUrl();
                file_type = "video/youtube";
                break;
            case "image":
            case "event_poster":
                url = MockUtils.randomImageUrl();
                file_type = "image/jpeg";
                break;
            default:
                url = "https://example.com/content";
                file_type = "text/plain";
        }
        return this.create({
            type,
            url,
            file_type,
            ...overrides,
        });
    }
}
/**
 * Comprehensive test data generator that creates related data
 */
export class TestDataGenerator {
    /**
     * Create a complete masjid setup with related data
     */
    static createMasjidSetup(overrides = {}) {
        // Create super admin user
        const superAdmin = UserMockFactory.createSuperAdmin();
        // Create masjid
        const masjid = MasjidMockFactory.create({
            created_by: superAdmin.id,
            ...overrides.masjid,
        });
        // Create masjid admin user
        const adminUser = UserMockFactory.createMasjidAdmin(overrides.admin);
        // Create admin profile
        const adminProfile = ProfileMockFactory.createComplete({
            user_id: adminUser.id,
            home_masjid_id: masjid.id,
            ...overrides.profile,
        });
        // Create admin address
        const adminAddress = ProfileAddressMockFactory.createPrimary(adminProfile.id, overrides.address);
        // Create displays
        const displays = TvDisplayMockFactory.createMany(overrides.displays || 2, {
            masjid_id: masjid.id,
        });
        // Create content
        const content = DisplayContentMockFactory.createMany(overrides.content || 5, { masjid_id: masjid.id });
        return {
            superAdmin,
            masjid,
            adminUser,
            adminProfile,
            adminAddress,
            displays,
            content,
        };
    }
    /**
     * Create test data for E2E scenarios
     */
    static createE2EScenario() {
        const setup = this.createMasjidSetup({
            displays: 3,
            content: 10,
        });
        // Create additional content with different statuses
        const activeContent = DisplayContentMockFactory.createMany(5, {
            masjid_id: setup.masjid.id,
            status: "active",
        });
        return {
            ...setup,
            activeContent,
        };
    }
}
/**
 * Export all mock factories for easy access
 */
export const MockFactories = {
    User: UserMockFactory,
    Profile: ProfileMockFactory,
    ProfileAddress: ProfileAddressMockFactory,
    Masjid: MasjidMockFactory,
    TvDisplay: TvDisplayMockFactory,
    DisplayContent: DisplayContentMockFactory,
    TestDataGenerator,
};
//# sourceMappingURL=mock-data.js.map