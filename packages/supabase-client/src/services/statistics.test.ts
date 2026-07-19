import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatisticsService } from "./statistics";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    from: vi.fn(),
  },
}));

vi.mock("../index", () => ({
  supabase: supabaseMock,
}));

describe("StatisticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a typed mapping verification summary", async () => {
    const zoneQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ zone_code: "JHR02" }, { zone_code: "SGR01" }],
        error: null,
      }),
    };

    const masjidQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            id: "masjid-1",
            zone_code: "JHR02",
            created_at: "2026-07-18T00:00:00Z",
          },
          {
            id: "masjid-2",
            zone_code: "SGR01",
            created_at: "2026-07-18T00:01:00Z",
          },
        ],
        error: null,
      }),
    };

    const displayQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          { masjid_id: "masjid-1" },
          { masjid_id: "masjid-2" },
          { masjid_id: "masjid-2" },
        ],
        error: null,
      }),
    };

    supabaseMock.from
      .mockReturnValueOnce(zoneQuery)
      .mockReturnValueOnce(masjidQuery)
      .mockReturnValueOnce(displayQuery);

    const result = await StatisticsService.getMappingVerificationResult();

    expect(result).toMatchObject({
      generatedMasjidCount: 2,
      discoverableGeneratedMasjidCount: 1,
      linkedDisplayCount: 3,
      violationCount: 1,
      excludedGeneratedMasjidIds: ["masjid-2"],
      deterministicZoneCount: 1,
    });
    expect(result.completedAt).toEqual(expect.any(String));
    expect(supabaseMock.from).toHaveBeenCalledTimes(3);
  });

  it("returns an empty verification payload when no active zones exist", async () => {
    const zoneQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    supabaseMock.from.mockReturnValueOnce(zoneQuery);

    const result = await StatisticsService.getMappingVerificationResult();

    expect(result).toMatchObject({
      generatedMasjidCount: 0,
      discoverableGeneratedMasjidCount: 0,
      linkedDisplayCount: 0,
      violationCount: 0,
      excludedGeneratedMasjidIds: [],
      deterministicZoneCount: 0,
    });
    expect(result.completedAt).toEqual(expect.any(String));
    expect(supabaseMock.from).toHaveBeenCalledTimes(1);
  });
});
