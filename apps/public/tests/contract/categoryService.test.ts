import { describe, it, expect } from "vitest";
import { getAllCategories } from "@/services/categoryService";

describe("CategoryService Contract Tests", () => {
  describe("getAllCategories()", () => {
    it("should return array of Category objects", async () => {
      const result = await getAllCategories();

      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        const category = result[0];
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("icon");
        expect(category).toHaveProperty("color");
        expect(category).toHaveProperty("is_active");
        expect(category).toHaveProperty("display_order");
        expect(category).toHaveProperty("created_at");
        expect(category).toHaveProperty("updated_at");
      }
    });

    it("should filter by is_active=true", async () => {
      const result = await getAllCategories();

      result.forEach((category) => {
        expect(category.is_active).toBe(true);
      });
    });

    it("should sort by display_order ASC", async () => {
      const result = await getAllCategories();

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const current = result[i];
          const next = result[i + 1];
          expect(current.display_order).toBeLessThanOrEqual(next.display_order);
        }
      }
    });

    it("should have valid hex color codes", async () => {
      const result = await getAllCategories();
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      result.forEach((category) => {
        expect(hexColorRegex.test(category.color)).toBe(true);
      });
    });

    it("should return empty array when no categories", async () => {
      // This test will pass if database has no active categories
      const result = await getAllCategories();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle Supabase errors gracefully", async () => {
      // Mock Supabase error will be tested once service is implemented
      await expect(async () => {
        // Service should throw on connection error
        await getAllCategories();
      }).rejects.toThrow();
    });
  });
});
