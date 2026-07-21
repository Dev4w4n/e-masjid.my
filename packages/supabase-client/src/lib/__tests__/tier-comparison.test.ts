import { describe, expect, it } from "vitest";

import {
  COMPARISON_DIMENSIONS,
  TIER_COMPARISON_DATA,
  compareTiers,
  getTierComparisonValue,
} from "../tier-comparison";

describe("tier-comparison model", () => {
  it("exposes exactly 8 comparison dimensions", () => {
    expect(COMPARISON_DIMENSIONS).toHaveLength(8);
    expect(COMPARISON_DIMENSIONS.map((d) => d.key)).toEqual([
      "max_screens",
      "requires_login",
      "customization_type",
      "support_level",
      "prayer_times_display",
      "prayer_times_sync",
      "content_scheduling",
      "analytics",
    ]);
  });

  it("returns matrix rows for requested tiers", () => {
    const matrix = compareTiers(["asas", "maju", "gemilang", "istimewa"]);
    expect(matrix).toHaveLength(8);
    expect(matrix[0]?.values.asas.label_en).toBe("1 Display");
    expect(matrix[0]?.values.gemilang.label_en).toBe("Unlimited");
  });

  it("returns stable lookup values by tier and dimension", () => {
    const majuCustomization = getTierComparisonValue(
      "maju",
      "customization_type",
    );
    expect(majuCustomization.label_en).toBe("Managed via WhatsApp");

    const asasLogin = getTierComparisonValue("asas", "requires_login");
    expect(asasLogin.value).toBe(false);
  });

  it("keeps all tier payloads dimension-complete", () => {
    const expected = COMPARISON_DIMENSIONS.length;
    expect(Object.keys(TIER_COMPARISON_DATA.asas)).toHaveLength(expected);
    expect(Object.keys(TIER_COMPARISON_DATA.maju)).toHaveLength(expected);
    expect(Object.keys(TIER_COMPARISON_DATA.gemilang)).toHaveLength(expected);
    expect(Object.keys(TIER_COMPARISON_DATA.istimewa)).toHaveLength(expected);
  });
});
