import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gameSessionService, type GameSession } from '../services/gameSessionService';
import TacoGame from './TacoGame';
import NicknameModal from './NicknameModal';
import TournamentResultsModal from './TournamentResultsModal';
import { Trophy, DollarSign, Users, Crown } from 'lucide-react';

interface TournamentGameSessionProps {
  sessionId: string;
  onGameComplete: (results: any) => void;
  onLeaveSession: () => void;
}

const TournamentGameSession: React.FC<TournamentGameSessionProps> = ({
  sessionId,
  onGameComplete,
  onLeaveSession
}) => {
  const { user, updateBalance } = useAuth();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [session, setSession] = useState<GameSession | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
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
    console.log('TournamentGameSession: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
    
    // Show nickname modal for tournament leaderboard submission
    setShowNicknameModal(true);
  }, []);

  const handleNicknameSubmit = async (nickname: string) => {
    if (finalScore === null || !user) return;
    
    setIsSubmittingScore(true);
    try {
      // Submit score to tournament
      await gameSessionService.submitScore(sessionId, user.id, finalScore);
      
      // Add to global leaderboard with tournament indicator
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: `🏆 ${nickname}`,
          score: finalScore,
          userId: user.id,
          tournamentId: sessionId
        })
      });

      setShowNicknameModal(false);
      setShowResultsModal(true);
    } catch (error) {
      console.error('Failed to submit tournament score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleNicknameSkip = () => {
    setShowNicknameModal(false);
    setShowResultsModal(true);
  };

  const handleResultsClose = () => {
    setShowResultsModal(false);
    onLeaveSession();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading tournament...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tournament Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-royal-blue-100 to-steel-blue-100 bg-clip-text text-transparent mb-4">
            🏆 Tournament Game 🏆
          </h1>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 inline-block">
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-white">Entry: $1.00</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Tournament Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-orange-400" />
                <span className="text-white">Compete for Glory!</span>
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
          {finalScore !== null && !showNicknameModal && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-royal-blue-300 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-royal-blue-700 mb-2">
                    🎉 Tournament Complete! 🎉
                  </h3>
                  <p className="text-lg text-royal-blue-600 mb-4">
                    Final Score: <span className="font-bold text-2xl">{finalScore}</span> points
                  </p>
                  <p className="text-sm text-royal-blue-500 mb-4">
                    Your score has been submitted to the tournament!
                  </p>
                  <button
                    onClick={onLeaveSession}
                    className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tournament Info */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h3 className="text-white font-semibold mb-3">Tournament Format:</h3>
          <ul className="text-royal-blue-200 text-sm space-y-1">
            <li>• $1 entry fee per game</li>
            <li>• Play the taco game and get your best score</li>
            <li>• Your score is added to the tournament leaderboard</li>
            <li>• Compete against other players for the highest score</li>
            <li>• Winners are determined by the global tournament rankings</li>
          </ul>
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

      {/* Tournament Results Modal */}
      <TournamentResultsModal
        isOpen={showResultsModal}
        onClose={handleResultsClose}
        userScore={finalScore || 0}
        sessionId={sessionId}
      />
    </div>
  );
};

export default TournamentGameSession;