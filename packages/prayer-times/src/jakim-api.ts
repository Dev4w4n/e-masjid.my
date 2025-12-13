/**
 * JAKIM Prayer Times Service
 *
 * Shared service for fetching Malaysian prayer times from JAKIM API
 * Used by both Hub and TV Display applications
 */

/**
 * Prayer times interface (simplified from shared-types)
 */
export interface PrayerTimes {
  id: string;
  masjid_id: string;
  prayer_date: string; // YYYY-MM-DD

  // Prayer times
  fajr_time: string; // HH:MM
  sunrise_time: string; // HH:MM
  dhuhr_time: string; // HH:MM
  asr_time: string; // HH:MM
  maghrib_time: string; // HH:MM
  isha_time: string; // HH:MM

  // Source and metadata
  source: "JAKIM_API" | "MANUAL_ENTRY" | "CACHED_FALLBACK";
  fetched_at: string; // ISO datetime
  manual_adjustments?: {
    [key in "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha"]?: number; // minutes offset
  };

  created_at: string;
  updated_at: string;
}

/**
 * Malaysian prayer time zones from JAKIM
 * These are the official zone codes used by the Malaysian government
 */
export const MALAYSIAN_ZONES = {
  // Johor
  JHR01: "Pulau Aur dan Pulau Pemanggil",
  JHR02: "Johor Bahru, Kota Tinggi, Mersing, Kulai",
  JHR03: "Kluang, Pontian",
  JHR04: "Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak",

  // Kedah
  KDH01: "Kota Setar, Kubang Pasu, Pokok Sena",
  KDH02: "Kuala Muda, Yan, Pendang",
  KDH03: "Padang Terap, Sik",
  KDH04: "Baling",
  KDH05: "Bandar Baharu, Kulim",
  KDH06: "Langkawi",
  KDH07: "Gunung Jerai",

  // Kelantan
  KTN01:
    "Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku",
  KTN03: "Gua Musang, Mukim Galas, Bertam",

  // Melaka
  MLK01: "SELURUH NEGERI MELAKA",

  // Negeri Sembilan
  NGS01: "Tampin, Jempol",
  NGS02: "Jelebu, Kuala Pilah, Port Dickson, Rembau, Seremban",

  // Pahang
  PHG01: "Pulau Tioman",
  PHG02: "Kuantan, Pekan, Rompin, Muadzam Shah",
  PHG03: "Jerantut, Temerloh, Maran, Bera, Chenor, Jengka",
  PHG04: "Bentong, Lipis, Raub",
  PHG05: "Genting Sempah, Janda Baik, Bukit Tinggi",
  PHG06: "Cameron Highlands, Genting Highlands, Bukit Fraser",

  // Pulau Pinang
  PNG01: "SELURUH NEGERI PULAU PINANG",

  // Perak
  PRK01: "Tapah, Slim River, Tanjung Malim",
  PRK02: "Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar",
  PRK03: "Lenggong, Pengkalan Hulu, Grik",
  PRK04: "Temengor, Belum",
  PRK05:
    "Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor",
  PRK06: "Selama, Taiping, Bagan Serai, Parit Buntar",
  PRK07: "Bukit Larut",

  // Perlis
  PLS01: "Kangar, Padang Besar, Arau",

  // Sabah
  SBH01:
    "Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan, Sukau",
  SBH02:
    "Bahagian Sandakan (Barat), Pinangah, Terusan, Beluran, Kuamut, Telupit",
  SBH03: "Bahagian Tawau (Timur), Bandar Tawau, Balong, Merotai, Kalabakan",
  SBH04:
    "Bahagian Tawau (Barat), Kunak, Lahad Datu, Silabukan, Tungku, Sahabat, Semporna",
  SBH05: "Kudat, Kota Marudu, Pitas, Pulau Banggi, Bahagian Kudat",
  SBH06: "Gunung Kinabalu",
  SBH07:
    "Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat",
  SBH08: "Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman",
  SBH09:
    "Sipitang, Membakut, Beaufort, Kuala Penyu, Weston, Tenom, Long Pasia, Bahagian Pendalaman",

  // Sarawak
  SWK01: "Limbang, Lawas, Sundar, Trusan",
  SWK02: "Miri, Niah, Bekenu, Sibuti, Marudi",
  SWK03: "Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu",
  SWK04: "Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit",
  SWK05: "Sarikei, Meradong, Julau, Rajang, Bitangor, Belawai",
  SWK06:
    "Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok",
  SWK07: "Serian, Simunjan, Samarahan, Sebuyau, Meludam",
  SWK08: "Kuching, Bau, Lundu, Sematan",
  SWK09: "Zon Khas (Kampung Patarikan)",

  // Selangor
  SGR01: "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Rawang, S.Alam",
  SGR02: "Sabak Bernam, Kuala Selangor",
  SGR03: "Klang, Kuala Langat",

  // Terengganu
  TRG01: "Kuala Terengganu, Marang, Kuala Nerus",
  TRG02: "Besut, Setiu",
  TRG03: "Hulu Terengganu",
  TRG04: "Dungun, Kemaman",

  // Wilayah Persekutuan
  WLY01: "Kuala Lumpur, Putrajaya",
  WLY02: "Labuan",
} as const;

