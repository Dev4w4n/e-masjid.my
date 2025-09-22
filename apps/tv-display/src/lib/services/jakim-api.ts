/**
<<<<<<< HEAD
<<<<<<< HEAD
 * JAKIM API Service - Real Implementation
 * 
 * This service integrates with the Malaysian government prayer times API.
 * 
 * @see https://www.e-solat.gov.my/index.php for actual JAKIM prayer times
 * @see https://api.waktusolat.app/v2/solat/ for API documentation
=======
 * JAKIM API Service - Mock Implementation
=======
 * JAKIM API Service - Real Implementation
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
 * 
 * This service integrates with the Malaysian government prayer times API.
 * 
 * @see https://www.e-solat.gov.my/index.php for actual JAKIM prayer times
<<<<<<< HEAD
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
 * @see https://api.waktusolat.app/v2/solat/ for API documentation
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
 */

import { PrayerTimes } from '@masjid-suite/shared-types';

/**
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
 * JAKIM API response format (mocked based on typical e-solat API structure)
=======
 * Real JAKIM API response format from waktusolat.app
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
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
<<<<<<< HEAD
  'SGR01': 'Perlis, Kedah, Penang, Perak',
  'SGR02': 'Selangor, KL, Putrajaya, Negeri Sembilan',
  'SGR03': 'Pahang, Johor',
  'SGR04': 'Kelantan, Terengganu',
  'SGR05': 'Sabah',
  'SGR06': 'Sarawak',
  'SGR07': 'Labuan'
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
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
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
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
<<<<<<< HEAD
<<<<<<< HEAD
  /** Base URL for the JAKIM API */
  baseUrl: string;
=======
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
  /** Base URL for the JAKIM API */
  baseUrl: string;
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
}

/**
 * Default configuration for JAKIM API
 */
