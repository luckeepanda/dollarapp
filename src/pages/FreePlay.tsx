import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRandomEmojis } from '../utils/emojiSystem';
import TacoGame from '../components/TacoGame';
import NicknameModal from '../components/NicknameModal';
import LeaderboardModal from '../components/LeaderboardModal';
import SlotMachine from '../components/SlotMachine';
import { leaderboardService } from '../services/leaderboardService';
import {
  Trophy,
  GamepadIcon,
  Home,
  Play,
  Gamepad2
} from 'lucide-react';

const FreePlay: React.FC = () => {
  const { user, logout } = useAuth();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [gameEmojis, setGameEmojis] = useState<string[]>(['🌮', '🍔', '🚀', '🍕']);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🌮');
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const characterOptions = ['🌮', '🍕', '🍺', '💅', '🚗'];

  // Rotate game emojis on component mount
  React.useEffect(() => {
    setGameEmojis(getRandomEmojis(4));
  }, []);

  console.log('FreePlay: Component rendered', { 
    gameActive, 
    finalScore, 
    gameKey, 
    resetTrigger 
  });

  const handleLogout = async () => {
    try {
      await logout();
      // Force navigation to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to home page
      window.location.href = '/';
    }
  };

  const handleGameEnd = useCallback((score: number) => {
    console.log('FreePlay: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
    
    // Show nickname modal for score submission
    setShowNicknameModal(true);
  }, []);

  const handleNicknameSubmit = async (nickname: string) => {
    if (finalScore === null) return;
    
    setIsSubmittingScore(true);
    try {
      await leaderboardService.addScore(nickname, finalScore, user?.id);
      console.log('Score saved to leaderboard:', { nickname, score: finalScore });
      setShowNicknameModal(false);
      setShowLeaderboard(true);
    } catch (error) {
      console.error('Failed to save score:', error);
      alert('Failed to save score to leaderboard. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleNicknameSkip = () => {
    setShowNicknameModal(false);
    setShowLeaderboard(true);
  };

  const handleSlotSelection = (emoji: string) => {
    setSelectedEmoji(emoji);
    setHasSpun(true);
    setTimeout(() => {
      setIsSpinning(false);
      setFinalScore(null);
      setGameActive(false);
      setGameKey(prev => prev + 1);
      setResetTrigger(prev => prev + 1);
      setTimeout(() => {
        setGameActive(true);
      }, 100);
    }, 500);
  };

  const handleStartSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setHasSpun(false);
  };

  const restartGame = useCallback(() => {
    console.log('FreePlay: Restarting game - forcing component remount');
    
    // Close any open modals
    setShowNicknameModal(false);
    setShowLeaderboard(false);
    
    // Reset all game-related state
    setFinalScore(null);
    setGameActive(false);
    
    // Force component remount by changing key
    setGameKey(prev => {
      const newKey = prev + 1;
      console.log('FreePlay: Game key incremented to force remount:', newKey);
      return newKey;
    });
    
    // Trigger reset in TacoGame component
    setResetTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('FreePlay: Reset trigger incremented to:', newTrigger);
      return newTrigger;
    });
    
    // Small delay to ensure reset is processed, then activate game
    setTimeout(() => {
      console.log('FreePlay: Activating game after reset and remount');
      setGameActive(true);
    }, 100);
  }, []);

  console.log('FreePlay: About to render TacoGame with props:', {
    gameActive,
    resetTrigger,
    gameKey,
    finalScore
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Simple Header for Free Play */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
                <GamepadIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent font-display">
                Free Play Mode
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{user.username}</span>
                  <span className="px-2 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                    {user.accountType}
                  </span>
                </div>
              )}
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Home</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Slot Machine Character Selection */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display food-text-gradient mb-8">Choose Your Player</h2>

          <div className="flex flex-col items-center space-y-8">
            <SlotMachine
              emojis={characterOptions}
              onSelection={handleSlotSelection}
              isSpinning={isSpinning}
            />

            <button
              onClick={handleStartSpin}
              disabled={isSpinning}
              className={`relative group ${
                isSpinning
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95'
              } transition-all duration-200`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-b from-red-500 to-red-700 text-white px-16 py-6 rounded-full text-3xl font-black shadow-2xl border-8 border-yellow-400 group-hover:border-yellow-300 transition-all">
                <div className="flex items-center space-x-3">
                  <Play className="h-8 w-8" />
                  <span>{isSpinning ? 'SPINNING...' : hasSpun ? 'SPIN AGAIN' : 'START'}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="food-card p-8 mb-8 relative">
          {/* Force component remount with key prop */}
          <TacoGame 
            key={gameKey}
            onGameEnd={handleGameEnd} 
            gameActive={gameActive}
            resetTrigger={resetTrigger}
            selectedEmoji={selectedEmoji}
          />
          
          {/* Floating Play Again Button - positioned over the canvas */}
          {finalScore !== null && !showNicknameModal && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl border-2 border-primary-300 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary-700 mb-2 font-display">
                    🎉 Great Job! 🎉
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    You scored <span className="font-bold text-2xl">{finalScore}</span> points!
                  </p>
                  <div className="flex space-x-3 mb-4">
                    <button
                      onClick={restartGame}
                      className="food-button px-6 py-3 rounded-lg font-semibold"
                    >
                      Play Again
                    </button>
                    <Link
                      to="/hamburger-runner"
                      className="bg-gradient-to-r from-success-600 to-success-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-success-700 hover:to-success-800 transition-all transform hover:scale-105 shadow-sm inline-block"
                    >
                      Try Burger Runner (Beta)
                    </Link>
                  </div>
                  
                  {/* Leaderboard Button */}
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="w-full bg-gradient-to-r from-accent-500 to-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-accent-600 hover:to-primary-600 transition-all transform hover:scale-105 shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Trophy className="h-5 w-5" />
                    <span>View Leaderboard</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Options Section */}
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-display">Choose Your Game</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {/* Taco Flyer - Currently Playing */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-6 animate-bounce">{gameEmojis[0]}</div>
                <h3 className="text-2xl font-bold font-display mb-3">Taco Flyer</h3>
                <p className="text-primary-100 text-base mb-6 leading-relaxed">Guide the taco through obstacles!</p>
                <div className="bg-white/30 px-4 py-2 rounded-full text-base font-bold border border-white/40">
                  Currently Playing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        onSubmit={handleNicknameSubmit}
        onSkip={handleNicknameSkip}
        score={finalScore || 0}
        isSubmitting={isSubmittingScore}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        onPlayAgain={restartGame}
      />
    </div>
  );
};

export default FreePlay;