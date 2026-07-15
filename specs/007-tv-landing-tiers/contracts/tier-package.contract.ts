/**
 * Contract: Tier Package Data Service
 * Purpose: Define the contract for fetching and managing tier package metadata
 * 
 * This contract defines the interface for tier data that the landing page consumes.
 * All tiers (Asas, Maju, Gemilang, Istimewa) are returned as static data from this service.
 */

// ============================================================================
// INPUT / REQUEST CONTRACTS
// ============================================================================

/**
 * Request: Fetch all tier packages
 * No parameters required; returns all 4 tiers
 */
export interface FetchTiersRequest {
  // No parameters
}

/**
 * Response: Array of all tier packages
 */
export interface FetchTiersResponse {
  tiers: TierPackageDTO[];
}

// ============================================================================
// OUTPUT / DATA TRANSFER OBJECTS
// ============================================================================

export interface TierPackageDTO {
  id: 'asas' | 'maju' | 'gemilang' | 'istimewa';
  
  // Display names in both languages
  name_ms: string;        // e.g., "Asas (Percuma)"
  name_en: string;        // e.g., "Asas (Free)"
  
  // Marketing blurbs
  description_ms: string; // Full Bahasa Malaysia description
  description_en: string; // Full English description
  
  // Pricing display
  price_ms: string | null;       // e.g., "Percuma" or "RM ~75"
  price_en: string | null;       // e.g., "Free" or "RM ~75"
  
  // Feature flags
  max_screens: number | null;     // null = unlimited, 1 = single, etc.
  requires_login: boolean;
  requires_admin_dashboard: boolean;
  customization_type: 'none' | 'managed_service' | 'self_service';
  support_level: 'basic' | 'standard' | 'priority';
  
  // Features list (for rendering checkmarks)
  features: string[];             // e.g., ["official_prayer_times", "custom_messages"]
  
  // Call-to-action button text
  cta_text_ms: string;            // e.g., "Mulai Percuma", "Hubungi Kami", "Tukar Pelan"
  cta_text_en: string;
  
  // CTA action type (for routing/navigation)
  cta_action: 'start_free' | 'contact_sales' | 'upgrade_tier' | 'admin_login';
  
  // Optional: Icon/badge for visual hierarchy
  icon?: string;                  // e.g., "Star", "Zap", "Crown"
  badge?: string;                 // e.g., "Popular", "Best Value"
  
  // Metadata
  display_order: number;           // 1-4 for sorting on landing page
  is_featured: boolean;            // Whether to highlight this tier
}

// ============================================================================
// EXAMPLE DATA (from spec)
// ============================================================================

/**
 * Example: Asas Tier (Free)
 */
export const EXAMPLE_ASAS_TIER: TierPackageDTO = {
  id: 'asas',
  name_ms: 'Asas (Percuma)',
  name_en: 'Asas (Free)',
  description_ms: 'Sahaja TV Masjid mudah dan percuma – paparkan waktu solat JAKIM di TV anda dalam 2 minit tanpa pendaftaran. Pilih zon waktu, dan paparan rasmi akan mula berjalan dengan latar belakang standard. Tiada bayaran, tiada komitmen.',
  description_en: 'Simple, free Sahaja TV – display official JAKIM prayer times on your TV in 2 minutes without registration. Select your time zone, and the official display starts with a standard background. No payment, no commitment.',
  price_ms: 'Percuma',
  price_en: 'Free',
  max_screens: 1,
  requires_login: false,
  requires_admin_dashboard: false,
  customization_type: 'none',
  support_level: 'basic',
  features: [
    'official_jakim_prayer_times',
    'jakim_zone_selection',
    'default_background',
    'multiple_languages',
    'no_login_required'
  ],
  cta_text_ms: 'Mulai Percuma',
  cta_text_en: 'Start Free',
  cta_action: 'start_free',
  display_order: 1,
  is_featured: true
};

/**
 * Example: Maju Tier (Pro, Managed Service)
 */
export const EXAMPLE_MAJU_TIER: TierPackageDTO = {
  id: 'maju',
  name_ms: 'Maju (Pro)',
  name_en: 'Maju (Pro)',
  description_ms: 'Paparkan gaya tersendiri dengan bantuan kami! Termasuk 3 gambar atau grafik tersuai setiap bulan — hantar apa yang anda mahu melalui WhatsApp, dan kami kemas kini paparan. Anda tidak perlu log masuk – fokus pada ibadah, biar kami urus paparan TV masjid anda.',
  description_en: 'Show your own style with our help! Includes 3 custom images or graphics every month — send what you want via WhatsApp, and we update your display. You don\'t need to log in – focus on worship, let us manage your mosque TV display.',
  price_ms: 'RM ~75',
  price_en: 'RM ~75',
  max_screens: 1,
  requires_login: false,
  requires_admin_dashboard: false,
  customization_type: 'managed_service',
  support_level: 'standard',
  features: [
    'official_jakim_prayer_times',
    'custom_backgrounds',
    'custom_messages_monthly',
    'whatsapp_support',
    'assisted_updates'
  ],
  cta_text_ms: 'Hubungi Kami',
  cta_text_en: 'Contact Us',
  cta_action: 'contact_sales',
  display_order: 2,
  is_featured: false
};

