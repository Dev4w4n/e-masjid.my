import { z } from "zod";
export declare const masjidSchema: z.ZodObject<{
    name: z.ZodString;
    registration_number: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone_number: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    website_url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodObject<{
        address_line_1: z.ZodString;
        address_line_2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        city: z.ZodString;
        state: z.ZodEnum<["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Pulau Pinang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan"]>;
        postcode: z.ZodString;
        country: z.ZodLiteral<"MYS">;
    }, "strip", z.ZodTypeAny, {
        address_line_1: string;
        city: string;
        postcode: string;
        state: "Johor" | "Kedah" | "Kelantan" | "Negeri Sembilan" | "Pahang" | "Perak" | "Perlis" | "Sabah" | "Sarawak" | "Selangor" | "Terengganu" | "Pulau Pinang" | "Melaka" | "Wilayah Persekutuan";
        country: "MYS";
        address_line_2?: string | null | undefined;
    }, {
        address_line_1: string;
        city: string;
        postcode: string;
        state: "Johor" | "Kedah" | "Kelantan" | "Negeri Sembilan" | "Pahang" | "Perak" | "Perlis" | "Sabah" | "Sarawak" | "Selangor" | "Terengganu" | "Pulau Pinang" | "Melaka" | "Wilayah Persekutuan";
        country: "MYS";
        address_line_2?: string | null | undefined;
    }>;
    capacity: z.ZodOptional<z.ZodNumber>;
    prayer_times_source: z.ZodOptional<z.ZodEnum<["manual", "jakim", "auto"]>>;
    jakim_zone_code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending_verification"]>>;
}, "strip", z.ZodTypeAny, {
    address: {
        address_line_1: string;
        city: string;
        postcode: string;
        state: "Johor" | "Kedah" | "Kelantan" | "Negeri Sembilan" | "Pahang" | "Perak" | "Perlis" | "Sabah" | "Sarawak" | "Selangor" | "Terengganu" | "Pulau Pinang" | "Melaka" | "Wilayah Persekutuan";
        country: "MYS";
        address_line_2?: string | null | undefined;
    };
    name: string;
    description?: string | null | undefined;
    email?: string | undefined;
    phone_number?: string | undefined;
    capacity?: number | undefined;
    jakim_zone_code?: string | null | undefined;
    prayer_times_source?: "manual" | "jakim" | "auto" | undefined;
    registration_number?: string | undefined;
    status?: "active" | "inactive" | "pending_verification" | undefined;
    website_url?: string | undefined;
}, {
    address: {
        address_line_1: string;
        city: string;
        postcode: string;
        state: "Johor" | "Kedah" | "Kelantan" | "Negeri Sembilan" | "Pahang" | "Perak" | "Perlis" | "Sabah" | "Sarawak" | "Selangor" | "Terengganu" | "Pulau Pinang" | "Melaka" | "Wilayah Persekutuan";
        country: "MYS";
        address_line_2?: string | null | undefined;
    };
    name: string;
    description?: string | null | undefined;
    email?: string | undefined;
    phone_number?: string | undefined;
    capacity?: number | undefined;
    jakim_zone_code?: string | null | undefined;
    prayer_times_source?: "manual" | "jakim" | "auto" | undefined;
    registration_number?: string | undefined;
    status?: "active" | "inactive" | "pending_verification" | undefined;
    website_url?: string | undefined;
}>;
export type MasjidFormData = z.infer<typeof masjidSchema>;
export type MasjidAddress = z.infer<typeof masjidSchema.shape.address>;
//# sourceMappingURL=masjid.d.ts.map