import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZoneSyncService } from "./zone-sync";

const mockSupabase = {
  from: vi.fn(),
};

describe("ZoneSyncService", () => {
  let service: ZoneSyncService;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.clearAllMocks();
    service = new ZoneSyncService(mockSupabase as any);
  });

  it("inserts new zones and reports the count", async () => {
    const existingZonesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ zone_code: "JHR02" }],
        error: null,
      }),
    };

    const insert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from
      .mockReturnValueOnce(existingZonesQuery)
      .mockReturnValueOnce({ insert });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          zone_code: "JHR02",
          zone_name_ms: "Johor Bahru",
          zone_name_en: "Johor Bahru",
          state_code: "JHR",
          state_ms: "Johor",
          state_en: "Johor",
        },
        {
          zone_code: "SGR01",
          zone_name_ms: "Selangor",
          zone_name_en: "Selangor",
          state_code: "SGR",
          state_ms: "Selangor",
          state_en: "Selangor",
        },
      ]),
    } as any);

    const result = await service.syncZonesFromJAKIM();

    expect(result.success).toBe(true);
    expect(result.newZonesAdded).toBe(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ zone_code: "SGR01", region: "peninsular" }),
      ]),
    );
  });

  it("returns a failed sync result when the upstream API keeps failing", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const result = await service.syncZonesFromJAKIM();

    expect(result.success).toBe(false);
    expect(result.error).toContain("network down");
  });
});
