import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check if user is already authenticated with Supabase
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          // Get user data from the users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (error || !userData) {
            console.error('Error fetching user data:', error);
            return;
          }
          
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            tier: userData.tier,
            created_at: userData.created_at,
            active: userData.active,
            can_login: userData.can_login
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { email }); // Debug log
    
    // Only allow admin@greep.io to login
    if (email !== 'admin@greep.io') {
      console.log('Login failed - only admin@greep.io can login'); // Debug log
      return false;
    }
    
    try {
      // Let Supabase Auth handle the password verification
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Authentication failed:', error.message);
        return false;
      }
      
      if (!data.user) {
        console.error('No user returned from authentication');
        return false;
      }
      
      // Now fetch the user details from our custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        console.error('Error fetching user data:', userError?.message);
        // Sign out since we couldn't get the user data
        await supabase.auth.signOut();
        return false;
      }
      
      // Verify this user is allowed to login
      if (!userData.can_login) {
        console.log('User not allowed to login');
        await supabase.auth.signOut();
        return false;
      }
      
      // Create user object from database data
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        tier: userData.tier,
        created_at: userData.created_at,
        active: userData.active,
        can_login: userData.can_login
      };
      
      // Update auth state
      setAuthState({
        user,
        isAuthenticated: true,
      });
      
      // Return success immediately
      console.log('Login successful'); // Debug log
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out'); // Debug log
    
    try {
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear local auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
      
      // Clear any local storage items
      localStorage.removeItem('supabase.auth.token');
      
      // Force reload the page to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Force state reset even if there was an error
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
      window.location.href = '/';
    }
  };

  return {
    ...authState,
    login,
    logout,
  };
}