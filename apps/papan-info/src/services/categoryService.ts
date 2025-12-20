import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name_en: string;
  name_ms: string;
  slug: string;
  description_en?: string;
  description_ms?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active categories
 * @returns Promise<Category[]> Sorted by display_order ASC
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return (data || []) as Category[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching categories");
  }
}
