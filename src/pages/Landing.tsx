import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getRandomEmojis } from '../utils/emojiSystem';
import { Users, Trophy, QrCode, CreditCard, Play, RotateCcw, Zap, Sparkles } from 'lucide-react';
import TacoGame from '../components/TacoGame';

const Landing: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [gameEmojis, setGameEmojis] = useState<string[]>(['🌮', '🍔', '🚀', '🍕']);

  // Rotate game emojis on component mount
  useEffect(() => {
    setGameEmojis(getRandomEmojis(4));
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-dark-950 cyber-grid">
        {/* Top Navigation */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          {/* Left side - LIVE GAMES NOW button and Language Toggle */}
          <div className="flex flex-col space-y-3">
            {/* LIVE GAMES NOW Button - moved from right to left */}
            <Link
              to="/restaurant-games"
              className="group relative web3-card text-white px-4 py-3 sm:px-6 sm:py-4 font-bold font-display hover:text-cyber-200 transition-all duration-300 transform hover:scale-105 web3-glow overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-electric-400/20 via-neon-500/20 to-cyber-400/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm sm:text-base font-black web3-text-gradient animate-pulse">
                    LIVE GAMES NOW
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-electric-300 animate-pulse delay-150">
                  JUEGOS EN VIVO AHORA
                </div>
              </div>
              
              {/* Corner accents */}
              <div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-electric-400 opacity-60"></div>
              <div className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-neon-400 opacity-60"></div>
              <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-cyber-400 opacity-60"></div>
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-electric-400 opacity-60"></div>
            </Link>
            
            {/* Language Toggle - moved below LIVE GAMES NOW */}
            <div className="flex food-card overflow-hidden">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium font-display transition-all duration-300 text-center ${
                  language === 'en'
                    ? 'bg-primary-100 text-primary-800 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {t('language.english')}
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium font-display transition-all duration-300 text-center ${
                  language === 'es'
                    ? 'bg-primary-100 text-primary-800 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {t('language.spanish')}
              </button>
            </div>
          </div>
          
          {/* Right side - For Restaurant Button */}
          <Link
            to="/restaurant/login"
            className="group relative inline-flex items-center justify-center space-x-2 web3-card text-cyber-300 px-4 py-2 font-medium hover:text-cyber-200 transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-neon-400 to-electric-500 rounded-lg flex items-center justify-center web3-glow">
              <span className="text-white text-sm font-bold">🍽️</span>
            </div>
            <span>For Restaurants</span>
          </Link>
        </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-400 mx-auto mb-4 web3-glow"></div>
          <p className="text-cyber-300 text-lg font-display">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 food-grid">
        <div className="absolute inset-0 bg-food-mesh"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-success-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-success-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-success-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        {/* Header - Responsive Navigation */}
        <header className="relative z-10 w-full">
          <div className="flex justify-between items-start p-4 sm:p-6 lg:p-8">
            {/* Left side - LIVE GAMES NOW button and Language Toggle */}
            <div className="flex flex-col space-y-3">
              {/* LIVE GAMES NOW Button - moved from right to left */}
              <Link
                to="/restaurant-games"
                className="group relative food-card text-gray-900 px-3 py-2 sm:px-4 sm:py-3 font-bold font-display hover:text-primary-600 transition-all duration-300 transform hover:scale-105 food-glow overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-success-500/20 to-primary-400/20 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                    <div className="relative">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-primary-400 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-xs sm:text-sm font-black food-text-gradient animate-pulse">
                      LIVE GAMES NOW
                    </span>
                  </div>
                  <div className="text-xs font-bold text-success-600 animate-pulse delay-150">
                    JUEGOS EN VIVO AHORA
                  </div>
                </div>
                
                {/* Corner accents */}
                <div className="absolute top-1 left-1 w-1 h-1 sm:w-2 sm:h-2 border-l-2 border-t-2 border-primary-400 opacity-60"></div>
                <div className="absolute top-1 right-1 w-1 h-1 sm:w-2 sm:h-2 border-r-2 border-t-2 border-success-400 opacity-60"></div>
                <div className="absolute bottom-1 left-1 w-1 h-1 sm:w-2 sm:h-2 border-l-2 border-b-2 border-accent-400 opacity-60"></div>
                <div className="absolute bottom-1 right-1 w-1 h-1 sm:w-2 sm:h-2 border-r-2 border-b-2 border-primary-400 opacity-60"></div>
              </Link>
              
              {/* Language Toggle - moved below LIVE GAMES NOW */}
              <div className="flex food-card overflow-hidden">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium font-display transition-all duration-300 text-center ${
                    language === 'en'
                      ? 'bg-primary-100 text-primary-800 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {t('language.english')}
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`flex-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium font-display transition-all duration-300 text-center ${
                    language === 'es'
                      ? 'bg-primary-100 text-primary-800 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {t('language.spanish')}
                </button>
              </div>
            </div>
            
            {/* Right side - For Restaurant Button */}
            {/* <Link
              to="/restaurant/login"
              className="group relative inline-flex items-center justify-center food-card text-gray-900 px-4 py-3 sm:px-6 sm:py-4 font-bold font-display hover:text-primary-600 transition-all duration-300 transform hover:scale-105 food-glow"
            >
              {/* For Restaurant button 
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 animate-pulse" />
                  <div className="absolute inset-0 bg-primary-500 rounded-full blur-sm opacity-50 animate-ping"></div>
                </div>
                <span className="text-lg sm:text-xl font-bold food-text-gradient animate-pulse">
                  For Restaurants
                </span>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-accent-500 animate-pulse delay-300" />
              </div>
            </Link> */}
          </div>
        </header>
        
        {/* Hero Content - Now properly spaced below header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pt-12 sm:pb-32">
          <div className="text-center">
            {/* Enhanced Web3 $1 Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                {/* Multiple glow layers for Web3 effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-success-500 to-accent-400 rounded-full blur-2xl opacity-60 group-hover:opacity-100 animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-success-400 via-accent-500 to-primary-400 rounded-full blur-xl opacity-40 group-hover:opacity-80 animate-pulse delay-300"></div>
                
                {/* Main logo container with Web3 styling */}
                <div className="relative bg-gradient-to-br from-white/90 to-neutral-100/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-primary-200 transform group-hover:scale-105 transition-all duration-500 rotate-12 group-hover:rotate-6 food-glow" itemScope itemType="https://schema.org/ImageObject">
                  {/* Animated inner background */}
                  <div className="absolute inset-3 sm:inset-4 bg-gradient-to-br from-primary-400/20 via-success-500/20 to-accent-400/20 rounded-2xl animate-pulse"></div>
                  
                  {/* Hexagonal pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <pattern id="hexagons" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <polygon points="10,1 18,6 18,14 10,19 2,14 2,6" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-400"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#hexagons)"/>
                    </svg>
                  </div>
                  
                  {/* Enhanced Taco with $1 Text */}
                  <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                    <div className="relative">
                      {/* Animated Taco Shell */}
                      <div className="text-4xl sm:text-6xl animate-float" role="img" aria-label="Taco emoji representing Dollar App gaming platform">🌮</div>
                      {/* Enhanced $1 Text overlay with Web3 styling */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl sm:text-9xl font-black font-display food-text-gradient drop-shadow-2xl animate-pulse" itemProp="name">
                          $1
                        </span>
                        {/* Glowing outline effect */}
                        <span className="absolute text-4xl sm:text-6xl font-black font-display text-primary-400 opacity-50 blur-sm animate-pulse delay-150">
                          $1
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced floating particles with Web3 effects */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs sm:text-sm animate-ping">
                    <span className="drop-shadow-lg">🌶️</span>
                  </div>
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-xs animate-ping delay-300">
                    <span className="drop-shadow-lg">🧀</span>
                  </div>
                  <div className="absolute top-4 left-1 sm:top-6 sm:left-2 text-xs animate-ping delay-700">
                    <span className="drop-shadow-lg">🥬</span>
                  </div>
                  
                  {/* Web3 corner accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-primary-400 opacity-60"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-success-400 opacity-60"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-accent-400 opacity-60"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-primary-400 opacity-60"></div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display food-text-gradient mb-6 drop-shadow-lg animate-pulse" itemProp="headline">
              {t('landing.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-green-500 mb-8 max-w-3xl mx-auto drop-shadow-sm font-medium px-4" itemProp="description">
              <strong>{t('landing.subtitle')}</strong>
            </p>
            
            {/* Clean Button Layout */}
            <div className="flex flex-col items-center space-y-6 px-4">
              {/* Get Started Button */}
              <div className="w-full max-w-lg">
                <button
                  onClick={handleGetStartedClick}
                  className="group relative w-full food-button text-lg px-6 sm:px-8 py-3 sm:py-4 font-display shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10">{t('landing.getStarted')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Play Games Section */}
      <div className="py-16 bg-gradient-to-br from-neutral-100 to-white relative">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 food-grid opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold font-display food-text-gradient mb-4 drop-shadow-lg animate-pulse" itemProp="name">
              {t('landing.tryOurGames')}
            </h2>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-1 bg-gradient-to-r from-primary-400 via-success-500 to-accent-400 rounded-full food-glow"></div>
            </div>
            {/* <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Experience our exciting collection of food-themed games. Play instantly and compete for high scores!
            </p>  */}
          </div>

          {/* Game Container */}
          <div className="food-card p-8 mb-8 relative">
            <TacoGame 
              key={gameKey}
              onGameEnd={handleGameEnd} 
              gameActive={gameActive}
              resetTrigger={resetTrigger}
            />
            
            {/* Floating Play Again Button */}
            {finalScore !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="food-card bg-white/95 p-6 shadow-2xl border-2 border-primary-200 pointer-events-auto food-glow">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold font-display food-text-gradient mb-2">
                      🎉 Great Job! 🎉
                    </h3>
                    <p className="text-lg text-gray-700 mb-4">
                      You scored <span className="font-bold text-2xl food-text-gradient">{finalScore}</span> points!
                    </p>
                    <div className="flex space-x-3 mb-4">
                      <button
                        onClick={restartGame}
                        className="food-button px-6 py-3 font-semibold flex items-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Play Again</span>
                      </button>
                      <button
                        onClick={handlePlayFreeClick}
                        className="bg-gradient-to-r from-success-600 to-success-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-success-700 hover:to-success-800 transition-all transform hover:scale-105 shadow-lg food-glow"
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
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold font-display food-text-gradient mb-8" itemProp="name">{t('landing.chooseYourGame')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center" itemScope itemType="https://schema.org/ItemList">
              {/* Taco Flyer - Currently Playing */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full" itemScope itemType="https://schema.org/Game">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 animate-bounce" role="img" aria-label="Game icon">{gameEmojis[0]}</div>
                  <h3 className="text-2xl font-bold font-display mb-3" itemProp="name">{t('landing.tacoFlyer')}</h3>
                  <p className="text-primary-100 text-base mb-6 leading-relaxed" itemProp="description">{t('landing.tacoFlyerDesc')}</p>
                  <div className="bg-white/30 px-4 py-2 rounded-full text-base font-bold font-display border border-white/40">
                    {t('landing.currentlyPlaying')}
                  </div>
                  <meta itemProp="genre" content="Arcade" />
                  <meta itemProp="gamePlatform" content="Web Browser" />
                </div>
              </div>
              
              {/* Hamburger Runner */}
              <Link
                to="/hamburger-runner"
                className="bg-gradient-to-r from-success-500 to-success-600 rounded-2xl p-8 text-white hover:from-success-600 hover:to-success-700 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group shadow-xl hover:shadow-2xl w-full" itemScope itemType="https://schema.org/Game"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-700"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 animate-pulse" role="img" aria-label="Game icon">{gameEmojis[1]}</div>
                  <h3 className="text-2xl font-bold font-display mb-3" itemProp="name">{t('landing.hamburgerRunner')}</h3>
                  <p className="text-success-100 text-base mb-6 leading-relaxed" itemProp="description">{t('landing.hamburgerRunnerDesc')}</p>
                  <div className="flex items-center justify-center space-x-2 bg-white/30 px-4 py-2 rounded-full text-base font-bold font-display border border-white/40">
                    <Play className="h-4 w-4" />
                    <span>{t('landing.playNow')}</span>
                  </div>
                  <meta itemProp="genre" content="Endless Runner" />
                  <meta itemProp="gamePlatform" content="Web Browser" />
                </div>
              </Link>
              
              {/* Food Blaster Game */}
              
              <div 
                className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl p-8 text-white hover:from-accent-600 hover:to-accent-700 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group shadow-xl hover:shadow-2xl w-full" itemScope itemType="https://schema.org/Game"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-700"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 animate-float" role="img" aria-label="Game icon">{gameEmojis[2]}</div>
                  <h3 className="text-2xl font-bold font-display mb-3" itemProp="name">{t('landing.foodBlaster')}</h3>
                  <p className="text-accent-100 text-base mb-6 leading-relaxed" itemProp="description">{t('landing.foodBlasterDesc')}</p>
                  <div className="flex items-center justify-center space-x-2 bg-white/30 px-4 py-2 rounded-full text-base font-bold font-display border border-white/40">
                    <Play className="h-4 w-4" />
                    <span>{t('landing.comingSoon')}</span>
                  </div>
                  <meta itemProp="genre" content="Shooter" />
                  <meta itemProp="gamePlatform" content="Web Browser" />
                </div>
              </div>
              
              {/* Pizza Hunter - Coming Soon */}
              <div 
                className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white hover:from-primary-600 hover:to-accent-600 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group shadow-xl hover:shadow-2xl w-full" itemScope itemType="https://schema.org/Game"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-700"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 animate-ping" role="img" aria-label="Game icon">{gameEmojis[3]}</div>
                  <h3 className="text-2xl font-bold font-display mb-3" itemProp="name">{t('landing.pizzaHunter')}</h3>
                  <p className="text-primary-100 text-base mb-6 leading-relaxed" itemProp="description">{t('landing.pizzaHunterDesc')}</p>
                  <div className="flex items-center justify-center space-x-2 bg-white/30 px-4 py-2 rounded-full text-base font-bold font-display border border-white/40">
                    <Play className="h-4 w-4" />
                    <span>{t('landing.comingSoon')}</span>
                  </div>
                  <meta itemProp="genre" content="Arcade" />
                  <meta itemProp="gamePlatform" content="Web Browser" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative">
        <div className="absolute inset-0 food-grid opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display food-text-gradient mb-4" itemProp="name">{t('landing.howItWorks')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" itemProp="description">
              {t('landing.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" itemScope itemType="https://schema.org/HowTo">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary-500 to-success-500 p-6 rounded-lg w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform food-glow" itemScope itemType="https://schema.org/HowToStep">
                <CreditCard className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900 mb-4" itemProp="name">{t('landing.step1.title')}</h3>
              <p className="text-gray-600" itemProp="text">
                {t('landing.step1.description')}
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-success-500 to-accent-500 p-6 rounded-lg w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform food-glow" itemScope itemType="https://schema.org/HowToStep">
                <Trophy className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900 mb-4" itemProp="name">{t('landing.step2.title')}</h3>
              <p className="text-gray-600" itemProp="text">
                {t('landing.step2.description')}
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-accent-500 to-primary-500 p-6 rounded-lg w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform food-glow" itemScope itemType="https://schema.org/HowToStep">
                <QrCode className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900 mb-4" itemProp="name">{t('landing.step3.title')}</h3>
              <p className="text-gray-600" itemProp="text">
                {t('landing.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Commented out as in original */}
      {/* <div className="py-16 bg-gradient-to-r from-royal-blue-500 to-steel-blue-500">
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
      </div> */}
    </div>
  );
};

export default Landing;