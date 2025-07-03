import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, type User } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateBalance: (newBalance: number) => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  accountType: 'player' | 'restaurant';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set a timeout for the session check
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        console.log('Initial session check:', session?.user?.email);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (mounted) {
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      // Handle sign out or invalid session
      if (event === 'SIGNED_OUT' || !session?.user) {
        setSupabaseUser(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, clearing session');
        setSupabaseUser(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setSupabaseUser(session?.user ?? null);
      
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        // For OAuth logins, we might need to create a profile if it doesn't exist
        await fetchUserProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // Set a timeout for the profile fetch
      const profilePromise = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error('Error fetching user profile:', error);
        // If user profile doesn't exist, this might be an OAuth user
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('User profile fetched:', data);
      setUser({
        id: data.id,
        email: data.email,
        username: data.username,
        accountType: data.account_type,
        balance: parseFloat(data.balance || '0'),
        isKYCVerified: data.is_kyc_verified,
        created_at: data.created_at,
        updated_at: data.updated_at
      });

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // On any error, clear the user state and stop loading
      setUser(null);
    } finally {
      // Always ensure loading is set to false
      setIsLoading(false);
    }
  };

  const createOAuthProfile = async (supabaseUser: SupabaseUser, accountType: 'player' | 'restaurant' = 'player') => {
    try {
      // Extract username from email or use a default
      const username = supabaseUser.email?.split('@')[0] || `user_${supabaseUser.id.slice(0, 8)}`;
      
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            username: username,
            account_type: accountType,
            balance: 0.00,
            is_kyc_verified: accountType === 'restaurant' ? false : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error creating OAuth profile:', error);
        throw error;
      }

      // Fetch the newly created profile
      await fetchUserProfile(supabaseUser.id);
    } catch (error) {
      console.error('Failed to create OAuth profile:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('Attempting login for:', email);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data.user?.email);
      
      const profile = await fetchUserProfile(data.user.id);
      return profile;
    } catch (error: any) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google login error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Google login failed:', error);
      setIsLoading(false);
      throw new Error(error.message || 'Google login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      console.log('Starting registration process for:', userData.email);
      
      // Create auth user with explicit options
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            account_type: userData.accountType
          }
        }
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        throw authError;
      }

      console.log('Auth user created:', authData.user.id);

    } catch (error: any) {
      console.error('Registration error:', error);
      // Provide specific error messages
      if (error.message?.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (error.message?.includes('duplicate key')) {
        if (error.message.includes('username')) {
          throw new Error('This username is already taken. Please choose a different one.');
        } else {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
      } else if (error.message?.includes('invalid email')) {
        throw new Error('Please enter a valid email address.');
      } else if (error.message?.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long.');
      } else if (error.message?.includes('row-level security policy')) {
        throw new Error('Account creation failed due to security policy. Please try again or contact support.');
      } else if (error.message?.includes('session not established')) {
        throw new Error('Authentication session not established. Please try logging in with your new account.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      // Clear state immediately on successful logout
      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setSupabaseUser(null);
      throw error;
    }
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      login, 
      loginWithGoogle,
      register, 
      logout, 
      isLoading, 
      updateBalance 
    }}>
      {children}
    </AuthContext.Provider>
  );
};