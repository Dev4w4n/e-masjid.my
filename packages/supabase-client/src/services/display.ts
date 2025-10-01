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
): Promise<DisplayContent[]> => {
  const { data, error } = await (supabase as any)
    .from("display_content_assignments")
    .select(
      `
      display_content:content_id(*)
    `
    )
    .eq("display_id", displayId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item: any) => item.display_content);
};

export const assignContent = async (displayId: string, contentId: string) => {
  const { data, error } = await (supabase as any)
    .from("display_content_assignments")
    .insert([
      {
        display_id: displayId,
        content_id: contentId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
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
