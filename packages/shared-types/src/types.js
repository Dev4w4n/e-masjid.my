// Application-specific types for Masjid Suite Profile Management System
// Constants
export const USER_ROLES = [
    "super_admin",
    "masjid_admin",
    "registered",
    "public",
];
export const LANGUAGE_CODES = ["en", "ms", "zh", "ta"];
export const ADDRESS_TYPES = ["home", "work", "other"];
export const MASJID_STATUSES = [
    "active",
    "inactive",
    "pending_verification",
];
export const APPLICATION_STATUSES = [
    "pending",
    "approved",
    "rejected",
    "withdrawn",
];
export const ADMIN_ASSIGNMENT_STATUSES = [
    "active",
    "inactive",
    "pending",
    "revoked",
];
export const MALAYSIAN_STATES = [
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
export const LANGUAGE_LABELS = {
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
};
//# sourceMappingURL=types.js.map