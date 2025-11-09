import { supabase } from "@/lib/supabase";
import type { Database } from "@masjid-suite/shared-types";

type Masjid = Database["public"]["Tables"]["masjids"]["Row"];
type MasjidAdmin =
  Database["public"]["Functions"]["get_masjid_admin_list"]["Returns"][number];

// Simplified TV Display info for public display
export interface TvDisplayInfo {
  id: string;
  display_name: string;
  description: string | null;
  location_description: string | null;
}

/**
 * Get masjid by ID (public access)
 */
export async function getMasjidById(id: string): Promise<Masjid | null> {
  const { data, error } = await supabase
    .from("masjids")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch masjid:", error);
    return null;
  }

  return data;
}

/**
 * Get all active masjids (public access)
 */
export async function getAllActiveMasjids(): Promise<Masjid[]> {
  const { data, error } = await supabase
    .from("masjids")
    .select("*")
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Failed to fetch masjids:", error);
    return [];
  }

  return data || [];
}

/**
 * Get masjid admins (public access for committee display)
 */
export async function getMasjidAdmins(
  masjidId: string
): Promise<MasjidAdmin[]> {
  const { data, error } = await supabase.rpc("get_masjid_admin_list", {
    target_masjid_id: masjidId,
  });

  if (error) {
    console.error("Failed to fetch masjid admins:", error);
    return [];
  }

  return data || [];
}

/**
 * Get TV displays for a masjid (public access)
 */
export async function getMasjidTvDisplays(
  masjidId: string
): Promise<TvDisplayInfo[]> {
  const { data, error } = await supabase
    .from("tv_displays")
    .select("id, display_name, description, location_description")
    .eq("masjid_id", masjidId)
    .eq("is_active", true)
    .order("display_name");

  if (error) {
    console.error("Failed to fetch TV displays:", error);
    return [];
  }

  return (data || []) as TvDisplayInfo[];
}

/**
 * Format masjid address for display
 */
export function formatMasjidAddress(address: any): string {
  if (!address || typeof address !== "object") return "Alamat tidak tersedia";

  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.city,
    address.state,
    address.postcode,
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Get status color for display
 */
export function getStatusColor(
  status: string
): "success" | "error" | "warning" | "default" {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "error";
    case "pending_verification":
      return "warning";
    default:
      return "default";
  }
}
