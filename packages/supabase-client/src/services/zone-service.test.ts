/**
 * Zone Service Tests
 * TDD test suite for zone-service.ts
 * Feature: 007-tv-landing-tiers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ZoneSelectionService } from "./zone-service";
import { ServiceErrorCode } from "@masjid-suite/shared-types";

/**
 * Mock Supabase client
 */
const mockSupabase = {
  from: vi.fn(),
};

const mockZonesData = [
  {
    zone_code: "JHR02",
    zone_name_ms: "Johor",
    zone_name_en: "Johor",
    state_ms: "Johor",
    state_en: "Johor",
    region: "peninsular",
    masjid_count: 5,
    is_active: true,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
  {
    zone_code: "SGR01",
    zone_name_ms: "Selangor",
    zone_name_en: "Selangor",
    state_ms: "Selangor",
    state_en: "Selangor",
    region: "peninsular",
    masjid_count: 8,
    is_active: true,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
];

const mockMasjidsData = [
  {
    id: "masjid-johor-1",
    name: "Masjid Negara Johor Bahru",
    zone_code: "JHR02",
    tier: "asas",
    display_id: "display-johor-1",
    prayer_times_source: "jakim_api",
    is_auto_populated: true,
    status: "active",
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
];

describe("ZoneSelectionService", () => {
  let service: ZoneSelectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore - mock object for testing
    service = new ZoneSelectionService(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    service.clearCache();
  });

  describe("fetchAllZones", () => {
    it("should fetch all active zones", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockZonesData, error: null }),
      });

      const zones = await service.fetchAllZones();

      expect(zones).toHaveLength(2);
      expect(zones[0].zone_code).toBe("JHR02");
      expect(zones[1].zone_code).toBe("SGR01");
    });

    it("should throw error when database query fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        }),
      });

      await expect(service.fetchAllZones()).rejects.toThrow();
    });

    it("should throw error when no zones found", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      await expect(service.fetchAllZones()).rejects.toThrow();
    });

    it("should cache results", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockZonesData, error: null }),
      });

      const zones1 = await service.fetchAllZones();
      const zones2 = await service.fetchAllZones();

      expect(zones1).toEqual(zones2);
      // Should only call database once due to cache
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchZoneByCode", () => {
    it("should fetch zone by code", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockZonesData[0],
          error: null,
        }),
      });

      const zone = await service.fetchZoneByCode("JHR02");

      expect(zone).toBeDefined();
      expect(zone?.zone_code).toBe("JHR02");
    });

    it("should return null when zone not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        }),
      });

      const zone = await service.fetchZoneByCode("XXX99");

      expect(zone).toBeNull();
    });

    it("should reject invalid zone code format", async () => {
      await expect(service.fetchZoneByCode("INVALID-CODE")).rejects.toThrow();
    });
  });

  describe("fetchMasjidsByZone", () => {
    it("should fetch all Asas tier masjids for zone", async () => {
      const mockZoneChain: any = {};
      mockZoneChain.select = vi.fn(() => mockZoneChain);
      mockZoneChain.eq = vi.fn(() => mockZoneChain);
      mockZoneChain.single = vi.fn().mockResolvedValue({
        data: mockZonesData[0],
        error: null,
      });

      const mockMasjidChain: any = {};
      mockMasjidChain.select = vi.fn(() => mockMasjidChain);
      mockMasjidChain.eq = vi.fn(() => mockMasjidChain);
      mockMasjidChain.order = vi.fn().mockResolvedValue({
        data: mockMasjidsData,
        error: null,
      });

      // Mock zone fetch
      mockSupabase.from.mockReturnValueOnce(mockZoneChain);

      // Mock masjid fetch
      mockSupabase.from.mockReturnValueOnce(mockMasjidChain);

      const masjids = await service.fetchMasjidsByZone("JHR02");

      expect(masjids).toHaveLength(1);
      expect(masjids[0].name).toBe("Masjid Negara Johor Bahru");
    });

    it("should throw error when no masjids found in zone", async () => {
      // Create mock objects that chain properly
      const mockZoneChain = {
        select: vi.fn(function (this: any) {
          return this;
        }),
        eq: vi.fn(function (this: any) {
          return this;
        }),
        single: vi.fn().mockResolvedValue({
          data: mockZonesData[0],
          error: null,
        }),
      };

      const mockEmptyChain = {
        select: vi.fn(function (this: any) {
          return this;
        }),
        eq: vi.fn(function (this: any) {
          return this;
        }),
        order: vi.fn(function (this: any) {
          const callCount = (this.order as any).mock.calls.length;
          if (callCount === 1) {
            return this;
          }
          return Promise.resolve({
            data: null,
            error: null,
          });
        }),
      };

      // Mock zone fetch
      mockSupabase.from.mockReturnValueOnce(mockZoneChain);

      // Mock empty masjid result
      mockSupabase.from.mockReturnValueOnce(mockEmptyChain);

      await expect(service.fetchMasjidsByZone("JHR02")).rejects.toThrow();
    });
  });

  describe("selectZone", () => {
    it("should select zone and return response", async () => {
      const mockZoneChain: any = {};
      mockZoneChain.select = vi.fn(() => mockZoneChain);
      mockZoneChain.eq = vi.fn(() => mockZoneChain);
      mockZoneChain.single = vi.fn().mockResolvedValue({
        data: mockZonesData[0],
        error: null,
      });

      const mockMasjidChain: any = {};
      mockMasjidChain.select = vi.fn(() => mockMasjidChain);
      mockMasjidChain.eq = vi.fn(() => mockMasjidChain);
      mockMasjidChain.order = vi.fn().mockResolvedValue({
        data: mockMasjidsData,
        error: null,
      });

      const mockDisplayChain: any = {};
      mockDisplayChain.select = vi.fn(() => mockDisplayChain);
      mockDisplayChain.eq = vi.fn(() => mockDisplayChain);
      mockDisplayChain.single = vi.fn().mockResolvedValue({
        data: { id: "display-johor-1" },
        error: null,
      });

      // Mock zone fetch (first call from selectZone)
      mockSupabase.from.mockReturnValueOnce(mockZoneChain);

      // Mock zone fetch (second call from fetchMasjidsByZone -> fetchZoneByCode)
      mockSupabase.from.mockReturnValueOnce(mockZoneChain);

      // Mock masjid fetch
      mockSupabase.from.mockReturnValueOnce(mockMasjidChain);

      // Mock active display resolution
      mockSupabase.from.mockReturnValueOnce(mockDisplayChain);

      const response = await service.selectZone("JHR02");

      expect(response.zone.zone_code).toBe("JHR02");
      expect(response.primary_masjid.name).toBe("Masjid Negara Johor Bahru");
      expect(response.display_id).toBe("display-johor-1");
    });

    it("should reject when the linked display is inactive", async () => {
      vi.spyOn(service, "fetchZoneByCode").mockResolvedValue(
        mockZonesData[0] as any,
      );

      const mockMasjidChain: any = {};
      mockMasjidChain.select = vi.fn(() => mockMasjidChain);
      mockMasjidChain.eq = vi.fn(() => mockMasjidChain);
      mockMasjidChain.order = vi.fn().mockResolvedValue({
        data: mockMasjidsData,
        error: null,
      });

      const mockInactiveDisplayChain: any = {};
      mockInactiveDisplayChain.select = vi.fn(() => mockInactiveDisplayChain);
      mockInactiveDisplayChain.eq = vi.fn(() => mockInactiveDisplayChain);
      mockInactiveDisplayChain.single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      mockSupabase.from.mockReturnValueOnce(mockMasjidChain);
      mockSupabase.from.mockReturnValueOnce(mockInactiveDisplayChain);

      await expect(service.selectZone("JHR02")).rejects.toMatchObject({
        code: ServiceErrorCode.NO_MOSQUES_IN_ZONE,
      });
    });
  });

  describe("searchZones", () => {
    it("should search zones by name", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockZonesData, error: null }),
      });

      const results = await service.searchZones("jhr", "en");

      expect(results).toHaveLength(1);
      expect(results[0].zone_code).toBe("JHR02");
    });
  });
});
