import { supabase } from "@/lib/supabase";

// Extended content type with masjid information
export interface ContentWithMasjid {
  id: string;
  title: string;
  description: string | null;
  type: "image" | "youtube_video" | "text_announcement" | "event_poster";
  url: string;
  thumbnail_url: string | null;
  category_id: string | null;
  status: "pending" | "active" | "expired" | "rejected";
  start_date: string | null;
  end_date: string | null;
  sponsorship_amount: number;
  contact_number: string | null;
  contact_email: string | null;
  created_at: string;
  masjids: {
    id: string;
    name: string;
    address: {
      address_line_1?: string;
      address_line_2?: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    };
  };
}

/**
 * Fetch all approved and active content from all masjids nationwide
 * @returns Promise<ContentWithMasjid[]> Sorted by created_at DESC (newest first)
 */
export async function getAllActiveContent(): Promise<ContentWithMasjid[]> {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("display_content")
      .select(
        `
        *,
        masjids (
          id,
          name,
          address
        )
      `
      )
      .eq("status", "active")
      .lte("start_date", today)
      .gte("end_date", today)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    return (data || []) as ContentWithMasjid[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching content");
  }
}

/**
 * Extract UUID from slug format: "title-kebab-case-{uuid}"
 * @param slug Content slug
 * @returns UUID or null if invalid
 */
function extractUuidFromSlug(slug: string): string | null {
  if (!slug) return null;

  // UUID pattern: 8-4-4-4-12 hex characters
  const uuidPattern =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = slug.match(uuidPattern);

  return match ? match[1] || null : null;
}

/**
 * Fetch single content by slug
 * @param slug Content slug in format "title-kebab-case-{uuid}"
 * @returns Promise<ContentWithMasjid | null> Content or null if not found/not active
 */
export async function getContentBySlug(
  slug: string
): Promise<ContentWithMasjid | null> {
  try {
    const uuid = extractUuidFromSlug(slug);

    if (!uuid) {
      return null;
    }

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("display_content")
      .select(
        `
        *,
        masjids (
          id,
          name,
          address
        )
      `
      )
      .eq("id", uuid)
      .eq("status", "active")
      .lte("start_date", today)
      .gte("end_date", today)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    return data as ContentWithMasjid;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Not found")) {
      return null;
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching content");
  }
}

/**
 * Generate slug from title and ID
 * @param title Content title
 * @param id Content UUID
 * @returns Slug in format "title-kebab-case-{uuid}"
 */
export function generateSlug(title: string, id: string): string {
  const kebabTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${kebabTitle}-${id}`;
}
