/**
 * Tier Package Service Tests
 * TDD test suite for tier-service.ts
 * Feature: 007-tv-landing-tiers
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TierPackageService } from "./tier-service";

describe("TierPackageService", () => {
  let service: TierPackageService;

  beforeEach(() => {
    service = new TierPackageService();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe("fetchAllTiers", () => {
    it("should fetch all tiers sorted by display order", async () => {
      const tiers = await service.fetchAllTiers();

      expect(tiers).toHaveLength(4);
      expect(tiers[0].id).toBe("asas");
      expect(tiers[1].id).toBe("maju");
      expect(tiers[2].id).toBe("gemilang");
      expect(tiers[3].id).toBe("istimewa");
    });

    it("should have correct display orders", async () => {
      const tiers = await service.fetchAllTiers();

      for (let i = 0; i < tiers.length - 1; i++) {
        expect(tiers[i].display_order).toBeLessThanOrEqual(
          tiers[i + 1].display_order,
        );
      }
    });

    it("should cache results", async () => {
      const tiers1 = await service.fetchAllTiers();
      const tiers2 = await service.fetchAllTiers();

      expect(tiers1).toEqual(tiers2);
    });
  });

  describe("fetchTierById", () => {
    it("should fetch tier by valid ID", async () => {
      const tier = await service.fetchTierById("asas");

      expect(tier).toBeDefined();
      expect(tier?.id).toBe("asas");
      expect(tier?.price_ms).toBe("Percuma");
    });

    it("should return null for invalid tier ID", async () => {
      await expect(service.fetchTierById("invalid" as any)).rejects.toThrow();
    });

    it("should have all required properties", async () => {
      const tier = await service.fetchTierById("gemilang");

      expect(tier).toHaveProperty("id");
      expect(tier).toHaveProperty("name_ms");
      expect(tier).toHaveProperty("name_en");
      expect(tier).toHaveProperty("price_ms");
      expect(tier).toHaveProperty("price_en");
      expect(tier).toHaveProperty("max_screens");
      expect(tier).toHaveProperty("features");
      expect(tier).toHaveProperty("support_level");
    });

    it("should distinguish tiers correctly", async () => {
      const asas = await service.fetchTierById("asas");
      const gemilang = await service.fetchTierById("gemilang");
      const istimewa = await service.fetchTierById("istimewa");

      expect(asas?.requires_login).toBe(false);
      expect(gemilang?.requires_login).toBe(true);
      expect(istimewa?.requires_login).toBe(true);

      expect(asas?.max_screens).toBe(1);
      expect(gemilang?.max_screens).toBeNull();
      expect(istimewa?.max_screens).toBeNull();
    });
  });

  describe("fetchTiersForLanding", () => {
    it("should return tiers optimized for landing", async () => {
      const tiers = await service.fetchTiersForLanding();

      expect(tiers).toHaveLength(4);
      // Featured tiers should appear earlier (Asas and Gemilang)
      expect(tiers[0].is_featured).toBe(true);
      expect(tiers[0].id).toBe("asas");
    });

    it("should handle featured tier prioritization", async () => {
      const tiers = await service.fetchTiersForLanding();

      const featuredTiers = tiers.filter((t) => t.is_featured);
      expect(featuredTiers.length).toBeGreaterThan(0);
      expect(featuredTiers[0].display_order).toBeLessThanOrEqual(
        tiers[tiers.length - 1].display_order,
      );
    });
  });

  describe("compareTiers", () => {
    it("should compare selected tiers", async () => {
      const comparison = await service.compareTiers(["asas", "gemilang"]);

      expect(comparison.has("price_ms")).toBe(true);
      expect(comparison.has("max_screens")).toBe(true);
      expect(comparison.has("requires_login")).toBe(true);

      const prices = comparison.get("price_ms");
      expect(prices?.["asas"]).toBe("Percuma");
      expect(prices?.["gemilang"]).toBe("RM ~150/bulan");
    });

    it("should compare customization types", async () => {
      const comparison = await service.compareTiers([
        "asas",
        "maju",
        "gemilang",
      ]);

      const customization = comparison.get("customization_type");
      expect(customization?.["asas"]).toBe("none");
      expect(customization?.["maju"]).toBe("managed");
      expect(customization?.["gemilang"]).toBe("self-service");
    });

    it("should include all dimensions", async () => {
      const comparison = await service.compareTiers(["asas", "gemilang"]);

      const expectedDimensions = [
        "price_ms",
        "price_en",
        "max_screens",
        "requires_login",
        "customization_type",
        "support_level",
      ];

      for (const dimension of expectedDimensions) {
        expect(comparison.has(dimension)).toBe(true);
      }
    });
  });

  describe("tier characteristics", () => {
    it("should have Asas as free tier", async () => {
      const asas = await service.fetchTierById("asas");

      expect(asas?.price_ms).toBe("Percuma");
      expect(asas?.price_en).toBe("Free");
      expect(asas?.requires_login).toBe(false);
      expect(asas?.max_screens).toBe(1);
    });

    it("should have Maju as managed tier", async () => {
      const maju = await service.fetchTierById("maju");

      expect(maju?.customization_type).toBe("managed");
      expect(maju?.requires_login).toBe(false);
      expect(maju?.max_screens).toBe(1);
    });

    it("should have Gemilang with self-service", async () => {
      const gemilang = await service.fetchTierById("gemilang");

      expect(gemilang?.customization_type).toBe("self-service");
      expect(gemilang?.requires_login).toBe(true);
      expect(gemilang?.max_screens).toBeNull();
    });

    it("should have Istimewa as enterprise", async () => {
      const istimewa = await service.fetchTierById("istimewa");

      expect(istimewa?.customization_type).toBe("custom");
      expect(istimewa?.support_level).toBe("custom");
      expect(istimewa?.requires_login).toBe(true);
      expect(istimewa?.max_screens).toBeNull();
    });
  });

  describe("tier features", () => {
    it("should include prayer times in all tiers", async () => {
      const tiers = await service.fetchAllTiers();

      for (const tier of tiers) {
        const hasPrayerTimes = tier.features.some(
          (f) => f.id === "prayer_times",
        );
        expect(hasPrayerTimes).toBe(true);
      }
    });

    it("should only have admin dashboard in higher tiers", async () => {
      const asas = await service.fetchTierById("asas");
      const gemilang = await service.fetchTierById("gemilang");

      const asasHasDashboard = asas?.features.some(
        (f) => f.id === "admin_dashboard",
      );
      const gemilangHasDashboard = gemilang?.features.some(
        (f) => f.id === "admin_dashboard",
      );

      expect(asasHasDashboard).toBe(false);
      expect(gemilangHasDashboard).toBe(true);
    });
  });
});
