import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "../supabase-client";
import { useLoading } from "./LoadingContext";

type UserRole = "student" | "instructor" | "admin";

interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  initializing: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; role: UserRole | null }>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string
  ) => Promise<{ error: Error | null; role: UserRole | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const { showLoading, hideLoading, setLoadingMessage } = useLoading();

  useEffect(() => {
    console.log("🔵 AuthContext: Setting up auth listener...");

    let mounted = true;
    console.log("🔵 AuthContext: mounted flag set to true");

    const fetchUserProfile = async (authUser: any) => {
      console.log("🟡 fetchUserProfile: Starting, mounted =", mounted);
      if (!mounted) {
        console.log(
          "🔴 fetchUserProfile: Component unmounted, skipping profile fetch"
        );
        return;
      }

      console.log(
        "🟡 fetchUserProfile: Fetching profile for user:",
        authUser.id
      );
      setLoadingMessage("Loading your profile...", "Please wait");
      console.log("🟡 fetchUserProfile: Loading message set");

      try {
        console.log("🟡 fetchUserProfile: Making Supabase query...");
        console.log("🟡 fetchUserProfile: Query details:", {
          userId: authUser.id,
          table: "profiles",
          fields: "role, first_name, last_name, status, is_active",
        });
        
        console.log("🟡 fetchUserProfile: Waiting for query response...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, first_name, last_name, status, is_active")
          .eq("id", authUser.id)
          .single();

        console.log("🟡 fetchUserProfile: Query completed, mounted =", mounted);
        console.log("🟡 fetchUserProfile: RAW RESPONSE:", {
          data: profile,
          error: profileError,
        });

        if (!mounted) {
          console.log(
            "🔴 fetchUserProfile: Component unmounted during fetch, skipping state update"
          );
          return;
        }

        console.log("🟡 fetchUserProfile: Profile fetch result:", {
          hasProfile: !!profile,
          error: profileError?.message,
          errorCode: profileError?.code,
          errorDetails: profileError?.details,
          profileData: profile,
          profileStatus: profile?.status,
          profileIsActive: profile?.is_active,
        });

        if (profileError) {
          console.error(
            "🔴 fetchUserProfile: Profile fetch error:",
            profileError.message
          );
          console.error(
            "🔴 fetchUserProfile: Full error object:",
            profileError
          );
          console.log("🔴 fetchUserProfile: Setting user to null");
          setUser(null);
          return;
        }

        console.log("🟡 fetchUserProfile: Checking profile approval status...");
        console.log("🟡 fetchUserProfile: profile.status =", profile?.status);
        console.log(
          "🟡 fetchUserProfile: profile.is_active =",
          profile?.is_active
        );

        if (profile && profile.status === "approved" && profile.is_active) {
          console.log("🟢 fetchUserProfile: Profile approved and active");
          const userData = {
            id: authUser.id,
            email: authUser.email!,
            role: profile.role,
            firstName: profile.first_name,
            lastName: profile.last_name,
          };
          console.log("🟢 fetchUserProfile: Setting user data:", userData);
          setUser(userData);
          console.log("🟢 fetchUserProfile: User data set successfully");
        } else {
          console.log(
            "🔴 fetchUserProfile: Profile not approved or not active, profile:",
            profile
          );
          console.log(
            "🔴 fetchUserProfile: Setting user to null and signing out"
          );
          setUser(null);
          await supabase.auth.signOut();
          console.log("🔴 fetchUserProfile: Signed out");
        }
      } catch (error) {
        console.error(
          "🔴 fetchUserProfile: Exception during profile fetch:",
          error
        );
        if (mounted) {
          console.log(
            "🔴 fetchUserProfile: Setting user to null due to exception"
          );
          setUser(null);
        }
      }
      console.log("🟡 fetchUserProfile: Function completed");
    };

    // Get initial session first
    const getInitialSession = async () => {
      console.log("🟠 getInitialSession: Starting...");
      console.log("🟠 getInitialSession: Showing loading UI");
      showLoading("Initializing...", "Checking authentication");

      try {
        console.log("🟠 getInitialSession: Calling supabase.auth.getSession()");
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        console.log(
          "🟠 getInitialSession: getSession completed, mounted =",
          mounted
        );
        console.log("🟠 getInitialSession: Has session?", !!initialSession);
        console.log("🟠 getInitialSession: Session details:", {
          hasSession: !!initialSession,
          hasUser: !!initialSession?.user,
          userId: initialSession?.user?.id,
          userEmail: initialSession?.user?.email,
        });

        if (!mounted) {
          console.log(
            "🔴 getInitialSession: Component unmounted, but will still update initializing state"
          );
        }

        if (initialSession?.user && mounted) {
          console.log(
            "🟢 getInitialSession: Initial session found, user ID:",
            initialSession.user.id
          );
          console.log("🟠 getInitialSession: Calling fetchUserProfile...");
          await fetchUserProfile(initialSession.user);
          console.log("🟠 getInitialSession: fetchUserProfile completed");
        } else if (!initialSession?.user && mounted) {
          console.log("🔴 getInitialSession: No initial session found");
          console.log("🔴 getInitialSession: Setting user to null");
          setUser(null);
        }
      } catch (error) {
        console.error(
          "🔴 getInitialSession: Error getting initial session:",
          error
        );
        if (mounted) {
          console.log(
            "🔴 getInitialSession: Setting user to null due to error"
          );
          setUser(null);
        }
      } finally {
        // ALWAYS set initializing to false, even if unmounted
        // This is safe because React will batch state updates
        console.log("🟠 getInitialSession: Finally block, mounted =", mounted);
        console.log(
          "🟢 getInitialSession: Setting initializing to false (regardless of mount state)"
        );
        setInitializing(false);
        console.log("🟢 getInitialSession: Hiding loading UI");
        hideLoading();
        console.log("🟢 getInitialSession: Initial session check complete");
      }
    };

    console.log("🔵 AuthContext: Calling getInitialSession()");
    getInitialSession();

    // Listen for auth changes
    console.log("🔵 AuthContext: Setting up onAuthStateChange listener");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🟣 onAuthStateChange: Event received:",
        event,
        "| Has session:",
        !!session
      );
      console.log("🟣 onAuthStateChange: mounted =", mounted);

      if (!mounted) {
        console.log(
          "🔴 onAuthStateChange: Component unmounted, ignoring event"
        );
        return;
      }

      // Skip if this is during initial setup
      if (event === "INITIAL_SESSION") {
        console.log(
          "🟣 onAuthStateChange: Skipping INITIAL_SESSION event (already handled)"
        );
        return;
      }

      if (session?.user) {
        console.log(
          "🟢 onAuthStateChange: Session user found, user ID:",
          session.user.id
        );
        console.log("🟣 onAuthStateChange: Showing loading UI");
        showLoading("Loading profile...", "Please wait");
        console.log("🟣 onAuthStateChange: Calling fetchUserProfile...");
        await fetchUserProfile(session.user);
        console.log("🟣 onAuthStateChange: fetchUserProfile completed");
        console.log("🟣 onAuthStateChange: Hiding loading UI");
        hideLoading();
      } else {
        console.log("🔴 onAuthStateChange: No session, clearing user");
        setUser(null);
      }

      console.log("🟣 onAuthStateChange: Auth state change handled");
    });

    console.log("🔵 AuthContext: Listener setup complete");

    return () => {
      console.log("🔴 AuthContext: Cleanup function called - unmounting");
      mounted = false;
      console.log("🔴 AuthContext: mounted flag set to false");
      console.log("🔴 AuthContext: Unsubscribing from auth listener");
      subscription.unsubscribe();
      console.log("🔴 AuthContext: Cleanup complete");
    };
  }, [showLoading, hideLoading, setLoadingMessage]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, first_name, last_name, status, is_active")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          if (
            profileError.code === "PGRST116" ||
            profileError.details?.includes("0 rows")
          ) {
            throw new Error(
              "Your account profile is incomplete. Please contact an administrator or register again."
            );
          }
          throw profileError;
        }

        if (!profile) {
          throw new Error(
            "Profile not found. Please contact an administrator."
          );
        }

        if (profile.status === "suspended") {
          await supabase.auth.signOut();
          throw new Error(
            "Your account has been suspended. Please contact an administrator."
          );
        }

        if (profile.status === "pending") {
          await supabase.auth.signOut();
          throw new Error(
            "Your account is pending approval. Please wait for an administrator to approve your account before you can log in."
          );
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          throw new Error(
            "Your account is inactive. Please contact an administrator to activate your account."
          );
        }

        if (profile.status !== "approved") {
          await supabase.auth.signOut();
          throw new Error(
            "Your account is not approved. Please contact an administrator."
          );
        }

        return { error: null, role: profile.role as UserRole };
      }

      throw new Error("No user data returned");
    } catch (error) {
      return { error: error as Error, role: null };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("No user data returned from signup");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            role,
            first_name: firstName,
            last_name: lastName,
            email,
            is_active: false,
            status: "pending",
          },
        ])
        .select();

      if (result.error) throw result.error;

      if (role === "student") {
        await supabase.from("student_details").insert([
          {
            id: data.user.id,
            student_number: `${new Date().getFullYear()}-${Math.floor(
              10000 + Math.random() * 90000
            )}`,
            program: "Not Set",
            year_level: 1,
          },
        ]);
      } else if (role === "instructor") {
        await supabase.from("instructor_details").insert([
          {
            id: data.user.id,
            department: "Not Set",
            academic_rank: "Instructor I",
          },
        ]);
      }

      return { error: null, role };
    } catch (error) {
      return { error: error as Error, role: null };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }) => {
    try {
      if (!user?.id) throw new Error("No user logged in");

      const updates = {
        ...(data.firstName && { first_name: data.firstName }),
        ...(data.lastName && { last_name: data.lastName }),
        ...(data.role && { role: data.role }),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      setUser((prev) => (prev ? { ...prev, ...data } : null));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
