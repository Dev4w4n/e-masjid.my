import { getAllActiveContent } from "@/services/contentService";
import { getAllCategories, type Category } from "@/services/categoryService";
import ContentGrid from "@/components/ContentGrid";
import { generateStructuredData } from "@/lib/seo";

// Force edge runtime for Cloudflare Pages
export const runtime = "edge";

// ISR - Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  // Fetch content (categories optional - table may not exist yet)
  const contents = await getAllActiveContent();
  let categories: Category[] = [];

  try {
    categories = await getAllCategories();
  } catch (error) {
    console.warn("Categories table not found, displaying without filters");
  }

  // Generate ItemList structured data
  const itemListData = generateStructuredData("ItemList", {
    items: contents.map((content, index) => ({
      position: index + 1,
      name: content.title,
      description: content.description || "",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/iklan/${content.id}`,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
      />

      <div className="w-full max-w-full overflow-x-hidden">
        {/* Hero Section - E-Masjid Modern Style */}
        <div className="text-center mb-12 px-4">
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
                Open E Masjid
              </span>
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              Info & Perkhidmatan Komuniti Masjid
            </h2>
          </div>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Senarai info dan perkhidmatan daripada masjid-masjid di seluruh
            Malaysia.
            <span className="block mt-2 text-sm text-gray-500">
              Platform digital bersepadu untuk komuniti masjid
            </span>
          </p>
        </div>

        <ContentGrid contents={contents} categories={categories} />
      </div>
    </>
  );
}
