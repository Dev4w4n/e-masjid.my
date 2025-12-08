"use client";

import { useState, useMemo } from "react";
import { ContentWithMasjid } from "@/services/contentService";
import { Category } from "@/services/categoryService";
import FeedCard from "./FeedCard";
import CategoryFilter from "./CategoryFilter";

interface ContentGridProps {
  contents: ContentWithMasjid[];
  categories: Category[];
}

export default function ContentGrid({
  contents,
  categories,
}: ContentGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate content counts per category
  const contentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contents.forEach((content) => {
      if (content.category_id) {
        counts[content.category_id] = (counts[content.category_id] || 0) + 1;
      }
    });
    return counts;
  }, [contents]);

  // Filter contents based on selected category
  const filteredContents = useMemo(() => {
    if (!selectedCategory) {
      return contents;
    }
    return contents.filter(
      (content) => content.category_id === selectedCategory
    );
  }, [contents, selectedCategory]);

  return (
    <div className="flex justify-center w-full">
      {/* Main Feed Container - E-Masjid.My style grid */}
      <div className="w-full max-w-6xl px-0">
        {/* Category Filter */}
        <div className="mb-8 w-full">
          <CategoryFilter
            categories={categories}
            contentCounts={contentCounts}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            totalItems={contents.length}
          />
        </div>

        {/* Feed - Responsive grid layout */}
        {filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content, index) => (
              <FeedCard
                key={content.id}
                content={content}
                priority={index < 3} // Prioritize first 3 items
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded shadow-sm border border-gray-200">
            <span className="text-6xl mb-4 block">🕌</span>
            <p className="text-xl text-gray-600 mb-2 font-semibold">
              Tiada iklan buat masa ini
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Belum ada iklan tersedia untuk kategori ini
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded transition-colors"
              >
                Paparkan Semua Iklan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
