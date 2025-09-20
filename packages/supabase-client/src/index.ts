import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from "@supabase/supabase-js";
import type { Database } from "@masjid-suite/shared-types";

// Environment variables for Supabase configuration
// Simplified and more reliable environment variable access

function getEnvironmentVariables() {
  const isBrowser = typeof window !== "undefined";
  const nodeEnv =
    (typeof process !== "undefined" && process.env && process.env.NODE_ENV) ||
    undefined;
  const isTest = nodeEnv === "test";

  let SUPABASE_URL: string | undefined;
  let SUPABASE_ANON_KEY: string | undefined;

  if (isBrowser) {
    // Access Vite's injected env directly via import.meta.env
    try {
      // @ts-expect-error Vite provides import.meta.env at build time
      const env = import.meta.env as Record<string, string | undefined>;
      SUPABASE_URL = env?.VITE_SUPABASE_URL;
      SUPABASE_ANON_KEY = env?.VITE_SUPABASE_ANON_KEY;
    } catch {
      // ignore; fall back to process.env below (useful in tests/node)
    }
  }

  // Fallback for Node.js/test environments
  if (!SUPABASE_URL) {
    SUPABASE_URL = process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL;
  }
  if (!SUPABASE_ANON_KEY) {
    SUPABASE_ANON_KEY =
      process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY;
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY, isTest };
}

const { SUPABASE_URL, SUPABASE_ANON_KEY, isTest } = getEnvironmentVariables();
const testUrl = "https://dummy-project.supabase.co";
const testKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15LXByb2plY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxOTU1MzU1NjAwfQ.dummy_signature";

const finalUrl = SUPABASE_URL || (isTest ? testUrl : "");
const finalKey = SUPABASE_ANON_KEY || (isTest ? testKey : "");

if (!finalUrl || !finalKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY"
  );
}

/**
 * Typed Supabase client for the Masjid Suite application
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  finalUrl,
  finalKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Authentication utilities
 */
export class AuthService {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) {
    const signUpData: any = {
      email,
      password,
    };

    if (metadata) {
      signUpData.options = {
        data: metadata,
      };
    }

    const { data, error } = await this.client.auth.signUp(signUpData);

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();

    if (error) {
      throw new Error(`Failed to get current user: ${error.message}`);
    }

    return user;
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (error) {
      throw new Error(`Failed to get current session: ${error.message}`);
    }

    return session;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(`Password update failed: ${error.message}`);
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata: Record<string, any>) {
    const { error } = await this.client.auth.updateUser({
      data: metadata,
    });

    if (error) {
      throw new Error(`User metadata update failed: ${error.message}`);
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }
}

/**
 * Database utilities
 */
export class DatabaseService {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  /**
   * Generic query builder for any table
   */
  table<T extends keyof Database["public"]["Tables"]>(tableName: T): any {
    return this.client.from(tableName);
  }

  /**
   * Execute RPC (stored procedure) calls
   */
  async rpc<T extends keyof Database["public"]["Functions"]>(
    functionName: T,
    params?: Database["public"]["Functions"][T]["Args"]
  ): Promise<Database["public"]["Functions"][T]["Returns"]> {
    const { data, error } = await this.client.rpc(functionName, params);

    if (error) {
      throw new Error(`RPC call failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe<T extends keyof Database["public"]["Tables"]>(
    tableName: T,
    callback: (payload: any) => void,
    event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*",
    filter?: string
  ) {
    const channel = this.client
      .channel(`${String(tableName)}-changes`)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema: "public",
          table: String(tableName),
          filter,
        },
        callback
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }

  /**
   * Get count of records
   */
  async count<T extends keyof Database["public"]["Tables"]>(
    tableName: T,
    filter?: any
  ): Promise<number> {
    let query = this.client
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (filter) {
      query = query.match(filter);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Count query failed: ${error.message}`);
    }

    return count || 0;
  }
}

/**
 * Profile-specific database operations
 */
