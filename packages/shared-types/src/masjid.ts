import { z } from "zod";
import { malaysianStates } from "./constants";
import type { Database } from "./database.types";

// ============================================================================
// Zod Validation Schema
// ============================================================================

export const masjidAddressSchema = z.object({
  address_line_1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(100, "Address line 1 must not exceed 100 characters"),
  address_line_2: z
    .string()
    .max(100, "Address line 2 must not exceed 100 characters")
    .optional()
    .nullable(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters"),
  state: z.enum(malaysianStates, {
    errorMap: () => ({ message: "Please select a valid Malaysian state" }),
  }),
  postcode: z.string().regex(/^\d{5}$/, "Postcode must be 5 digits"),
  country: z.literal("MYS"),
});

export const masjidFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must not exceed 100 characters"),
    registration_number: z
      .string()
      .optional()
      .refine((val) => !val || /^MSJ-\d{4}-\d{3}$/.test(val), {
        message: "Registration number must follow format MSJ-YYYY-XXX",
      }),
    email: z
      .string()
      .email("Please enter a valid email address")
      .optional()
      .or(z.literal("")),
    phone_number: z
      .string()
      .optional()
      .refine((val) => !val || /^\+60[0-9]{8,10}$/.test(val), {
        message:
          "Phone number must be in Malaysian format (e.g., +60123456789)",
      }),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .nullable(),
    website_url: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),
    address: masjidAddressSchema,
    capacity: z
      .number()
      .min(50, "Capacity must be at least 50 people")
      .max(10000, "Capacity must not exceed 10,000 people")
      .optional()
      .nullable(),
    prayer_times_source: z
      .enum(["manual", "jakim", "auto"], {
        errorMap: () => ({ message: "Please select a prayer times source" }),
      })
      .optional(),
    jakim_zone_code: z
      .string()
      .regex(/^[A-Z]{3}[0-9]{2}$/, {
        message:
          "Zone code must be in format: 3 letters + 2 digits (e.g., WLY01)",
      })
      .optional()
      .nullable(),
    status: z
      .enum(["active", "inactive", "pending_verification"], {
        errorMap: () => ({ message: "Please select a valid status" }),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.prayer_times_source === "jakim") {
        return !!data.jakim_zone_code;
      }
      return true;
    },
    {
      message: "JAKIM zone is required when prayer source is JAKIM",
      path: ["jakim_zone_code"],
    }
  );

export type MasjidFormData = z.infer<typeof masjidFormSchema>;

export type MasjidAddress = z.infer<typeof masjidAddressSchema>;

export type Masjid = Database["public"]["Tables"]["masjids"]["Row"];

export type MasjidAdmin =
  Database["public"]["Functions"]["get_masjid_admin_list"]["Returns"][number];

export type MasjidWithAdmins = Masjid & {
  admins: MasjidAdmin[];
};
