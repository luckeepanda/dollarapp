import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Trophy, QrCode, CreditCard, Play } from 'lucide-react';

const Landing: React.FC = () => {
  const { user, isLoading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
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
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
        <div className="absolute inset-0 bg-blue-900/10"></div>
        
        {/* Bolt.new Logo - Top Right */}
        <div className="absolute top-4 right-4 z-10">
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
              Dollar App
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 mb-8 max-w-3xl mx-auto drop-shadow-sm">
              Pay $1, play for prizes, redeem at restaurants.
            </p>
            
            {/* Clean Button Layout */}
            <div className="flex flex-col items-center space-y-4">
              {/* Main Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
                
                <Link
                  to="/login"
                  className="border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white transition-all transform hover:scale-105 backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </div>
              
              {/* Free Play Button - Clean Green Design */}
              <div className="mt-6">
                <Link
                  to="/free-play"
                  className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 25%, #16a34a 50%, #15803d 75%, #166534 100%)',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                  }}
                >
                  {/* Animated Play Icon */}
                  <div className="relative">
                    <Play className="h-6 w-6 fill-current group-hover:animate-pulse" />
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping group-hover:animate-none"></div>
                  </div>
                  
                  <span className="relative">
                    FREE PLAY
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join the food game revolution with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Deposit & Play</h3>
              <p className="text-gray-600">
                Add funds via Apple Pay, Cash App, or Zelle. Enter games for just $1 each.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Win Prizes</h3>
              <p className="text-gray-600">
                Compete for growing prize pools. Winners receive QR codes for restaurant redemption.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Redeem & Enjoy</h3>
              <p className="text-gray-600">
                Use QR codes at participating restaurants. Instant verification and secure payouts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join the Game?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start playing today and discover amazing food experiences in your area.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg inline-block"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;