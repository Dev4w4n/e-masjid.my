/**
 * JAKIM API Service - Real Implementation
 * 
 * This service integrates with the Malaysian government prayer times API.
 * 
 * @see https://www.e-solat.gov.my/index.php for actual JAKIM prayer times
 * @see https://api.waktusolat.app/v2/solat/ for API documentation
 */

import { PrayerTimes } from '@masjid-suite/shared-types';

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
    fajr: number;     // Unix timestamp
    syuruk: number;   // Unix timestamp
    dhuhr: number;    // Unix timestamp
    asr: number;      // Unix timestamp
    maghrib: number;  // Unix timestamp
    isha: number;     // Unix timestamp
  }>;
}

/**
 * Malaysian prayer time zones from JAKIM
 * These are the official zone codes used by the Malaysian government
 */
export const MALAYSIAN_ZONES = {
  // Johor
  'JHR01': 'Pulau Aur dan Pulau Pemanggil',
  'JHR02': 'Johor Bahru, Kota Tinggi, Mersing, Kulai',
  'JHR03': 'Kluang, Pontian',
  'JHR04': 'Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak',
  
  // Kedah
  'KDH01': 'Kota Setar, Kubang Pasu, Pokok Sena',
  'KDH02': 'Kuala Muda, Yan, Pendang',
  'KDH03': 'Padang Terap, Sik',
  'KDH04': 'Baling',
  'KDH05': 'Bandar Baharu, Kulim',
  'KDH06': 'Langkawi',
  'KDH07': 'Puncak Gunung Jerai',
  
  // Kelantan
  'KTN01': 'Kota Bharu, Bachok, Pasir Mas, Tumpat, Pasir Puteh, Kuala Krai, Machang',
  'KTN02': 'Gua Musang, Jeli, Jajahan Kecil Lojing',
  
  // Malacca
  'MLK01': 'SELURUH NEGERI MELAKA',
  
  // Negeri Sembilan
  'NGS01': 'Tampin, Jempol',
  'NGS02': 'Jelebu, Kuala Pilah, Rembau',
  'NGS03': 'Port Dickson, Seremban',
  
  // Pahang
  'PHG01': 'Pulau Tioman',
  'PHG02': 'Kuantan, Pekan, Rompin, Muadzam Shah',
  'PHG03': 'Jerantut, Temerloh, Maran, Bera, Chenor, Jengka',
  'PHG04': 'Bentong, Lipis, Raub',
  'PHG05': 'Genting Sempah, Janda Baik, Bukit Tinggi',
  'PHG06': 'Cameron Highlands, Genting Higlands, Bukit Fraser',
  
  // Perak
  'PRK01': 'Tapah, Slim River, Tanjung Malim',
  'PRK02': 'Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar',
  'PRK03': 'Lenggong, Pengkalan Hulu, Grik',
  'PRK04': 'Temengor, Belum',
  'PRK05': 'Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor',
  'PRK06': 'Selama, Taiping, Bagan Serai, Parit Buntar',
  'PRK07': 'Bukit Larut',
  
  // Perlis
  'PLS01': 'SELURUH NEGERI PERLIS',
  
  // Penang
  'PNG01': 'SELURUH NEGERI PULAU PINANG',
  
  // Sabah
  'SBH01': 'Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan, Sukau',
  'SBH02': 'Beluran, Telupid, Pinangah, Terusan, Kuamut, Bahagian Sandakan (Barat)',
  'SBH03': 'Lahad Datu, Silabukan, Kunak, Sahabat, Semporna, Tungku, Bahagian Tawau (Timur)',
  'SBH04': 'Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (Barat)',
  'SBH05': 'Kudat, Kota Marudu, Pitas, Pulau Banggi, Bahagian Kudat',
  'SBH06': 'Gunung Kinabalu',
  'SBH07': 'Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat',
  'SBH08': 'Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman (Atas)',
  'SBH09': 'Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pasia, Membakut, Weston, Bahagian Pendalaman (Bawah)',
  
  // Sarawak
  'SWK01': 'Limbang, Lawas, Sundar, Trusan',
  'SWK02': 'Miri, Niah, Bekenu, Sibuti, Marudi',
  'SWK03': 'Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu',
  'SWK04': 'Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit',
  'SWK05': 'Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai',
  'SWK06': 'Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok',
  'SWK07': 'Serian, Simunjan, Samarahan, Sebuyau, Meludam',
  'SWK08': 'Kuching, Bau, Lundu, Sematan',
  'SWK09': 'Zon Khas (Kampung Patarikan)',
  
  // Selangor
  'SGR01': 'Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam',
  'SGR02': 'Kuala Selangor, Sabak Bernam',
  'SGR03': 'Klang, Kuala Langat',
  
  // Terengganu
  'TRG01': 'Kuala Terengganu, Marang',
  'TRG02': 'Besut, Setiu',
  'TRG03': 'Hulu Terengganu',
  'TRG04': 'Dungun, Kemaman',
  
  // Wilayah Persekutuan
  'WLY01': 'Kuala Lumpur, Putrajaya',
  'WLY02': 'Labuan'
} as const;

