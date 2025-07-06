import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { restaurantGameService, type RestaurantGame, type GameResult } from '../services/restaurantGameService';
import TacoGame from './TacoGame';
import GameLeaderboard from './GameLeaderboard';
import { Trophy, DollarSign, Users, Crown, QrCode, RotateCcw, Home } from 'lucide-react';
import type { RestaurantGameEntry } from '../services/restaurantGameService';

interface RestaurantGameSessionProps {
  game: RestaurantGame;
  onGameComplete: (results: GameResult) => void;
  onLeaveGame: () => void;
}

const RestaurantGameSession: React.FC<RestaurantGameSessionProps> = ({
  game,
  onGameComplete,
  onLeaveGame
}) => {
  const { user } = useAuth();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [userEntryCount, setUserEntryCount] = useState(0);
  const [userBestScore, setUserBestScore] = useState(0);
  const [isJoiningAgain, setIsJoiningAgain] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameEntries, setGameEntries] = useState<RestaurantGameEntry[]>([]);

  // Load user's previous entries and best score
  React.useEffect(() => {
    if (user && game) {
      loadUserStats();
    }
  }, [user, game]);

  const loadUserStats = async () => {
    if (!user || !game) return;
    
    try {
      const [entryCount, bestScore] = await Promise.all([
        restaurantGameService.getUserEntryCount(game.id, user.id),
        restaurantGameService.getUserBestScore(game.id, user.id)
      ]);
      
      setUserEntryCount(entryCount);
      setUserBestScore(bestScore);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const loadGameEntries = async () => {
    try {
      const entries = await restaurantGameService.getGameEntries(game.id);
      setGameEntries(entries);
    } catch (error) {
      console.error('Failed to load game entries:', error);
    }
  };

  const handleGameEnd = useCallback(async (score: number) => {
    console.log('RestaurantGameSession: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
    setIsSubmittingScore(true);

    try {
      if (!user) throw new Error('User not found');

      // Submit score to the restaurant game
      const result = await restaurantGameService.submitScore(game.id, user.id, score);
      setGameResult(result);
      
      // Load updated game entries for leaderboard
      await loadGameEntries();
      
      // Update user stats
      await loadUserStats();
      
      onGameComplete(result);
    } catch (error) {
      console.error('Failed to submit score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  }, [game.id, user, onGameComplete]);

  const restartGame = useCallback(() => {
    console.log('RestaurantGameSession: Restarting game');
    
    setFinalScore(null);
    setGameActive(false);
    setGameResult(null);
    
    setGameKey(prev => prev + 1);
    setResetTrigger(prev => prev + 1);
    
    setTimeout(() => {
      setGameActive(true);
    }, 100);
  }, []);

  const handlePlayAgain = async () => {
    if (!user || !game) return;
    
    if (user.balance < game.entry_fee) {
      alert('Insufficient balance. Please add funds to play again.');
      return;
    }

    setIsJoiningAgain(true);
    try {
      await restaurantGameService.joinGame(game.id, user.id);
      
      // Update user balance locally
      const { updateBalance } = useAuth();
      updateBalance(user.balance - game.entry_fee);
      
      // Reset game state for new attempt
      setFinalScore(null);
      setGameResult(null);
      setGameActive(false);
      
      // Update user stats
      await loadUserStats();
      
      // Force component remount
      setGameKey(prev => prev + 1);
      setResetTrigger(prev => prev + 1);
      
      // Activate game after reset
      setTimeout(() => {
        setGameActive(true);
      }, 100);
      
    } catch (error: any) {
      console.error('Failed to join game again:', error);
      alert(error.message || 'Failed to join game. Please try again.');
    } finally {
      setIsJoiningAgain(false);
    }
  };

  const handleViewLeaderboard = () => {
    loadGameEntries();
    setShowLeaderboard(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Container */}
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 mb-8 relative">
          <TacoGame 
            key={gameKey}
            onGameEnd={handleGameEnd} 
            gameActive={gameActive}
            resetTrigger={resetTrigger}
          />
          
          {/* Game Over Overlay */}
          {finalScore !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-royal-blue-300 pointer-events-auto max-w-md w-full">
                <div className="text-center">
                  {isSubmittingScore ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue-500 mx-auto mb-4"></div>
                      <h3 className="text-2xl font-bold text-royal-blue-700 mb-2">
                        Submitting Score...
                      </h3>
                      <p className="text-lg text-royal-blue-600">
                        You scored <span className="font-bold text-2xl">{finalScore}</span> points!
                      </p>
                    </>
                  )}
                  
                  {gameResult.game_completed && (
                    <button
                      onClick={handleViewLeaderboard}
                      className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      View Final Leaderboard
                    </button>
                  ) : gameResult ? (
                    <>
                      <h3 className="text-2xl font-bold text-royal-blue-700 mb-2">
                        {gameResult.game_completed ? '🎉 Game Complete! 🎉' : '✅ Score Submitted!'}
                      </h3>
                      <p className="text-lg text-royal-blue-600 mb-4">
                        Final Score: <span className="font-bold text-2xl">{finalScore}</span> points
                      </p>
                      
                      {gameResult.qualified ? (
                        <p className="text-sm text-green-600 mb-4">
                          ✅ You qualified! (Min: {game.min_score} points)
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 mb-4">
                          ❌ Need {game.min_score} points to qualify
                        </p>
                      )}

                      {gameResult.game_completed && (
                        <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          {gameResult.winner_id === user?.id ? (
                            <>
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <Crown className="h-6 w-6 text-yellow-600" />
                                <span className="text-lg font-bold text-yellow-800">YOU WON!</span>
                              </div>
                              <p className="text-sm text-yellow-700 mb-3">
                                Congratulations! You won ${game.prize_pool.toFixed(2)}!
                              </p>
                              {gameResult.qr_code && (
                                <div className="bg-white p-3 rounded-lg border border-yellow-300">
                                  <div className="flex items-center justify-center space-x-2 mb-2">
                                    <QrCode className="h-5 w-5 text-yellow-600" />
                                    <span className="font-semibold text-yellow-800">Your QR Code:</span>
                                  </div>
                                  <div className="text-xl font-mono text-center text-gray-800 bg-gray-100 p-2 rounded">
                                    {gameResult.qr_code}
                                  </div>
                                  <p className="text-xs text-yellow-700 mt-2 text-center">
                                    Present this code at {game.restaurant?.username || 'the restaurant'} to claim your prize!
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-yellow-700 mb-2">
                                Game completed! Winner scored {gameResult.winning_score} points.
                              </p>
                              <p className="text-xs text-yellow-600">
                                Better luck next time!
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-royal-blue-500 mb-4">
                        Entries completed: {gameResult.entries_count}/{gameResult.max_players}
                      </p>
                      
                      <div className="flex space-x-3">
                        {!gameResult.game_completed && user && user.balance >= game.entry_fee && (
                          <button
                            onClick={handlePlayAgain}
                            disabled={isJoiningAgain}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 flex items-center justify-center space-x-2 border border-green-400/30"
                          >
                            {isJoiningAgain ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Joining...</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4" />
                                <span>Play Again - ${game.entry_fee.toFixed(2)}</span>
                              </>
                            )}
                          </button>
                        )}
                        
                        {!gameResult.game_completed && user && user.balance < game.entry_fee && (
                          <div className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold text-center opacity-50">
                            Insufficient Balance
                            <button
                              onClick={handleViewLeaderboard}
                              className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                            >
                              View Final Leaderboard
                            </button>
                          </div>
                        )}
                        
                        <button
                          onClick={onLeaveGame}
                          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-2xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 border border-gray-400/30"
                        >
                          <Home className="h-4 w-4" />
                          <span>{gameResult.game_completed ? 'Back to Games' : 'Leave Game'}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-royal-blue-700 mb-2">
                        🎉 Game Complete! 🎉
                      </h3>
                      <p className="text-lg text-royal-blue-600 mb-4">
                        You scored <span className="font-bold text-2xl">{finalScore}</span> points!
                      </p>
                      <button
                        onClick={onLeaveGame}
                        className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white px-6 py-3 rounded-2xl font-bold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-royal-blue-400/30"
                      >
                        Back to Games
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h3 className="text-white font-semibold mb-3">How to Win:</h3>
          <ul className="text-royal-blue-200 text-sm space-y-1">
            <li>• Guide the taco through obstacles by clicking or pressing SPACE</li>
            <li>• Score at least {game.min_score} points to qualify</li>
            <li>• You can play multiple times (${game.entry_fee.toFixed(2)} per attempt)</li>
            <li>• After {game.max_players} total entries, the highest scorer wins</li>
            <li>• Winner receives ${game.prize_pool.toFixed(2)} and a QR code for restaurant redemption</li>
          </ul>
        </div>
      </div>
      
      {/* Game Leaderboard Modal */}
      <GameLeaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        gameEntries={gameEntries}
        currentUserScore={finalScore}
      />
    </div>
  );
};

export default RestaurantGameSession;