import { create, StateCreator } from "zustand";
import { supabase, authService } from "@masjid-suite/supabase-client";
import type { User, Session } from "@supabase/supabase-js";
import type { ProfileWithRole, UserRole } from "./types";

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: ProfileWithRole | null;
  userRole: UserRole | null;
  status: "initializing" | "authenticated" | "unauthenticated";
  error: string | null;
};

export type AuthActions = {
  initialize: () => () => void; // Returns unsubscribe function
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (
    updates: Partial<ProfileWithRole>
  ) => Promise<ProfileWithRole | null>;
  refreshProfile: () => Promise<void>;
  _setUserAndProfile: (
    user: User | null,
    session: Session | null
  ) => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  userRole: null,
  status: "initializing",
  error: null,
};

const authStoreCreator: StateCreator<AuthStore> = (set, get) => ({
  ...initialState,

  initialize: () => {
    const { _setUserAndProfile } = get();

    // Run once on client mount
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        _setUserAndProfile(session?.user ?? null, session);
      })
      .catch((error) => {
        console.error("Get session error:", error);
        set({ ...initialState, status: "unauthenticated" });
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await _setUserAndProfile(session?.user ?? null, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  _setUserAndProfile: async (user, session) => {
    if (user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role, email")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        const role = (userData?.role as UserRole) || "public";
        const email = userData?.email || "";

        const profile: ProfileWithRole | null = profileData
          ? { ...profileData, user_role: role, email, role }
          : null;

        set({
          user,
          session,
          profile,
          userRole: role,
          status: "authenticated",
          error: null,
        });
      } catch (error: any) {
        console.error("Error loading user profile:", error);
        set({
          user,
          session,
          profile: null,
          userRole: null,
          status: "authenticated", // Still authenticated, but profile failed
          error: `Failed to load user profile: ${error.message}`,
        });
      }
    } else {
      set({ ...initialState, status: "unauthenticated" });
    }
  },

  signIn: async (email, password) => {
    set({ status: "initializing", error: null });
    try {
      const data = await authService.signIn(email, password);
      if (data.user && data.session) {
        // Explicitly set user and profile to avoid race condition with onAuthStateChange
        await get()._setUserAndProfile(data.user, data.session);
      } else {
        throw new Error("Sign in failed: Invalid session data returned.");
      }
    } catch (error: any) {
      set({ status: "unauthenticated", error: error.message });
      throw error;
    }
  },

  signUp: async (email, password, metadata) => {
    try {
      set({ status: "initializing", error: null });
      await authService.signUp(email, password, metadata);
    } catch (error: any) {
      set({ status: "unauthenticated", error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      set({ ...initialState, status: "unauthenticated" });
    } catch (error: any) {
      console.error("Sign out failed:", error);
      // Force clear state even if sign out fails
      set({ ...initialState, status: "unauthenticated" });
    }
  },

  resetPassword: async (email: string) => {
    await authService.resetPassword(email);
  },

  updatePassword: async (newPassword: string) => {
    await authService.updatePassword(newPassword);
  },

  updateProfile: async (updates) => {
    const { user, _setUserAndProfile } = get();
    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // Refresh profile after update
    await _setUserAndProfile(user, get().session);
    return data as ProfileWithRole;
  },

  refreshProfile: async () => {
    const { user, session, _setUserAndProfile } = get();
    if (user) {
      await _setUserAndProfile(user, session);
    }
  },
});

export const useCreateAuthStore = () => create<AuthStore>(authStoreCreator);
