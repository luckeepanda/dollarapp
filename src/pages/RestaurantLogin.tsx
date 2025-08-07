import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Store, MonitorPlay } from 'lucide-react';

const RestaurantLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      console.log('Restaurant login successful, navigating to dashboard for:', user);
      
      // Check if user is actually a restaurant
      if (user.account_type !== 'restaurant') {
        setError('This account is not registered as a restaurant. Please use the player login.');
        setIsLoading(false);
        return;
      }
      
      // Navigate to restaurant dashboard
      navigate('/restaurant/dashboard');
      
    } catch (error: any) {
      console.error('Restaurant login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-success-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-success-400/20 to-primary-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Language Toggle */}
          <div className="flex food-card overflow-hidden mb-6 max-w-32 mx-auto">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 px-3 py-2 text-sm font-medium font-display transition-all duration-300 text-center ${
                language === 'en'
                  ? 'bg-primary-100 text-primary-800 shadow-sm'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {t('language.english')}
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`flex-1 px-3 py-2 text-sm font-medium font-display transition-all duration-300 text-center ${
                language === 'es'
                  ? 'bg-primary-100 text-primary-800 shadow-sm'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {t('language.spanish')}
            </button>
          </div>
          
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-6 shadow-lg">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">
            {t('restaurant.portal')}
          </h2>
          <p className="text-gray-600">{t('restaurant.signInToManage')}</p><br/>
          <Link to="https://www.loom.com/share/f23936cd98b14916b27493aa2621d7d5?sid=9c9ff67a-6a4f-4072-a067-1b25f40f229b" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            <button className="w-full food-button py-3 rounded-lg font-bold flex items-center justify-center space-x-2">
            <MonitorPlay />&nbsp; {t('restaurant.viewDemo')}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="food-input pl-10"
                  placeholder={t('restaurant.enterRestaurantEmail')}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="food-input pl-10 pr-12"
                  placeholder={t('auth.enterPassword')}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full food-button py-3 rounded-lg font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>{t('restaurant.signInToPortal')}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('restaurant.dontHaveAccount')}{' '}
              <Link to="/restaurant/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                {t('restaurant.registerHere')}
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
              {t('auth.backToMainSite')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLogin;