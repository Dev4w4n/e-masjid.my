import { getAllActiveContent } from "@/services/contentService";
import { generateSitemap } from "@/lib/seo";

export async function GET() {
  const contents = await getAllActiveContent();
  const sitemap = generateSitemap(contents);

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
