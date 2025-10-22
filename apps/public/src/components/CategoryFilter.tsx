"use client";

import { Category } from "@/services/categoryService";

interface CategoryFilterProps {
  categories: Category[];
  contentCounts: Record<string, number>;
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  contentCounts,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const totalCount = Object.values(contentCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="bg-white rounded shadow-sm p-4 border border-gray-200 mb-4 -mx-4 sm:mx-0">
      {/* Horizontal Scrollable Filters - E-Masjid.My style */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4 sm:px-0 -mx-4 sm:mx-0">
        {/* All Categories Pill */}
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`
            flex-shrink-0 px-4 py-2 rounded font-medium text-sm transition-all
            ${
              selectedCategory === null
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          Semua ({totalCount})
        </button>

        {/* Category Pills */}
        {categories.map((category) => {
          const count = contentCounts[category.id] || 0;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded font-medium text-sm transition-all
                ${
                  selectedCategory === category.id
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {category.name_ms || category.name_en} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
