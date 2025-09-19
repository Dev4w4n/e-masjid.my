import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { authService, supabase } from "@masjid-suite/supabase-client";
import type { Database, UserRole } from "@masjid-suite/shared-types";

// Extended profile type with user role and UI properties
type UserWithRole = Database["public"]["Tables"]["users"]["Row"];
export type ProfileWithRole =
  Database["public"]["Tables"]["profiles"]["Row"] & {
    user_role?: UserRole;
    role?: UserRole; // Alias for compatibility with UI components
    email?: string; // From users table
    avatar_url?: string; // For future implementation
  };

// Auth context types
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileWithRole | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
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
    updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileWithRole | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;

    // Set a failsafe timeout to ensure loading doesn't hang forever
    loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("Auth loading timeout reached, forcing loading to false");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    async function getInitialSession() {
      try {
        console.log("🚀 Getting initial session...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          console.log("📦 Initial session result:", {
            hasSession: !!session,
            userId: session?.user?.id || "No session",
          });

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log("👤 Initial session has user, loading profile...");
            try {
              await loadUserProfile(session.user.id);
              console.log("✅ Initial profile loading completed");
            } catch (err) {
              console.error("❌ Initial profile loading failed:", err);
              // Don't break the auth flow if profile loading fails
              // The user is still authenticated even if we can't load their profile
            }
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("❌ Error getting initial session:", err);
          setError(
            err instanceof Error ? err.message : "Failed to get initial session"
          );
        }
      } finally {
        if (mounted) {
          console.log(
            "🎯 Clearing timeout and setting loading to false (initial)"
          );
          clearTimeout(loadingTimeout);
          setLoading(false);
          console.log("✅ Initial session loading completed");
        }
      }
    }

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          console.log("🔄 Auth state changed:", event, session?.user?.id);
          clearTimeout(loadingTimeout); // Clear any existing timeout

          console.log("📝 Setting session and user...");
          setSession(session);
          setUser(session?.user ?? null);
          setError(null);

          if (session?.user) {
            console.log("👤 User found, loading profile...");
            try {
              await loadUserProfile(session.user.id);
              console.log("✅ Profile loading completed");
            } catch (err) {
              console.error(
                "❌ Profile loading failed in auth state change:",
                err
              );
              // Don't break the auth flow if profile loading fails
              // The user is still authenticated even if we can't load their profile
            }
          } else {
            console.log("❌ No user, clearing profile...");
            setProfile(null);
            setUserRole(null);
          }

          console.log("🎯 Setting loading to false...");
          setLoading(false);
          console.log("✅ Auth state change processing completed");
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile with role
  async function loadUserProfile(userId: string) {
    console.log("🔍 Starting profile load for user:", userId);

    try {
      console.log("📊 Fetching profile data from database...");

      // Add timeout to profile data query
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        new Promise<{ data: null; error: { message: string } }>((_, reject) =>
          setTimeout(() => reject(new Error("Profile query timeout")), 5000)
        ),
      ]).catch((err) => {
        console.warn("⏰ Profile query timed out or failed:", err);
        return { data: null, error: { message: err.message } };
      });

      console.log("📊 Profile query result:", { profileData, profileError });

      if (
        profileError &&
        typeof profileError === "object" &&
        "code" in profileError &&
        profileError.code !== "PGRST116"
      ) {
        // No rows returned
        console.error("❌ Profile error:", profileError);
        throw profileError;
      }

      console.log("👤 Fetching user data from database...");

      // Add timeout to user data query
      const userPromise = supabase
        .from("users")
        .select("role, email")
        .eq("id", userId)
        .single();

      const { data: userData, error: userError } = await Promise.race([
        userPromise,
        new Promise<{ data: null; error: { message: string } }>((_, reject) =>
          setTimeout(() => reject(new Error("User query timeout")), 5000)
        ),
      ]).catch((err) => {
        console.warn("⏰ User query timed out or failed:", err);
        return { data: null, error: { message: err.message } };
      });

      console.log("👤 User query result:", { userData, userError });

      if (
        userError &&
        typeof userError === "object" &&
        "code" in userError &&
        userError.code !== "PGRST116"
      ) {
        console.error("❌ User data error:", userError);
        throw userError;
      }

      const role = userData?.role || "public";
      const email = userData?.email || "";

      console.log("🔧 Setting user role:", role);
      setUserRole(role);

      // Combine profile with role and email
      const profileWithRole: ProfileWithRole | null = profileData
        ? {
            ...profileData,
            user_role: role,
            role: role, // Alias for UI compatibility
            email: email,
            // avatar_url is optional and undefined by default
          }
        : null;

      console.log("✅ Profile loaded successfully:", {
        role,
        email,
        hasProfile: !!profileData,
        profileId: profileData?.id,
      });

      setProfile(profileWithRole);
    } catch (err) {
      console.error("❌ Failed to load user profile:", err);
      // Don't set error state for missing profiles, as they might not exist yet
      if (err instanceof Error && !err.message.includes("PGRST116")) {
        setError(err.message);
      }
      // Even if profile loading fails, we should still consider the user authenticated
      // The profile might not exist yet for new users

      // Set default values so the app can still function
      setUserRole("public");
      setProfile(null);
    }

    console.log("🏁 Profile loading completed for user:", userId);
  }

  // Auth methods
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signUp(email, password, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
      throw err;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      await authService.updatePassword(newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed");
      throw err;
    }
  };

  const updateProfile = async (
    updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>
  ) => {
    try {
      setError(null);

      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      // Update the profile state with the returned data
      const updatedProfile: ProfileWithRole = {
        ...data,
        user_role: profile?.user_role || "public",
        role: profile?.role || "public",
        email: profile?.email || user.email || "",
      };

      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile update failed");
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRole,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Hook to get current user
 */
export function useUser() {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to get current user profile
 */
export function useProfile() {
  const { profile, refreshProfile } = useAuth();
  return { profile, refreshProfile };
}

/**
 * Hook to get current session
 */
export function useSession() {
  const { session } = useAuth();
  return session;
}

/**
 * Hook for authentication loading state
 */
export function useAuthLoading() {
  const { loading } = useAuth();
  return loading;
}

/**
 * Hook for authentication error state
 */
export function useAuthError() {
  const { error } = useAuth();
  return error;
}

/**
 * Permission utilities
 */
export class PermissionService {
  /**
   * Check if user has specific role (works with ProfileWithRole)
   */
  static hasRole(profile: ProfileWithRole | null, role: UserRole): boolean {
    return profile?.user_role === role;
  }

  /**
   * Check if user is super admin (works with ProfileWithRole)
   */
  static isSuperAdmin(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "super_admin");
  }

  /**
   * Check if user is masjid admin (works with ProfileWithRole)
   */
  static isMasjidAdmin(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "masjid_admin");
  }

  /**
   * Check if user is registered community member (works with ProfileWithRole)
   */
  static isRegistered(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "registered");
  }

  /**
   * Check if user is public (works with ProfileWithRole)
   */
  static isPublic(profile: ProfileWithRole | null): boolean {
    return this.hasRole(profile, "public");
  }

  /**
   * Check if user has admin privileges (super_admin or masjid_admin)
   */
  static hasAdminPrivileges(profile: ProfileWithRole | null): boolean {
    return this.isSuperAdmin(profile) || this.isMasjidAdmin(profile);
  }

  /**
   * Check if user can manage masjids
   */
  static canManageMasjids(profile: ProfileWithRole | null): boolean {
    return this.isSuperAdmin(profile);
  }

  /**
   * Check if user can manage a specific masjid
   */
  static async canManageSpecificMasjid(
    profile: ProfileWithRole | null,
    masjidId: string
  ): Promise<boolean> {
    if (!profile) return false;

    // Super admins can manage any masjid
    if (this.isSuperAdmin(profile)) return true;

    // Masjid admins can only manage their assigned masjids
    if (this.isMasjidAdmin(profile)) {
      const { data, error } = await supabase
        .from("masjid_admins")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("masjid_id", masjidId)
        .single();

      return !error && !!data;
    }

    return false;
  }

  /**
   * Check if user can view profile
   */
  static canViewProfile(
    currentProfile: ProfileWithRole | null,
    targetProfile: Database["public"]["Tables"]["profiles"]["Row"]
  ): boolean {
    if (!currentProfile) return false;

    // Users can always view their own profile
    if (currentProfile.id === targetProfile.id) return true;

    // Super admins can view any profile
    if (this.isSuperAdmin(currentProfile)) return true;

    // Masjid admins can view profiles of users in their masjids
    // This would require additional logic to check masjid membership

    return false;
  }

  /**
   * Check if user can edit profile
   */
  static canEditProfile(
    currentProfile: ProfileWithRole | null,
    targetProfile: Database["public"]["Tables"]["profiles"]["Row"]
  ): boolean {
    if (!currentProfile) return false;

    // Users can always edit their own profile
    if (currentProfile.id === targetProfile.id) return true;

    // Super admins can edit any profile
    if (this.isSuperAdmin(currentProfile)) return true;

    return false;
  }
}

