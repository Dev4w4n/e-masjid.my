import { createClient, } from "@supabase/supabase-js";
// Environment variables for Supabase configuration
// Simplified and more reliable environment variable access
function getEnvironmentVariables() {
    const isBrowser = typeof window !== "undefined";
    const directProcessEnv = typeof process !== "undefined"
        ? process.env
        : undefined;
    const globalProcessEnv = typeof globalThis !== "undefined" &&
        "process" in globalThis
        ? globalThis.process?.env
        : undefined;
    const safeProcessEnv = directProcessEnv ?? globalProcessEnv;
    const nodeEnv = safeProcessEnv?.NODE_ENV;
    const isTest = nodeEnv === "test";
    let SUPABASE_URL;
    let SUPABASE_ANON_KEY;
    if (isBrowser) {
        // Access Vite's injected env directly via import.meta.env
        try {
            // @ts-expect-error Vite provides import.meta.env at build time
            const env = import.meta.env;
            SUPABASE_URL = env?.VITE_SUPABASE_URL || env?.NEXT_PUBLIC_SUPABASE_URL;
            SUPABASE_ANON_KEY =
                env?.VITE_SUPABASE_ANON_KEY || env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        }
        catch {
            // ignore; fall back to process.env below (useful in tests/node)
        }
        // Prefer compile-time inlined Next.js env values in browser bundles.
        if (!SUPABASE_URL && directProcessEnv) {
            SUPABASE_URL =
                directProcessEnv.NEXT_PUBLIC_SUPABASE_URL ||
                    directProcessEnv.SUPABASE_URL;
        }
        if (!SUPABASE_ANON_KEY && directProcessEnv) {
            SUPABASE_ANON_KEY =
                directProcessEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                    directProcessEnv.SUPABASE_ANON_KEY;
        }
        // Check runtime process env as an additional fallback.
        if (!SUPABASE_URL && safeProcessEnv) {
            SUPABASE_URL =
                safeProcessEnv.NEXT_PUBLIC_SUPABASE_URL || safeProcessEnv.SUPABASE_URL;
        }
        if (!SUPABASE_ANON_KEY && safeProcessEnv) {
            SUPABASE_ANON_KEY =
                safeProcessEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                    safeProcessEnv.SUPABASE_ANON_KEY;
        }
    }
    // Fallback for Node.js/test environments
    if (!SUPABASE_URL && safeProcessEnv) {
        SUPABASE_URL =
            safeProcessEnv.VITE_SUPABASE_URL ||
                safeProcessEnv.NEXT_PUBLIC_SUPABASE_URL ||
                safeProcessEnv.SUPABASE_URL;
    }
    if (!SUPABASE_ANON_KEY && safeProcessEnv) {
        SUPABASE_ANON_KEY =
            safeProcessEnv.VITE_SUPABASE_ANON_KEY ||
                safeProcessEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                safeProcessEnv.SUPABASE_ANON_KEY;
    }
    return { SUPABASE_URL, SUPABASE_ANON_KEY, isTest };
}
const { SUPABASE_URL, SUPABASE_ANON_KEY, isTest } = getEnvironmentVariables();
const testUrl = "https://dummy-project.supabase.co";
const testKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15LXByb2plY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxOTU1MzU1NjAwfQ.dummy_signature";
const isBrowser = typeof window !== "undefined";
const finalUrl = SUPABASE_URL || (isTest ? testUrl : "");
const finalKey = SUPABASE_ANON_KEY || (isTest ? testKey : "");
if (!finalUrl || !finalKey) {
    const message = "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY).";
    if (!isBrowser && !isTest) {
        throw new Error(message);
    }
    console.error(message);
}
const resolvedUrl = finalUrl || testUrl;
const resolvedKey = finalKey || testKey;
/**
 * Custom lock function that bypasses the browser's LockManager API.
 *
 * The default Supabase auth uses navigator.locks.request() which can hang
 * indefinitely in certain scenarios:
 * - When a tab crashes without releasing its lock
 * - When there are stale locks from previous sessions
 * - On certain browser/OS combinations with LockManager bugs
 *
 * By providing a no-op lock, we trade off cross-tab coordination for reliability.
 * This means:
 * - Multiple tabs may occasionally both try to refresh tokens simultaneously
 * - Supabase handles this gracefully (last one wins)
 * - The app will never hang due to lock acquisition timeout
 *
 * @experimental - Using the experimental lock option from Supabase auth-js
 */
