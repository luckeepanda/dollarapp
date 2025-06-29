import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Authentication failed. Please try again.');
          return;
        }

        if (data.session?.user) {
          console.log('OAuth user authenticated:', data.session.user.email);
          
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            console.log('Creating profile for OAuth user');
            
            // Extract username from email or use a default
            const username = data.session.user.email?.split('@')[0] || `user_${data.session.user.id.slice(0, 8)}`;
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  username: username,
                  account_type: 'player', // Default to player for OAuth users
                  balance: 0.00,
                  is_kyc_verified: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]);

            if (insertError) {
              console.error('Error creating OAuth profile:', insertError);
              setError('Failed to create user profile. Please try again.');
              return;
            }
          }

          // Wait a moment for the auth context to update
          setTimeout(() => {
            navigate('/player/dashboard');
          }, 1000);
        } else {
          setError('No user session found. Please try signing in again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user && !isProcessing) {
      navigate(`/${user.accountType}/dashboard`);
    }
  }, [user, navigate, isProcessing]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Completing Sign In</h2>
        <p className="text-gray-600">
          Please wait while we set up your account...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;