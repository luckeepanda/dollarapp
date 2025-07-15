import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, Trophy, QrCode, CreditCard, Play, RotateCcw } from 'lucide-react';
import TacoGame from '../components/TacoGame';

const Landing: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate(`/${user.accountType}/dashboard`);
    }
  }, [user, isLoading, navigate]);

  const handleGameEnd = (score: number) => {
    console.log('Landing: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
  };

  const restartGame = () => {
    console.log('Landing: Restarting game');
    
    setFinalScore(null);
    setGameActive(false);
    
    setGameKey(prev => prev + 1);
    setResetTrigger(prev => prev + 1);
    
    setTimeout(() => {
      setGameActive(true);
    }, 100);
  };

  const handleGetStartedClick = () => {
    // Add a small delay to show the animation before navigating
    setTimeout(() => {
      navigate('/register');
    }, 200);
  };

  const handlePlayFreeClick = () => {
    navigate('/free-play');
  };

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
              className="group relative inline-flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-lg"
            >
              {/* Falcon Logo */}
              <div className="w-20 h-20 mb-1">
                <img 
                  src="/falcon-logo.png" 
                  alt="Falcon Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Plate emoji and text */}
              <div className="flex items-center space-x-1">
                <span className="text-sm">🍽️</span>
                <span className="text-sm font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                  Play Demo
                </span>
              </div>
            </Link>
            
            {/* Language Toggle */}
            <div className="flex bg-royal-blue-100/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
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
                {/* Dollar Logo */}
                <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl shadow-2xl">
                  <div className="w-48 h-48 bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-8xl font-bold text-white">$</span>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg ">
              {t('landing.title')}
            </h1>
            <p className="text-xl md:text-2xl text-royal-blue-100 mb-8 max-w-3xl mx-auto drop-shadow-sm">
              <strong>{t('landing.subtitle')}</strong>
            </p>
            
            {/* Clean Button Layout */}
            <div className="flex flex-col items-center space-y-6">
              {/* Get Started Button */}
              <div className="w-full max-w-lg">
                <button
                  onClick={handleGetStartedClick}
                  className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-green-400/30 hover:border-green-300/50 overflow-hidden"
                >
                  {/* Ripple effect on click */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-active:opacity-100 transition-opacity duration-200"></div>
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <span className="relative z-10">{t('landing.getStarted')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Play Games Section */}
      <div className="py-16 bg-gradient-to-br from-royal-blue-900 to-steel-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              Try Our Games
            </h2>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"></div>
            </div>
            <p className="text-xl text-steel-blue-200 max-w-2xl mx-auto">
              Experience our exciting collection of food-themed games. Play instantly and compete for high scores!
            </p>
          </div>

          {/* Game Container */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 mb-8 relative">
            <TacoGame 
              key={gameKey}
              onGameEnd={handleGameEnd} 
              gameActive={gameActive}
              resetTrigger={resetTrigger}
            />
            
            {/* Floating Play Again Button */}
            {finalScore !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-royal-blue-300 pointer-events-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-royal-blue-700 mb-2">
                      🎉 Great Job! 🎉
                    </h3>
                    <p className="text-lg text-royal-blue-600 mb-4">
                      You scored <span className="font-bold text-2xl">{finalScore}</span> points!
                    </p>
                    <div className="flex space-x-3 mb-4">
                      <button
                        onClick={restartGame}
                        className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Play Again</span>
                      </button>
                      <button
                        onClick={handlePlayFreeClick}
                        className="bg-gradient-to-r from-green-600 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg"
                      >
                        Other Games
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Options Section */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-steel-blue mb-8">Choose Your Game</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Taco Flyer - Currently Playing */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🌮</div>
                  <h3 className="text-xl font-bold mb-2">Taco Flyer</h3>
                  <p className="text-orange-100 text-sm mb-4">Guide the taco through obstacles!</p>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    Currently Playing
                  </div>
                </div>
              </div>
              
              {/* Hamburger Runner */}
              <Link
                to="/hamburger-runner"
                className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl p-6 text-white hover:from-green-600 hover:to-yellow-600 transition-all transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🍔</div>
                  <h3 className="text-xl font-bold mb-2">Hamburger Runner</h3>
                  <p className="text-green-100 text-sm mb-4">Run and jump through obstacles!</p>
                  <div className="flex items-center justify-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    <Play className="h-4 w-4" />
                    <span>Play Now</span>
                  </div>
                </div>
              </Link>
              
              {/* Food Blaster Game */}
              <Link
                to="/food-blaster"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-bold mb-2">Food Blaster</h3>
                  <p className="text-purple-100 text-sm mb-4">Shoot the food invaders!</p>
                  <div className="flex items-center justify-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    <Play className="h-4 w-4" />
                    <span>Play Now</span>
                  </div>
                </div>
              </Link>
              
              {/* Pizza Hunter - Coming Soon */}
              <div className="bg-gradient-to-r from-red-500 to-yellow-500 rounded-2xl p-6 text-white relative overflow-hidden opacity-75">
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🍕</div>
                  <h3 className="text-xl font-bold mb-2">Pizza Hunter</h3>
                  <p className="text-red-100 text-sm mb-4">Hunt for the perfect slice!</p>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    Coming Soon
                  </div>
                </div>
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