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
      
      // For development, use a hardcoded admin user
      // This bypasses any RLS issues
      const user: User = {
        id: '957dadef-fa6e-42eb-bf2b-731f6d726391', // Admin user ID
        name: 'Admin User',
        email: 'admin@greep.io',
        role: 'admin',
        tier: 'A',
        created_at: new Date().toISOString(),
        active: true,
        can_login: true
      };
      
      // Update auth state immediately
      setAuthState({
        user,
        isAuthenticated: true,
      });
      
      return true;
      
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