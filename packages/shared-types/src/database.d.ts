export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    role: Database['public']['Enums']['user_role'];
                    created_at: string;
                    updated_at: string;
                    email_verified: boolean;
                    last_sign_in_at: string | null;
                };
                Insert: {
                    id: string;
                    email: string;
                    role?: Database['public']['Enums']['user_role'];
                    created_at?: string;
                    updated_at?: string;
                    email_verified?: boolean;
                    last_sign_in_at?: string | null;
                };
                Update: {
                    id?: string;
                    email?: string;
                    role?: Database['public']['Enums']['user_role'];
                    created_at?: string;
                    updated_at?: string;
                    email_verified?: boolean;
                    last_sign_in_at?: string | null;
                };
                Relationships: [];
            };
            profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    full_name: string;
                    phone_number: string | null;
                    preferred_language: Database['public']['Enums']['language_code'];
                    home_masjid_id: string | null;
                    is_complete: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    full_name: string;
                    phone_number?: string | null;
                    preferred_language?: Database['public']['Enums']['language_code'];
                    home_masjid_id?: string | null;
                    is_complete?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    full_name?: string;
                    phone_number?: string | null;
                    preferred_language?: Database['public']['Enums']['language_code'];
                    home_masjid_id?: string | null;
                    is_complete?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "fk_profiles_home_masjid";
                        columns: ["home_masjid_id"];
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "profiles_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profile_addresses: {
                Row: {
                    id: string;
                    profile_id: string;
                    address_line_1: string;
                    address_line_2: string | null;
                    city: string;
                    state: Database['public']['Enums']['malaysian_state'];
                    postcode: string;
                    country: string;
                    address_type: Database['public']['Enums']['address_type'];
                    is_primary: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    address_line_1: string;
                    address_line_2?: string | null;
                    city: string;
                    state: Database['public']['Enums']['malaysian_state'];
                    postcode: string;
                    country?: string;
                    address_type?: Database['public']['Enums']['address_type'];
                    is_primary?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    address_line_1?: string;
                    address_line_2?: string | null;
                    city?: string;
                    state?: Database['public']['Enums']['malaysian_state'];
                    postcode?: string;
                    country?: string;
                    address_type?: Database['public']['Enums']['address_type'];
                    is_primary?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "profile_addresses_profile_id_fkey";
                        columns: ["profile_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            masjids: {
                Row: {
                    id: string;
                    name: string;
                    registration_number: string | null;
                    email: string | null;
                    phone_number: string | null;
                    description: string | null;
                    address: Json;
                    status: Database['public']['Enums']['masjid_status'];
                    created_by: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    registration_number?: string | null;
                    email?: string | null;
                    phone_number?: string | null;
                    description?: string | null;
                    address: Json;
                    status?: Database['public']['Enums']['masjid_status'];
                    created_by: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    registration_number?: string | null;
                    email?: string | null;
                    phone_number?: string | null;
                    description?: string | null;
                    address?: Json;
                    status?: Database['public']['Enums']['masjid_status'];
                    created_by?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "masjids_created_by_fkey";
                        columns: ["created_by"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            masjid_admins: {
                Row: {
                    id: string;
                    user_id: string;
                    masjid_id: string;
                    status: Database['public']['Enums']['admin_assignment_status'];
                    approved_by: string;
                    approved_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    masjid_id: string;
                    status?: Database['public']['Enums']['admin_assignment_status'];
                    approved_by: string;
                    approved_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    masjid_id?: string;
                    status?: Database['public']['Enums']['admin_assignment_status'];
                    approved_by?: string;
                    approved_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "masjid_admins_approved_by_fkey";
                        columns: ["approved_by"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "masjid_admins_masjid_id_fkey";
                        columns: ["masjid_id"];
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "masjid_admins_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            admin_applications: {
                Row: {
                    id: string;
                    user_id: string;
                    masjid_id: string;
                    application_message: string | null;
                    status: Database['public']['Enums']['application_status'];
                    review_notes: string | null;
                    reviewed_by: string | null;
                    reviewed_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    masjid_id: string;
                    application_message?: string | null;
                    status?: Database['public']['Enums']['application_status'];
                    review_notes?: string | null;
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    masjid_id?: string;
                    application_message?: string | null;
                    status?: Database['public']['Enums']['application_status'];
                    review_notes?: string | null;
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "admin_applications_masjid_id_fkey";
                        columns: ["masjid_id"];
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "admin_applications_reviewed_by_fkey";
                        columns: ["reviewed_by"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "admin_applications_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            malaysian_postcodes: {
                Row: {
                    postcode: string;
                    city: string;
                    state: Database['public']['Enums']['malaysian_state'];
                    created_at: string;
                };
                Insert: {
                    postcode: string;
                    city: string;
                    state: Database['public']['Enums']['malaysian_state'];
                    created_at?: string;
                };
                Update: {
                    postcode?: string;
                    city?: string;
                    state?: Database['public']['Enums']['malaysian_state'];
                    created_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            approve_admin_application: {
                Args: {
                    application_id: string;
                    approving_user_id: string;
                    approval_notes?: string;
                };
                Returns: boolean;
            };
            check_profile_completion: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            create_profile_for_new_user: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            create_sample_data: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            ensure_one_primary_address: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            get_masjid_admin_list: {
                Args: {
                    target_masjid_id: string;
                };
                Returns: {
                    user_id: string;
                    full_name: string;
                    email: string;
                    assignment_status: Database['public']['Enums']['admin_assignment_status'];
                    assigned_at: string;
                    phone_number: string;
                }[];
            };
            get_masjid_applications: {
                Args: {
                    target_masjid_id: string;
                };
                Returns: {
                    application_id: string;
                    user_id: string;
                    user_email: string;
                    user_full_name: string;
                    application_message: string;
                    status: Database['public']['Enums']['application_status'];
                    applied_at: string;
                    reviewed_at: string;
                    reviewer_email: string;
                    review_notes: string;
                }[];
            };
            get_masjids_by_state: {
                Args: {
                    target_state: string;
                };
                Returns: {
                    id: string;
                    name: string;
                    address: Json;
                    status: Database['public']['Enums']['masjid_status'];
                    distance_score: number;
                }[];
            };
            get_pending_applications: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    application_id: string;
                    user_id: string;
                    user_email: string;
                    user_full_name: string;
                    user_phone: string;
                    masjid_id: string;
                    masjid_name: string;
                    application_message: string;
                    applied_at: string;
                }[];
            };
            get_user_admin_assignments: {
                Args: {
                    target_user_id: string;
                };
                Returns: {
                    assignment_id: string;
                    masjid_id: string;
                    masjid_name: string;
                    assignment_status: Database['public']['Enums']['admin_assignment_status'];
                    approved_at: string;
                    approved_by_email: string;
                }[];
            };
            get_user_admin_masjids: {
                Args: Record<PropertyKey, never>;
                Returns: string[];
            };
            get_user_role: {
                Args: Record<PropertyKey, never>;
                Returns: Database['public']['Enums']['user_role'];
            };
            handle_new_user: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            is_admin_of_masjid: {
                Args: {
                    masjid_id: string;
                };
                Returns: boolean;
            };
            is_super_admin: {
                Args: Record<PropertyKey, never>;
                Returns: boolean;
            };
            is_user_masjid_admin: {
                Args: {
                    target_user_id: string;
                    target_masjid_id: string;
                };
                Returns: boolean;
            };
            reject_admin_application: {
                Args: {
                    application_id: string;
                    rejecting_user_id: string;
                    rejection_notes: string;
                };
                Returns: boolean;
            };
            reset_development_data: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            revoke_admin_assignment: {
                Args: {
                    target_assignment_id: string;
                    revoking_user_id: string;
                };
                Returns: boolean;
            };
            sync_user_email_verification: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            sync_user_role_with_admin_assignment: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            update_updated_at_column: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            validate_admin_application: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            validate_admin_assignment: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            validate_masjid_address: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            withdraw_admin_application: {
                Args: {
                    application_id: string;
                    withdrawing_user_id: string;
                };
                Returns: boolean;
            };
        };
        Enums: {
            address_type: 'home' | 'work' | 'other';
            admin_assignment_status: 'active' | 'inactive' | 'pending' | 'revoked';
            application_status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
            language_code: 'en' | 'ms' | 'zh' | 'ta';
            malaysian_state: 'Johor' | 'Kedah' | 'Kelantan' | 'Malacca' | 'Negeri Sembilan' | 'Pahang' | 'Penang' | 'Perak' | 'Perlis' | 'Sabah' | 'Sarawak' | 'Selangor' | 'Terengganu' | 'Kuala Lumpur' | 'Labuan' | 'Putrajaya';
            masjid_status: 'active' | 'inactive' | 'pending_verification';
            user_role: 'super_admin' | 'masjid_admin' | 'registered' | 'public';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
//# sourceMappingURL=database.d.ts.map