const DEFAULT_CONFIG: JakimApiConfig = {
<<<<<<< HEAD
<<<<<<< HEAD
  zone: 'WLY01', // Default to Kuala Lumpur
  cacheDuration: 60, // 1 hour cache
  retryAttempts: 3,
  timeout: 10000, // 10 seconds
  baseUrl: 'https://api.waktusolat.app/v2/solat'
=======
  zone: 'SGR02', // Default to Selangor/KL
  cacheDuration: 60, // 1 hour cache
  retryAttempts: 3,
  timeout: 10000 // 10 seconds
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
  zone: 'WLY01', // Default to Kuala Lumpur
  cacheDuration: 60, // 1 hour cache
  retryAttempts: 3,
  timeout: 10000, // 10 seconds
  baseUrl: 'https://api.waktusolat.app/v2/solat'
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
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
      
<<<<<<< HEAD
<<<<<<< HEAD
      // Real API call to waktusolat.app
      const response = await this.fetchFromJakimApi(zone);
      
      // Transform API response to our format
      const prayerTimes = this.transformApiResponse(response, masjidId, zone, date);
=======
      // Mock API call (in production, this would be actual HTTP request)
      const response = await this.mockJakimApiCall(zone, date);
      
      // Transform API response to our format
      const prayerTimes = this.transformApiResponse(response, masjidId, zone);
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
      // Real API call to waktusolat.app
      const response = await this.fetchFromJakimApi(zone);
      
      // Transform API response to our format
      const prayerTimes = this.transformApiResponse(response, masjidId, zone, date);
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
      
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
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
   * Mock JAKIM API call - simulates actual API response
   * In production, this would be replaced with actual HTTP requests
=======
   * Fetch prayer times from the real JAKIM API
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
   */
  private async fetchFromJakimApi(zone: MalaysianZone): Promise<JakimApiResponse> {
    const url = `${this.config.baseUrl}/${zone}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
<<<<<<< HEAD
    return {
      status: "OK",
      serverTime: new Date().toISOString(),
      periode: date,
      lang: "ms",
      zone,
      bearing: "292.5", // Qibla direction for Malaysia
      data: [{
        date,
        timings: baseTimes
      }]
    };
  }

  /**
   * Generate realistic prayer times for Malaysian zones
   */
  private generateBasePrayerTimes(zone: MalaysianZone, date: string) {
    // Base times for different zones (simplified)
    const zoneOffsets = {
      'SGR01': { fajr: '05:45', sunrise: '07:05', dhuhr: '13:15', asr: '16:35', maghrib: '19:25', isha: '20:35' },
      'SGR02': { fajr: '05:50', sunrise: '07:10', dhuhr: '13:20', asr: '16:40', maghrib: '19:30', isha: '20:40' },
      'SGR03': { fajr: '05:48', sunrise: '07:08', dhuhr: '13:18', asr: '16:38', maghrib: '19:28', isha: '20:38' },
      'SGR04': { fajr: '05:42', sunrise: '07:02', dhuhr: '13:12', asr: '16:32', maghrib: '19:22', isha: '20:32' },
      'SGR05': { fajr: '05:30', sunrise: '06:50', dhuhr: '13:00', asr: '16:20', maghrib: '19:10', isha: '20:20' },
      'SGR06': { fajr: '05:35', sunrise: '06:55', dhuhr: '13:05', asr: '16:25', maghrib: '19:15', isha: '20:25' },
      'SGR07': { fajr: '05:32', sunrise: '06:52', dhuhr: '13:02', asr: '16:22', maghrib: '19:12', isha: '20:22' }
    };

    // Add slight daily variation (±5 minutes) to simulate seasonal changes
    const variation = () => {
      const minutes = Math.floor(Math.random() * 11) - 5; // -5 to +5 minutes
      return minutes;
    };

    const addMinutes = (time: string, minutes: number): string => {
      const [hours, mins] = time.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMins = totalMinutes % 60;
      return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    };

    const base = zoneOffsets[zone];
    
    return {
      Fajr: addMinutes(base.fajr, variation()),
      Sunrise: addMinutes(base.sunrise, variation()),
      Dhuhr: addMinutes(base.dhuhr, variation()),
      Asr: addMinutes(base.asr, variation()),
      Maghrib: addMinutes(base.maghrib, variation()),
      Isha: addMinutes(base.isha, variation())
    };
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
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
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
  }

  /**
   * Transform JAKIM API response to our PrayerTimes format
   */
  private transformApiResponse(
    response: JakimApiResponse,
    masjidId: string,
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
    zone: MalaysianZone
=======
    zone: MalaysianZone,
    targetDate: string
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
  ): PrayerTimes {
    const now = new Date().toISOString();
    
    // Extract day from target date (YYYY-MM-DD format)
    const targetDay = parseInt(targetDate.split('-')[2], 10);
    
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
<<<<<<< HEAD
      prayer_date: data.date,
      fajr_time: data.timings.Fajr,
      sunrise_time: data.timings.Sunrise,
      dhuhr_time: data.timings.Dhuhr,
      asr_time: data.timings.Asr,
      maghrib_time: data.timings.Maghrib,
      isha_time: data.timings.Isha,
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
      prayer_date: targetDate,
      fajr_time: formatTime(prayerData.fajr),
      sunrise_time: formatTime(prayerData.syuruk),
      dhuhr_time: formatTime(prayerData.dhuhr),
      asr_time: formatTime(prayerData.asr),
      maghrib_time: formatTime(prayerData.maghrib),
      isha_time: formatTime(prayerData.isha),
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
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
<<<<<<< HEAD
      const dateString = current.toISOString().split('T')[0];
      if (dateString) {
        dates.push(dateString);
      }
=======
      dates.push(current.toISOString().split('T')[0]);
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
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
<<<<<<< HEAD
<<<<<<< HEAD
  zone: MalaysianZone = 'WLY01'
): Promise<PrayerTimes> {
  const today = new Date().toISOString().split('T')[0]!;
=======
  zone: MalaysianZone = 'SGR02'
=======
  zone: MalaysianZone = 'WLY01'
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
): Promise<PrayerTimes> {
  const today = new Date().toISOString().split('T')[0];
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
  return jakimApi.fetchPrayerTimes(masjidId, today, zone);
}

/**
 * Utility function to get prayer times for this month
 */
export async function getMonthlyPrayerTimes(
  masjidId: string,
<<<<<<< HEAD
<<<<<<< HEAD
  zone: MalaysianZone = 'WLY01'
=======
  zone: MalaysianZone = 'SGR02'
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
=======
  zone: MalaysianZone = 'WLY01'
>>>>>>> 8d5ddaf (feat: Add JAKIM API integration tests and enhance masjid service)
): Promise<PrayerTimes[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
<<<<<<< HEAD
  const startDate = startOfMonth.toISOString().split('T')[0]!;
  const endDate = endOfMonth.toISOString().split('T')[0]!;
=======
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
  
  return jakimApi.fetchPrayerTimesRange(masjidId, startDate, endDate, zone);
}