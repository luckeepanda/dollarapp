import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    accountType: 'player' as 'player' | 'restaurant'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting registration process...');
      
      await register({
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        password: formData.password,
        accountType: formData.accountType
      });
      
      setSuccess('Account created successfully! Redirecting to email verification...');
      
      // Wait a moment to show success message, then navigate to email verification
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&type=${formData.accountType}`);
      }, 1500);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific error types
      if (error.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (error.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long.');
      } else if (error.message?.includes('Username already exists')) {
        setError('This username is already taken. Please choose a different one.');
      } else if (error.message?.includes('security policy')) {
        setError('Account creation failed. Please try again in a moment.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setIsOAuthLoading('google');
    
    try {
      await loginWithGoogle();
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      console.error('Google signup failed:', error);
      setError(error.message || 'Google signup failed. Please try again.');
    } finally {
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-royal-blue-900 via-steel-blue-900 to-royal-blue-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-royal-blue-400/20 to-steel-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-steel-blue-400/20 to-royal-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl font-bold text-white">$</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-steel-blue to-royal-blue-100 bg-clip-text text-transparent mb-2">
            Create Account
          </h2>
          <p className="text-steel-blue-200">Join the Dollar App community</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignup}
              disabled={isOAuthLoading !== null || isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-white-300 text-white-100 py-3 rounded-2xl font-bold hover:border-royal-blue-300 hover:bg-royal-blue-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-xl hover:shadow-2xl"
            >
              {isOAuthLoading === 'google' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white-200"></div>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-white-300 rounded-lg">Or create account with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white-100 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-royal-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-100 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-royal-blue-500 focus:border-transparent transition-all"
                  placeholder="Choose a username"
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                  minLength={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-100 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-royal-blue-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading || isOAuthLoading !== null}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-100 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-royal-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isOAuthLoading !== null}
              className="w-full bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white py-3 rounded-2xl font-bold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-royal-blue-400/30"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white-200">
              Already have an account?{' '}
              <Link to="/login" className="text-royal-blue-500 font-semibold hover:text-royal-blue-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-white-300 hover:text-white-200 text-sm transition-colors">
              ← Back to main site
            </Link>
          </div>

          <div className="mt-4 p-4 bg-royal-blue-50 rounded-xl">
            <p className="text-sm text-royal-blue-800 text-center">
              <strong>Note:</strong> OAuth accounts are created instantly. Email accounts require verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;