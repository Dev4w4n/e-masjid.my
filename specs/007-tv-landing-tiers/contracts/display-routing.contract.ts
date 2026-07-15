/**
 * Contract: Display Routing & Landing Page Service
 * Purpose: Define the contract for navigating between landing page, zone selection, and display pages
 * 
 * This contract defines the routing logic that guides users through the discovery funnel:
 * Landing Page → Zone Selection Modal → Display Page
 */

// ============================================================================
// INPUT / REQUEST CONTRACTS
// ============================================================================

/**
 * Request: Load landing page
 * Fetches all tier data and zone list for initial page render
 */
export interface LoadLandingPageRequest {
  language: 'ms' | 'en';  // User's language preference
}

/**
 * Response: Landing page data (tiers, zones, FAQs)
 */
export interface LoadLandingPageResponse {
  tiers: TierPackageDTO[];
  zones: JAKIMZoneDTO[];
  faqs: FAQItemDTO[];
  page_metadata: {
    title_ms: string;
    title_en: string;
    description_ms: string;
    description_en: string;
    hero_image_url?: string;
  };
}

/**
 * Request: Open zone selection modal
 * Called when user clicks "Cari kawasan anda" CTA
 */
export interface OpenZoneModalRequest {
  language: 'ms' | 'en';
  current_user_zone?: string;  // Optional: pre-select if user's zone known
}

/**
 * Response: Zone data for modal display
 */
export interface OpenZoneModalResponse {
  zones: JAKIMZoneDTO[];
  total_zones: number;
}

/**
 * Request: Navigate to display page
 * Called when user selects a zone or clicks an existing display link
 */
export interface NavigateToDisplayRequest {
  display_id: string;
  zone_code?: string;
  referer?: 'landing_page' | 'zone_modal' | 'search' | 'link';
}

/**
 * Response: Display page initialization data
 */
export interface NavigateToDisplayResponse {
  display_id: string;
  masjid_id: string;
  zone_code: string;
  tier: 'asas' | 'maju' | 'gemilang' | 'istimewa';
  prayer_times: PrayerTimesDTO;
  masjid_name: string;
  masjid_name_en?: string;
  can_upgrade: boolean;
  can_switch_zone: boolean;
  route_path: string;
}

/**
 * Request: Initiate tier upgrade
 * Called when user clicks "Upgrade" or "Tukar Pelan" button from display page
 */
export interface InitiateTierUpgradeRequest {
  current_display_id: string;
  current_tier: string;
  target_tier: string;
}

/**
 * Response: Upgrade flow confirmation
 */
export interface InitiateTierUpgradeResponse {
  upgrade_id: string;
  current_tier: string;
  target_tier: string;
  action: 'open_contact_form' | 'open_checkout' | 'open_admin_signup';
  action_url?: string;
}

/**
 * Request: Switch to a different zone without upgrading
 * Called when user clicks "Switch Zone" from display page
 */
export interface SwitchZoneRequest {
  current_display_id: string;
  target_zone_code: string;
}

/**
 * Response: New display to load for the selected zone
 */
export interface SwitchZoneResponse {
  new_display_id: string;
  new_masjid_id: string;
  new_zone_code: string;
  new_prayer_times: PrayerTimesDTO;
  route_path: string;
}

// ============================================================================
// DATA TRANSFER OBJECTS
// ============================================================================

export interface TierPackageDTO {
  id: string;
  name_ms: string;
  name_en: string;
  description_ms: string;
  description_en: string;
  price_ms: string | null;
  price_en: string | null;
  max_screens: number | null;
  requires_login: boolean;
  requires_admin_dashboard: boolean;
  customization_type: string;
  support_level: string;
  features: string[];
  cta_text_ms: string;
  cta_text_en: string;
  cta_action: string;
  display_order: number;
  is_featured: boolean;
}

export interface JAKIMZoneDTO {
  zone_code: string;
  zone_name_ms: string;
  zone_name_en: string;
  state_ms: string;
  state_en: string;
  region: 'peninsular' | 'sabah' | 'sarawak';
  masjid_count: number;
  is_active: boolean;
}

export interface FAQItemDTO {
  id: string;
  question_ms: string;
  question_en: string;
  answer_ms: string;
  answer_en: string;
  category: 'tiers' | 'pricing' | 'screens' | 'support' | 'trial' | 'payment';
  display_order: number;
}

export interface PrayerTimesDTO {
  date: string;          // YYYY-MM-DD format
  fajr: string;         // HH:MM format
  sunrise: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  timezone: string;      // e.g., "Malaysia/Kuala_Lumpur"
  is_current: boolean;   // Whether these are today's times
}

// ============================================================================
// EXAMPLE DATA
// ============================================================================

