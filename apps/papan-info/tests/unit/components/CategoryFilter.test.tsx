import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryFilter from "../../../src/components/CategoryFilter";

describe("CategoryFilter Component", () => {
  const mockCategories = [
    {
      id: "cat-1",
      name_en: "Food & Beverages",
      name_ms: "Makanan & Minuman",
      slug: "makanan-minuman",
      description_en: "Food and drinks",
      description_ms: "Makanan dan minuman",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "cat-2",
      name_en: "Services",
      name_ms: "Perkhidmatan",
      slug: "perkhidmatan",
      description_en: "Services",
      description_ms: "Perkhidmatan",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  ];

  const mockContentCounts = {
    "cat-1": 5,
    "cat-2": 3,
  };

  const mockOnCategoryChange = vi.fn();

  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  it('should render "Semua" button by default', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        contentCounts={mockContentCounts}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />
    );

    expect(screen.getByRole("button", { name: /semua/i })).toBeInTheDocument();
  });

  it("should render category buttons from props", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        contentCounts={mockContentCounts}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />
    );

    expect(screen.getByText(/makanan & minuman/i)).toBeInTheDocument();
    expect(screen.getByText(/perkhidmatan/i)).toBeInTheDocument();
  });

  it("should highlight selected category with primary color", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        contentCounts={mockContentCounts}
        selectedCategory="cat-1"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const selectedButton = screen
      .getByText(/makanan & minuman/i)
      .closest("button");
    expect(selectedButton).toHaveClass("bg-primary-600");
  });

  it("should call onCategoryChange with category ID on click", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        contentCounts={mockContentCounts}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const categoryButton = screen.getByText(/makanan & minuman/i);
    fireEvent.click(categoryButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith("cat-1");
  });

  it('should call onCategoryChange with null when "Semua" clicked', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        contentCounts={mockContentCounts}
        selectedCategory="cat-1"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const allButton = screen.getByRole("button", { name: /semua/i });
    fireEvent.click(allButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(null);
  });

  it("should show content count badge on each button", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        contentCounts={mockContentCounts}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />
    );

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("should have rounded button style (not pills)", () => {
    const { container } = render(
      <CategoryFilter
        categories={mockCategories}
        contentCounts={mockContentCounts}
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const buttons = container.querySelectorAll("button");
    buttons.forEach((button) => {
      expect(button.className).toContain("rounded");
      // Should not have rounded-full (pill style)
      expect(button.className).not.toContain("rounded-full");
    });
  });
});
