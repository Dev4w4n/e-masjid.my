export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json;
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            admin_applications: {
                Row: {
                    application_message: string | null;
                    created_at: string;
                    id: string;
                    masjid_id: string;
                    review_notes: string | null;
                    reviewed_at: string | null;
                    reviewed_by: string | null;
                    status: Database["public"]["Enums"]["application_status"];
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    application_message?: string | null;
                    created_at?: string;
                    id?: string;
                    masjid_id: string;
                    review_notes?: string | null;
                    reviewed_at?: string | null;
                    reviewed_by?: string | null;
                    status?: Database["public"]["Enums"]["application_status"];
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    application_message?: string | null;
                    created_at?: string;
                    id?: string;
                    masjid_id?: string;
                    review_notes?: string | null;
                    reviewed_at?: string | null;
                    reviewed_by?: string | null;
                    status?: Database["public"]["Enums"]["application_status"];
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "admin_applications_masjid_id_fkey";
                        columns: ["masjid_id"];
                        isOneToOne: false;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "admin_applications_reviewed_by_fkey";
                        columns: ["reviewed_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "admin_applications_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            display_analytics: {
                Row: {
                    active_sponsors: number;
                    average_content_duration: number;
                    content_views: number;
                    created_at: string | null;
                    date: string;
                    display_id: string;
                    downtime_minutes: number;
                    error_count: number;
                    id: string;
                    total_sponsorship_revenue: number;
                    unique_content_shown: number;
                    uptime_minutes: number;
                };
                Insert: {
                    active_sponsors?: number;
                    average_content_duration?: number;
                    content_views?: number;
                    created_at?: string | null;
                    date: string;
                    display_id: string;
                    downtime_minutes?: number;
                    error_count?: number;
                    id?: string;
                    total_sponsorship_revenue?: number;
                    unique_content_shown?: number;
                    uptime_minutes?: number;
                };
                Update: {
                    active_sponsors?: number;
                    average_content_duration?: number;
                    content_views?: number;
                    created_at?: string | null;
                    date?: string;
                    display_id?: string;
                    downtime_minutes?: number;
                    error_count?: number;
                    id?: string;
                    total_sponsorship_revenue?: number;
                    unique_content_shown?: number;
                    uptime_minutes?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "display_analytics_display_id_fkey";
                        columns: ["display_id"];
                        isOneToOne: false;
                        referencedRelation: "tv_displays";
                        referencedColumns: ["id"];
                    }
                ];
            };
            display_content: {
                Row: {
                    approval_notes: string | null;
                    approved_at: string | null;
                    approved_by: string | null;
                    created_at: string | null;
                    description: string | null;
                    display_id: string | null;
                    duration: number;
                    end_date: string;
                    file_size: number | null;
                    file_type: string | null;
                    id: string;
                    masjid_id: string;
                    payment_reference: string | null;
                    payment_status: Database["public"]["Enums"]["payment_status"];
                    rejection_reason: string | null;
                    resubmission_of: string | null;
                    sponsorship_amount: number;
                    sponsorship_tier: Database["public"]["Enums"]["sponsorship_tier"] | null;
                    start_date: string;
                    status: Database["public"]["Enums"]["content_status"];
                    submitted_at: string | null;
                    submitted_by: string;
                    thumbnail_url: string | null;
                    title: string;
                    type: Database["public"]["Enums"]["content_type"];
                    updated_at: string | null;
                    url: string;
                };
                Insert: {
                    approval_notes?: string | null;
                    approved_at?: string | null;
                    approved_by?: string | null;
                    created_at?: string | null;
                    description?: string | null;
                    display_id?: string | null;
                    duration?: number;
                    end_date?: string;
                    file_size?: number | null;
                    file_type?: string | null;
                    id?: string;
                    masjid_id: string;
                    payment_reference?: string | null;
                    payment_status?: Database["public"]["Enums"]["payment_status"];
                    rejection_reason?: string | null;
                    resubmission_of?: string | null;
                    sponsorship_amount?: number;
                    sponsorship_tier?: Database["public"]["Enums"]["sponsorship_tier"] | null;
                    start_date?: string;
                    status?: Database["public"]["Enums"]["content_status"];
                    submitted_at?: string | null;
                    submitted_by: string;
                    thumbnail_url?: string | null;
                    title: string;
                    type: Database["public"]["Enums"]["content_type"];
                    updated_at?: string | null;
                    url: string;
                };
                Update: {
                    approval_notes?: string | null;
                    approved_at?: string | null;
                    approved_by?: string | null;
                    created_at?: string | null;
                    description?: string | null;
                    display_id?: string | null;
                    duration?: number;
                    end_date?: string;
                    file_size?: number | null;
                    file_type?: string | null;
                    id?: string;
                    masjid_id?: string;
                    payment_reference?: string | null;
                    payment_status?: Database["public"]["Enums"]["payment_status"];
                    rejection_reason?: string | null;
                    resubmission_of?: string | null;
                    sponsorship_amount?: number;
                    sponsorship_tier?: Database["public"]["Enums"]["sponsorship_tier"] | null;
                    start_date?: string;
                    status?: Database["public"]["Enums"]["content_status"];
                    submitted_at?: string | null;
                    submitted_by?: string;
                    thumbnail_url?: string | null;
                    title?: string;
                    type?: Database["public"]["Enums"]["content_type"];
                    updated_at?: string | null;
                    url?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "display_content_approved_by_fkey";
                        columns: ["approved_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "display_content_display_id_fkey";
                        columns: ["display_id"];
                        isOneToOne: false;
                        referencedRelation: "tv_displays";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "display_content_masjid_id_fkey";
                        columns: ["masjid_id"];
                        isOneToOne: false;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "display_content_resubmission_of_fkey";
                        columns: ["resubmission_of"];
                        isOneToOne: false;
                        referencedRelation: "display_content";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "display_content_submitted_by_fkey";
                        columns: ["submitted_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            display_status: {
                Row: {
                    api_response_time: number;
                    browser_info: string | null;
                    content_load_time: number;
                    created_at: string | null;
                    current_content_id: string | null;
                    device_info: string | null;
                    display_id: string;
                    error_count_24h: number;
                    id: string;
                    is_online: boolean;
                    last_seen: string | null;
                    screen_resolution: string | null;
                    updated_at: string | null;
                    uptime_percentage: number;
                };
                Insert: {
                    api_response_time?: number;
                    browser_info?: string | null;
                    content_load_time?: number;
                    created_at?: string | null;
                    current_content_id?: string | null;
                    device_info?: string | null;
                    display_id: string;
                    error_count_24h?: number;
                    id?: string;
                    is_online?: boolean;
                    last_seen?: string | null;
                    screen_resolution?: string | null;
                    updated_at?: string | null;
                    uptime_percentage?: number;
                };
                Update: {
                    api_response_time?: number;
                    browser_info?: string | null;
                    content_load_time?: number;
                    created_at?: string | null;
                    current_content_id?: string | null;
                    device_info?: string | null;
                    display_id?: string;
                    error_count_24h?: number;
                    id?: string;
                    is_online?: boolean;
                    last_seen?: string | null;
                    screen_resolution?: string | null;
                    updated_at?: string | null;
                    uptime_percentage?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "display_status_current_content_id_fkey";
                        columns: ["current_content_id"];
                        isOneToOne: false;
                        referencedRelation: "display_content";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "display_status_display_id_fkey";
                        columns: ["display_id"];
                        isOneToOne: true;
                        referencedRelation: "tv_displays";
                        referencedColumns: ["id"];
                    }
                ];
            };
            masjid_admins: {
                Row: {
                    approved_at: string;
                    approved_by: string;
                    created_at: string;
                    id: string;
                    masjid_id: string;
                    status: Database["public"]["Enums"]["admin_assignment_status"];
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    approved_at?: string;
                    approved_by: string;
                    created_at?: string;
                    id?: string;
                    masjid_id: string;
                    status?: Database["public"]["Enums"]["admin_assignment_status"];
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    approved_at?: string;
                    approved_by?: string;
                    created_at?: string;
                    id?: string;
                    masjid_id?: string;
                    status?: Database["public"]["Enums"]["admin_assignment_status"];
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "masjid_admins_approved_by_fkey";
                        columns: ["approved_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "masjid_admins_masjid_id_fkey";
                        columns: ["masjid_id"];
                        isOneToOne: false;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "masjid_admins_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            masjids: {
                Row: {
                    address: Json;
                    capacity: number | null;
                    created_at: string;
                    created_by: string;
                    description: string | null;
                    email: string | null;
                    id: string;
                    jakim_zone_code: string | null;
                    name: string;
                    phone_number: string | null;
                    prayer_times_source: Database["public"]["Enums"]["prayer_source_enum"] | null;
                    registration_number: string | null;
                    status: Database["public"]["Enums"]["masjid_status"];
                    updated_at: string;
                    website_url: string | null;
                };
                Insert: {
                    address: Json;
                    capacity?: number | null;
                    created_at?: string;
                    created_by: string;
                    description?: string | null;
                    email?: string | null;
                    id?: string;
                    jakim_zone_code?: string | null;
                    name: string;
                    phone_number?: string | null;
                    prayer_times_source?: Database["public"]["Enums"]["prayer_source_enum"] | null;
                    registration_number?: string | null;
                    status?: Database["public"]["Enums"]["masjid_status"];
                    updated_at?: string;
                    website_url?: string | null;
                };
                Update: {
                    address?: Json;
                    capacity?: number | null;
                    created_at?: string;
                    created_by?: string;
                    description?: string | null;
                    email?: string | null;
                    id?: string;
                    jakim_zone_code?: string | null;
                    name?: string;
                    phone_number?: string | null;
                    prayer_times_source?: Database["public"]["Enums"]["prayer_source_enum"] | null;
                    registration_number?: string | null;
                    status?: Database["public"]["Enums"]["masjid_status"];
                    updated_at?: string;
                    website_url?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "masjids_created_by_fkey";
                        columns: ["created_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            prayer_time_config: {
                Row: {
                    adjustments: Json;
                    created_at: string | null;
                    highlight_current_prayer: boolean;
                    id: string;
                    latitude: number | null;
                    location_name: string;
                    longitude: number | null;
                    masjid_id: string;
                    next_prayer_countdown: boolean;
                    show_seconds: boolean;
                    updated_at: string | null;
                    zone_code: string;
                };
                Insert: {
                    adjustments?: Json;
                    created_at?: string | null;
                    highlight_current_prayer?: boolean;
                    id?: string;
                    latitude?: number | null;
                    location_name: string;
                    longitude?: number | null;
                    masjid_id: string;
                    next_prayer_countdown?: boolean;
                    show_seconds?: boolean;
                    updated_at?: string | null;
                    zone_code: string;
                };
                Update: {
                    adjustments?: Json;
                    created_at?: string | null;
                    highlight_current_prayer?: boolean;
                    id?: string;
                    latitude?: number | null;
                    location_name?: string;
                    longitude?: number | null;
                    masjid_id?: string;
                    next_prayer_countdown?: boolean;
                    show_seconds?: boolean;
                    updated_at?: string | null;
                    zone_code?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "prayer_time_config_masjid_id_fkey";
                        columns: ["masjid_id"];
                        isOneToOne: true;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    }
                ];
            };
            prayer_times: {
                Row: {
                    asr_time: string;
                    created_at: string | null;
                    dhuhr_time: string;
                    fajr_time: string;
                    fetched_at: string | null;
                    id: string;
                    isha_time: string;
                    maghrib_time: string;
                    manual_adjustments: Json | null;
                    masjid_id: string;
                    prayer_date: string;
                    source: Database["public"]["Enums"]["prayer_time_source"];
                    sunrise_time: string;
                    updated_at: string | null;
                };
                Insert: {
                    asr_time: string;
                    created_at?: string | null;
                    dhuhr_time: string;
                    fajr_time: string;
                    fetched_at?: string | null;
                    id?: string;
                    isha_time: string;
                    maghrib_time: string;
                    manual_adjustments?: Json | null;
                    masjid_id: string;
                    prayer_date: string;
                    source?: Database["public"]["Enums"]["prayer_time_source"];
                    sunrise_time: string;
                    updated_at?: string | null;
                };
                Update: {
                    asr_time?: string;
                    created_at?: string | null;
                    dhuhr_time?: string;
                    fajr_time?: string;
                    fetched_at?: string | null;
                    id?: string;
                    isha_time?: string;
                    maghrib_time?: string;
                    manual_adjustments?: Json | null;
                    masjid_id?: string;
                    prayer_date?: string;
                    source?: Database["public"]["Enums"]["prayer_time_source"];
                    sunrise_time?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "prayer_times_masjid_id_fkey";
                        columns: ["masjid_id"];
                        isOneToOne: false;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profile_addresses: {
                Row: {
                    address_line_1: string;
                    address_line_2: string | null;
                    address_type: Database["public"]["Enums"]["address_type"];
                    city: string;
                    country: string;
                    created_at: string;
                    id: string;
                    is_primary: boolean | null;
                    postcode: string;
                    profile_id: string;
                    state: Database["public"]["Enums"]["malaysian_state"];
                    updated_at: string;
                };
                Insert: {
                    address_line_1: string;
                    address_line_2?: string | null;
                    address_type?: Database["public"]["Enums"]["address_type"];
                    city: string;
                    country?: string;
                    created_at?: string;
                    id?: string;
                    is_primary?: boolean | null;
                    postcode: string;
                    profile_id: string;
                    state: Database["public"]["Enums"]["malaysian_state"];
                    updated_at?: string;
                };
                Update: {
                    address_line_1?: string;
                    address_line_2?: string | null;
                    address_type?: Database["public"]["Enums"]["address_type"];
                    city?: string;
                    country?: string;
                    created_at?: string;
                    id?: string;
                    is_primary?: boolean | null;
                    postcode?: string;
                    profile_id?: string;
                    state?: Database["public"]["Enums"]["malaysian_state"];
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "profile_addresses_profile_id_fkey";
                        columns: ["profile_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profiles: {
                Row: {
                    created_at: string;
                    full_name: string;
                    home_masjid_id: string | null;
                    id: string;
                    is_complete: boolean | null;
                    phone_number: string | null;
                    preferred_language: Database["public"]["Enums"]["language_code"];
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    full_name: string;
                    home_masjid_id?: string | null;
                    id?: string;
                    is_complete?: boolean | null;
                    phone_number?: string | null;
                    preferred_language?: Database["public"]["Enums"]["language_code"];
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    full_name?: string;
                    home_masjid_id?: string | null;
                    id?: string;
                    is_complete?: boolean | null;
                    phone_number?: string | null;
                    preferred_language?: Database["public"]["Enums"]["language_code"];
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "fk_profiles_home_masjid";
                        columns: ["home_masjid_id"];
                        isOneToOne: false;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "profiles_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: true;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            sponsorships: {
                Row: {
                    amount: number;
                    content_id: string;
                    created_at: string | null;
                    currency: string;
                    id: string;
                    masjid_id: string;
                    payment_date: string | null;
                    payment_method: Database["public"]["Enums"]["payment_method"];
                    payment_reference: string;
                    payment_status: Database["public"]["Enums"]["payment_status"];
                    show_sponsor_name: boolean;
                    sponsor_email: string | null;
                    sponsor_message: string | null;
                    sponsor_name: string;
                    sponsor_phone: string | null;
                    tier: Database["public"]["Enums"]["sponsorship_tier"];
                    updated_at: string | null;
                };
                Insert: {
                    amount: number;
                    content_id: string;
                    created_at?: string | null;
                    currency?: string;
                    id?: string;
                    masjid_id: string;
                    payment_date?: string | null;
                    payment_method: Database["public"]["Enums"]["payment_method"];
                    payment_reference: string;
                    payment_status?: Database["public"]["Enums"]["payment_status"];
                    show_sponsor_name?: boolean;
                    sponsor_email?: string | null;
                    sponsor_message?: string | null;
                    sponsor_name: string;
                    sponsor_phone?: string | null;
                    tier: Database["public"]["Enums"]["sponsorship_tier"];
                    updated_at?: string | null;
                };
                Update: {
                    amount?: number;
                    content_id?: string;
                    created_at?: string | null;
                    currency?: string;
                    id?: string;
                    masjid_id?: string;
                    payment_date?: string | null;
                    payment_method?: Database["public"]["Enums"]["payment_method"];
                    payment_reference?: string;
                    payment_status?: Database["public"]["Enums"]["payment_status"];
                    show_sponsor_name?: boolean;
                    sponsor_email?: string | null;
                    sponsor_message?: string | null;
                    sponsor_name?: string;
                    sponsor_phone?: string | null;
                    tier?: Database["public"]["Enums"]["sponsorship_tier"];
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "sponsorships_content_id_fkey";
                        columns: ["content_id"];
                        isOneToOne: false;
                        referencedRelation: "display_content";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "sponsorships_masjid_id_fkey";
                        columns: ["masjid_id"];
                        isOneToOne: false;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    }
                ];
            };
            tv_displays: {
                Row: {
                    auto_refresh_interval: number;
                    carousel_interval: number;
                    content_transition_type: string;
                    created_at: string | null;
                    description: string | null;
                    display_name: string;
                    heartbeat_interval: number;
                    id: string;
                    is_active: boolean;
                    is_touch_enabled: boolean;
                    last_heartbeat: string | null;
                    location_description: string | null;
                    masjid_id: string;
                    max_content_items: number;
                    max_retry_attempts: number;
                    offline_cache_duration: number;
                    orientation: Database["public"]["Enums"]["display_orientation"];
                    prayer_time_background_opacity: number;
                    prayer_time_color: string;
                    prayer_time_font_size: string;
                    prayer_time_position: Database["public"]["Enums"]["prayer_time_position"];
                    resolution: Database["public"]["Enums"]["display_resolution"];
                    retry_backoff_multiplier: number;
                    show_sponsorship_amounts: boolean;
                    sponsorship_tier_colors: Json;
                    updated_at: string | null;
                };
                Insert: {
                    auto_refresh_interval?: number;
                    carousel_interval?: number;
                    content_transition_type?: string;
                    created_at?: string | null;
                    description?: string | null;
                    display_name: string;
                    heartbeat_interval?: number;
                    id?: string;
                    is_active?: boolean;
                    is_touch_enabled?: boolean;
                    last_heartbeat?: string | null;
                    location_description?: string | null;
                    masjid_id: string;
                    max_content_items?: number;
                    max_retry_attempts?: number;
                    offline_cache_duration?: number;
                    orientation?: Database["public"]["Enums"]["display_orientation"];
                    prayer_time_background_opacity?: number;
                    prayer_time_color?: string;
                    prayer_time_font_size?: string;
                    prayer_time_position?: Database["public"]["Enums"]["prayer_time_position"];
                    resolution?: Database["public"]["Enums"]["display_resolution"];
                    retry_backoff_multiplier?: number;
                    show_sponsorship_amounts?: boolean;
                    sponsorship_tier_colors?: Json;
                    updated_at?: string | null;
                };
                Update: {
                    auto_refresh_interval?: number;
                    carousel_interval?: number;
                    content_transition_type?: string;
                    created_at?: string | null;
                    description?: string | null;
                    display_name?: string;
                    heartbeat_interval?: number;
                    id?: string;
                    is_active?: boolean;
                    is_touch_enabled?: boolean;
                    last_heartbeat?: string | null;
                    location_description?: string | null;
                    masjid_id?: string;
                    max_content_items?: number;
                    max_retry_attempts?: number;
                    offline_cache_duration?: number;
                    orientation?: Database["public"]["Enums"]["display_orientation"];
                    prayer_time_background_opacity?: number;
                    prayer_time_color?: string;
                    prayer_time_font_size?: string;
                    prayer_time_position?: Database["public"]["Enums"]["prayer_time_position"];
                    resolution?: Database["public"]["Enums"]["display_resolution"];
                    retry_backoff_multiplier?: number;
                    show_sponsorship_amounts?: boolean;
                    sponsorship_tier_colors?: Json;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "tv_displays_masjid_id_fkey";
                        columns: ["masjid_id"];
                        isOneToOne: false;
                        referencedRelation: "masjids";
                        referencedColumns: ["id"];
                    }
                ];
            };
            users: {
                Row: {
                    created_at: string;
                    email: string;
                    email_verified: boolean | null;
                    id: string;
                    last_sign_in_at: string | null;
                    role: Database["public"]["Enums"]["user_role"];
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    email: string;
                    email_verified?: boolean | null;
                    id: string;
                    last_sign_in_at?: string | null;
                    role?: Database["public"]["Enums"]["user_role"];
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    email?: string;
                    email_verified?: boolean | null;
                    id?: string;
                    last_sign_in_at?: string | null;
                    role?: Database["public"]["Enums"]["user_role"];
                    updated_at?: string;
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
                    approval_notes?: string;
                    approving_user_id: string;
                };
                Returns: boolean;
            };
            approve_content: {
                Args: {
                    approver_id: string;
                    content_id: string;
                    notes?: string;
                };
                Returns: {
                    approval_notes: string | null;
                    approved_at: string | null;
                    approved_by: string | null;
                    created_at: string | null;
                    description: string | null;
                    display_id: string | null;
                    duration: number;
                    end_date: string;
                    file_size: number | null;
                    file_type: string | null;
                    id: string;
                    masjid_id: string;
                    payment_reference: string | null;
                    payment_status: Database["public"]["Enums"]["payment_status"];
                    rejection_reason: string | null;
                    resubmission_of: string | null;
                    sponsorship_amount: number;
                    sponsorship_tier: Database["public"]["Enums"]["sponsorship_tier"] | null;
                    start_date: string;
                    status: Database["public"]["Enums"]["content_status"];
                    submitted_at: string | null;
                    submitted_by: string;
                    thumbnail_url: string | null;
                    title: string;
                    type: Database["public"]["Enums"]["content_type"];
                    updated_at: string | null;
                    url: string;
                };
            };
            cleanup_expired_content: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            complete_user_profile: {
                Args: {
                    address_data: Json;
                    profile_data: Json;
                };
                Returns: Json;
            };
            get_display_content: {
                Args: {
                    p_display_id: string;
                    p_limit?: number;
                };
                Returns: {
                    duration: number;
                    id: string;
                    sponsor_name: string;
                    sponsorship_amount: number;
                    sponsorship_tier: Database["public"]["Enums"]["sponsorship_tier"];
                    thumbnail_url: string;
                    title: string;
                    type: Database["public"]["Enums"]["content_type"];
                    url: string;
                }[];
            };
            get_masjid_admin_list: {
                Args: {
                    target_masjid_id: string;
                };
                Returns: {
                    assigned_at: string;
                    assignment_status: Database["public"]["Enums"]["admin_assignment_status"];
                    email: string;
                    full_name: string;
                    phone_number: string;
                    user_id: string;
                }[];
            };
            get_masjid_applications: {
                Args: {
                    target_masjid_id: string;
                };
                Returns: {
                    application_id: string;
                    application_message: string;
                    applied_at: string;
                    review_notes: string;
                    reviewed_at: string;
                    reviewer_email: string;
                    status: Database["public"]["Enums"]["application_status"];
                    user_email: string;
                    user_full_name: string;
                    user_id: string;
                }[];
            };
            get_masjids_by_jakim_zone: {
                Args: {
                    target_zone: string;
                };
                Returns: {
                    address: Json;
                    id: string;
                    jakim_zone_code: string;
                    name: string;
                    status: Database["public"]["Enums"]["masjid_status"];
                }[];
            };
            get_masjids_by_state: {
                Args: {
                    target_state: string;
                };
                Returns: {
                    address: Json;
                    distance_score: number;
                    id: string;
                    name: string;
                    status: Database["public"]["Enums"]["masjid_status"];
                }[];
            };
            get_pending_applications: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    application_id: string;
                    application_message: string;
                    applied_at: string;
                    masjid_id: string;
                    masjid_name: string;
                    user_email: string;
                    user_full_name: string;
                    user_id: string;
                    user_phone: string;
                }[];
            };
            get_pending_approvals_count: {
                Args: {
                    admin_user_id: string;
                };
                Returns: number;
            };
            get_resubmission_history: {
                Args: {
                    content_id: string;
                };
                Returns: {
                    approval_notes: string;
                    approved_at: string;
                    id: string;
                    rejection_reason: string;
                    status: Database["public"]["Enums"]["content_status"];
                    submitted_at: string;
                    title: string;
                }[];
            };
            get_user_admin_assignments: {
                Args: {
                    target_user_id: string;
                };
                Returns: {
                    approved_at: string;
                    approved_by_email: string;
                    assignment_id: string;
                    assignment_status: Database["public"]["Enums"]["admin_assignment_status"];
                    masjid_id: string;
                    masjid_name: string;
                }[];
            };
            get_user_admin_masjids: {
                Args: Record<PropertyKey, never>;
                Returns: string[];
            };
            get_user_role: {
                Args: Record<PropertyKey, never>;
                Returns: Database["public"]["Enums"]["user_role"];
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
                    target_masjid_id: string;
                    target_user_id: string;
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
            reject_content: {
                Args: {
                    approver_id: string;
                    content_id: string;
                    notes?: string;
                    reason: string;
                };
                Returns: {
                    approval_notes: string | null;
                    approved_at: string | null;
                    approved_by: string | null;
                    created_at: string | null;
                    description: string | null;
                    display_id: string | null;
                    duration: number;
                    end_date: string;
                    file_size: number | null;
                    file_type: string | null;
                    id: string;
                    masjid_id: string;
                    payment_reference: string | null;
                    payment_status: Database["public"]["Enums"]["payment_status"];
                    rejection_reason: string | null;
                    resubmission_of: string | null;
                    sponsorship_amount: number;
                    sponsorship_tier: Database["public"]["Enums"]["sponsorship_tier"] | null;
                    start_date: string;
                    status: Database["public"]["Enums"]["content_status"];
                    submitted_at: string | null;
                    submitted_by: string;
                    thumbnail_url: string | null;
                    title: string;
                    type: Database["public"]["Enums"]["content_type"];
                    updated_at: string | null;
                    url: string;
                };
            };
            revoke_admin_assignment: {
                Args: {
                    revoking_user_id: string;
                    target_assignment_id: string;
                };
                Returns: boolean;
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
            address_type: "home" | "work" | "other";
            admin_assignment_status: "active" | "inactive" | "pending" | "revoked";
            application_status: "pending" | "approved" | "rejected" | "withdrawn";
            content_status: "pending" | "active" | "expired" | "rejected";
            content_type: "image" | "youtube_video" | "text_announcement" | "event_poster";
            display_orientation: "landscape" | "portrait";
            display_resolution: "1920x1080" | "3840x2160" | "1366x768" | "2560x1440";
            language_code: "en" | "ms" | "zh" | "ta";
            malaysian_state: "Johor" | "Kedah" | "Kelantan" | "Malacca" | "Negeri Sembilan" | "Pahang" | "Penang" | "Perak" | "Perlis" | "Sabah" | "Sarawak" | "Selangor" | "Terengganu" | "Kuala Lumpur" | "Labuan" | "Putrajaya";
            masjid_status: "active" | "inactive" | "pending_verification";
            payment_method: "fpx" | "credit_card" | "bank_transfer" | "cash";
            payment_status: "pending" | "paid" | "failed" | "refunded";
            prayer_source_enum: "manual" | "jakim" | "auto";
            prayer_time_position: "top" | "bottom" | "left" | "right" | "center" | "hidden";
            prayer_time_source: "JAKIM_API" | "MANUAL_ENTRY" | "CACHED_FALLBACK";
            sponsorship_tier: "bronze" | "silver" | "gold" | "platinum";
            user_role: "super_admin" | "masjid_admin" | "registered" | "public";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    storage: {
        Tables: {
            buckets: {
                Row: {
                    allowed_mime_types: string[] | null;
                    avif_autodetection: boolean | null;
                    created_at: string | null;
                    file_size_limit: number | null;
                    id: string;
                    name: string;
                    owner: string | null;
                    owner_id: string | null;
                    public: boolean | null;
                    type: Database["storage"]["Enums"]["buckettype"];
                    updated_at: string | null;
                };
                Insert: {
                    allowed_mime_types?: string[] | null;
                    avif_autodetection?: boolean | null;
                    created_at?: string | null;
                    file_size_limit?: number | null;
                    id: string;
                    name: string;
                    owner?: string | null;
                    owner_id?: string | null;
                    public?: boolean | null;
                    type?: Database["storage"]["Enums"]["buckettype"];
                    updated_at?: string | null;
                };
                Update: {
                    allowed_mime_types?: string[] | null;
                    avif_autodetection?: boolean | null;
                    created_at?: string | null;
                    file_size_limit?: number | null;
                    id?: string;
                    name?: string;
                    owner?: string | null;
                    owner_id?: string | null;
                    public?: boolean | null;
                    type?: Database["storage"]["Enums"]["buckettype"];
                    updated_at?: string | null;
                };
                Relationships: [];
            };
            buckets_analytics: {
                Row: {
                    created_at: string;
                    format: string;
                    id: string;
                    type: Database["storage"]["Enums"]["buckettype"];
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    format?: string;
                    id: string;
                    type?: Database["storage"]["Enums"]["buckettype"];
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    format?: string;
                    id?: string;
                    type?: Database["storage"]["Enums"]["buckettype"];
                    updated_at?: string;
                };
                Relationships: [];
            };
            iceberg_namespaces: {
                Row: {
                    bucket_id: string;
                    created_at: string;
                    id: string;
                    name: string;
                    updated_at: string;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string;
                    id?: string;
                    name: string;
                    updated_at?: string;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string;
                    id?: string;
                    name?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "iceberg_namespaces_bucket_id_fkey";
                        columns: ["bucket_id"];
                        isOneToOne: false;
                        referencedRelation: "buckets_analytics";
                        referencedColumns: ["id"];
                    }
                ];
            };
            iceberg_tables: {
                Row: {
                    bucket_id: string;
                    created_at: string;
                    id: string;
                    location: string;
                    name: string;
                    namespace_id: string;
                    updated_at: string;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string;
                    id?: string;
                    location: string;
                    name: string;
                    namespace_id: string;
                    updated_at?: string;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string;
                    id?: string;
                    location?: string;
                    name?: string;
                    namespace_id?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "iceberg_tables_bucket_id_fkey";
                        columns: ["bucket_id"];
                        isOneToOne: false;
                        referencedRelation: "buckets_analytics";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "iceberg_tables_namespace_id_fkey";
                        columns: ["namespace_id"];
                        isOneToOne: false;
                        referencedRelation: "iceberg_namespaces";
                        referencedColumns: ["id"];
                    }
                ];
            };
            migrations: {
                Row: {
                    executed_at: string | null;
                    hash: string;
                    id: number;
                    name: string;
                };
                Insert: {
                    executed_at?: string | null;
                    hash: string;
                    id: number;
                    name: string;
                };
                Update: {
                    executed_at?: string | null;
                    hash?: string;
                    id?: number;
                    name?: string;
                };
                Relationships: [];
            };
            objects: {
                Row: {
                    bucket_id: string | null;
                    created_at: string | null;
                    id: string;
                    last_accessed_at: string | null;
                    level: number | null;
                    metadata: Json | null;
                    name: string | null;
                    owner: string | null;
                    owner_id: string | null;
                    path_tokens: string[] | null;
                    updated_at: string | null;
                    user_metadata: Json | null;
                    version: string | null;
                };
                Insert: {
                    bucket_id?: string | null;
                    created_at?: string | null;
                    id?: string;
                    last_accessed_at?: string | null;
                    level?: number | null;
                    metadata?: Json | null;
                    name?: string | null;
                    owner?: string | null;
                    owner_id?: string | null;
                    path_tokens?: string[] | null;
                    updated_at?: string | null;
                    user_metadata?: Json | null;
                    version?: string | null;
                };
                Update: {
                    bucket_id?: string | null;
                    created_at?: string | null;
                    id?: string;
                    last_accessed_at?: string | null;
                    level?: number | null;
                    metadata?: Json | null;
                    name?: string | null;
                    owner?: string | null;
                    owner_id?: string | null;
                    path_tokens?: string[] | null;
                    updated_at?: string | null;
                    user_metadata?: Json | null;
                    version?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "objects_bucketId_fkey";
                        columns: ["bucket_id"];
                        isOneToOne: false;
                        referencedRelation: "buckets";
                        referencedColumns: ["id"];
                    }
                ];
            };
            prefixes: {
                Row: {
                    bucket_id: string;
                    created_at: string | null;
                    level: number;
                    name: string;
                    updated_at: string | null;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string | null;
                    level?: number;
                    name: string;
                    updated_at?: string | null;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string | null;
                    level?: number;
                    name?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "prefixes_bucketId_fkey";
                        columns: ["bucket_id"];
                        isOneToOne: false;
                        referencedRelation: "buckets";
                        referencedColumns: ["id"];
                    }
                ];
            };
            s3_multipart_uploads: {
                Row: {
                    bucket_id: string;
                    created_at: string;
                    id: string;
                    in_progress_size: number;
                    key: string;
                    owner_id: string | null;
                    upload_signature: string;
                    user_metadata: Json | null;
                    version: string;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string;
                    id: string;
                    in_progress_size?: number;
                    key: string;
                    owner_id?: string | null;
                    upload_signature: string;
                    user_metadata?: Json | null;
                    version: string;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string;
                    id?: string;
                    in_progress_size?: number;
                    key?: string;
                    owner_id?: string | null;
                    upload_signature?: string;
                    user_metadata?: Json | null;
                    version?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "s3_multipart_uploads_bucket_id_fkey";
                        columns: ["bucket_id"];
                        isOneToOne: false;
                        referencedRelation: "buckets";
                        referencedColumns: ["id"];
                    }
                ];
            };
            s3_multipart_uploads_parts: {
                Row: {
                    bucket_id: string;
                    created_at: string;
                    etag: string;
                    id: string;
                    key: string;
                    owner_id: string | null;
                    part_number: number;
                    size: number;
                    upload_id: string;
                    version: string;
                };
                Insert: {
                    bucket_id: string;
                    created_at?: string;
                    etag: string;
                    id?: string;
                    key: string;
                    owner_id?: string | null;
                    part_number: number;
                    size?: number;
                    upload_id: string;
                    version: string;
                };
                Update: {
                    bucket_id?: string;
                    created_at?: string;
                    etag?: string;
                    id?: string;
                    key?: string;
                    owner_id?: string | null;
                    part_number?: number;
                    size?: number;
                    upload_id?: string;
                    version?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey";
                        columns: ["bucket_id"];
                        isOneToOne: false;
                        referencedRelation: "buckets";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey";
                        columns: ["upload_id"];
                        isOneToOne: false;
                        referencedRelation: "s3_multipart_uploads";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            add_prefixes: {
                Args: {
                    _bucket_id: string;
                    _name: string;
                };
                Returns: undefined;
            };
            can_insert_object: {
                Args: {
                    bucketid: string;
                    metadata: Json;
                    name: string;
                    owner: string;
                };
                Returns: undefined;
            };
            delete_leaf_prefixes: {
                Args: {
                    bucket_ids: string[];
                    names: string[];
                };
                Returns: undefined;
            };
            delete_prefix: {
                Args: {
                    _bucket_id: string;
                    _name: string;
                };
                Returns: boolean;
            };
            extension: {
                Args: {
                    name: string;
                };
                Returns: string;
            };
            filename: {
                Args: {
                    name: string;
                };
                Returns: string;
            };
            foldername: {
                Args: {
                    name: string;
                };
                Returns: string[];
            };
            get_level: {
                Args: {
                    name: string;
                };
                Returns: number;
            };
            get_prefix: {
                Args: {
                    name: string;
                };
                Returns: string;
            };
            get_prefixes: {
                Args: {
                    name: string;
                };
                Returns: string[];
            };
            get_size_by_bucket: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    bucket_id: string;
                    size: number;
                }[];
            };
            list_multipart_uploads_with_delimiter: {
                Args: {
                    bucket_id: string;
                    delimiter_param: string;
                    max_keys?: number;
                    next_key_token?: string;
                    next_upload_token?: string;
                    prefix_param: string;
                };
                Returns: {
                    created_at: string;
                    id: string;
                    key: string;
                }[];
            };
            list_objects_with_delimiter: {
                Args: {
                    bucket_id: string;
                    delimiter_param: string;
                    max_keys?: number;
                    next_token?: string;
                    prefix_param: string;
                    start_after?: string;
                };
                Returns: {
                    id: string;
                    metadata: Json;
                    name: string;
                    updated_at: string;
                }[];
            };
            lock_top_prefixes: {
                Args: {
                    bucket_ids: string[];
                    names: string[];
                };
                Returns: undefined;
            };
            operation: {
                Args: Record<PropertyKey, never>;
                Returns: string;
            };
            search: {
                Args: {
                    bucketname: string;
                    levels?: number;
                    limits?: number;
                    offsets?: number;
                    prefix: string;
                    search?: string;
                    sortcolumn?: string;
                    sortorder?: string;
                };
                Returns: {
                    created_at: string;
                    id: string;
                    last_accessed_at: string;
                    metadata: Json;
                    name: string;
                    updated_at: string;
                }[];
            };
            search_legacy_v1: {
                Args: {
                    bucketname: string;
                    levels?: number;
                    limits?: number;
                    offsets?: number;
                    prefix: string;
                    search?: string;
                    sortcolumn?: string;
                    sortorder?: string;
                };
                Returns: {
                    created_at: string;
                    id: string;
                    last_accessed_at: string;
                    metadata: Json;
                    name: string;
                    updated_at: string;
                }[];
            };
            search_v1_optimised: {
                Args: {
                    bucketname: string;
                    levels?: number;
                    limits?: number;
                    offsets?: number;
                    prefix: string;
                    search?: string;
                    sortcolumn?: string;
                    sortorder?: string;
                };
                Returns: {
                    created_at: string;
                    id: string;
                    last_accessed_at: string;
                    metadata: Json;
                    name: string;
                    updated_at: string;
                }[];
            };
            search_v2: {
                Args: {
                    bucket_name: string;
                    levels?: number;
                    limits?: number;
                    prefix: string;
                    sort_column?: string;
                    sort_column_after?: string;
                    sort_order?: string;
                    start_after?: string;
                };
                Returns: {
                    created_at: string;
                    id: string;
                    key: string;
                    last_accessed_at: string;
                    metadata: Json;
                    name: string;
                    updated_at: string;
                }[];
            };
        };
        Enums: {
            buckettype: "STANDARD" | "ANALYTICS";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];
export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
    schema: keyof DatabaseWithoutInternals;
}, EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
    schema: keyof DatabaseWithoutInternals;
}, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;
export declare const Constants: {
    readonly graphql_public: {
        readonly Enums: {};
    };
    readonly public: {
        readonly Enums: {
            readonly address_type: readonly ["home", "work", "other"];
            readonly admin_assignment_status: readonly ["active", "inactive", "pending", "revoked"];
            readonly application_status: readonly ["pending", "approved", "rejected", "withdrawn"];
            readonly content_status: readonly ["pending", "active", "expired", "rejected"];
            readonly content_type: readonly ["image", "youtube_video", "text_announcement", "event_poster"];
            readonly display_orientation: readonly ["landscape", "portrait"];
            readonly display_resolution: readonly ["1920x1080", "3840x2160", "1366x768", "2560x1440"];
            readonly language_code: readonly ["en", "ms", "zh", "ta"];
            readonly malaysian_state: readonly ["Johor", "Kedah", "Kelantan", "Malacca", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"];
            readonly masjid_status: readonly ["active", "inactive", "pending_verification"];
            readonly payment_method: readonly ["fpx", "credit_card", "bank_transfer", "cash"];
            readonly payment_status: readonly ["pending", "paid", "failed", "refunded"];
            readonly prayer_source_enum: readonly ["manual", "jakim", "auto"];
            readonly prayer_time_position: readonly ["top", "bottom", "left", "right", "center", "hidden"];
            readonly prayer_time_source: readonly ["JAKIM_API", "MANUAL_ENTRY", "CACHED_FALLBACK"];
            readonly sponsorship_tier: readonly ["bronze", "silver", "gold", "platinum"];
            readonly user_role: readonly ["super_admin", "masjid_admin", "registered", "public"];
        };
    };
    readonly storage: {
        readonly Enums: {
            readonly buckettype: readonly ["STANDARD", "ANALYTICS"];
        };
    };
};
export {};
//# sourceMappingURL=database.d.ts.map