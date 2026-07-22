import { SupabaseClient, User, Session } from "@supabase/supabase-js";
import type { Database, MasjidWithAdmins } from "@masjid-suite/shared-types";
export {
  ZoneClient,
  fetchAllZones,
  selectZone,
  isValidZoneCode,
  clearZoneCache,
} from "./lib/zone-client";
/**
 * Typed Supabase client for the Masjid Suite application
 *
 * Note: We configure a custom lock function to prevent the app from hanging
 * indefinitely when there are lock contention issues (e.g., multiple tabs,
 * browser bugs, or stale locks from crashed tabs).
 */
export declare const supabase: SupabaseClient<Database>;
/**
 * Authentication utilities
 */
export declare class AuthService {
  private client;
  constructor(client: SupabaseClient<Database>);
  /**
   * Sign up with email and password
   */
  signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ): Promise<{
    user: User | null;
    session: Session | null;
  }>;
  /**
   * Sign in with email and password
   */
  signIn(
    email: string,
    password: string,
  ): Promise<{
    user: User;
    session: Session;
    weakPassword?: import("@supabase/supabase-js").WeakPassword;
  }>;
  /**
   * Sign out current user
   */
  signOut(): Promise<void>;
  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null>;
  /**
   * Get current session
   */
  getCurrentSession(): Promise<Session | null>;
  /**
   * Reset password
   */
  resetPassword(email: string): Promise<void>;
  /**
   * Update password
   */
  updatePassword(newPassword: string): Promise<void>;
  /**
   * Update user metadata
   */
  updateUserMetadata(metadata: Record<string, any>): Promise<void>;
  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void,
  ): {
    data: {
      subscription: import("@supabase/supabase-js").Subscription;
    };
  };
}
/**
 * Database utilities
 */
export declare class DatabaseService {
  private client;
  constructor(client: SupabaseClient<Database>);
  /**
   * Generic query builder for any table
   */
  table<T extends keyof Database["public"]["Tables"]>(tableName: T): any;
  /**
   * Execute RPC (stored procedure) calls
   */
  rpc<T extends keyof Database["public"]["Functions"]>(
    functionName: T,
    params?: Database["public"]["Functions"][T]["Args"],
  ): Promise<Database["public"]["Functions"][T]["Returns"]>;
  /**
   * Subscribe to real-time changes
   */
  subscribe<T extends keyof Database["public"]["Tables"]>(
    tableName: T,
    callback: (payload: any) => void,
    event?: "INSERT" | "UPDATE" | "DELETE" | "*",
    filter?: string,
  ): () => void;
  /**
   * Get count of records
   */
  count<T extends keyof Database["public"]["Tables"]>(
    tableName: T,
    filter?: any,
  ): Promise<number>;
}
/**
 * Profile-specific database operations
 */
export declare class ProfileService {
  private db;
  constructor(db: DatabaseService);
  /**
   * Get profile by user ID
   */
  getProfile(userId: string): Promise<any>;
  /**
   * Create or update profile
   */
  upsertProfile(
    profile: Database["public"]["Tables"]["profiles"]["Insert"],
  ): Promise<any>;
  /**
   * Get profile addresses
   */
  getProfileAddresses(profileId: string): Promise<any>;
  /**
   * Add profile address
   */
  addProfileAddress(
    address: Database["public"]["Tables"]["profile_addresses"]["Insert"],
  ): Promise<any>;
  /**
   * Delete profile address
   */
  deleteProfileAddress(addressId: string): Promise<boolean>;
}
/**
 * Masjid-specific database operations
 */
export declare class MasjidService {
  private db;
  constructor(db: DatabaseService);
  /**
   * Get all masjids
   */
  getAllMasjids(): Promise<MasjidWithAdmins[]>;
  /**
   * Get masjid by ID
   */
  getMasjid(masjidId: string): Promise<any>;
  /**
   * Get masjids by JAKIM zone code
   */
  getMasjidsByZone(zoneCode: string): Promise<any>;
  /**
   * Create masjid
   */
  createMasjid(
    masjid: Database["public"]["Tables"]["masjids"]["Insert"],
  ): Promise<any>;
  /**
   * Update masjid
   */
  updateMasjid(
    masjidId: string,
    updates: Database["public"]["Tables"]["masjids"]["Update"],
  ): Promise<any>;
  /**
   * Delete masjid
   */
  deleteMasjid(masjidId: string): Promise<{
    success: boolean;
  }>;
  /**
   * Update masjid JAKIM zone code
   */
  updateMasjidZoneCode(masjidId: string, zoneCode: string): Promise<any>;
  /**
   * Get masjid prayer time configuration
   */
  getMasjidPrayerConfig(masjidId: string): Promise<any>;
  /**
   * Create or update prayer time configuration
   */
  upsertPrayerConfig(
    config: Database["public"]["Tables"]["prayer_time_config"]["Insert"],
  ): Promise<any>;
  /**
   * Get user's admin masjids
   */
  getUserAdminMasjids(): Promise<string[]>;
  /**
   * Get all active masjids for content submission (any registered user can submit to any masjid)
   */
  getAllActiveMasjids(): Promise<any[]>;
  /**
   * Get masjids by IDs (for populating dropdowns)
   */
  getMasjidsByIds(masjidIds: string[]): Promise<any[]>;
  /**
   * Get masjid admins
   */
  getMasjidAdmins(
    masjidId: string,
  ): Promise<
    Database["public"]["Functions"]["get_masjid_admin_list"]["Returns"]
  >;
  /**
   * Assign admin to masjid
   */
  assignAdmin(
    assignment: Database["public"]["Tables"]["masjid_admins"]["Insert"],
  ): Promise<Database["public"]["Tables"]["masjid_admins"]["Row"]>;
}
export declare const authService: AuthService;
export declare const databaseService: DatabaseService;
export declare const profileService: ProfileService;
export declare const masjidService: MasjidService;
export { JakimService, jakimService } from "./services/jakim";
export type { UiJakimZone } from "./services/jakim";
export {
  createDisplay,
  getDisplaysByMasjid,
  getAssignedContent,
  assignContent,
  removeContent,
  updateContentOrder,
  updateContentSettings,
} from "./services/display";
export {
  StatisticsService,
  type DashboardStatistics,
  type MappingVerificationResult,
} from "./services/statistics";
export {
  ZoneSelectionService,
  type IZoneSelectionService,
} from "./services/zone-service";
export {
  TierPackageService,
  tierPackageService,
} from "./services/tier-service";
export type { Database } from "@masjid-suite/shared-types";
export type { SupabaseClient, User, Session } from "@supabase/supabase-js";
export default supabase;
//# sourceMappingURL=index.d.ts.map
