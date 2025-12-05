import { supabase } from "@masjid-suite/supabase-client";
import {
  DisplayContent,
  CreateDisplayContent,
  UpdateDisplayContent,
} from "@masjid-suite/shared-types";

/**
 * Fetches all content for the masjids the user administers.
 * @returns A promise that resolves to an array of display content.
 */
export const getContentForAdmin = async (): Promise<DisplayContent[]> => {
  const { data, error } = await supabase
    .from("display_content")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Error fetching content:", error);
    throw new Error(error.message);
  }

  return (data as DisplayContent[]) || [];
};

/**
 * Creates new display content.
 * @param contentData The data for the new content.
 * @returns A promise that resolves to the newly created content.
 */
export const createContent = async (
  contentData: CreateDisplayContent
): Promise<DisplayContent> => {
  const { data, error } = await supabase
    .from("display_content")
    .insert([contentData])
    .select()
    .single();

  if (error) {
    console.error("Error creating content:", error);
    throw new Error(error.message);
  }

  return data as DisplayContent;
};

/**
 * Updates existing display content.
 * @param id The ID of the content to update.
 * @param contentData The data to update.
 * @returns A promise that resolves to the updated content.
 */
export const updateContent = async (
  id: string,
  contentData: UpdateDisplayContent
): Promise<DisplayContent> => {
  const { data, error } = await supabase
    .from("display_content")
    .update(contentData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating content ${id}:`, error);
    throw new Error(error.message);
  }

  return data as DisplayContent;
};

/**
 * Deletes display content.
 * @param id The ID of the content to delete.
 * @returns A promise that resolves when the content is deleted.
 */
export const deleteContent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("display_content")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting content ${id}:`, error);
    throw new Error(error.message);
  }
};
