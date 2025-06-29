import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, type User } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<User>;
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
    supabase.auth.getSession().then( ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
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
      
      if (!session?.user) {
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
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      console.log('fetched!!!', data);
      if (error) {
        console.error('Error fetching user profile:', error);
        // If user profile doesn't exist, this might be an auth-only user
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
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('Attempting login for:', email);
      setIsLoading(true);
      // login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('perhaps here?')
      // get profile
      const profile = await fetchUserProfile(data.user.id);
      console.log('am i here?')
      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data.user?.email);
      
      setIsLoading(false);
      console.log(profile);
      return profile;
    } catch (error: any) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw new Error(error.message || 'Login failed');
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