/**
 * Hook to use permissions
 */
export function usePermissions() {
  const { profile } = useAuth();

  return {
    hasRole: (role: UserRole) => PermissionService.hasRole(profile, role),
    isSuperAdmin: () => PermissionService.isSuperAdmin(profile),
    isMasjidAdmin: () => PermissionService.isMasjidAdmin(profile),
    isCommunityMember: () => PermissionService.isRegistered(profile),
    isPublic: () => PermissionService.isPublic(profile),
    hasAdminPrivileges: () => PermissionService.hasAdminPrivileges(profile),
    canManageMasjids: () => PermissionService.canManageMasjids(profile),
    canManageSpecificMasjid: (masjidId: string) =>
      PermissionService.canManageSpecificMasjid(profile, masjidId),
    canViewProfile: (
      targetProfile: Database["public"]["Tables"]["profiles"]["Row"]
    ) => PermissionService.canViewProfile(profile, targetProfile),
    canEditProfile: (
      targetProfile: Database["public"]["Tables"]["profiles"]["Row"]
    ) => PermissionService.canEditProfile(profile, targetProfile),
  };
}

/**
 * Higher-order component for role-based access control
 */
interface WithRoleProps {
  role?: UserRole;
  roles?: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function WithRole({
  role,
  roles,
  children,
  fallback = null,
}: WithRoleProps) {
  const { profile } = useAuth();

  if (!profile) {
    return <>{fallback}</>;
  }

  const hasAccess = role
    ? PermissionService.hasRole(profile, role)
    : roles
      ? roles.some((r) => PermissionService.hasRole(profile, r))
      : false;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component for admin-only content
 */
interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <WithRole roles={["super_admin", "masjid_admin"]} fallback={fallback}>
      {children}
    </WithRole>
  );
}

/**
 * Component for super admin-only content
 */
export function SuperAdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <WithRole role="super_admin" fallback={fallback}>
      {children}
    </WithRole>
  );
}

/**
 * Component for authenticated users only
 */
export function AuthenticatedOnly({
  children,
  fallback = null,
}: AdminOnlyProps) {
  const { user } = useAuth();
  return user ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook for protected routes
 */
export function useProtectedRoute(requiredRole?: UserRole) {
  const { user, profile, loading } = useAuth();

  const isAuthenticated = !!user;
  const hasRequiredRole = requiredRole
    ? PermissionService.hasRole(profile, requiredRole)
    : true;
  const canAccess = isAuthenticated && hasRequiredRole;

  return {
    isAuthenticated,
    hasRequiredRole,
    canAccess,
    loading,
    user,
    profile,
  };
}
