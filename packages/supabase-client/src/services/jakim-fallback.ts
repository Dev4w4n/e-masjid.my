import { supabase } from "../index";

const getRuntimeEnv = (): Record<string, string | undefined> => {
  const viteEnv = ((import.meta as any)?.env ?? {}) as Record<
    string,
    string | undefined
  >;
  const nodeEnv =
    typeof process !== "undefined"
      ? (process.env as unknown as Record<string, string | undefined>)
      : {};

  return {
    ...nodeEnv,
    ...viteEnv,
  };
};

const getEnvVar = (name: string): string | undefined => getRuntimeEnv()[name];

/**
 * JAKIM API Fallback Strategy
 * Feature: 007-tv-landing-tiers
 *
 * Cache-first prayer time retrieval with stale-while-revalidate semantics.
 * Cached values are stored in the existing `prayer_times` table using the
 * unique `(masjid_id, prayer_date)` constraint.
 */

type SupabaseLike = {
  from: (table: string) => {
    select: (...args: unknown[]) => unknown;
    eq: (...args: unknown[]) => unknown;
    single?: () => Promise<{ data: any; error: any }>;
    limit?: (count: number) => Promise<{ data: any; error: any }>;
    order?: (...args: unknown[]) => unknown;
    upsert?: (values: any, options?: any) => Promise<{ error: any }>;
  };
};

export interface PrayerTimes {
  zone_code: string;
  date: string;
  sunrise?: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  cached: boolean;
  cache_age_minutes?: number;
}

export interface JAKIMPrayerTimesResponse {
  zone_code?: string;
  date: string;
  times?: {
    sunrise?: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  prayers?: Array<{
    day: number;
    fajr: number;
    syuruk: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  }>;
}

type SingleResult<T> = { data: T | null; error: unknown };
type ListResult<T> = { data: T[] | null; error: unknown };

export class JAKIMFallbackService {
  constructor(private readonly client: SupabaseLike = supabase as any) {}

  private jakim_api_url =
    getEnvVar("NEXT_PUBLIC_JAKIM_API_URL") ||
    "https://api.waktusolat.app/v2/solat";
  private cache_ttl_hours = 24;
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

  /**
   * Get prayer times with fallback strategy:
   * 1. Try JAKIM API
   * 2. On failure, serve from 24-hour cache
   * 3. On both failure, return error UI component hint
   */
  async getPrayerTimes(zone_code: string): Promise<PrayerTimes | null> {
    try {
      // Attempt to fetch from JAKIM API
      return await this.fetchFromJAKIMWithRetry(zone_code);
    } catch (api_error) {
      console.error(
        `[JAKIMFallback] JAKIM API failed for ${zone_code}:`,
        api_error,
      );

      // Fallback: Try to serve from cache
      try {
        const cached_times = await this.fetchFromCache(zone_code);
        if (cached_times) {
          console.log(
            `[JAKIMFallback] Serving cached prayer times for ${zone_code}`,
          );
          this.reportDegradedService("using_cache", zone_code);

          return {
            ...cached_times,
            cached: true,
            cache_age_minutes: this.getCacheAgeMinutes(cached_times.date),
          };
        }
      } catch (cache_error) {
        console.error(`[JAKIMFallback] Cache fallback failed:`, cache_error);
      }

      // Both API and cache failed - signal error to UI
      console.error(
        `[JAKIMFallback] All fallback strategies failed for ${zone_code}`,
      );
      this.reportServiceUnavailable(zone_code);
      return null;
    }
  }