const noopLock = async (_name, _acquireTimeout, fn) => {
    // Simply execute the function without any locking
    // This prevents hanging but may cause minor race conditions across tabs
    return fn();
};
const supabaseGlobal = globalThis;
/**
 * Typed Supabase client for the Masjid Suite application
 *
 * Note: We configure a custom lock function to prevent the app from hanging
 * indefinitely when there are lock contention issues (e.g., multiple tabs,
 * browser bugs, or stale locks from crashed tabs).
 */
export const supabase = supabaseGlobal.__emasjidSupabaseClient__ ||
    (supabaseGlobal.__emasjidSupabaseClient__ = createClient(resolvedUrl, resolvedKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            // Use our no-op lock to prevent hanging on getSession/refreshSession calls
            // This is an @experimental option - may need updating in future Supabase versions
            lock: noopLock,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    }));
/**
 * Authentication utilities
 */
export class AuthService {
    constructor(client) {
        this.client = client;
    }
    /**
     * Sign up with email and password
     */
    async signUp(email, password, metadata) {
        const signUpData = {
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
    async signIn(email, password) {
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
        console.log("SupabaseClient: Starting sign out process");
        try {
            const { error } = await this.client.auth.signOut();
            if (error) {
                console.error("SupabaseClient: Sign out error:", error);
                throw new Error(`Sign out failed: ${error.message}`);
            }
            console.log("SupabaseClient: Sign out completed successfully");
        }
        catch (err) {
            console.error("SupabaseClient: Exception during sign out:", err);
            throw err;
        }
    }
    /**
     * Get current user
     */
    async getCurrentUser() {
        const { data: { user }, error, } = await this.client.auth.getUser();
        if (error) {
            throw new Error(`Failed to get current user: ${error.message}`);
        }
        return user;
    }
    /**
     * Get current session
     */
    async getCurrentSession() {
        const { data: { session }, error, } = await this.client.auth.getSession();
        if (error) {
            throw new Error(`Failed to get current session: ${error.message}`);
        }
        return session;
    }
    /**
     * Reset password
     */
    async resetPassword(email) {
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
    async updatePassword(newPassword) {
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
    async updateUserMetadata(metadata) {
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
    onAuthStateChange(callback) {
        return this.client.auth.onAuthStateChange(callback);
    }
}
/**
 * Database utilities
 */
export class DatabaseService {
    constructor(client) {
        this.client = client;
    }
    /**
     * Generic query builder for any table
     */
    table(tableName) {
        return this.client.from(tableName);
    }
    /**
     * Execute RPC (stored procedure) calls
     */
    async rpc(functionName, params) {
        const { data, error } = await this.client.rpc(functionName, params);
        if (error) {
            throw new Error(`RPC call failed: ${error.message}`);
        }
        return data;
    }
    /**
     * Subscribe to real-time changes
     */
    subscribe(tableName, callback, event = "*", filter) {
        const channel = this.client
            .channel(`${String(tableName)}-changes`)
            .on("postgres_changes", {
            event,
            schema: "public",
            table: String(tableName),
            filter,
        }, callback)
            .subscribe();
        return () => {
            this.client.removeChannel(channel);
        };
    }
    /**
     * Get count of records
     */
    async count(tableName, filter) {
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
    constructor(db) {
        this.db = db;
    }
    /**
     * Get profile by user ID
     */
    async getProfile(userId) {
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
    async upsertProfile(profile) {
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
    async getProfileAddresses(profileId) {
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
    async addProfileAddress(address) {
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
     * Delete profile address
     */
    async deleteProfileAddress(addressId) {
        const { error } = await this.db
            .table("profile_addresses")
            .delete()
            .eq("id", addressId);
        if (error) {
            throw new Error(`Failed to delete profile address: ${error.message}`);
        }
        return true;
    }
}
/**
 * Masjid-specific database operations
 */
export class MasjidService {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get all masjids
     */
    async getAllMasjids() {
        const { data: masjids, error } = await this.db
            .table("masjids")
            .select("*")
            .eq("status", "active")
            .order("name");
        if (error) {
            throw new Error(`Failed to get masjids: ${error.message}`);
        }
        if (!masjids) {
            return [];
        }
        const masjidsWithAdmins = await Promise.all(masjids.map(async (masjid) => {
            const admins = await this.getMasjidAdmins(masjid.id);
            return { ...masjid, admins: admins || [] };
        }));
        return masjidsWithAdmins;
    }
    /**
     * Get masjid by ID
     */
    async getMasjid(masjidId) {
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
    async getMasjidsByZone(zoneCode) {
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
    async createMasjid(masjid) {
        // Get the current authenticated user via the db's client
        const { data: { user }, } = await this.db.client.auth.getUser();
        if (!user) {
            throw new Error("User must be authenticated to create a masjid");
        }
        // Automatically set created_by to the current user's ID
        const masjidWithCreator = {
            ...masjid,
            created_by: user.id,
        };
        const { data, error } = await this.db
            .table("masjids")
            .insert(masjidWithCreator)
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
    async updateMasjid(masjidId, updates) {
        const { data, error } = await this.db
            .table("masjids")
            .update(updates)
            .eq("id", masjidId)
            .select();
        console.log("Update result:", { data, error });
        if (error) {
            throw new Error(`Failed to update masjid: ${error.message}`);
        }
        return data?.[0];
    }
    /**
     * Delete masjid
     */
    async deleteMasjid(masjidId) {
        const { error } = await this.db
            .table("masjids")
            .delete()
            .eq("id", masjidId);
        if (error) {
            throw new Error(`Failed to delete masjid: ${error.message}`);
        }
        return { success: true };
    }
    /**
     * Update masjid JAKIM zone code
     */
    async updateMasjidZoneCode(masjidId, zoneCode) {
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
    async getMasjidPrayerConfig(masjidId) {
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
    async upsertPrayerConfig(config) {
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
     * Get user's admin masjids
     */
    async getUserAdminMasjids() {
        return await this.db.rpc("get_user_admin_masjids");
    }
    /**
     * Get all active masjids for content submission (any registered user can submit to any masjid)
     */
    async getAllActiveMasjids() {
        const { data, error } = await this.db
            .table("masjids")
            .select(`
        id, 
        name, 
        address->>'address_line_1' as address_line_1,
        address->>'address_line_2' as address_line_2, 
        address->>'postcode' as postcode,
        address->>'city' as city,
        address->>'state' as state
      `)
            .eq("status", "active")
            .order("name");
        if (error) {
            throw new Error(`Failed to get active masjids: ${error.message}`);
        }
        return data || [];
    }
    /**
     * Get masjids by IDs (for populating dropdowns)
     */
    async getMasjidsByIds(masjidIds) {
        if (!masjidIds.length)
            return [];
        const { data, error } = await this.db
            .table("masjids")
            .select(`
        id, 
        name, 
        address->>'address_line_1' as address_line_1,
        address->>'address_line_2' as address_line_2, 
        address->>'postcode' as postcode,
        address->>'city' as city,
        address->>'state' as state
      `)
            .in("id", masjidIds);
        if (error) {
            throw new Error(`Failed to get masjids by IDs: ${error.message}`);
        }
        return data || [];
    }
    /**
     * Get masjid admins
     */
    async getMasjidAdmins(masjidId) {
        const data = await this.db.rpc("get_masjid_admin_list", {
            target_masjid_id: masjidId,
        });
        return data || [];
    }
    /**
     * Assign admin to masjid
     */
    async assignAdmin(assignment) {
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
}
// Create service instances
export const authService = new AuthService(supabase);
export const databaseService = new DatabaseService(supabase);
export const profileService = new ProfileService(databaseService);
export const masjidService = new MasjidService(databaseService);
// JAKIM service for external data
export { JakimService, jakimService } from "./services/jakim";
// Display service for TV display management
export { createDisplay, getDisplaysByMasjid, getAssignedContent, assignContent, removeContent, updateContentOrder, updateContentSettings, } from "./services/display";
// Export statistics service
export { StatisticsService, } from "./services/statistics";
// Zone selection service for TV landing tiers (Feature 007)
export { ZoneSelectionService, } from "./services/zone-service";
// Zone client for landing page discovery flows (Feature 007)
export { ZoneClient, fetchAllZones, selectZone, isValidZoneCode, clearZoneCache, } from "./lib/zone-client.js";
// Tier package service for TV landing tiers (Feature 007)
export { TierPackageService, tierPackageService, } from "./services/tier-service";
// Default export
export default supabase;
//# sourceMappingURL=index.js.map