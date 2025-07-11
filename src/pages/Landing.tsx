import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, Trophy, QrCode, CreditCard, Play } from 'lucide-react';

const Landing: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate(`/${user.accountType}/dashboard`);
    }
  }, [user, isLoading, navigate]);

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-royal-blue-500 via-steel-blue-500 to-royal-blue-600">
        {/* Top Navigation */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          {/* For Restaurant Button - Top Left */}
          <Link
            to="/restaurant/login"
            className="group relative inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-lg"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🍽️</span>
            </div>
            <span>For Restaurants</span>
          </Link>
          
          {/* Bolt.new Logo - Top Right (existing) */}
          <a 
            href="http://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:scale-105 transition-transform duration-200"
          >
            <img 
              src="/white_circle_360x360.png" 
              alt="Powered by Bolt.new" 
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 opacity-90 hover:opacity-100 transition-opacity duration-200"
            />
          </a>
        </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-royal-blue-500 via-steel-blue-500 to-royal-blue-600">
        <div className="absolute inset-0 bg-royal-blue-900/10"></div>
        
        {/* Top Navigation - Always Visible */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          {/* Left side - For Restaurant Button and Language Toggle */}
          <div className="flex flex-col space-y-3">
            {/* For Restaurant Button */}
            <Link
              to="/restaurant/login"
              className="group relative inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-lg"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🍽️</span>
              </div>
              <span>{t('landing.forRestaurants')}</span>
            </Link>
            
            {/* Language Toggle */}
            <div className="flex bg-steel-blue-300/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 text-center ${
                  language === 'en'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {t('language.english')}
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 text-center ${
                  language === 'es'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {t('language.spanish')}
              </button>
            </div>
          </div>
          
          {/* Bolt.new Logo - Top Right */}
          <a 
            href="http://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:scale-105 transition-transform duration-200"
          >
            <img 
              src="/white_circle_360x360.png" 
              alt="Powered by Bolt.new" 
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 opacity-90 hover:opacity-100 transition-opacity duration-200"
            />
          </a>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Simple $1 Display */}
                <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl shadow-2xl">
                  <div className="text-6xl font-bold text-white drop-shadow-2xl">
                    $1
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {t('landing.title')}
            </h1>
            <p className="text-xl md:text-2xl text-royal-blue-100 mb-8 max-w-3xl mx-auto drop-shadow-sm">
              <strong>{t('landing.subtitle')}</strong>
            </p>
            
            {/* Clean Button Layout */}
            <div className="flex flex-col items-center space-y-6">
              {/* Main Action Buttons - Same Size and Aligned */}
              <div className="flex flex-col gap-4 justify-center w-full max-w-lg">
                <Link
                  to="/register"
                  className="bg-white text-royal-blue-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-royal-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-center border-2 border-transparent hover:border-royal-blue-200"
                >
                  {t('landing.getStarted')}
                </Link>
                
                <Link
                  to="/free-play"
                  className="group relative inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-green-300/30 hover:border-green-200/50"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 25%, #16a34a 50%, #15803d 75%, #166534 100%)',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                  }}
                >
                  {/* Animated Play Icon */}
                  <div className="relative">
                    <Play className="h-5 w-5 fill-current group-hover:animate-pulse" />
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping group-hover:animate-none"></div>
                  </div>
                  
                  <span className="relative">
                    {t('landing.playFreeNow')}
                  </span>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white-100 mb-4">{t('landing.howItWorks')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-royal-blue-500 to-steel-blue-500 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-4">1. Deposit & Play</h3>
              <p className="text-gray-600">
                {t('landing.step1.description')}
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-royal-blue-500 to-steel-blue-500 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-4">2. Win Prizes</h3>
              <p className="text-gray-600">
                {t('landing.step2.description')}
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-royal-blue-500 to-steel-blue-500 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-4">3. Redeem & Enjoy</h3>
              <p className="text-gray-600">
                {t('landing.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-royal-blue-500 to-steel-blue-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-royal-blue-100 mb-8">
            {t('landing.cta.subtitle')}
          </p>
          <Link
            to="/register"
            className="bg-white text-royal-blue-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-royal-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-block border-2 border-transparent hover:border-royal-blue-200"
          >
            {t('landing.cta.button')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;