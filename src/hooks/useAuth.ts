import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthState, User } from "../types";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated with Supabase
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Get user data from the users table

          const defaultUser: User = {
            id: session.user.id,
            name: "Admin User",
            email: "caspertheman299@gmail.com",
            role: "admin",
            tier: "A",
            created_at: new Date().toISOString(),
            active: true,
            can_login: true,
          };

          setAuthState({
            user: defaultUser,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const defaultUser: User = {
          id: session.user.id,
          name: "Admin User",
          email: "caspertheman299@gmail.com",
          role: "admin",
          tier: "A",
          created_at: new Date().toISOString(),
          active: true,
          can_login: true,
        };

        setAuthState({
          user: defaultUser,
          isAuthenticated: true,
        });
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          user: null,
          isAuthenticated: false,
        });
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt:", { email }); // Debug log

    // Only allow admin@greep.io to login
    if (email !== "caspertheman299@gmail.com") {
      console.log("Login failed - only caspertheman299@gmail.com can login"); // Debug log
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Authentication failed:", error.message);
        return false;
      }

      if (!data.user) {
        console.error("No user returned from authentication");
        return false;
      }

      console.log("Supabase auth successful, fetching user data");

      // Fetch user data from our custom users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError.message);
        // If we can't fetch user data, use a default admin user
        const defaultUser: User = {
          id: data.user.id,
          name: "Admin User",
          email: "caspertheman299@gmail.com",
          role: "admin",
          tier: "A",
          created_at: new Date().toISOString(),
          active: true,
          can_login: true,
        };

        setAuthState({
          user: defaultUser,
          isAuthenticated: true,
        });

        return true;
      }

      if (!userData) {
        console.error("No user found in database");
        return false;
      }

      if (!userData.can_login) {
        console.error("User is not allowed to login");
        return false;
      }

      // Update auth state with the user data
      setAuthState({
        user: userData as User,
        isAuthenticated: true,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
      }

      // Clear auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
      });

      console.log("Successfully logged out");
    } catch (err) {
      console.error("Logout error:", err);

      // Still clear local state even if Supabase logout fails
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
    }
  };

  return {
    ...authState,
    login,
    logout,
    isLoading,
  };
}
