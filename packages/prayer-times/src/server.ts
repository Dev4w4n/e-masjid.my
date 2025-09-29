/**
 * @masjid-suite/prayer-times/server
 *
 * Server-only exports for prayer times functionality
 * Use this in API routes and server-side code to avoid React dependencies
 */

// Core API service - server-safe exports only
export {
  JakimApiService,
  jakimApi,
  getTodayPrayerTimes,
  getMonthlyPrayerTimes,
  determineZoneCode,
  MALAYSIAN_ZONES,
} from "./jakim-api";
export type { MalaysianZone, PrayerTimes } from "./jakim-api";
