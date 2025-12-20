import { getAllActiveContent } from "@/services/contentService";
import { generateSitemap } from "@/lib/seo";

// Force dynamic rendering for sitemap
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contents = await getAllActiveContent();
    const sitemap = generateSitemap(contents);

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    // Return empty sitemap on error
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_BASE_URL || "https://masjidbro.my"}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  }
}