/**
 * Example: Gemilang Tier (Premium, Self-Service)
 */
export const EXAMPLE_GEMILANG_TIER: TierPackageDTO = {
  id: 'gemilang',
  name_ms: 'Gemilang (Premium)',
  name_en: 'Gemilang (Premium)',
  description_ms: 'Kuasa penuh kawalan! Daftar masuk ke papan pemuka mesra pengguna untuk muat naik gambar, jadualkan pengumuman, dan kendalikan berbilang skrin sendiri. Termasuk support dan latihan ringkas. Selesaikan semuanya sendiri – fleksibiliti maksima bagi masjid sederhana hingga besar.',
  description_en: 'Full control power! Log in to a user-friendly dashboard to upload images, schedule announcements, and manage multiple screens yourself. Includes support and brief training. Do it all yourself – maximum flexibility for medium to large mosques.',
  price_ms: 'RM ~150',
  price_en: 'RM ~150',
  max_screens: null,  // Unlimited
  requires_login: true,
  requires_admin_dashboard: true,
  customization_type: 'self_service',
  support_level: 'priority',
  features: [
    'official_jakim_prayer_times',
    'admin_dashboard',
    'unlimited_screens',
    'unlimited_customization',
    'scheduled_announcements',
    'priority_support',
    'training_included'
  ],
  cta_text_ms: 'Daftar Sekarang',
  cta_text_en: 'Sign Up Now',
  cta_action: 'admin_login',
  display_order: 3,
  is_featured: true
};

/**
 * Example: Istimewa Tier (Enterprise)
 */
export const EXAMPLE_ISTIMEWA_TIER: TierPackageDTO = {
  id: 'istimewa',
  name_ms: 'Istimewa (Enterprise)',
  name_en: 'Istimewa (Enterprise)',
  description_ms: 'Pakej tertinggi kami – bina paparan TV mengikut impian anda. Dari integrasi domain khusus hingga sokongan pembangunan API atau penggunaan multi-cawangan, kami akan rekaan khas yang memuatkan semua keperluan masjid besar anda. Hubungi untuk perbincangan dan sebut harga.',
  description_en: 'Our highest tier – build your TV display according to your dreams. From custom domain integration to API development support or multi-branch usage, we create custom solutions that meet all your large mosque needs. Contact us for discussion and pricing.',
  price_ms: 'Hubungi untuk Sebut Harga',
  price_en: 'Contact for Pricing',
  max_screens: null,  // Unlimited
  requires_login: true,
  requires_admin_dashboard: true,
  customization_type: 'self_service',
  support_level: 'priority',
  features: [
    'official_jakim_prayer_times',
    'admin_dashboard',
    'unlimited_screens',
    'unlimited_customization',
    'api_access',
    'custom_domain',
    'multi_branch_support',
    'dedicated_account_manager'
  ],
  cta_text_ms: 'Hubungi Kami',
  cta_text_en: 'Contact Us',
  cta_action: 'contact_sales',
  display_order: 4,
  is_featured: false,
  icon: 'Crown'
};

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface ITierPackageService {
  /**
   * Fetch all 4 tier packages
   * @returns Promise resolving to FetchTiersResponse with all tiers
   */
  fetchAllTiers(): Promise<FetchTiersResponse>;
  
  /**
   * Fetch a single tier by ID
   * @param tierId - One of 'asas' | 'maju' | 'gemilang' | 'istimewa'
   * @returns Promise resolving to the single tier, or null if not found
   */
  fetchTierById(tierId: string): Promise<TierPackageDTO | null>;
  
  /**
   * Fetch tiers sorted for landing page display
   * @returns Promise resolving to tiers sorted by display_order with featured tiers highlighted
   */
  fetchTiersForLanding(): Promise<TierPackageDTO[]>;
}

// ============================================================================
// ERROR CONTRACTS
// ============================================================================

export interface TierPackageError {
  code: 'TIER_NOT_FOUND' | 'TIER_SERVICE_UNAVAILABLE' | 'INVALID_TIER_ID';
  message: string;
  tier_id?: string;
}
