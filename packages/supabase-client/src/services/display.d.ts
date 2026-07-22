import { DisplayContent, Tables, TablesInsert } from "@masjid-suite/shared-types";
type TvDisplay = Tables<"tv_displays">;
type NewTvDisplay = TablesInsert<"tv_displays">;
export declare const createDisplay: (newDisplay: NewTvDisplay) => Promise<TvDisplay>;
export declare const getDisplaysByMasjid: (masjidId: string) => Promise<TvDisplay[]>;
export declare const getAssignedContent: (displayId: string) => Promise<Array<DisplayContent & {
    carousel_duration: number;
    transition_type: "fade" | "slide" | "zoom" | "none";
    image_display_mode: "contain" | "cover" | "fill" | "none";
}>>;
export declare const assignContent: (displayId: string, contentId: string, settings?: {
    carousel_duration?: number;
    transition_type?: "fade" | "slide" | "zoom" | "none";
    image_display_mode?: "contain" | "cover" | "fill" | "none";
}) => Promise<any>;
export declare const removeContent: (displayId: string, contentId: string) => Promise<boolean>;
export declare const updateContentOrder: (displayId: string, contentOrders: Array<{
    contentId: string;
    order: number;
}>) => Promise<boolean>;
export declare const updateContentSettings: (displayId: string, contentId: string, settings: {
    carousel_duration?: number;
    transition_type?: "fade" | "slide" | "zoom" | "none";
    image_display_mode?: "contain" | "cover" | "fill" | "none";
}) => Promise<boolean>;
export {};
//# sourceMappingURL=display.d.ts.map