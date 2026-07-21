import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZoneClient } from "./zone-client";

describe("ZoneClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the zone list from the API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        zones: [
          {
            zone_code: "JHR01",
            zone_name_ms: "Johor Bahru",
            zone_name_en: "Johor Bahru",
            state_ms: "Johor",
            state_en: "Johor",
          },
        ],
      }),
    } as any);

    await expect(ZoneClient.fetchAllZones()).resolves.toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith("/api/zones", { cache: "force-cache" });
  });

  it("returns the primary display id for a selected zone", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({
        zone_code: "JHR01",
        mosques: [
          {
            id: "mosque-1",
            name: "Masjid Sultan Ismail",
            display_id: "display-jhr01-primary",
          },
        ],
        primary_display_id: "display-jhr01-primary",
      }),
    } as any);

    await expect(ZoneClient.selectZone("JHR01")).resolves.toBe(
      "display-jhr01-primary",
    );
  });

  it("rejects invalid zone codes before calling the API", async () => {
    await expect(ZoneClient.selectZone("BAD01")).rejects.toThrow(
      "Invalid zone code format",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects zones with no mosques", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 204,
      statusText: "No Content",
    } as any);

    await expect(ZoneClient.selectZone("JHR01")).rejects.toThrow(
      "No mosques found in zone",
    );
  });
});
