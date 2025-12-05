import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Sparkles } from 'lucide-react';

const Landing: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const greenSectionRef = useRef<HTMLDivElement>(null);
  const orangeSectionRef = useRef<HTMLDivElement>(null);

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate(`/${user.accountType}/dashboard`);
    }
  }, [user, isLoading, navigate]);

  // Scroll tracking effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;

      setScrollProgress(progress);
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <div className="text-4xl animate-pulse">🌮</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Dynamic Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
          isScrolled
            ? 'bg-gradient-to-r from-green-500/95 to-green-600/95 backdrop-blur-lg shadow-2xl'
            : 'bg-transparent'
        }`}
        style={{
          transform: isScrolled ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isScrolled ? 1 : 0,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 transform hover:scale-105 transition-transform">
              <div className="text-3xl">🌮</div>
              <span className="text-2xl font-black text-white drop-shadow-lg">Dollar App</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 rounded-xl font-bold text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                Login
              </Link>
              <Link
                to="/restaurant-games"
                className="px-6 py-3 rounded-xl font-bold bg-white text-green-600 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                LIVE GAMES
              </Link>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-white via-orange-200 to-orange-400 transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 food-grid">
        <div className="absolute inset-0 bg-food-mesh"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-success-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-success-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-success-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pt-12 sm:pb-32">
          <div className="text-center">
            {/* Enhanced $1 Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                {/* Glow layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-success-500 to-accent-400 rounded-full blur-2xl opacity-60 group-hover:opacity-100 animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-success-400 via-accent-500 to-primary-400 rounded-full blur-xl opacity-40 group-hover:opacity-80 animate-pulse delay-300"></div>

                {/* Main logo container */}
                <div className="relative bg-gradient-to-br from-white/90 to-neutral-100/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-primary-200 transform group-hover:scale-105 transition-all duration-500 rotate-12 group-hover:rotate-6 food-glow">
                  {/* Animated inner background */}
                  <div className="absolute inset-3 sm:inset-4 bg-gradient-to-br from-primary-400/20 via-success-500/20 to-accent-400/20 rounded-2xl animate-pulse"></div>

                  {/* Hexagonal pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <pattern id="hexagons" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <polygon points="10,1 18,6 18,14 10,19 2,14 2,6" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-400" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#hexagons)" />
                    </svg>
                  </div>

                  {/* Taco with $1 Text */}
                  <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                    <div className="relative">
                      <div className="text-4xl sm:text-6xl animate-float">🌮</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl sm:text-9xl font-black font-display food-text-gradient drop-shadow-2xl animate-pulse">
                          $1
                        </span>
                        <span className="absolute text-4xl sm:text-6xl font-black font-display text-primary-400 opacity-50 blur-sm animate-pulse delay-150">
                          $1
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating particles */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs sm:text-sm animate-ping">
                    <span className="drop-shadow-lg">🌶️</span>
                  </div>
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-xs animate-ping delay-300">
                    <span className="drop-shadow-lg">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dollar App Text */}
            <div className="text-center mb-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-display mb-4 leading-tight">
                <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Dollar App</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary-600 font-display mb-8 leading-relaxed">
                Pay Less, Play More.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col items-center space-y-4">
                <Link
                  to="/login"
                  className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl font-black text-base sm:text-lg md:text-xl lg:text-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-primary-200"
                >
                  GET STARTED
                </Link>
                <Link
                  to="/restaurant-games"
                  className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl font-black text-base sm:text-lg md:text-xl lg:text-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-green-200 animate-pulse"
                >
                  LIVE GAMES
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Green Section */}
      <div
        ref={greenSectionRef}
        className="relative py-32 bg-gradient-to-br from-green-500 to-green-600 overflow-hidden transition-all duration-1000"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="green-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#green-dots)" />
          </svg>
        </div>
      </div>

      {/* Orange Section with Button */}
      <div
        ref={orangeSectionRef}
        className="relative py-32 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden transition-all duration-1000"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="orange-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#orange-grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/restaurant-games"
            className="inline-block bg-white text-orange-600 px-12 py-6 sm:px-16 sm:py-8 rounded-3xl font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl hover:bg-orange-50 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl border-4 border-orange-300 hover:border-white group"
          >
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-orange-700">
              Try Dollar Games
            </span>
          </Link>

          {/* Floating emojis */}
          <div className="absolute top-0 left-1/4 text-6xl animate-bounce">🎮</div>
          <div className="absolute bottom-0 right-1/4 text-6xl animate-bounce delay-300">🏆</div>
          <div className="absolute top-1/2 left-12 text-5xl animate-pulse">💰</div>
          <div className="absolute top-1/2 right-12 text-5xl animate-pulse delay-500">🎯</div>
        </div>
      </div>
    </div>
  );
};

export default Landing;