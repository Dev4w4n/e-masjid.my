/**
 * Prayer Times React Hooks
 *
 * Custom hooks for fetching and managing prayer times in React applications
 */

import { useState, useEffect, useCallback } from "react";
import { jakimApi, MalaysianZone, PrayerTimes } from "./jakim-api";

/**
 * Hook for fetching prayer times for a specific masjid
 */
export function usePrayerTimes(
  masjidId: string | null,
  zoneCode: MalaysianZone | null
) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayerTimes = useCallback(
    async (date?: string) => {
      if (!masjidId || !zoneCode) {
        setPrayerTimes(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const targetDate = date || new Date().toISOString().split("T")[0]!;
        const result = await jakimApi.fetchPrayerTimes(
          masjidId,
          targetDate,
          zoneCode
        );

        setPrayerTimes(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch prayer times";
        setError(errorMessage);
        console.error("Prayer times fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [masjidId, zoneCode]
  );

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  const refetch = useCallback(
    (date?: string) => {
      fetchPrayerTimes(date);
    },
    [fetchPrayerTimes]
  );

  return {
    prayerTimes,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching prayer times for a date range
 */
export function usePrayerTimesRange(
  masjidId: string | null,
  zoneCode: MalaysianZone | null,
  startDate: string,
  endDate: string
) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayerTimesRange = useCallback(async () => {
    if (!masjidId || !zoneCode) {
      setPrayerTimes([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const results = await jakimApi.fetchPrayerTimesRange(
        masjidId,
        startDate,
        endDate,
        zoneCode
      );
      setPrayerTimes(results);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch prayer times range";
      setError(errorMessage);
      console.error("Prayer times range fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [masjidId, zoneCode, startDate, endDate]);

  useEffect(() => {
    fetchPrayerTimesRange();
  }, [fetchPrayerTimesRange]);

  return {
    prayerTimes,
    loading,
    error,
    refetch: fetchPrayerTimesRange,
  };
}

/**
 * Hook for today's prayer times (most common use case)
 */
export function useTodayPrayerTimes(
  masjidId: string | null,
  zoneCode: MalaysianZone | null
) {
  return usePrayerTimes(masjidId, zoneCode);
}
