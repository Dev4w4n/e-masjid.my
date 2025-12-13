import { Metadata } from "next";
import { ContentWithMasjid } from "@/services/contentService";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://e-masjid.my";
const SITE_NAME = "Open E Masjid";
const DEFAULT_OG_IMAGE = `${SITE_URL}/emasjid-500x500.png`;

/**
 * Generate SEO metadata for pages
 * @param content Optional content for detail pages
 * @param category Optional category name for filtering
 * @returns Next.js Metadata object
 */
export function generateMetadata(
  content?: ContentWithMasjid,
  category?: string
): Metadata {
  let title = "";
  let description = "";
  let keywords: string[] = [];
  let images: string[] = [DEFAULT_OG_IMAGE];

  if (content) {
    // Content detail page
    title = `${content.title} - ${SITE_NAME}`;
    description = content.description
      ? content.description.substring(0, 160)
      : `${content.title} di ${content.masjids.name}, ${content.masjids.address.city}`;

    keywords = [
      content.title,
      content.masjids.name,
      content.masjids.address.city,
      content.masjids.address.state,
      content.type,
      "masjid",
      "iklan",
      "halal",
    ];

    if (content.thumbnail_url || content.url) {
      images = [content.thumbnail_url || content.url];
    }
  } else if (category) {
    // Category filter page
    title = `${category} - ${SITE_NAME}`;
    description = `Temui perkhidmatan ${category.toLowerCase()} dalam komuniti masjid seluruh Malaysia`;
    keywords = [category, "masjid", "komuniti", "Muslim", "Malaysia"];
  } else {
    // Homepage
    title = "Open E Masjid - Platform Iklan Digital Masjid";
    description =
      "Temui perniagaan halal, perkhidmatan, dan produk dalam komuniti masjid seluruh Malaysia. Platform digital untuk menghubungkan jamaah dan peniaga.";
    keywords = [
      "masjid",
      "iklan",
      "halal",
      "komuniti",
      "Muslim",
      "Malaysia",
      "perniagaan",
    ];
  }

  // Ensure title is under 60 chars
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }

  // Ensure description is under 160 chars
  if (description.length > 160) {
    description = description.substring(0, 157) + "...";
  }

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      images: images.map((url) => ({ url })),
      locale: "ms_MY",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

/**
 * Generate structured data (JSON-LD) for schema.org
 * @param type Schema type
 * @param data Data for the schema
 * @returns JSON-LD string
 */
export function generateStructuredData(
  type: "Organization" | "ItemList" | "Product",
  data: any
): string {
  let schema: any = {
    "@context": "https://schema.org",
    "@type": type,
  };

  switch (type) {
    case "Organization":
      schema = {
        ...schema,
        name: data.name || SITE_NAME,
        url: data.url || SITE_URL,
        logo: data.logo || DEFAULT_OG_IMAGE,
        contactPoint: {
          "@type": "ContactPoint",
          email: data.email || "info@emasjid.my",
          contactType: "customer service",
        },
      };
      break;

    case "ItemList":
      schema = {
        ...schema,
        itemListElement: (data.items || []).map((item: any, index: number) => ({
          "@type": "Product",
          position: index + 1,
          name: item.name || item.title,
          description: item.description,
          image: item.image || item.thumbnail_url || item.url,
        })),
      };
      break;

    case "Product":
      schema = {
        ...schema,
        name: data.name || data.title,
        description: data.description,
        image: data.image || data.thumbnail_url || data.url,
      };

      if (data.sponsorship_amount && data.sponsorship_amount > 0) {
        schema.offers = {
          "@type": "Offer",
          priceCurrency: "MYR",
          price: data.sponsorship_amount,
        };
      }
      break;
  }

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate XML sitemap
 * @param contents Array of all content
 * @returns XML sitemap string
 */
export function generateSitemap(contents: ContentWithMasjid[]): string {
  const today = new Date().toISOString().split("T")[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += "  <url>\n";
  xml += `    <loc>${SITE_URL}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += "    <changefreq>daily</changefreq>\n";
  xml += "    <priority>1.0</priority>\n";
  xml += "  </url>\n";

  // Content pages
  contents.forEach((content) => {
    const slug = generateContentSlug(content.title, content.id);
    const lastmod = content.created_at.split("T")[0];

    xml += "  <url>\n";
    xml += `    <loc>${SITE_URL}/iklan/${slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += "    <changefreq>weekly</changefreq>\n";
    xml += "    <priority>0.8</priority>\n";
    xml += "  </url>\n";
  });

  xml += "</urlset>";

  return xml;
}

/**
 * Helper to generate slug from title and ID
 */
function generateContentSlug(title: string, id: string): string {
  const kebabTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${kebabTitle}-${id}`;
}
