import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQSection } from "../FAQSection";

describe("FAQSection", () => {
  it("renders at least six FAQ entries", () => {
    render(<FAQSection language="ms" />);
    const accordions = screen.getAllByRole("button");
    expect(accordions.length).toBeGreaterThanOrEqual(6);
  });

  it("filters FAQ items by search query", async () => {
    const user = userEvent.setup();
    render(<FAQSection language="en" />);

    await user.type(screen.getByLabelText("Search FAQs"), "pricing");

    expect(screen.getByText("Is pricing per screen?")).toBeInTheDocument();
  });

  it("emits faq expand callback", async () => {
    const user = userEvent.setup();
    const onFaqExpand = vi.fn();
    render(<FAQSection language="ms" onFaqExpand={onFaqExpand} />);

    await user.click(screen.getByText("Apakah perbezaan antara Asas dan Maju?"));
    expect(onFaqExpand).toHaveBeenCalledWith("tier-diff-asas-maju");
  });
});
