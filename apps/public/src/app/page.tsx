import { getAllActiveContent } from "@/services/contentService";
import { getAllCategories, type Category } from "@/services/categoryService";
import ContentGrid from "@/components/ContentGrid";
import { generateStructuredData } from "@/lib/seo";

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
        {/* E-Masjid.My style Header */}
        <div className="text-center mb-10 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-gray-900">
            Iklan & Perkhidmatan Komuniti Masjid
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            Senarai iklan dan perkhidmatan daripada masjid-masjid di seluruh
            Malaysia
          </p>
        </div>

        <ContentGrid contents={contents} categories={categories} />
      </div>
    </>
  );
}
