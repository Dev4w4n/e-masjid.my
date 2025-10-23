import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContentGrid from "../../../src/components/ContentGrid";

describe("ContentGrid Component", () => {
  const mockCategories = [
    {
      id: "cat-1",
      name_en: "Category 1",
      name_ms: "Kategori 1",
      slug: "category-1",
      description_en: "Description 1",
      description_ms: "Penerangan 1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "cat-2",
      name_en: "Category 2",
      name_ms: "Kategori 2",
      slug: "category-2",
      description_en: "Description 2",
      description_ms: "Penerangan 2",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  ];

  const mockContent = [
    {
      id: "1",
      masjid_id: "masjid-1",
      title: "Premium Content 1",
      description: "Description 1",
      type: "image" as const,
      url: "https://example.com/1.jpg",
      thumbnail_url: "https://example.com/thumb1.jpg",
      sponsorship_amount: 200,
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      status: "approved" as const,
      submitted_by: "user-1",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      category_id: "cat-1",
      masjids: {
        id: "masjid-1",
        name: "Masjid 1",
        address: {
          city: "Kuala Lumpur",
          state: "WP",
          district: "KL",
        },
      },
    },
    {
      id: "2",
      masjid_id: "masjid-2",
      title: "Premium Content 2",
      description: "Description 2",
      type: "image" as const,
      url: "https://example.com/2.jpg",
      thumbnail_url: "https://example.com/thumb2.jpg",
      sponsorship_amount: 150,
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      status: "approved" as const,
      submitted_by: "user-2",
      created_at: "2025-01-02T00:00:00Z",
      updated_at: "2025-01-02T00:00:00Z",
      category_id: "cat-1",
      masjids: {
        id: "masjid-2",
        name: "Masjid 2",
        address: {
          city: "Petaling Jaya",
          state: "Selangor",
          district: "PJ",
        },
      },
    },
    {
      id: "3",
      masjid_id: "masjid-3",
      title: "Regular Content",
      description: "Description 3",
      type: "image" as const,
      url: "https://example.com/3.jpg",
      thumbnail_url: "https://example.com/thumb3.jpg",
      sponsorship_amount: 0,
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      status: "approved" as const,
      submitted_by: "user-3",
      created_at: "2025-01-03T00:00:00Z",
      updated_at: "2025-01-03T00:00:00Z",
      category_id: "cat-2",
      masjids: {
        id: "masjid-3",
        name: "Masjid 3",
        address: {
          city: "Georgetown",
          state: "Penang",
          district: "Georgetown",
        },
      },
    },
  ];

  it("should render content cards in grid layout", () => {
    const { container } = render(
      <ContentGrid contents={mockContent} categories={mockCategories} />
    );

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();

    expect(screen.getByText("Premium Content 1")).toBeInTheDocument();
    expect(screen.getByText("Premium Content 2")).toBeInTheDocument();
    expect(screen.getByText("Regular Content")).toBeInTheDocument();
  });

  it("should render category filter", () => {
    render(<ContentGrid contents={mockContent} categories={mockCategories} />);

    // Use regex with flexible whitespace matching
    expect(screen.getByText(/Kategori 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Kategori 2/i)).toBeInTheDocument();
  });

  it("should filter content when category is selected", () => {
    render(<ContentGrid contents={mockContent} categories={mockCategories} />);

    // Click on category 1 button
    const category1Button = screen.getByText(/Kategori 1/i);
    fireEvent.click(category1Button);

    // Should show cat-1 content
    expect(screen.getByText("Premium Content 1")).toBeInTheDocument();
    expect(screen.getByText("Premium Content 2")).toBeInTheDocument();

    // Should NOT show cat-2 content
    expect(screen.queryByText("Regular Content")).not.toBeInTheDocument();
  });

  it("should show all content when 'Semua' is clicked", () => {
    render(<ContentGrid contents={mockContent} categories={mockCategories} />);

    // Click on a category first
    const category1Button = screen.getByText(/Kategori 1/i);
    fireEvent.click(category1Button);

    // Then click 'Semua'
    const allButton = screen.getByText(/Semua/i);
    fireEvent.click(allButton);

    // Should show all content
    expect(screen.getByText("Premium Content 1")).toBeInTheDocument();
    expect(screen.getByText("Premium Content 2")).toBeInTheDocument();
    expect(screen.getByText("Regular Content")).toBeInTheDocument();
  });

  it("should have responsive grid classes", () => {
    const { container } = render(
      <ContentGrid contents={mockContent} categories={mockCategories} />
    );

    const grid = container.querySelector('[class*="grid"]');

    expect(grid).toBeInTheDocument();
    // Grid should have responsive classes (1 col mobile, 2 col tablet, 3 col desktop)
  });
});
