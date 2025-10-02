import { supabase } from "..";
import {
  DisplayContent,
  Tables,
  TablesInsert,
} from "@masjid-suite/shared-types";

type TvDisplay = Tables<"tv_displays">;
type NewTvDisplay = TablesInsert<"tv_displays">;

export const createDisplay = async (
  newDisplay: NewTvDisplay
): Promise<TvDisplay> => {
  const { data, error } = await supabase
    .from("tv_displays")
    .insert(newDisplay)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getDisplaysByMasjid = async (
  masjidId: string
): Promise<TvDisplay[]> => {
  const { data, error } = await supabase
    .from("tv_displays")
    .select("*")
    .eq("masjid_id", masjidId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getAssignedContent = async (
  displayId: string
): Promise<
  Array<
    DisplayContent & {
      carousel_duration: number;
      transition_type: "fade" | "slide" | "zoom" | "none";
      image_display_mode: "contain" | "cover" | "fill" | "none";
    }
  >
> => {
  const { data, error } = await (supabase as any)
    .from("display_content_assignments")
    .select(
      `
      display_order,
      carousel_duration,
      transition_type,
      image_display_mode,
      display_content:content_id(*)
    `
    )
    .eq("display_id", displayId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item: any) => ({
    ...item.display_content,
    carousel_duration: item.carousel_duration,
    transition_type: item.transition_type,
    image_display_mode: item.image_display_mode,
  }));
};

export const assignContent = async (
  displayId: string,
  contentId: string,
  settings?: {
    carousel_duration?: number;
    transition_type?: "fade" | "slide" | "zoom" | "none";
    image_display_mode?: "contain" | "cover" | "fill" | "none";
  }
) => {
  // Get the current max display_order for this display
  const { data: maxOrderData } = await (supabase as any)
    .from("display_content_assignments")
    .select("display_order")
    .eq("display_id", displayId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = maxOrderData ? maxOrderData.display_order + 1 : 0;

  const { data, error } = await (supabase as any)
    .from("display_content_assignments")
    .insert([
      {
        display_id: displayId,
        content_id: contentId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
        display_order: nextOrder,
        carousel_duration: settings?.carousel_duration || 10,
        transition_type: settings?.transition_type || "fade",
        image_display_mode: settings?.image_display_mode || "contain",
      },
    ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const removeContent = async (displayId: string, contentId: string) => {
  const { error } = await (supabase as any)
    .from("display_content_assignments")
    .delete()
    .eq("display_id", displayId)
    .eq("content_id", contentId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const updateContentOrder = async (
  displayId: string,
  contentOrders: Array<{ contentId: string; order: number }>
) => {
  // Update each assignment's display_order
  const updates = contentOrders.map(({ contentId, order }) =>
    (supabase as any)
      .from("display_content_assignments")
      .update({ display_order: order })
      .eq("display_id", displayId)
      .eq("content_id", contentId)
  );

  const results = await Promise.all(updates);

  // Check if any updates failed
  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    throw new Error(
      `Failed to update content order: ${errors[0].error.message}`
    );
  }

  return true;
};

export const updateContentSettings = async (
  displayId: string,
  contentId: string,
  settings: {
    carousel_duration?: number;
    transition_type?: "fade" | "slide" | "zoom" | "none";
    image_display_mode?: "contain" | "cover" | "fill" | "none";
  }
) => {
  const { error } = await (supabase as any)
    .from("display_content_assignments")
    .update(settings)
    .eq("display_id", displayId)
    .eq("content_id", contentId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
