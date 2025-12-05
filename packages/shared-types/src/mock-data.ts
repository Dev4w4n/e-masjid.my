/**
 * Shared Mock Data Factory
 *
 * Generates mock data that exactly matches the Supabase schema for consistent testing
 * across all apps in the monorepo. This ensures unit tests use realistic data
 * that matches database constraints and validations.
 */

import type { Tables } from "./database";

// Type aliases for cleaner code
type User = Tables<"users">;
type Profile = Tables<"profiles">;
type ProfileAddress = Tables<"profile_addresses">;
type Masjid = Tables<"masjids">;
type TvDisplay = Tables<"tv_displays">;
type DisplayContent = Tables<"display_content">;
type PrayerTimes = Tables<"prayer_times">;
type PrayerTimeConfig = Tables<"prayer_time_config">;
type DisplayStatus = Tables<"display_status">;
type DisplayAnalytics = Tables<"display_analytics">;

// Enum values from Supabase schema
const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Pulau Pinang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
] as const;

const LANGUAGE_CODES = ["en", "ms", "zh", "ta"] as const;
const USER_ROLES = [
  "super_admin",
  "masjid_admin",
  "registered",
  "public",
] as const;
const CONTENT_TYPES = [
  "image",
  "youtube_video",
  "text_announcement",
  "event_poster",
] as const;
const CONTENT_STATUSES = ["pending", "active", "expired", "rejected"] as const;
const PRAYER_TIME_POSITIONS = [
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "hidden",
] as const;
const DISPLAY_ORIENTATIONS = ["landscape", "portrait"] as const;
const DISPLAY_RESOLUTIONS = [
  "1920x1080",
  "3840x2160",
  "1366x768",
  "2560x1440",
] as const;
const PRAYER_TIME_SOURCES = ["manual", "jakim", "auto"] as const;

/**
 * Simple mock data utilities
 */
class MockUtils {
  private static counter = 0;

  static generateId(): string {
    return `mock-id-${Date.now()}-${++this.counter}`;
  }

  static randomElement<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot select random element from empty array");
    }
    return array[Math.floor(Math.random() * array.length)]!;
  }

  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomFloat(min: number, max: number, precision = 2): number {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(precision));
  }

  static randomBoolean(): boolean {
    return Math.random() > 0.5;
  }

  static randomEmail(): string {
    const domains = ["example.com", "test.com", "mock.org"];
    const names = ["user", "test", "admin", "john", "jane"];
    return `${this.randomElement(names)}${this.randomNumber(1, 999)}@${this.randomElement(domains)}`;
  }

  static randomName(): string {
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

  static randomMasjidName(): string {
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

  static randomStreetAddress(): string {
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

  static randomCity(): string {
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

  static randomPostcode(): string {
    return this.randomNumber(10000, 98000).toString().padStart(5, "0");
  }

  static randomPhone(): string {
    const formats = [
      `+60${this.randomNumber(10, 19)}${this.randomNumber(1000000, 9999999)}`,
      `0${this.randomNumber(10, 19)}-${this.randomNumber(100, 999)}-${this.randomNumber(1000, 9999)}`,
    ];
    return this.randomElement(formats);
  }

  static randomYouTubeUrl(): string {
    const videoId = Math.random().toString(36).substring(2, 13);
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  static randomImageUrl(): string {
    const width = this.randomElement([1920, 1280, 1024]);
    const height = this.randomElement([1080, 720, 768]);
    return `https://picsum.photos/${width}/${height}`;
  }

  static randomJakimZone(): string {
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

  static randomDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - this.randomNumber(0, 365));
    return date.toISOString();
  }

  static randomRecentDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - this.randomNumber(0, 30));
    return date.toISOString();
  }

  static randomFutureDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + this.randomNumber(1, 365));
    return date.toISOString();
  }

  static randomDateOnly(): string {
    const date = new Date();
    date.setDate(date.getDate() - this.randomNumber(0, 365));
    return date.toISOString().split("T")[0]!;
  }
}

/**
 * User mock data factory
 */
export class UserMockFactory {
  static create(overrides: Partial<User> = {}): User {
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

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createSuperAdmin(overrides: Partial<User> = {}): User {
    return this.create({ role: "super_admin", ...overrides });
  }

  static createMasjidAdmin(overrides: Partial<User> = {}): User {
    return this.create({ role: "masjid_admin", ...overrides });
  }

  static createRegisteredUser(overrides: Partial<User> = {}): User {
    return this.create({ role: "registered", ...overrides });
  }
}

/**
 * Profile mock data factory
 */
export class ProfileMockFactory {
  static create(overrides: Partial<Profile> = {}): Profile {
    const hasHomeMasjid =
      overrides.home_masjid_id !== undefined
        ? overrides.home_masjid_id !== null
        : MockUtils.randomBoolean();

    return {
      id: MockUtils.generateId(),
      user_id: MockUtils.generateId(),
      full_name: MockUtils.randomName(),
      phone_number: MockUtils.randomBoolean() ? MockUtils.randomPhone() : null,
      preferred_language: MockUtils.randomElement(LANGUAGE_CODES),
      home_masjid_id: hasHomeMasjid ? MockUtils.generateId() : null,
      is_complete: MockUtils.randomBoolean(),
      created_at: MockUtils.randomDate(),
      updated_at: MockUtils.randomRecentDate(),
      ...overrides,
    };
  }

