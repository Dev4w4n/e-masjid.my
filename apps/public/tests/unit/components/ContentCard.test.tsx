import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContentCard from "../../../src/components/ContentCard";

describe("ContentCard Component", () => {
  const mockContent = {
    id: "123",
    masjid_id: "masjid-123",
    title: "Test Content Title",
    description: "This is a test description for content card",
    type: "image" as const,
    url: "https://example.com/image.jpg",
    thumbnail_url: "https://example.com/thumb.jpg",
    sponsorship_amount: 100,
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    status: "approved" as const,
    submitted_by: "user-123",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    masjids: {
      id: "masjid-123",
      name: "Masjid Test",
      address: {
        city: "Kuala Lumpur",
        state: "Wilayah Persekutuan",
        district: "KL",
      },
    },
  };

  it("should render title", () => {
    render(<ContentCard content={mockContent} />);

    expect(screen.getByText("Test Content Title")).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<ContentCard content={mockContent} />);

    expect(screen.getByText(/test description/i)).toBeInTheDocument();
  });

  it("should render image with alt text", () => {
    render(<ContentCard content={mockContent} />);

    const image = screen.getByRole("img", { name: /test content title/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("alt", "Test Content Title");
  });

  it("should render masjid name and location", () => {
    render(<ContentCard content={mockContent} />);

    expect(screen.getByText(/masjid test/i)).toBeInTheDocument();
    expect(screen.getByText(/kuala lumpur/i)).toBeInTheDocument();
  });

  it("should render premium badge when sponsorship_amount > 0", () => {
    render(<ContentCard content={mockContent} />);

    expect(screen.getByText(/premium/i)).toBeInTheDocument();
  });

  it("should NOT render premium badge when sponsorship_amount = 0", () => {
    const freeContent = { ...mockContent, sponsorship_amount: 0 };
    render(<ContentCard content={freeContent} />);

    expect(screen.queryByText(/premium/i)).not.toBeInTheDocument();
  });

  it("should render creation date", () => {
    render(<ContentCard content={mockContent} />);

    // Date should be formatted
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it("should link to content detail page with slug", () => {
    render(<ContentCard content={mockContent} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining("/iklan/"));
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining(mockContent.id)
    );
  });
});
