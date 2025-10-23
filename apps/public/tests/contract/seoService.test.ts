import { describe, it, expect } from "vitest";
import {
  generateMetadata,
  generateStructuredData,
  generateSitemap,
} from "@/lib/seo";

describe("SEO Service Contract Tests", () => {
  describe("generateMetadata()", () => {
    it("should return Metadata with title, description, openGraph", () => {
      const metadata = generateMetadata();

      expect(metadata).toHaveProperty("title");
      expect(metadata).toHaveProperty("description");
      expect(metadata).toHaveProperty("openGraph");
      expect(typeof metadata.title).toBe("string");
      expect(typeof metadata.description).toBe("string");
    });

    it("should have title under 60 characters", () => {
      const metadata = generateMetadata();

      expect(metadata.title.length).toBeLessThanOrEqual(60);
    });

    it("should have description under 160 characters", () => {
      const metadata = generateMetadata();

      expect(metadata.description.length).toBeLessThanOrEqual(160);
    });

    it("should include OpenGraph image URL", () => {
      const metadata = generateMetadata();

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.images).toBeDefined();
      expect(Array.isArray(metadata.openGraph?.images)).toBe(true);

      if (metadata.openGraph?.images && metadata.openGraph.images.length > 0) {
        const imageUrl = metadata.openGraph.images[0];
        expect(typeof imageUrl).toBe("string");
        // Should be absolute URL
        expect(imageUrl.startsWith("http")).toBe(true);
      }
    });

    it("should include Twitter card metadata", () => {
      const metadata = generateMetadata();

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe("summary_large_image");
    });

    it("should include keywords with Bahasa Malaysia terms", () => {
      const metadata = generateMetadata();

      expect(metadata.keywords).toBeDefined();
      expect(Array.isArray(metadata.keywords)).toBe(true);

      if (metadata.keywords) {
        // Should include at least one BM keyword
        const bmKeywords = ["masjid", "iklan", "halal", "komuniti", "Muslim"];
        const hasBMKeyword = metadata.keywords.some((keyword) =>
          bmKeywords.includes(keyword.toLowerCase())
        );
        expect(hasBMKeyword).toBe(true);
      }
    });
  });

  describe("generateStructuredData()", () => {
    it("should return valid JSON-LD string", () => {
      const jsonLd = generateStructuredData("Organization", {
        name: "E-Masjid.My",
        url: "https://emasjid.my",
      });

      expect(typeof jsonLd).toBe("string");

      // Should be parseable JSON
      const parsed = JSON.parse(jsonLd);
      expect(parsed).toBeDefined();
    });

    it("should include @context in Organization schema", () => {
      const jsonLd = generateStructuredData("Organization", {
        name: "E-Masjid.My",
        url: "https://emasjid.my",
      });

      const parsed = JSON.parse(jsonLd);
      expect(parsed["@context"]).toBe("https://schema.org");
      expect(parsed["@type"]).toBe("Organization");
    });

    it("should include required fields in Organization schema", () => {
      const jsonLd = generateStructuredData("Organization", {
        name: "E-Masjid.My",
        url: "https://emasjid.my",
        logo: "https://emasjid.my/logo.png",
      });

      const parsed = JSON.parse(jsonLd);
      expect(parsed.name).toBe("E-Masjid.My");
      expect(parsed.url).toBe("https://emasjid.my");
      expect(parsed.logo).toBe("https://emasjid.my/logo.png");
    });

    it("should include position field in ItemList schema", () => {
      const jsonLd = generateStructuredData("ItemList", {
        items: [
          { name: "Item 1", description: "Test" },
          { name: "Item 2", description: "Test" },
        ],
      });

      const parsed = JSON.parse(jsonLd);
      expect(parsed["@type"]).toBe("ItemList");
      expect(parsed.itemListElement).toBeDefined();
      expect(Array.isArray(parsed.itemListElement)).toBe(true);

      if (parsed.itemListElement.length > 0) {
        expect(parsed.itemListElement[0]).toHaveProperty("position");
      }
    });

    it("should include name, description, image in Product schema", () => {
      const jsonLd = generateStructuredData("Product", {
        name: "Test Product",
        description: "Test Description",
        image: "https://example.com/image.jpg",
      });

      const parsed = JSON.parse(jsonLd);
      expect(parsed["@type"]).toBe("Product");
      expect(parsed.name).toBe("Test Product");
      expect(parsed.description).toBe("Test Description");
      expect(parsed.image).toBe("https://example.com/image.jpg");
    });

    it("should use absolute URLs", () => {
      const jsonLd = generateStructuredData("Organization", {
        name: "E-Masjid.My",
        url: "https://emasjid.my",
        logo: "https://emasjid.my/logo.png",
      });

      const parsed = JSON.parse(jsonLd);

      if (parsed.url) {
        expect(parsed.url.startsWith("http")).toBe(true);
      }
      if (parsed.logo) {
        expect(parsed.logo.startsWith("http")).toBe(true);
      }
    });
  });

  describe("generateSitemap()", () => {
    it("should return valid XML string", () => {
      const sitemap = generateSitemap([]);

      expect(typeof sitemap).toBe("string");
      expect(sitemap.startsWith("<?xml")).toBe(true);
      expect(sitemap.includes("<urlset")).toBe(true);
      expect(sitemap.includes("</urlset>")).toBe(true);
    });

    it("should include homepage with priority 1.0", () => {
      const sitemap = generateSitemap([]);

      expect(sitemap.includes("<loc>https://emasjid.my/</loc>")).toBe(true);
      expect(sitemap.includes("<priority>1.0</priority>")).toBe(true);
    });

    it("should include all content pages with priority 0.8", () => {
      const mockContents = [
        {
          id: "123",
          title: "Test Content",
          slug: "test-content-123",
          updated_at: "2025-10-10T00:00:00Z",
        },
      ];

      const sitemap = generateSitemap(mockContents as any);

      expect(sitemap.includes("/iklan/test-content-123")).toBe(true);
      expect(sitemap.includes("<priority>0.8</priority>")).toBe(true);
    });

    it("should use absolute URLs", () => {
      const sitemap = generateSitemap([]);

      // Check if URLs are absolute (start with http)
      const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g);
      urlMatches?.forEach((match) => {
        const url = match.replace(/<\/?loc>/g, "");
        expect(url.startsWith("http")).toBe(true);
      });
    });

    it("should include lastmod timestamps", () => {
      const sitemap = generateSitemap([]);

      expect(sitemap.includes("<lastmod>")).toBe(true);
      expect(sitemap.includes("</lastmod>")).toBe(true);
    });

    it("should handle empty content array", () => {
      const sitemap = generateSitemap([]);

      // Should still include homepage
      expect(sitemap).toBeDefined();
      expect(sitemap.includes("https://emasjid.my/")).toBe(true);
    });
  });
});