  static createComplete(overrides: Partial<Profile> = {}): Profile {
    return this.create({
      is_complete: true,
      full_name: MockUtils.randomName(),
      phone_number: MockUtils.randomPhone(),
      ...overrides,
    });
  }

  static createIncomplete(overrides: Partial<Profile> = {}): Profile {
    return this.create({
      is_complete: false,
      full_name: "Unnamed User",
      phone_number: null,
      ...overrides,
    });
  }

  static createMany(
    count: number,
    overrides: Partial<Profile> = {}
  ): Profile[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

/**
 * Profile Address mock data factory
 */
export class ProfileAddressMockFactory {
  static create(overrides: Partial<ProfileAddress> = {}): ProfileAddress {
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

  static createMany(
    count: number,
    overrides: Partial<ProfileAddress> = {}
  ): ProfileAddress[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createPrimary(
    profileId: string,
    overrides: Partial<ProfileAddress> = {}
  ): ProfileAddress {
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
  static create(overrides: Partial<Masjid> = {}): Masjid {
    const state = MockUtils.randomElement(MALAYSIAN_STATES);

    const baseMasjid: Masjid = {
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

  static createMany(count: number, overrides: Partial<Masjid> = {}): Masjid[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createByState(
    state: (typeof MALAYSIAN_STATES)[number],
    overrides: Partial<Masjid> = {}
  ): Masjid {
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
  static create(overrides: Partial<TvDisplay> = {}): TvDisplay {
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
      image_background_color: MockUtils.randomBoolean() ? "#000000" : null,
      image_display_mode: MockUtils.randomElement(["fill", "fit", "stretch"]),
      language: MockUtils.randomBoolean()
        ? MockUtils.randomElement(["en", "ms"])
        : null,
      prayer_time_alignment: "center",
      prayer_time_layout: "horizontal",
      show_debug_info: false,
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

  static createMany(
    count: number,
    overrides: Partial<TvDisplay> = {}
  ): TvDisplay[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createActive(
    masjidId: string,
    overrides: Partial<TvDisplay> = {}
  ): TvDisplay {
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
  static create(overrides: Partial<DisplayContent> = {}): DisplayContent {
    const contentType = MockUtils.randomElement(CONTENT_TYPES);
    let url: string;
    let file_type: string;

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

    const baseContent: DisplayContent = {
      id: MockUtils.generateId(),
      masjid_id: MockUtils.generateId(),
      // display_id field removed - content assignments handled separately
      title: `Content ${MockUtils.randomNumber(1, 100)}`,
      description: MockUtils.randomBoolean()
        ? "Sample content description"
        : null,
      type: contentType,
      url,
      thumbnail_url: MockUtils.randomBoolean()
        ? MockUtils.randomImageUrl()
        : null,
      duration: MockUtils.randomNumber(5, 300),
      start_date: MockUtils.randomDateOnly(),
      end_date: MockUtils.randomFutureDate().split("T")[0]!,
      status: MockUtils.randomElement(CONTENT_STATUSES),
      submitted_by: MockUtils.generateId(),
      submitted_at: MockUtils.randomDate(),
      file_size: MockUtils.randomBoolean()
        ? MockUtils.randomNumber(1024, 10485760)
        : null,
      file_type,
      created_at: MockUtils.randomDate(),
      updated_at: MockUtils.randomRecentDate(),
      qr_code_enabled: MockUtils.randomBoolean(),
      qr_code_url: MockUtils.randomBoolean()
        ? "https://example.com/custom-url"
        : null,
      qr_code_position: MockUtils.randomElement([
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ] as const),
    };

    return {
      ...baseContent,
      ...overrides,
    };
  }

  static createMany(
    count: number,
    overrides: Partial<DisplayContent> = {}
  ): DisplayContent[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createActive(overrides: Partial<DisplayContent> = {}): DisplayContent {
    const today = new Date().toISOString().split("T")[0]!;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    return this.create({
      status: "active",
      start_date: today,
      end_date: futureDate.toISOString().split("T")[0]!,
      ...overrides,
    });
  }

  static createByType(
    type: (typeof CONTENT_TYPES)[number],
    overrides: Partial<DisplayContent> = {}
  ): DisplayContent {
    let url: string;
    let file_type: string;

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
  static createMasjidSetup(
    overrides: {
      masjid?: Partial<Masjid>;
      admin?: Partial<User>;
      profile?: Partial<Profile>;
      address?: Partial<ProfileAddress>;
      displays?: number;
      content?: number;
    } = {}
  ) {
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
    const adminAddress = ProfileAddressMockFactory.createPrimary(
      adminProfile.id,
      overrides.address
    );

    // Create displays
    const displays = TvDisplayMockFactory.createMany(overrides.displays || 2, {
      masjid_id: masjid.id,
    });

    // Create content
    const content = DisplayContentMockFactory.createMany(
      overrides.content || 5,
      { masjid_id: masjid.id }
    );

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
