import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JAKIMFallbackService } from "./jakim-fallback";

const mockSupabase = {
  from: vi.fn(),
};

describe("JAKIMFallbackService", () => {
  let service: JAKIMFallbackService;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.clearAllMocks();
    service = new JAKIMFallbackService(mockSupabase as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serves cached prayer times when the upstream API fails", async () => {
    const masjidQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "masjid-1",
          zone_code: "JHR02",
          tier: "asas",
          is_auto_populated: true,
          status: "active",
        },
        error: null,
      }),
    };

    const prayerTimesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            masjid_id: "masjid-1",
            prayer_date: "2026-07-18",
            fajr_time: "05:45",
            sunrise_time: "07:10",
            dhuhr_time: "13:20",
            asr_time: "16:40",
            maghrib_time: "19:25",
            isha_time: "20:40",
            source: "JAKIM_API",
            fetched_at: "2026-07-18T00:00:00Z",
          },
        ],
        error: null,
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(masjidQuery)
      .mockReturnValueOnce(prayerTimesQuery);

    vi.mocked(fetch).mockRejectedValueOnce(new Error("upstream unavailable"));

    const result = await service.getPrayerTimes("JHR02");

    expect(result).not.toBeNull();
    expect(result?.zone_code).toBe("JHR02");
    expect(result?.cached).toBe(true);
    expect(result?.fajr).toBe("05:45");
  });

  it("writes fresh prayer times to the prayer_times table after a successful fetch", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });

    const masjidQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "masjid-1",
          zone_code: "JHR02",
          tier: "asas",
          is_auto_populated: true,
          status: "active",
        },
        error: null,
      }),
    };

    const prayerTimesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn(),
      upsert,
    };

    mockSupabase.from
      .mockReturnValueOnce(masjidQuery)
      .mockReturnValueOnce(prayerTimesQuery);

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        date: "2026-07-18",
        times: {
          fajr: "05:44",
          dhuhr: "13:21",
          asr: "16:41",
          maghrib: "19:25",
          isha: "20:41",
        },
      }),
    } as any);

    const result = await service.getPrayerTimes("JHR02");

    expect(result?.cached).toBe(false);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        masjid_id: "masjid-1",
        prayer_date: expect.any(String),
        fajr_time: "05:44",
        source: "JAKIM_API",
      }),
      expect.objectContaining({ onConflict: "masjid_id,prayer_date" }),
    );
  });
});