export class ProfileService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * Get profile by user ID
   */
  async getProfile(userId: string) {
    const { data, error } = await this.db
      .table("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw new Error(`Failed to get profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Create or update profile
   */
  async upsertProfile(
    profile: Database["public"]["Tables"]["profiles"]["Insert"]
  ) {
    const { data, error } = await this.db
      .table("profiles")
      .upsert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Get profile addresses
   */
  async getProfileAddresses(profileId: string) {
    const { data, error } = await this.db
      .table("profile_addresses")
      .select("*")
      .eq("profile_id", profileId)
      .order("is_primary", { ascending: false });

    if (error) {
      throw new Error(`Failed to get profile addresses: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Add profile address
   */
  async addProfileAddress(
    address: Database["public"]["Tables"]["profile_addresses"]["Insert"]
  ) {
    const { data, error } = await this.db
      .table("profile_addresses")
      .insert(address)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add profile address: ${error.message}`);
    }

    return data;
  }

  /**
   * Update profile address
   */
  async updateProfileAddress(
    addressId: string,
    updates: Database["public"]["Tables"]["profile_addresses"]["Update"]
  ) {
    const { data, error } = await this.db
      .table("profile_addresses")
      .update(updates)
      .eq("id", addressId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile address: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete profile address
   */
  async deleteProfileAddress(addressId: string) {
    const { error } = await this.db
      .table("profile_addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      throw new Error(`Failed to delete profile address: ${error.message}`);
    }
  }

  /**
   * Set primary address (automatically unsets other primary addresses)
   */
  async setPrimaryAddress(profileId: string, addressId: string) {
    // First, unset all primary addresses for this profile
    await this.db
      .table("profile_addresses")
      .update({ is_primary: false })
      .eq("profile_id", profileId);

    // Then set the specified address as primary
    const { data, error } = await this.db
      .table("profile_addresses")
      .update({ is_primary: true })
      .eq("id", addressId)
      .eq("profile_id", profileId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to set primary address: ${error.message}`);
    }

    return data;
  }
}

/**
 * Masjid-specific database operations
 */
export class MasjidService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * Get all masjids
   */
  async getAllMasjids() {
    const { data, error } = await this.db
      .table("masjids")
      .select("*")
      .eq("status", "active")
      .order("name");

    if (error) {
      throw new Error(`Failed to get masjids: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get masjid by ID
   */
  async getMasjid(masjidId: string) {
    const { data, error } = await this.db
      .table("masjids")
      .select("*")
      .eq("id", masjidId)
      .single();

    if (error) {
      throw new Error(`Failed to get masjid: ${error.message}`);
    }

    return data;
  }

  /**
   * Get masjids by JAKIM zone code
   */
  async getMasjidsByZone(zoneCode: string) {
    const { data, error } = await this.db
      .table("masjids")
      .select("*")
      .eq("jakim_zone_code", zoneCode)
      .eq("status", "active")
      .order("name");

    if (error) {
      throw new Error(`Failed to get masjids by zone: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create masjid
   */
  async createMasjid(
    masjid: Database["public"]["Tables"]["masjids"]["Insert"]
  ) {
    // Ensure facilities is properly formatted as JSON array
    const masjidData = {
      ...masjid,
      facilities: masjid.facilities || [],
    };

    const { data, error } = await this.db
      .table("masjids")
      .insert(masjidData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create masjid: ${error.message}`);
    }

    return data;
  }

  /**
   * Update masjid
   */
  async updateMasjid(
    masjidId: string,
    updates: Database["public"]["Tables"]["masjids"]["Update"]
  ) {
    // Ensure facilities is properly formatted as JSON array if provided
    const updateData = {
      ...updates,
      ...(updates.facilities !== undefined && {
        facilities: updates.facilities || [],
      }),
    };

    const { data, error } = await this.db
      .table("masjids")
      .update(updateData)
      .eq("id", masjidId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update masjid: ${error.message}`);
    }

    return data;
  }

  /**
   * Update masjid JAKIM zone code
   */
  async updateMasjidZoneCode(masjidId: string, zoneCode: string) {
    const { data, error } = await this.db
      .table("masjids")
      .update({ jakim_zone_code: zoneCode })
      .eq("id", masjidId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update masjid zone code: ${error.message}`);
    }

    return data;
  }

  /**
   * Get masjid prayer time configuration
   */
  async getMasjidPrayerConfig(masjidId: string) {
    const { data, error } = await this.db
      .table("prayer_time_config")
      .select("*")
      .eq("masjid_id", masjidId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw new Error(`Failed to get prayer config: ${error.message}`);
    }

    return data;
  }

  /**
   * Create or update prayer time configuration
   */
  async upsertPrayerConfig(
    config: Database["public"]["Tables"]["prayer_time_config"]["Insert"]
  ) {
    const { data, error } = await this.db
      .table("prayer_time_config")
      .upsert(config)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert prayer config: ${error.message}`);
    }

    return data;
  }

  /**
   * Get masjid admins
   */
  async getMasjidAdmins(masjidId: string): Promise<any[]> {
    const { data, error } = await this.db
      .table("masjid_admins")
      .select(
        `
        *,
        profiles (
          user_id,
          full_name,
          email,
          phone_number
        )
      `
      )
      .eq("masjid_id", masjidId);

    if (error) {
      throw new Error(`Failed to get masjid admins: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Assign admin to masjid
   */
  async assignAdmin(
    assignment: Database["public"]["Tables"]["masjid_admins"]["Insert"]
  ): Promise<Database["public"]["Tables"]["masjid_admins"]["Row"]> {
    const { data, error } = await this.db
      .table("masjid_admins")
      .insert(assignment)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to assign admin: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete masjid
   */
  async deleteMasjid(masjidId: string): Promise<void> {
    const { error } = await this.db
      .table("masjids")
      .delete()
      .eq("id", masjidId);

    if (error) {
      throw new Error(`Failed to delete masjid: ${error.message}`);
    }
  }

  /**
   * Update masjid website URL
   */
  async updateMasjidWebsite(masjidId: string, websiteUrl: string | null) {
    const { data, error } = await this.db
      .table("masjids")
      .update({ website_url: websiteUrl })
      .eq("id", masjidId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update masjid website: ${error.message}`);
    }

    return data;
  }

  /**
   * Update masjid capacity
   */
  async updateMasjidCapacity(masjidId: string, capacity: number | null) {
    const { data, error } = await this.db
      .table("masjids")
      .update({ capacity })
      .eq("id", masjidId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update masjid capacity: ${error.message}`);
    }

    return data;
  }

  /**
   * Update masjid facilities
   */
  async updateMasjidFacilities(masjidId: string, facilities: string[]) {
    const { data, error } = await this.db
      .table("masjids")
      .update({ facilities: facilities || [] })
      .eq("id", masjidId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update masjid facilities: ${error.message}`);
    }

    return data;
  }

  /**
   * Search masjids by facilities
   */
  async searchMasjidsByFacilities(requiredFacilities: string[]) {
    if (!requiredFacilities.length) {
      return this.getAllMasjids();
    }

    const { data, error } = await this.db
      .table("masjids")
      .select("*")
      .eq("status", "active")
      .contains("facilities", requiredFacilities)
      .order("name");

    if (error) {
      throw new Error(
        `Failed to search masjids by facilities: ${error.message}`
      );
    }

    return data || [];
  }

  /**
   * Get masjids by capacity range
   */
  async getMasjidsByCapacity(minCapacity?: number, maxCapacity?: number) {
    let query = this.db
      .table("masjids")
      .select("*")
      .eq("status", "active")
      .not("capacity", "is", null);

    if (minCapacity !== undefined) {
      query = query.gte("capacity", minCapacity);
    }

    if (maxCapacity !== undefined) {
      query = query.lte("capacity", maxCapacity);
    }

    const { data, error } = await query.order("capacity");

    if (error) {
      throw new Error(`Failed to get masjids by capacity: ${error.message}`);
    }

    return data || [];
  }
}

// Create service instances
export const authService = new AuthService(supabase);
export const databaseService = new DatabaseService(supabase);
export const profileService = new ProfileService(databaseService);
export const masjidService = new MasjidService(databaseService);

// Re-export types for convenience
export type { Database } from "@masjid-suite/shared-types";
export type { SupabaseClient, User, Session } from "@supabase/supabase-js";

// Default export
export default supabase;
