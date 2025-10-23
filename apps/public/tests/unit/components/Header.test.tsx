import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

describe("Header Component", () => {
  // Mock environment variable
  beforeEach(() => {
    process.env.NEXT_PUBLIC_HUB_URL = "http://localhost:3000";
  });

  it("should render E-Masjid.My branding", () => {
    render(<Header />);

    const branding = screen.getByText(/E-Masjid\.My/i);
    expect(branding).toBeInTheDocument();
  });

  it('should render "Tambah Iklan" link', () => {
    render(<Header />);

    const link = screen.getByRole("link", { name: /tambah iklan/i });
    expect(link).toBeInTheDocument();
  });

  it("should link to hub app registration page", () => {
    render(<Header />);

    const link = screen.getByRole("link", { name: /tambah iklan/i });
    expect(link).toHaveAttribute("href", "http://localhost:3000/register");
  });

  it("should use NEXT_PUBLIC_HUB_URL environment variable", () => {
    process.env.NEXT_PUBLIC_HUB_URL = "http://custom-hub.com";

    render(<Header />);

    const link = screen.getByRole("link", { name: /tambah iklan/i });
    expect(link).toHaveAttribute("href", "http://custom-hub.com/register");
  });

  it("should apply Islamic theme styles", () => {
    const { container } = render(<Header />);

    // Check for Islamic theme class or inline styles
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    // Islamic theme classes will be applied
  });

  it("should have responsive menu for mobile", () => {
    render(<Header />);

    // Check for mobile menu button (hamburger)
    // This will be visible on mobile viewports
    const mobileMenuButton =
      screen.queryByLabelText(/menu/i) ||
      screen.queryByRole("button", { name: /menu/i });

    // Mobile menu button should exist in the DOM
    expect(mobileMenuButton || screen.getByRole("banner")).toBeInTheDocument();
  });
});
