/**
 * Contract: Display Routing + Prayer Times Retrieval
 */

export interface DisplayRouteParams {
  id: string; // display_id uuid
}

export interface DisplayViewModel {
  display_id: string;
  masjid_id: string;
  zone_code: string;
  tier: 'asas' | 'maju' | 'gemilang' | 'istimewa';
  prayer_times: Record<string, string>;
  can_upgrade: boolean;
  can_switch_zone: boolean;
}

export interface PrayerTimesFetchResult {
  zone_code: string;
  served_from_cache: boolean;
  refreshed_in_background: boolean;
  timezone: 'Asia/Kuala_Lumpur';
}

/**
 * Behavior Contract
 * - Route lookup uses display_id only.
 * - Zone association validated server-side.
 * - Prayer times served cache-first (SWR), refresh in background.
 */
