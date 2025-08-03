import React from 'react';
import { Link } from 'react-router-dom';
import { Home, GamepadIcon, Search, ArrowLeft, Zap, Sparkles } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-success-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-success-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-success-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating food emojis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-4xl animate-float">🌮</div>
        <div className="absolute top-32 right-32 text-3xl animate-float delay-300">🍔</div>
        <div className="absolute bottom-40 left-40 text-3xl animate-float delay-700">🍕</div>
        <div className="absolute bottom-20 right-20 text-4xl animate-float delay-1000">🚀</div>
        <div className="absolute top-1/2 left-10 text-2xl animate-float delay-500">🧀</div>
        <div className="absolute top-1/3 right-10 text-2xl animate-float delay-800">🥬</div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center">
          {/* 404 Display */}
          <div className="mb-8">
            <div className="relative inline-block">
              {/* Glowing 404 text */}
              <h1 className="text-8xl sm:text-9xl font-black font-display food-text-gradient drop-shadow-2xl animate-pulse mb-4">
                404
              </h1>
              
              {/* Animated taco replacing the "0" */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-6xl sm:text-7xl animate-float">🌮</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="food-card p-8 mb-8 relative overflow-hidden">
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Search className="h-8 w-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-gray-900 font-display">Page Not Found</h2>
              </div>
              
              <p className="text-lg text-gray-700 mb-6">
                Oops! The page you're looking for seems to have wandered off like a hungry taco. 
                Don't worry, we'll help you find your way back to the delicious games!
              </p>

              {/* Fun error messages */}
              <div className="bg-gradient-to-r from-primary-50 to-success-50 p-4 rounded-lg border border-primary-200 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold text-primary-800">What happened?</span>
                </div>
                <p className="text-sm text-primary-700">
                  The URL you entered doesn't exist, or the page may have been moved to make room for more games!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full food-button py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl"
            >
              <Home className="h-6 w-6" />
              <span>Back to Home</span>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/free-play"
                className="bg-gradient-to-r from-success-600 to-success-700 text-white py-3 rounded-lg font-semibold hover:from-success-700 hover:to-success-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <GamepadIcon className="h-5 w-5" />
                <span>Free Play</span>
              </Link>

              <Link
                to="/restaurant-games"
                className="bg-gradient-to-r from-accent-600 to-accent-700 text-white py-3 rounded-lg font-semibold hover:from-accent-700 hover:to-accent-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Live Games</span>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Still lost? Try going back to the previous page or contact support if you think this is an error.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-100/30 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default NotFound;