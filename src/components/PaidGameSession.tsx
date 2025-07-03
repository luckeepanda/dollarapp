import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gameSessionService } from '../services/gameSessionService';
import TacoGame from './TacoGame';
import { Trophy, DollarSign, Users } from 'lucide-react';

interface PaidGameSessionProps {
  sessionId: string;
  onGameComplete: (qualified: boolean, score: number, prizeWon?: number) => void;
  onLeaveSession: () => void;
}

const PaidGameSession: React.FC<PaidGameSessionProps> = ({
  sessionId,
  onGameComplete,
  onLeaveSession
}) => {
  const { user, updateBalance } = useAuth();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const { session: sessionData } = await gameSessionService.getSessionDetails(sessionId);
      setSession(sessionData);
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  };

  const handleGameEnd = useCallback(async (score: number) => {
    console.log('PaidGameSession: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
    setIsSubmittingScore(true);

    try {
      if (!user) throw new Error('User not found');

      // Submit score to the session
      const qualified = await gameSessionService.submitScore(sessionId, user.id, score);
      
      // Check if all players have finished (in a real app, you'd have better coordination)
      // For now, we'll complete the session immediately
      await gameSessionService.completeSession(sessionId);
      
      // Calculate potential prize (this would be more sophisticated in a real app)
      let prizeWon = 0;
      if (qualified && session) {
        // Simple calculation - in reality, you'd wait for all players and then distribute
        prizeWon = session.prize_pool / Math.max(1, session.current_players); // Rough estimate
        
        // Update user balance locally (the database function already updated it)
        updateBalance((user.balance || 0) + prizeWon);
      }

      onGameComplete(qualified, score, prizeWon);
    } catch (error) {
      console.error('Failed to submit score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  }, [sessionId, user, session, onGameComplete, updateBalance]);

  const restartGame = useCallback(() => {
    console.log('PaidGameSession: Restarting game');
    
    setFinalScore(null);
    setGameActive(false);
    
    setGameKey(prev => prev + 1);
    setResetTrigger(prev => prev + 1);
    
    setTimeout(() => {
      setGameActive(true);
    }, 100);
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-royal-blue-100 to-steel-blue-100 bg-clip-text text-transparent mb-4">
            🌮 Taco Flyer Challenge 🌮
          </h1>
          
          {/* Game Info */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 inline-block">
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-white">Prize Pool: ${session.prize_pool.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Min Score: {session.min_score}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-royal-blue-300" />
                <span className="text-white">{session.current_players} Players</span>
              </div>
            </div>
          </div>
        </div>

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
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-royal-blue-300 pointer-events-auto">
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
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-royal-blue-700 mb-2">
                        🎉 Game Complete! 🎉
                      </h3>
                      <p className="text-lg text-royal-blue-600 mb-4">
                        Final Score: <span className="font-bold text-2xl">{finalScore}</span> points
                      </p>
                      <p className="text-sm text-royal-blue-500 mb-4">
                        {finalScore >= session.min_score 
                          ? '✅ Qualified for prize draw!' 
                          : `❌ Need ${session.min_score} points to qualify`
                        }
                      </p>
                      <button
                        onClick={onLeaveSession}
                        className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all transform hover:scale-105 shadow-lg"
                      >
                        View Results
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
            <li>• Score at least {session.min_score} points to qualify for the prize</li>
            <li>• Qualified players split the ${session.prize_pool.toFixed(2)} prize pool equally</li>
            <li>• The more players qualify, the smaller each prize share</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaidGameSession;