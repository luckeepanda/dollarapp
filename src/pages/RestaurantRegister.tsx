import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Store, MonitorPlay } from 'lucide-react';

const RestaurantRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register } = useAuth();
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
      setError('Restaurant name must be at least 3 characters long');
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
      console.log('Starting restaurant registration process...');
      
      await register({
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        password: formData.password,
        accountType: 'restaurant'
      });
      
      setSuccess('Restaurant account created successfully! Redirecting to email verification...');
      
      // Wait a moment to show success message, then navigate to email verification
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&type=restaurant`);
      }, 1500);
      
    } catch (error: any) {
      console.error('Restaurant registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-steel-blue-900 via-royal-blue-900 to-steel-blue-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-steel-blue-400/20 to-royal-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-royal-blue-400/20 to-steel-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-steel-blue-500 to-royal-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-steel-blue to-steel-blue-100 bg-clip-text text-transparent mb-2">
            Join as Restaurant
          </h2>
          <p className="text-steel-blue-200">Create games and accept QR redemptions</p><br/>
          <Link to="https://www.youtube.com/watch?v=pSeCP5w5mok" className="text-steel-blue-500 font-semibold hover:text-steel-blue-600 transition-colors">
            <button className="w-full bg-gradient-to-r from-orange-600 to-red-500 text-white py-3 rounded-2xl font-bold hover:from-red-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-red-400/30">
            <MonitorPlay />&nbsp; View Demo
          </button>
          </Link>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white-100 mb-2">
                Restaurant Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-steel-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your restaurant email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-100 mb-2">
                Restaurant Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-steel-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your restaurant name"
                  required
                  disabled={isLoading}
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
                  className="w-full pl-10 pr-12 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-steel-blue-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
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
                  className="w-full pl-10 pr-4 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-steel-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-steel-blue-500 to-royal-blue-500 text-white py-3 rounded-2xl font-bold hover:from-steel-blue-600 hover:to-royal-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border border-steel-blue-400/30"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Restaurant Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white-200">
              Already have a restaurant account?{' '}
              <Link to="/restaurant/login" className="text-steel-blue-500 font-semibold hover:text-steel-blue-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-white-300 hover:text-white-200 text-sm transition-colors">
              ← Back to main site
            </Link>
          </div>

          <div className="mt-4 p-4 bg-steel-blue-50 rounded-xl">
            <p className="text-sm text-steel-blue-600 text-center">
              <strong>Restaurant Features:</strong> Create games, manage QR redemptions, and track earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegister;