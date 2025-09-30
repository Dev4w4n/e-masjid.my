import { supabase } from "@masjid-suite/supabase-client";
import {
  DisplayConfig,
  CreateDisplay,
  UpdateDisplay,
} from "@masjid-suite/shared-types";

type ContentTransitionType = "fade" | "slide" | "zoom" | "none";

const isValidContentTransitionType = (
  value: string
): value is ContentTransitionType => {
  return ["fade", "slide", "zoom", "none"].includes(value);
};

const toDisplayConfig = (dbData: any): DisplayConfig => {
  const contentTransitionType = dbData.content_transition_type;
  if (!isValidContentTransitionType(contentTransitionType)) {
    // Default to 'fade' or handle the error as appropriate
    console.warn(
      `Invalid content_transition_type "${contentTransitionType}" received from DB, defaulting to "fade".`
    );
    dbData.content_transition_type = "fade";
  }
  return dbData as DisplayConfig;
};

/**
 * Fetches all displays for the masjids the user administers.
 * @returns A promise that resolves to an array of displays.
 */
export const getDisplaysForAdmin = async (): Promise<DisplayConfig[]> => {
  const { data, error } = await supabase.from("tv_displays").select("*");

  if (error) {
    console.error("Error fetching displays:", error);
    throw new Error(error.message);
  }

  return (data?.map(toDisplayConfig) || []) as DisplayConfig[];
};

/**
 * Fetches a single display by its ID.
 * @param id The ID of the display to fetch.
 * @returns A promise that resolves to the display object.
 */
export const getDisplayById = async (
  id: string
): Promise<DisplayConfig | null> => {
  const { data, error } = await supabase
    .from("tv_displays")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching display ${id}:`, error);
    if (error.code === "PGRST116") {
      // PostgREST error for "Not a single row"
      return null;
    }
    throw new Error(error.message);
  }

  return data ? toDisplayConfig(data) : null;
};

/**
 * Creates a new display.
 * @param displayData The data for the new display.
 * @returns A promise that resolves to the newly created display.
 */
export const createDisplay = async (
  displayData: CreateDisplay
): Promise<DisplayConfig> => {
  const { data, error } = await supabase
    .from("tv_displays")
    .insert([displayData])
    .select()
    .single();

  if (error) {
    console.error("Error creating display:", error);
    throw new Error(error.message);
  }

  return toDisplayConfig(data);
};

/**
 * Updates an existing display.
 * @param id The ID of the display to update.
 * @param displayData The data to update.
 * @returns A promise that resolves to the updated display.
 */
export const updateDisplay = async (
  id: string,
  displayData: UpdateDisplay
): Promise<DisplayConfig> => {
  const { data, error } = await supabase
    .from("tv_displays")
    .update(displayData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating display ${id}:`, error);
    throw new Error(error.message);
  }

  return toDisplayConfig(data);
};

/**
 * Deletes a display.
 * @param id The ID of the display to delete.
 * @returns A promise that resolves when the display is deleted.
 */
export const deleteDisplay = async (id: string): Promise<void> => {
  const { error } = await supabase.from("tv_displays").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting display ${id}:`, error);
    throw new Error(error.message);
  }
};