  /**
   * Fetch prayer times from JAKIM API with retry logic
   */
  private async fetchFromJAKIMWithRetry(
    zone_code: string,
    attempt = 0,
  ): Promise<PrayerTimes> {
    try {
      console.log(
        `[JAKIMFallback] Fetching from JAKIM API for ${zone_code} (attempt ${attempt + 1}/${this.maxRetries})...`,
      );

      const url = new URL(`${this.jakim_api_url}/${zone_code}`);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "eMasjid-PrayerTimes/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(
          `JAKIM API returned ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as JAKIMPrayerTimesResponse;

      const prayer_times = this.transformApiResponse(data, zone_code);

      await this.updateCache(prayer_times);
      this.reportAPIHealth("healthy", zone_code);

      return prayer_times;
    } catch (error) {
      const error_msg = error instanceof Error ? error.message : String(error);

      // Retry with exponential backoff
      if (attempt < this.maxRetries - 1) {
        const delay = this.retryDelays[attempt];
        console.log(`[JAKIMFallback] Retrying in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchFromJAKIMWithRetry(zone_code, attempt + 1);
      }

      this.reportAPIHealth("unavailable", zone_code);
      throw new Error(
        `JAKIM API fetch failed after ${this.maxRetries} retries for ${zone_code}: ${error_msg}`,
      );
    }
  }

  /**
   * Fetch prayer times from in-memory cache (24-hour TTL)
   */
  private async fetchFromCache(zone_code: string): Promise<PrayerTimes | null> {
    try {
      const today = this.getKlDate();

      const masjidQuery = this.client.from("masjids") as any;
      const masjid_result = (await masjidQuery
        .select("id, zone_code")
        .eq("zone_code", zone_code)
        .eq("tier", "asas")
        .eq("is_auto_populated", true)
        .eq("status", "active")
        .single()) as SingleResult<{ id: string; zone_code: string }>;

      if (!masjid_result || masjid_result.error || !masjid_result.data) {
        console.log(`[JAKIMFallback] No masjid found for ${zone_code}`);
        return null;
      }

      const prayerQuery = this.client.from("prayer_times") as any;
      const prayer_result = (await prayerQuery
        .select("*")
        .eq("masjid_id", masjid_result.data.id)
        .eq("prayer_date", today)
        .order("updated_at", { ascending: false })
        .limit(1)) as
        | ListResult<{
            prayer_date: string;
            sunrise_time?: string;
            fajr_time: string;
            dhuhr_time: string;
            asr_time: string;
            maghrib_time: string;
            isha_time: string;
            fetched_at?: string;
            updated_at?: string;
          }>
        | undefined;

      const row = prayer_result?.data?.[0];

      if (!row) {
        console.log(`[JAKIMFallback] No cache entry found for ${zone_code}`);
        return null;
      }

      console.log(`[JAKIMFallback] Cache hit for ${zone_code} (${today})`);

      return {
        zone_code,
        date: row.prayer_date,
        sunrise: row.sunrise_time,
        fajr: row.fajr_time,
        dhuhr: row.dhuhr_time,
        asr: row.asr_time,
        maghrib: row.maghrib_time,
        isha: row.isha_time,
        cached: true,
        cache_age_minutes: Math.round(
          (Date.now() -
            new Date(
              row.fetched_at ?? row.updated_at ?? Date.now(),
            ).getTime()) /
            1000 /
            60,
        ),
      };
    } catch (error) {
      console.error(`[JAKIMFallback] Cache fetch error:`, error);
      return null;
    }
  }

  /**
   * Update in-memory cache with fresh prayer times
   */
  private async updateCache(times: PrayerTimes): Promise<void> {
    try {
      const masjidQuery = this.client.from("masjids") as any;
      const masjid_result = (await masjidQuery
        .select("id")
        .eq("zone_code", times.zone_code)
        .eq("tier", "asas")
        .eq("is_auto_populated", true)
        .eq("status", "active")
        .single()) as SingleResult<{ id: string }>;

      if (!masjid_result?.data?.id) {
        console.warn(
          `[JAKIMFallback] Cannot cache prayer times; no active Asas masjid found for ${times.zone_code}`,
        );
        return;
      }

      const prayerTimesQuery = this.client.from("prayer_times") as any;
      await prayerTimesQuery.upsert(
        {
          masjid_id: masjid_result.data.id,
          prayer_date: times.date,
          fajr_time: times.fajr,
          sunrise_time: times.sunrise ?? "",
          dhuhr_time: times.dhuhr,
          asr_time: times.asr,
          maghrib_time: times.maghrib,
          isha_time: times.isha,
          source: "JAKIM_API",
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "masjid_id,prayer_date" },
      );

      console.log(`[JAKIMFallback] Updated cache for ${times.zone_code}`);
    } catch (error) {
      console.error(`[JAKIMFallback] Cache update error:`, error);
    }
  }