export type MalaysianZone = keyof typeof MALAYSIAN_ZONES;

/**
 * Real JAKIM API response format from waktusolat.app
 */
interface JakimApiResponse {
  zone: string;
  year: number;
  month: string;
  month_number: number;
  last_updated: string | null;
  prayers: Array<{
    day: number;
    hijri: string;
    fajr: number; // Unix timestamp
    syuruk: number; // Unix timestamp
    dhuhr: number; // Unix timestamp
    asr: number; // Unix timestamp
    maghrib: number; // Unix timestamp
    isha: number; // Unix timestamp
  }>;
}

/**
 * Configuration for JAKIM API service
 */
interface JakimApiConfig {
  zone: MalaysianZone;
  /** Cache duration in minutes */
  cacheDuration: number;
  /** Retry attempts on failure */
  retryAttempts: number;
  /** Timeout in milliseconds */
  timeout: number;
  /** Base URL for the JAKIM API */
  baseUrl: string;
}

/**
 * Default configuration for JAKIM API
 */
const DEFAULT_CONFIG: JakimApiConfig = {
  zone: "WLY01", // Default to Kuala Lumpur
  cacheDuration: 60, // 1 hour cache
  retryAttempts: 3,
  timeout: 10000, // 10 seconds
  baseUrl: "https://api.waktusolat.app/v2/solat",
};

/**
 * Cache interface for storing prayer times
 */
interface CacheEntry {
  data: PrayerTimes;
  timestamp: number;
  zone: MalaysianZone;
}

/**
 * Simple in-memory cache (in production, this would use Redis or similar)
 */
class PrayerTimesCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: PrayerTimes, zone: MalaysianZone): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      zone,
    });
  }

  get(key: string, maxAge: number): PrayerTimes | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * JAKIM API Service class for fetching Malaysian prayer times
 */
export class JakimApiService {
  private config: JakimApiConfig;
  private cache: PrayerTimesCache;

  constructor(config: Partial<JakimApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new PrayerTimesCache();
  }