export const EXAMPLE_LANDING_PAGE_DATA: LoadLandingPageResponse = {
  tiers: [
    {
      id: 'asas',
      name_ms: 'Asas (Percuma)',
      name_en: 'Asas (Free)',
      description_ms: 'Sahaja TV Masjid mudah dan percuma...',
      description_en: 'Simple, free Sahaja TV...',
      price_ms: 'Percuma',
      price_en: 'Free',
      max_screens: 1,
      requires_login: false,
      requires_admin_dashboard: false,
      customization_type: 'none',
      support_level: 'basic',
      features: ['official_jakim_prayer_times', 'default_background'],
      cta_text_ms: 'Mulai Percuma',
      cta_text_en: 'Start Free',
      cta_action: 'start_free',
      display_order: 1,
      is_featured: true
    }
  ],
  zones: [
    {
      zone_code: 'johor',
      zone_name_ms: 'Johor',
      zone_name_en: 'Johor',
      state_ms: 'Johor',
      state_en: 'Johor',
      region: 'peninsular',
      masjid_count: 3,
      is_active: true
    }
  ],
  faqs: [
    {
      id: 'faq-001',
      question_ms: 'Apakah perbezaan antara Free/Asas dan Maju?',
      question_en: 'What is the difference between Free/Asas and Maju?',
      answer_ms: 'Free/Asas hanya menyediakan satu paparan asas...',
      answer_en: 'Free/Asas only provides a basic single display...',
      category: 'tiers',
      display_order: 1
    }
  ],
  page_metadata: {
    title_ms: 'Sahaja TV Masjid - Paparan Waktu Solat JAKIM di TV Anda',
    title_en: 'Sahaja TV Mosque - Display Official JAKIM Prayer Times on Your TV',
    description_ms: 'Mudah, percuma, atau dengan ciri-ciri premium - cari kawasan anda dan mulai dalam 2 minit.',
    description_en: 'Simple, free, or with premium features - find your zone and start in 2 minutes.',
    hero_image_url: 'https://cdn.example.com/tv-landing-hero.webp'
  }
};

export const EXAMPLE_NAVIGATE_TO_DISPLAY: NavigateToDisplayResponse = {
  display_id: '660e8400-e29b-41d4-a716-446655440002',
  masjid_id: '550e8400-e29b-41d4-a716-446655440001',
  zone_code: 'johor',
  tier: 'asas',
  prayer_times: {
    date: '2026-07-16',
    fajr: '05:32',
    sunrise: '06:52',
    zuhr: '12:54',
    asr: '16:25',
    maghrib: '18:54',
    isha: '20:05',
    timezone: 'Asia/Kuala_Lumpur',
    is_current: true
  },
  masjid_name: 'Masjid Al-Hana, Johor Bahru',
  can_upgrade: true,
  can_switch_zone: true,
  route_path: '/display/660e8400-e29b-41d4-a716-446655440002'
};

// ============================================================================
// UI STATE & NAVIGATION CONTRACTS
// ============================================================================

/**
 * Enum for CTA actions that determine which handler to invoke
 */
export enum CTAAction {
  START_FREE = 'start_free',           // Route to zone modal, then to first free display
  CONTACT_SALES = 'contact_sales',     // Open contact form or redirect to WhatsApp
  UPGRADE_TIER = 'upgrade_tier',       // Open tier upgrade modal
  ADMIN_LOGIN = 'admin_login',         // Route to admin dashboard login
}

/**
 * Enum for navigation state
 */
export enum NavigationState {
  LANDING_PAGE = 'landing_page',
  ZONE_MODAL = 'zone_modal',
  DISPLAY_PAGE = 'display_page',
  UPGRADE_FLOW = 'upgrade_flow',
  ADMIN_DASHBOARD = 'admin_dashboard',
  ERROR = 'error',
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface IDisplayRoutingService {
  /**
   * Load landing page data
   * @param language - User's language preference
   * @returns Promise resolving to landing page data (tiers, zones, FAQs)
   */
  loadLandingPage(language: 'ms' | 'en'): Promise<LoadLandingPageResponse>;
  
  /**
   * Open zone selection modal
   * @param language - User's language preference
   * @returns Promise resolving to zones for modal display
   */
  openZoneModal(language: 'ms' | 'en'): Promise<OpenZoneModalResponse>;
  
  /**
   * Navigate to a specific display page
   * @param display_id - UUID of the display to show
   * @returns Promise resolving to display initialization data
   */
  navigateToDisplay(display_id: string): Promise<NavigateToDisplayResponse>;
  
  /**
   * Route based on zone selection
   * @param zone_code - Selected zone code
   * @returns Promise resolving to the primary display for that zone
   */
  routeToZoneDisplay(zone_code: string): Promise<NavigateToDisplayResponse>;
  
  /**
   * Initiate tier upgrade flow
   * @param current_display_id - Current display UUID
   * @param target_tier - Tier to upgrade to
   * @returns Promise resolving to upgrade flow confirmation
   */
  initiateUpgrade(current_display_id: string, target_tier: string): Promise<InitiateTierUpgradeResponse>;
  
  /**
   * Switch to a different zone from display page
   * @param current_display_id - Current display UUID
   * @param target_zone_code - Zone to switch to
   * @returns Promise resolving to new display data for that zone
   */
  switchZone(current_display_id: string, target_zone_code: string): Promise<SwitchZoneResponse>;
  
  /**
   * Get breadcrumb/navigation context
   * @returns Current navigation state and available actions
   */
  getNavigationContext(): Promise<{
    current_state: NavigationState;
    available_actions: CTAAction[];
    back_route?: string;
  }>;
}

// ============================================================================
// ERROR CONTRACTS
// ============================================================================

export interface RoutingError {
  code: 'DISPLAY_NOT_FOUND' | 'ZONE_NOT_FOUND' | 'ROUTING_SERVICE_UNAVAILABLE' | 'INVALID_STATE_TRANSITION';
  message: string;
  display_id?: string;
  zone_code?: string;
  current_state?: NavigationState;
}
