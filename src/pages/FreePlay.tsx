import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TacoGame from '../components/TacoGame';
import NicknameModal from '../components/NicknameModal';
import LeaderboardModal from '../components/LeaderboardModal';
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

  console.log('FreePlay: Component rendered', { 
    gameActive, 
    finalScore, 
    gameKey, 
    resetTrigger 
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900">
      {/* Simple Header for Free Play */}
      <div className="bg-white shadow-sm border-b border-white-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 p-2 rounded-lg">
                <GamepadIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 bg-clip-text text-transparent">
                Free Play Mode
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{user.username}</span>
                  <span className="px-2 py-1 bg-royal-blue-600 text-white rounded-full text-xs font-medium">
                    {user.accountType}
                  </span>
                </div>
              )}
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-white-200 hover:text-royal-blue-500 transition-colors"
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
        {/* Game Container */}
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 mb-8 relative">
          {/* Force component remount with key prop */}
          <TacoGame 
            key={gameKey}
            onGameEnd={handleGameEnd} 
            gameActive={gameActive}
            resetTrigger={resetTrigger}
          />
          
          {/* Floating Play Again Button - positioned over the canvas */}
          {finalScore !== null && !showNicknameModal && (
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
                      className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Play Again
                    </button>
                    <Link
                      to="/hamburger-runner"
                      className="bg-gradient-to-r from-green-600 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg inline-block"
                    >
                      Other Games
                    </Link>
                  </div>
                  
                  {/* Leaderboard Button */}
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
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
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Choose Your Game</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            
            {/* Tetris Game */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden opacity-75">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🧩</div>
                <h3 className="text-xl font-bold mb-2">Tetris Mobile</h3>
                <p className="text-purple-100 text-sm mb-4">Hold to move, tap to rotate!</p>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Instructions */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center justify-center space-x-2">
              <Gamepad2 className="h-5 w-5 text-orange-400" />
              <span>How to Play</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-royal-blue-200">
              <div>
                <h4 className="font-semibold text-white mb-2">🌮 Taco Flyer</h4>
                <p>Click or press SPACE to make the taco fly. Avoid obstacles and collect coins for points!</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">🍔 Hamburger Runner</h4>
                <p>Click or press SPACE to jump over obstacles. Collect coins and run as far as you can!</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">🧩 Tetris Mobile</h4>
                <p>Hold to move pieces left/right, tap to rotate. Clear lines to score points! (Coming Soon)</p>
              </div>
            </div>
          </div>
          
          {/* Prize Information */}
          <div className="mt-6 text-center">
            <p className="text-royal-blue-200 text-sm">
              🏆 Compete for high scores and save them to the leaderboard! 🏆
            </p>
          </div>
        </div>
      </div>

      {/* Nickname Modal */}
      <NicknameModal
        isOpen={showNicknameModal}
        score={finalScore || 0}
        onSubmit={handleNicknameSubmit}
        onSkip={handleNicknameSkip}
        isSubmitting={isSubmittingScore}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentScore={finalScore || undefined}
      />
    </div>
  );
};

export default FreePlay;