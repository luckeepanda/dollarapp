import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, type User } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<void>;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
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
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data.user?.email);
      // User profile will be fetched automatically by the auth state change listener
    } catch (error: any) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration for:', userData.email);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        /*options: {
          emailRedirectTo: undefined // Disable email confirmation
        }*/
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        throw authError;
      }

      console.log('Auth user created:', authData.user?.id);

      if (authData.user) {
        // Create user profile
        console.log('Creating user profile...');
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: userData.email,
              username: userData.username,
              account_type: userData.accountType,
              balance: 0,
              is_kyc_verified: userData.accountType === 'restaurant' ? false : null,
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        console.log('User profile created successfully');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setIsLoading(false);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
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
      register, 
      logout, 
      isLoading, 
      updateBalance 
    }}>
      {children}
    </AuthContext.Provider>
  );
};