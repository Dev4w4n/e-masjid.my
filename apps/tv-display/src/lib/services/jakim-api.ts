/**
 * JAKIM API Service - Mock Implementation
 * 
 * This is a mock implementation of the JAKIM API service for development and testing.
 * In production, this would integrate with the actual Malaysian government prayer times API.
 * 
 * @see https://www.e-solat.gov.my/index.php for actual JAKIM prayer times
 */

import { PrayerTimes } from '@masjid-suite/shared-types';

/**
 * JAKIM API response format (mocked based on typical e-solat API structure)
 */
interface JakimApiResponse {
  status: string;
  serverTime: string;
  periode: string;
  lang: string;
  zone: string;
  bearing: string;
  data: {
    date: string;
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
  }[];
}

/**
 * Malaysian prayer time zones (simplified for mock)
 */
export const MALAYSIAN_ZONES = {
  'SGR01': 'Perlis, Kedah, Penang, Perak',
  'SGR02': 'Selangor, KL, Putrajaya, Negeri Sembilan',
  'SGR03': 'Pahang, Johor',
  'SGR04': 'Kelantan, Terengganu',
  'SGR05': 'Sabah',
  'SGR06': 'Sarawak',
  'SGR07': 'Labuan'
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
}

/**
 * Default configuration for JAKIM API
 */
const DEFAULT_CONFIG: JakimApiConfig = {
  zone: 'SGR02', // Default to Selangor/KL
  cacheDuration: 60, // 1 hour cache
  retryAttempts: 3,
  timeout: 10000 // 10 seconds
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
      
      // Mock API call (in production, this would be actual HTTP request)
      const response = await this.mockJakimApiCall(zone, date);
      
      // Transform API response to our format
      const prayerTimes = this.transformApiResponse(response, masjidId, zone);
      
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
   * Mock JAKIM API call - simulates actual API response
   * In production, this would be replaced with actual HTTP requests
   */
  private async mockJakimApiCall(zone: MalaysianZone, date: string): Promise<JakimApiResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Generate realistic prayer times based on zone and date
    const baseTimes = this.generateBasePrayerTimes(zone, date);
    
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
  }

  /**
   * Transform JAKIM API response to our PrayerTimes format
   */
  private transformApiResponse(
    response: JakimApiResponse,
    masjidId: string,
    zone: MalaysianZone
  ): PrayerTimes {
    const data = response.data[0];
    const now = new Date().toISOString();

    return {
      id: `jakim-${zone}-${data.date}-${Date.now()}`,
      masjid_id: masjidId,
      prayer_date: data.date,
      fajr_time: data.timings.Fajr,
      sunrise_time: data.timings.Sunrise,
      dhuhr_time: data.timings.Dhuhr,
      asr_time: data.timings.Asr,
      maghrib_time: data.timings.Maghrib,
      isha_time: data.timings.Isha,
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
      dates.push(current.toISOString().split('T')[0]);
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
  zone: MalaysianZone = 'SGR02'
): Promise<PrayerTimes> {
  const today = new Date().toISOString().split('T')[0];
  return jakimApi.fetchPrayerTimes(masjidId, today, zone);
}

/**
 * Utility function to get prayer times for this month
 */
export async function getMonthlyPrayerTimes(
  masjidId: string,
  zone: MalaysianZone = 'SGR02'
): Promise<PrayerTimes[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];
  
  return jakimApi.fetchPrayerTimesRange(masjidId, startDate, endDate, zone);
}