/**
 * @masjid-suite/prayer-times
 *
 * Shared prayer times service and React hooks for E-Masjid.My applications
 */

// Core API service
export {
  JakimApiService,
  jakimApi,
  getTodayPrayerTimes,
  getMonthlyPrayerTimes,
  determineZoneCode,
  MALAYSIAN_ZONES,
} from "./jakim-api";
export type { MalaysianZone, PrayerTimes } from "./jakim-api";

// React hooks (only available when React is present)
export {
  usePrayerTimes,
  usePrayerTimesRange,
  useTodayPrayerTimes,
} from "./hooks";
