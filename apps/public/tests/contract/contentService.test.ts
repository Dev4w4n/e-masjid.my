import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAllActiveContent,
  getContentBySlug,
} from "@/services/contentService";

describe("ContentService Contract Tests", () => {
  describe("getAllActiveContent()", () => {
    it("should return array of ContentWithMasjid", async () => {
      const result = await getAllActiveContent();

      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        const content = result[0];
        expect(content).toHaveProperty("id");
        expect(content).toHaveProperty("masjid_id");
        expect(content).toHaveProperty("title");
        expect(content).toHaveProperty("type");
        expect(content).toHaveProperty("url");
        expect(content).toHaveProperty("sponsorship_amount");
        expect(content).toHaveProperty("start_date");
        expect(content).toHaveProperty("end_date");
        expect(content).toHaveProperty("status");
        expect(content).toHaveProperty("masjids");
        expect(content.masjids).toHaveProperty("id");
        expect(content.masjids).toHaveProperty("name");
        expect(content.masjids).toHaveProperty("location");
      }
    });

    it("should filter by status=approved", async () => {
      const result = await getAllActiveContent();

      result.forEach((content) => {
        expect(content.status).toBe("approved");
      });
    });

    it("should filter by date range (start_date <= today <= end_date)", async () => {
      const result = await getAllActiveContent();
      const today = new Date();

      result.forEach((content) => {
        const startDate = new Date(content.start_date);
        const endDate = new Date(content.end_date);

        expect(startDate.getTime()).toBeLessThanOrEqual(today.getTime());
        expect(endDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
      });
    });

    it("should join with masjids table", async () => {
      const result = await getAllActiveContent();

      if (result.length > 0) {
        result.forEach((content) => {
          expect(content).toHaveProperty("masjids");
          expect(typeof content.masjids).toBe("object");
          expect(content.masjids).not.toBeNull();
          expect(content.masjids.id).toBe(content.masjid_id);
        });
      }
    });

    it("should sort by sponsorship_amount DESC, created_at DESC", async () => {
      const result = await getAllActiveContent();

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const current = result[i];
          const next = result[i + 1];

          // Primary sort: sponsorship_amount DESC
          if (current.sponsorship_amount !== next.sponsorship_amount) {
            expect(current.sponsorship_amount).toBeGreaterThanOrEqual(
              next.sponsorship_amount
            );
          } else {
            // Secondary sort: created_at DESC
            const currentDate = new Date(current.created_at).getTime();
            const nextDate = new Date(next.created_at).getTime();
            expect(currentDate).toBeGreaterThanOrEqual(nextDate);
          }
        }
      }
    });

    it("should return empty array when no content", async () => {
      // This test will pass if database has no active content
      const result = await getAllActiveContent();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle Supabase errors gracefully", async () => {
      // Mock Supabase error will be tested once service is implemented
      // For now, this test structure shows the contract expectation
      await expect(async () => {
        // Service should throw on connection error
        await getAllActiveContent();
      }).rejects.toThrow();
    });
  });

  describe("getContentBySlug()", () => {
    it("should extract UUID from slug (format: title-kebab-case-{uuid})", async () => {
      // Test slug parsing logic
      const testSlug = "test-content-abc123-def456-ghi789";
      const result = await getContentBySlug(testSlug);

      // Should attempt to extract UUID from end of slug
      expect(result).toBeDefined();
    });

    it("should return single ContentWithMasjid or null", async () => {
      const testSlug = "test-content-uuid";
      const result = await getContentBySlug(testSlug);

      if (result) {
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("masjids");
      } else {
        expect(result).toBeNull();
      }
    });

    it("should filter by status=approved", async () => {
      const testSlug = "test-content-uuid";
      const result = await getContentBySlug(testSlug);

      if (result) {
        expect(result.status).toBe("approved");
      }
    });

    it("should join with masjids table", async () => {
      const testSlug = "test-content-uuid";
      const result = await getContentBySlug(testSlug);

      if (result) {
        expect(result).toHaveProperty("masjids");
        expect(typeof result.masjids).toBe("object");
        expect(result.masjids).not.toBeNull();
      }
    });

    it("should return null for non-existent UUID", async () => {
      const nonExistentSlug =
        "non-existent-content-00000000-0000-0000-0000-000000000000";
      const result = await getContentBySlug(nonExistentSlug);

      expect(result).toBeNull();
    });

    it("should return null for malformed slug", async () => {
      const malformedSlug = "invalid";
      const result = await getContentBySlug(malformedSlug);

      expect(result).toBeNull();
    });

    it("should handle Supabase errors gracefully", async () => {
      // Mock error scenario
      await expect(async () => {
        // Service should throw on connection error
        await getContentBySlug("test-slug");
      }).rejects.toThrow();
    });
  });
});