  /**
   * Fetch prayer times for a specific date and zone
   *
   * @param masjidId - The masjid ID for database storage
   * @param date - Date in YYYY-MM-DD format
   * @param zone - Malaysian prayer time zone
   * @returns Promise<PrayerTimes> - Formatted prayer times
   */
  async fetchPrayerTimes(
    masjidId: string,
    date: string,
    zone: MalaysianZone = this.config.zone
  ): Promise<PrayerTimes> {
    const cacheKey = `${zone}-${date}`;
    const maxAge = this.config.cacheDuration * 60 * 1000; // Convert to milliseconds

    // Check cache first
    const cached = this.cache.get(cacheKey, maxAge);
    if (cached) {
      console.log(`[JakimAPI] Cache hit for ${cacheKey}`);
      return { ...cached, masjid_id: masjidId };
    }

    try {
      console.log(
        `[JakimAPI] Fetching prayer times for zone ${zone}, date ${date}`
      );

      // Real API call to waktusolat.app
      const response = await this.fetchFromJakimApi(zone);

      // Transform API response to our format
      const prayerTimes = this.transformApiResponse(
        response,
        masjidId,
        zone,
        date
      );

      // Cache the result
      this.cache.set(cacheKey, prayerTimes, zone);

      console.log(
        `[JakimAPI] Successfully fetched and cached prayer times for ${cacheKey}`
      );
      return prayerTimes;
    } catch (error) {
      console.error(`[JakimAPI] Failed to fetch prayer times:`, error);

      // Try to return cached data even if expired as fallback
      const staleCached = this.cache.get(cacheKey, Infinity);
      if (staleCached) {
        console.log(`[JakimAPI] Using stale cache as fallback for ${cacheKey}`);
        return {
          ...staleCached,
          masjid_id: masjidId,
          source: "CACHED_FALLBACK" as const,
        };
      }

      throw new Error(
        `Failed to fetch prayer times from JAKIM API: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Fetch prayer times for multiple dates (useful for monthly view)
   *
   * @param masjidId - The masjid ID
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @param zone - Malaysian prayer time zone
   * @returns Promise<PrayerTimes[]> - Array of prayer times
   */
  async fetchPrayerTimesRange(
    masjidId: string,
    startDate: string,
    endDate: string,
    zone: MalaysianZone = this.config.zone
  ): Promise<PrayerTimes[]> {
    const dates = this.generateDateRange(startDate, endDate);
    const promises = dates.map((date) =>
      this.fetchPrayerTimes(masjidId, date, zone)
    );

    return Promise.all(promises);
  }

  /**
   * Fetch prayer times from the real JAKIM API
   */
  private async fetchFromJakimApi(
    zone: MalaysianZone
  ): Promise<JakimApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/${zone}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Open-E-Masjid/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: JakimApiResponse = await response.json();

      if (!data.prayers || !Array.isArray(data.prayers)) {
        throw new Error("Invalid API response format");
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Transform JAKIM API response to our PrayerTimes format
   */
  private transformApiResponse(
    response: JakimApiResponse,
    masjidId: string,
    zone: MalaysianZone,
    targetDate: string
  ): PrayerTimes {
    // Find the prayer data for the target date
    const targetDay = parseInt(targetDate.split("-")[2] || "1", 10);
    const prayerData = response.prayers.find((p) => p.day === targetDay);

    if (!prayerData) {
      throw new Error(`No prayer data found for date ${targetDate}`);
    }

    // Convert Unix timestamps to HH:MM format
    const formatTime = (timestamp: number): string => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kuala_Lumpur",
      });
    };

    return {
      id: `${masjidId}-${targetDate}-${zone}`,
      masjid_id: masjidId,
      prayer_date: targetDate,
      fajr_time: formatTime(prayerData.fajr),
      sunrise_time: formatTime(prayerData.syuruk),
      dhuhr_time: formatTime(prayerData.dhuhr),
      asr_time: formatTime(prayerData.asr),
      maghrib_time: formatTime(prayerData.maghrib),
      isha_time: formatTime(prayerData.isha),
      source: "JAKIM_API",
      fetched_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Generate array of date strings between start and end dates
   */
  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0] || "");
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}

/**
 * Default JAKIM API service instance
 */
export const jakimApi = new JakimApiService();

/**
 * Utility function to get prayer times for today
 */
export async function getTodayPrayerTimes(
  masjidId: string,
  zone: MalaysianZone = "WLY01"
): Promise<PrayerTimes> {
  const today = new Date().toISOString().split("T")[0]!;
  return jakimApi.fetchPrayerTimes(masjidId, today, zone);
}

/**
 * Utility function to get prayer times for this month
 */
export async function getMonthlyPrayerTimes(
  masjidId: string,
  zone: MalaysianZone = "WLY01"
): Promise<PrayerTimes[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startDate = startOfMonth.toISOString().split("T")[0]!;
  const endDate = endOfMonth.toISOString().split("T")[0]!;

  return jakimApi.fetchPrayerTimesRange(masjidId, startDate, endDate, zone);
}

/**
 * Determine zone code based on state and city
 * This is a fallback function when zone code is not specified
 */
export function determineZoneCode(
  state: string,
  city: string = ""
): MalaysianZone {
  const stateUpper = state.toUpperCase();
  const cityUpper = city.toUpperCase();

  // Wilayah Persekutuan
  if (stateUpper.includes("KUALA LUMPUR") || cityUpper.includes("KUALA LUMPUR"))
    return "WLY01";
  if (stateUpper.includes("PUTRAJAYA") || cityUpper.includes("PUTRAJAYA"))
    return "WLY01";
  if (stateUpper.includes("LABUAN") || cityUpper.includes("LABUAN"))
    return "WLY02";

  // Selangor
  if (stateUpper.includes("SELANGOR")) {
    if (cityUpper.includes("SABAK") || cityUpper.includes("KUALA SELANGOR"))
      return "SGR02";
    if (cityUpper.includes("KLANG") || cityUpper.includes("KUALA LANGAT"))
      return "SGR03";
    return "SGR01"; // Default Selangor zone
  }

  // Johor
  if (stateUpper.includes("JOHOR")) {
    if (cityUpper.includes("PULAU AUR")) return "JHR01";
    if (cityUpper.includes("KLUANG") || cityUpper.includes("PONTIAN"))
      return "JHR03";
    if (cityUpper.includes("BATU PAHAT") || cityUpper.includes("MUAR"))
      return "JHR04";
    return "JHR02"; // Default Johor zone
  }

  // Add more states as needed
  if (stateUpper.includes("MELAKA") || stateUpper.includes("MALACCA"))
    return "MLK01";
  if (stateUpper.includes("PULAU PINANG") || stateUpper.includes("PENANG"))
    return "PNG01";
  if (stateUpper.includes("PERLIS")) return "PLS01";

  // Default to Kuala Lumpur if state not recognized
  return "WLY01";
}
