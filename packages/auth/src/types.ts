import type {
  Database,
  UserRole as AppUserRole,
} from "@masjid-suite/shared-types";

export type UserRole = AppUserRole;

// Extended profile type with user role and UI properties
export type ProfileWithRole =
  Database["public"]["Tables"]["profiles"]["Row"] & {
    user_role?: UserRole;
    role?: UserRole; // Alias for compatibility with UI components
    email?: string; // From users table
    avatar_url?: string; // For future implementation
  };
