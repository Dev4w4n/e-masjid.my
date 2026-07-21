import type { TierId } from "@masjid-suite/shared-types";
import { resolveUpgradeIntent } from "@masjid-suite/supabase-client";

export interface UpgradeNavigationTarget {
  href: string;
  external: boolean;
}

export function getUpgradeNavigation(
  currentTier: TierId,
  targetTier: Exclude<TierId, "asas">,
): UpgradeNavigationTarget {
  const intent = resolveUpgradeIntent(currentTier, targetTier);

  switch (intent.action) {
    case "contact_sales":
      return {
        href: "https://wa.me/60123456789?text=Saya%20ingin%20naik%20taraf%20pelan%20TV%20Masjid",
        external: true,
      };
    case "signup":
      return {
        href: "/signup",
        external: false,
      };
    case "checkout":
      return {
        href: "/checkout",
        external: false,
      };
    default:
      return {
        href: "/",
        external: false,
      };
  }
}
