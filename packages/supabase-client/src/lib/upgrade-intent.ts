import type { TierId } from "@masjid-suite/shared-types";

export type UpgradeAction = "contact_sales" | "signup" | "checkout";

export interface UpgradeIntent {
  currentTier: TierId;
  targetTier: Exclude<TierId, "asas">;
  action: UpgradeAction;
  preserveState: boolean;
}

const tierOrder: TierId[] = ["asas", "maju", "gemilang", "istimewa"];

export function resolveUpgradeIntent(
  currentTier: TierId,
  targetTier: Exclude<TierId, "asas">,
): UpgradeIntent {
  const currentIndex = tierOrder.indexOf(currentTier);
  const targetIndex = tierOrder.indexOf(targetTier);

  if (
    currentIndex === -1 ||
    targetIndex === -1 ||
    targetIndex <= currentIndex
  ) {
    throw new Error(`Invalid upgrade path: ${currentTier} -> ${targetTier}`);
  }

  if (targetTier === "maju" || targetTier === "istimewa") {
    return {
      currentTier,
      targetTier,
      action: "contact_sales",
      preserveState: true,
    };
  }

  return {
    currentTier,
    targetTier,
    action: "signup",
    preserveState: true,
  };
}