  private transformApiResponse(
    response: JAKIMPrayerTimesResponse,
    zone_code: string,
  ): PrayerTimes {
    if (response.times) {
      return {
        zone_code,
        date: response.date,
        sunrise: response.times.sunrise,
        fajr: response.times.fajr,
        dhuhr: response.times.dhuhr,
        asr: response.times.asr,
        maghrib: response.times.maghrib,
        isha: response.times.isha,
        cached: false,
      };
    }

    const targetDay = parseInt(response.date.split("-")[2] || "1", 10);
    const prayerData = response.prayers?.find(
      (entry) => entry.day === targetDay,
    );

    if (!prayerData) {
      throw new Error(
        `JAKIM API response missing prayer data for ${response.date}`,
      );
    }

    const formatTime = (timestamp: number): string => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kuala_Lumpur",
      });
    };

    return {
      zone_code,
      date: response.date,
      fajr: formatTime(prayerData.fajr),
      dhuhr: formatTime(prayerData.dhuhr),
      asr: formatTime(prayerData.asr),
      maghrib: formatTime(prayerData.maghrib),
      isha: formatTime(prayerData.isha),
      cached: false,
    };
  }

  private getKlDate(): string {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  /**
   * Calculate cache age in minutes
   */
  private getCacheAgeMinutes(cache_date: string): number {
    const cache_time = new Date(cache_date).getTime();
    const now = Date.now();
    return Math.round((now - cache_time) / 1000 / 60);
  }

  /**
   * Health check endpoint for monitoring
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unavailable";
    api_status: string;
    cache_status: string;
    last_check: Date;
    message: string;
  }> {
    try {
      // Try a test zone (JHR01 - Johor)
      const test_zone = "JHR01";
      const times = await this.fetchFromJAKIMWithRetry(test_zone);

      if (times && !times.cached) {
        return {
          status: "healthy",
          api_status: "operational",
          cache_status: "operational",
          last_check: new Date(),
          message: "JAKIM API responding normally",
        };
      }
    } catch (api_error) {
      // API failed, check cache
      try {
        const test_zone = "JHR01";
        const cached = await this.fetchFromCache(test_zone);

        if (cached) {
          return {
            status: "degraded",
            api_status: "unavailable",
            cache_status: "operational",
            last_check: new Date(),
            message: `JAKIM API unavailable - serving from cache (${cached.cache_age_minutes}min old)`,
          };
        }
      } catch (cache_error) {
        console.error(
          "[JAKIMFallback] Health check cache failed:",
          cache_error,
        );
      }
    }

    return {
      status: "unavailable",
      api_status: "unavailable",
      cache_status: "unavailable",
      last_check: new Date(),
      message: "JAKIM API and cache both unavailable",
    };
  }

  /**
   * Report degraded service to monitoring
   */
  private reportDegradedService(reason: string, zone_code: string): void {
    this.sendMetric("prayer_times.degraded", {
      reason,
      zone_code,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Report service unavailable
   */
  private reportServiceUnavailable(zone_code: string): void {
    this.sendMetric("prayer_times.unavailable", {
      zone_code,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Report API health status
   */
  private reportAPIHealth(
    status: "healthy" | "unavailable",
    zone_code: string,
  ): void {
    this.sendMetric(`jakim_api.${status}`, {
      zone_code,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send metrics to monitoring service
   */
  private sendMetric(event_name: string, data: Record<string, unknown>): void {
    const monitoringUrl = getEnvVar("NEXT_PUBLIC_MONITORING_URL");

    if (monitoringUrl) {
      fetch(monitoringUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: event_name, ...data }),
      }).catch((err) =>
        console.error("[JAKIMFallback] Metric send failed:", err),
      );
    }
  }
}

// Error UI component hint
export const JAKIMUnavailableMessage = {
  ms: "Waktu solat sedang dikemaskini. Sila cuba sebentar lagi.",
  en: "Prayer times are being updated. Please try again shortly.",
};

// Export singleton instance
export const jakimFallbackService = new JAKIMFallbackService();
