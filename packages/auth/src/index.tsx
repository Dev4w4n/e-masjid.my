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
    let isInitialLoadComplete = false;

    // OPTIMIZATION 3: Increase failsafe timeout to be more reasonable
    // Set a failsafe timeout to ensure loading doesn't hang forever
    loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn(
          "Auth loading timeout reached (30s), forcing loading to false"
        );
        setLoading(false);
      }
    }, 30000); // Increased from 10s to 30s for better stability

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
          // FIX: Set the flag AFTER loading is complete to prevent race conditions
          isInitialLoadComplete = true;
          console.log(
            "✅ Initial session loading completed - loading state:",
            false
          );
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

          // FIX: For INITIAL_SESSION during page refresh, ensure loading gets handled
          if (event === "INITIAL_SESSION" && !isInitialLoadComplete) {
            console.log(
              "⏭️ Skipping INITIAL_SESSION processing (handled by getInitialSession)"
            );
            // But make sure loading gets set to false if there's no user
            if (!session?.user) {
              console.log(
                "🎯 No user in INITIAL_SESSION, ensuring loading is false"
              );
              setLoading(false);
            }
            return;
          }

          clearTimeout(loadingTimeout); // Clear any existing timeout

          console.log("📝 Setting session and user...");
          setSession(session);
          setUser(session?.user ?? null);
          setError(null);

          if (session?.user) {
            console.log("👤 User found, loading profile...");
            // FIX: Set loading to true while profile loading is in progress
            setLoading(true);
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
            } finally {
              // FIX: Always set loading to false after profile loading completes
              console.log(
                "🎯 Setting loading to false after profile loading..."
              );
              setLoading(false);
              console.log(
                "✅ Profile loading completed - loading state:",
                false
              );
            }
          } else {
            console.log("❌ No user, clearing profile...");
            setProfile(null);
            setUserRole(null);
            // FIX: Set loading to false immediately when no user
            console.log("🎯 Setting loading to false (no user)...");
            setLoading(false);
            console.log("✅ No user - loading state:", false);
          }

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
      console.log("📊 Fetching profile and user data from database...");

      // Add timeout wrapper to prevent hanging queries during page refresh
      let queryResult;
      try {
        const queryPromise = supabase
          .from("profiles")
          .select(
            `
            *,
            users!profiles_user_id_fkey (
              role,
              email
            )
          `
          )
          .eq("user_id", userId)
          .single();

        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Database query timeout after 5 seconds"));
          }, 5000); // Shorter timeout for faster feedback
        });

        queryResult = await Promise.race([queryPromise, timeoutPromise]);

        // Clear the timeout if the query succeeded
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      } catch (timeoutError) {
        console.warn(
          "⚠️ Database query timed out, attempting fallback...",
          timeoutError
        );

        // Fallback: Try to get just user data without profile
        try {
          let fallbackTimeoutId: NodeJS.Timeout | undefined;
          const { data: userData, error: userError } = (await Promise.race([
            supabase
              .from("users")
              .select("role, email")
              .eq("id", userId)
              .single(),
            new Promise((_, reject) => {
              fallbackTimeoutId = setTimeout(
                () => reject(new Error("Fallback timeout")),
                3000
              );
            }),
          ])) as any;

          // Clear the fallback timeout if the query succeeded
          if (fallbackTimeoutId) {
            clearTimeout(fallbackTimeoutId);
          }

          if (userError) {
            console.error("❌ Fallback user query failed:", userError);
            throw userError;
          }

          console.log(
            "🔧 Using fallback - setting user role only:",
            userData?.role || "public"
          );
          setUserRole(userData?.role || "public");
          setProfile(null);
          return;
        } catch (fallbackError) {
          console.error(
            "❌ Both main and fallback queries failed:",
            fallbackError
          );
          // Set safe defaults and continue
          setUserRole("public");
          setProfile(null);
          return;
        }
      }

      const { data: combinedData, error: combinedError } = queryResult as any;

      console.log("📊 Combined query result:", {
        hasCombinedData: !!combinedData,
        combinedError: combinedError?.code || null,
      });

      // Handle the case where profile doesn't exist yet
      if (combinedError && combinedError.code === "PGRST116") {
        console.log("👤 No profile found, fetching user data only...");

        // Profile doesn't exist, but we still need user role and email
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role, email")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("❌ User data error:", userError);
          throw userError;
        }

        const role = userData?.role || "public";
        const email = userData?.email || "";

        console.log("🔧 Setting user role (no profile):", role);
        setUserRole(role);
        setProfile(null);

        console.log("✅ User data loaded (no profile yet):", { role, email });
        return;
      }

      // Handle other errors
      if (combinedError) {
        console.error("❌ Combined query error:", combinedError);
        throw combinedError;
      }

      // Extract data from the combined result
      const profileData = combinedData;
      const userData = combinedData?.users;

      if (!userData) {
        console.error("❌ No user data found in combined result");
        throw new Error("User data not found");
      }

      const role = userData.role || "public";
      const email = userData.email || "";

      console.log("🔧 Setting user role:", role);
      setUserRole(role);

      // Combine profile with role and email
      const profileWithRole: ProfileWithRole = {
        ...profileData,
        user_role: role,
        role: role, // Alias for UI compatibility
        email: email,
        // avatar_url is optional and undefined by default
      };

      console.log("✅ Profile loaded successfully:", {
        role,
        email,
        hasProfile: true,
        profileId: profileData.id,
      });

      setProfile(profileWithRole);
    } catch (err) {
      console.error("❌ Failed to load user profile:", err);

      // OPTIMIZATION 2: Improved error handling with fallback strategy
      // If the optimized query fails, try to at least get user role
      try {
        console.log("🔄 Attempting fallback user role fetch...");
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role, email")
          .eq("id", userId)
          .single();

        if (!userError && userData) {
          const role = userData.role || "public";
          console.log("🔧 Setting fallback user role:", role);
          setUserRole(role);
          setProfile(null);
          return;
        }
      } catch (fallbackErr) {
        console.warn("⚠️ Fallback user role fetch also failed:", fallbackErr);
      }

      // Don't set error state for missing profiles, as they might not exist yet
      if (err instanceof Error && !err.message.includes("PGRST116")) {
        setError(err.message);
      }

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

      // OPTIMIZATION 4: Use optimized query for profile updates
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select(
          `
          *,
          users!profiles_user_id_fkey (
            role,
            email
          )
        `
        )
        .single();

      if (error) {
        throw error;
      }

      // Update the profile state with the returned data
      const userData = data?.users;
      const updatedProfile: ProfileWithRole = {
        ...data,
        user_role: userData?.role || profile?.user_role || "public",
        role: userData?.role || profile?.role || "public",
        email: userData?.email || profile?.email || user.email || "",
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
