import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import HamburgerRunner from '../components/HamburgerRunner';
import { 
  Trophy,
  Star,
  GamepadIcon,
  Home,
  ArrowLeft
} from 'lucide-react';

const HamburgerRunnerGame: React.FC = () => {
  const { t } = useLanguage();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  console.log('HamburgerRunnerGame: Component rendered', { 
    gameActive, 
    finalScore, 
    gameKey, 
    resetTrigger 
  });

  const handleGameEnd = useCallback((score: number) => {
    console.log('HamburgerRunnerGame: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
  }, []);

  const restartGame = useCallback(() => {
    console.log('HamburgerRunnerGame: Restarting game - forcing component remount');
    
    // Reset all game-related state
    setFinalScore(null);
    setGameActive(false);
    
    // Force component remount by changing key
    setGameKey(prev => {
      const newKey = prev + 1;
      console.log('HamburgerRunnerGame: Game key incremented to force remount:', newKey);
      return newKey;
    });
    
    // Trigger reset in HamburgerRunner component
    setResetTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('HamburgerRunnerGame: Reset trigger incremented to:', newTrigger);
      return newTrigger;
    });
    
    // Small delay to ensure reset is processed, then activate game
    setTimeout(() => {
      console.log('HamburgerRunnerGame: Activating game after reset and remount');
      setGameActive(true);
    }, 100);
  }, []);

  const goBackToFreePlay = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Simple Header for Hamburger Runner */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBackToFreePlay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-green-600 to-yellow-500 p-2 rounded-lg">
                  <GamepadIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                  {t('hamburgerRunner.title')}
                </span>
              </div>
            </div>
            
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>{t('freePlay.backToHome')}</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                🍔 {t('hamburgerRunner.title')} 🍔
              </h1>
              <p className="text-gray-600 mt-2">{t('hamburgerRunner.subtitle')}</p>
            </div>
          </div>
          
          {/* Game Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 inline-block">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <GamepadIcon className="h-5 w-5 text-green-500" />
                <span className="font-semibold">{t('hamburgerRunner.templeRunStyle')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>{t('hamburgerRunner.endlessRunner')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-orange-500" />
                <span>{t('hamburgerRunner.collectCoins')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 relative">
          {/* Force component remount with key prop */}
          <HamburgerRunner 
            key={gameKey}
            onGameEnd={handleGameEnd} 
            gameActive={gameActive}
            resetTrigger={resetTrigger}
          />
          
          {/* Floating Play Again Button - positioned over the canvas */}
          {finalScore !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-green-200 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    🎉 {t('hamburgerRunner.amazingRun')} 🎉
                  </h3>
                  <p className="text-lg text-green-700 mb-4">
                    {t('freePlay.youScored')} <span className="font-bold text-2xl">{finalScore}</span> {t('freePlay.points')}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={restartGame}
                      className="bg-gradient-to-r from-green-600 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      {t('freePlay.playAgain')}
                    </button>
                    <button
                      onClick={goBackToFreePlay}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg"
                    >
                      {t('freePlay.otherGames')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HamburgerRunnerGame;