import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpgradeModal } from "../UpgradeModal";

describe("UpgradeModal", () => {
  it("renders available target tiers", () => {
    render(
      <UpgradeModal open={true} onClose={() => {}} onSelectTier={() => {}} />,
    );

    expect(screen.getByText("Maju")).toBeInTheDocument();
    expect(screen.getByText("Gemilang")).toBeInTheDocument();
    expect(screen.getByText("Istimewa")).toBeInTheDocument();
  });

  it("calls onSelectTier when a plan is selected", async () => {
    const user = userEvent.setup();
    const onSelectTier = vi.fn();

    render(
      <UpgradeModal
        open={true}
        onClose={() => {}}
        onSelectTier={onSelectTier}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Pilih" })[0]!);
    expect(onSelectTier).toHaveBeenCalledTimes(1);
  });
});
