import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TierComparisonTable } from "../TierComparisonTable";

describe("TierComparisonTable", () => {
  it("renders all four tier headers", () => {
    render(<TierComparisonTable language="en" />);

    expect(screen.getByText("Asas (Free)")).toBeInTheDocument();
    expect(screen.getByText("Maju")).toBeInTheDocument();
    expect(screen.getByText("Gemilang")).toBeInTheDocument();
    expect(screen.getByText("Istimewa")).toBeInTheDocument();
  });

  it("renders eight comparison dimensions", () => {
    render(<TierComparisonTable language="en" />);

    expect(screen.getByText("Number of Displays")).toBeInTheDocument();
    expect(screen.getByText("Requires Login")).toBeInTheDocument();
    expect(screen.getByText("Customization Type")).toBeInTheDocument();
    expect(screen.getByText("Support Level")).toBeInTheDocument();
    expect(screen.getByText("Prayer Times Display")).toBeInTheDocument();
    expect(screen.getByText("Prayer Times Sync")).toBeInTheDocument();
    expect(screen.getByText("Content Scheduling")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("supports Malay labels", () => {
    render(<TierComparisonTable language="ms" />);

    expect(screen.getByText("Asas (Percuma)")).toBeInTheDocument();
    expect(screen.getByText("Ciri")).toBeInTheDocument();
    expect(screen.getByText("Bilangan Skrin Paparan")).toBeInTheDocument();
  });

  it("renders comparison legend", () => {
    render(<TierComparisonTable language="en" />);

    expect(screen.getAllByText("Available").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not Available").length).toBeGreaterThan(0);
    expect(screen.getByText("Superior Feature")).toBeInTheDocument();
  });
});