export type MalaysianZone = keyof typeof MALAYSIAN_ZONES;

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
  zone: 'WLY01', // Default to Kuala Lumpur
  cacheDuration: 60, // 1 hour cache
  retryAttempts: 3,
  timeout: 10000, // 10 seconds
  baseUrl: 'https://api.waktusolat.app/v2/solat'
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
      zone
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
      console.log(`[JakimAPI] Fetching prayer times for zone ${zone}, date ${date}`);
      
      // Real API call to waktusolat.app
      const response = await this.fetchFromJakimApi(zone);
      
      // Transform API response to our format
      const prayerTimes = this.transformApiResponse(response, masjidId, zone, date);
      
      // Cache the result
      this.cache.set(cacheKey, prayerTimes, zone);
      
      console.log(`[JakimAPI] Successfully fetched and cached prayer times for ${cacheKey}`);
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
          source: 'CACHED_FALLBACK' as const 
        };
      }
      
      throw new Error(`Failed to fetch prayer times from JAKIM API: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const promises = dates.map(date => this.fetchPrayerTimes(masjidId, date, zone));
    
    return Promise.all(promises);
  }

  /**
   * Fetch prayer times from the real JAKIM API
   */
  private async fetchFromJakimApi(zone: MalaysianZone): Promise<JakimApiResponse> {
    const url = `${this.config.baseUrl}/${zone}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'e-masjid.my/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as JakimApiResponse;
      
      // The API doesn't have a status field, just check if we have prayers data
      if (!data.prayers || data.prayers.length === 0) {
        throw new Error('No prayer times data received');
      }
      
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
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
    const now = new Date().toISOString();
    
    // Extract day from target date (YYYY-MM-DD format)
    const dateParts = targetDate.split('-');
    const targetDay = parseInt(dateParts[2] || '1', 10);
    
    // Find the prayer data for the target day
    const prayerData = response.prayers.find(p => p.day === targetDay);
    
    if (!prayerData) {
      throw new Error(`No prayer times found for day ${targetDay} in ${response.zone}`);
    }

    // Helper function to convert Unix timestamp to HH:MM format
    const formatTime = (timestamp: number): string => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    return {
      id: `jakim-${zone}-${targetDate}-${Date.now()}`,
      masjid_id: masjidId,
      prayer_date: targetDate,
      fajr_time: formatTime(prayerData.fajr),
      sunrise_time: formatTime(prayerData.syuruk),
      dhuhr_time: formatTime(prayerData.dhuhr),
      asr_time: formatTime(prayerData.asr),
      maghrib_time: formatTime(prayerData.maghrib),
      isha_time: formatTime(prayerData.isha),
      source: 'JAKIM_API',
      fetched_at: now,
      created_at: now,
      updated_at: now
    };
  }

  /**
   * Generate array of dates between start and end date
   */
  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateString = current.toISOString().split('T')[0];
      if (dateString) {
        dates.push(dateString);
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Clear all cached prayer times
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current configuration
   */
  getConfig(): JakimApiConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<JakimApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
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
  zone: MalaysianZone = 'WLY01'
): Promise<PrayerTimes> {
  const today = new Date().toISOString().split('T')[0]!;
  return jakimApi.fetchPrayerTimes(masjidId, today, zone);
}

/**
 * Utility function to get prayer times for this month
 */
export async function getMonthlyPrayerTimes(
  masjidId: string,
  zone: MalaysianZone = 'WLY01'
): Promise<PrayerTimes[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0]!;
  const endDate = endOfMonth.toISOString().split('T')[0]!;
  
  return jakimApi.fetchPrayerTimesRange(masjidId, startDate, endDate, zone);
}