// Application-specific types for Masjid Suite Profile Management System

import type { Database } from "./database.js";

// Re-export database types for convenience
export type { Database } from "./database.js";

// Table row types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileAddress =
  Database["public"]["Tables"]["profile_addresses"]["Row"];
export type Masjid = Database["public"]["Tables"]["masjids"]["Row"];
export type MasjidAdmin = Database["public"]["Tables"]["masjid_admins"]["Row"];
export type AdminApplication =
  Database["public"]["Tables"]["admin_applications"]["Row"];
// export type MalaysianPostcode = Database['public']['Tables']['malaysian_postcodes']['Row']; // Removed - not in current schema

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileAddressInsert =
  Database["public"]["Tables"]["profile_addresses"]["Insert"];
export type MasjidInsert = Database["public"]["Tables"]["masjids"]["Insert"];
export type MasjidAdminInsert =
  Database["public"]["Tables"]["masjid_admins"]["Insert"];
export type AdminApplicationInsert =
  Database["public"]["Tables"]["admin_applications"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ProfileAddressUpdate =
  Database["public"]["Tables"]["profile_addresses"]["Update"];
export type MasjidUpdate = Database["public"]["Tables"]["masjids"]["Update"];
export type MasjidAdminUpdate =
  Database["public"]["Tables"]["masjid_admins"]["Update"];
export type AdminApplicationUpdate =
  Database["public"]["Tables"]["admin_applications"]["Update"];

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type LanguageCode = Database["public"]["Enums"]["language_code"];
export type AddressType = Database["public"]["Enums"]["address_type"];
export type MalaysianState = Database["public"]["Enums"]["malaysian_state"];
export type MasjidStatus = Database["public"]["Enums"]["masjid_status"];
export type AdminAssignmentStatus =
  Database["public"]["Enums"]["admin_assignment_status"];
export type ApplicationStatus =
  Database["public"]["Enums"]["application_status"];

// Function return types
export type UserAdminAssignment =
  Database["public"]["Functions"]["get_user_admin_assignments"]["Returns"][0];
export type MasjidAdminList =
  Database["public"]["Functions"]["get_masjid_admin_list"]["Returns"][0];
export type MasjidApplication =
  Database["public"]["Functions"]["get_masjid_applications"]["Returns"][0];
export type PendingApplication =
  Database["public"]["Functions"]["get_pending_applications"]["Returns"][0];
export type MasjidByState =
  Database["public"]["Functions"]["get_masjids_by_state"]["Returns"][0];

// Composite types for API responses
export interface UserWithProfile extends User {
  profile?: Profile;
}

export interface ProfileWithAddress extends Profile {
  addresses: ProfileAddress[];
  user: User;
}

export interface MasjidWithDetails extends Masjid {
  admin_count: number;
  member_count: number;
  pending_applications: number;
}

export interface AdminApplicationWithDetails extends AdminApplication {
  user: {
    id: string;
    email: string;
    profile: {
      full_name: string;
      phone_number: string | null;
    };
  };
  masjid: {
    id: string;
    name: string;
  };
  reviewer?: {
    id: string;
    email: string;
  };
}

export interface MasjidAdminWithDetails extends MasjidAdmin {
  user: {
    id: string;
    email: string;
    profile: {
      full_name: string;
      phone_number: string | null;
    };
  };
  masjid: {
    id: string;
    name: string;
  };
  approver: {
    id: string;
    email: string;
  };
}

// Address types (JSON structure in masjid.address field)
export interface MasjidAddress {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: MalaysianState;
  postcode: string;
  country: "MYS";
}

// Form types for frontend
export interface ProfileFormData {
  full_name: string;
  phone_number: string;
  preferred_language: LanguageCode;
  home_masjid_id: string | null;
  address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: MalaysianState;
    postcode: string;
    address_type: AddressType;
  };
}

export interface MasjidFormData {
  name: string;
  registration_number?: string;
  email?: string;
  phone_number?: string;
  description?: string;
  address: MasjidAddress;
}

export interface AdminApplicationFormData {
  masjid_id: string;
  application_message?: string;
}

export interface ApplicationReviewData {
  status: "approved" | "rejected";
  review_notes?: string;
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
}

export type ApiResult<T = any> = ApiResponse<T> | ApiError;

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  email_verified: boolean;
  profile?: Profile;
}

export interface SessionData {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Filter and pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  column: string;
  direction: "asc" | "desc";
}

export interface UserFilters {
  role?: UserRole;
  email_verified?: boolean;
  search?: string;
}

export interface MasjidFilters {
  status?: MasjidStatus;
  state?: MalaysianState;
  search?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  masjid_id?: string;
  user_id?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Constants
export const USER_ROLES: UserRole[] = [
  "super_admin",
  "masjid_admin",
  "registered",
  "public",
];
export const LANGUAGE_CODES: LanguageCode[] = ["en", "ms", "zh", "ta"];
export const ADDRESS_TYPES: AddressType[] = ["home", "work", "other"];
export const MASJID_STATUSES: MasjidStatus[] = [
  "active",
  "inactive",
  "pending_verification",
];
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "pending",
  "approved",
  "rejected",
  "withdrawn",
];
export const ADMIN_ASSIGNMENT_STATUSES: AdminAssignmentStatus[] = [
  "active",
  "inactive",
  "pending",
  "revoked",
];

export const MALAYSIAN_STATES: MalaysianState[] = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Malacca",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Labuan",
  "Putrajaya",
];

// Language labels
export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  ms: "Bahasa Malaysia",
  zh: "中文",
  ta: "தமிழ்",
};

// Role permissions
export const ROLE_PERMISSIONS = {
  super_admin: [
    "create_masjid",
    "manage_all_users",
    "approve_admin_applications",
    "revoke_admin_assignments",
    "view_all_data",
  ],
  masjid_admin: [
    "manage_assigned_masjid",
    "view_masjid_members",
    "update_masjid_info",
  ],
  registered: ["manage_own_profile", "apply_for_admin", "view_public_masjids"],
  public: ["view_public_masjids"],
} as const;

export type Permission =
  (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number];

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormErrors {
  [key: string]: string | ValidationError[];
}
