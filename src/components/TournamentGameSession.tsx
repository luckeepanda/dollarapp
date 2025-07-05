import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tournamentService, type Tournament, type ScoreSubmissionResult } from '../services/tournamentService';
import TacoGame from './TacoGame';
import NicknameModal from './NicknameModal';
import TournamentResultsModal from './TournamentResultsModal';
import { Trophy, DollarSign, Users, Crown, RotateCcw } from 'lucide-react';

interface TournamentGameSessionProps {
  tournamentId: string;
  onGameComplete: (results: any) => void;
  onLeaveTournament: () => void;
}

const TournamentGameSession: React.FC<TournamentGameSessionProps> = ({
  tournamentId,
  onGameComplete,
  onLeaveTournament
}) => {
  const { user, updateBalance } = useAuth();
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [entryCount, setEntryCount] = useState(1);
  const [scoreResult, setScoreResult] = useState<ScoreSubmissionResult | null>(null);

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const loadTournamentData = async () => {
    try {
      const tournamentData = await tournamentService.getTournament(tournamentId);
      setTournament(tournamentData);
    } catch (error) {
      console.error('Failed to load tournament data:', error);
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
      // Submit score to tournament and get results
      const result = await tournamentService.submitScore(tournamentId, user.id, finalScore);
      setScoreResult(result);
      
      console.log(`Tournament entry submitted with score: ${finalScore}`, result);
      
      setShowNicknameModal(false);
      setShowResultsModal(true);
    } catch (error) {
      console.error('Failed to submit tournament score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleNicknameSkip = async () => {
    if (finalScore !== null && user) {
      try {
        // Submit to tournament even if skipping nickname
        const result = await tournamentService.submitScore(tournamentId, user.id, finalScore);
        setScoreResult(result);
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
    
    setShowNicknameModal(false);
    setShowResultsModal(true);
  };

  const handlePlayAgain = async () => {
    if (!user || user.balance < 1) {
      alert('Insufficient balance. Please add funds to play again.');
      return;
    }

    try {
      // Join another tournament
      const newTournamentId = await tournamentService.joinTournament(user.id);
      
      // Update user balance locally
      updateBalance(user.balance - 1);
      
      // Increment entry count
      setEntryCount(prev => prev + 1);
      
      // Reset game state for new tournament
      setFinalScore(null);
      setGameActive(false);
      setShowResultsModal(false);
      setScoreResult(null);
      
      // Force component remount
      setGameKey(prev => prev + 1);
      setResetTrigger(prev => prev + 1);
      
      // Activate game after reset
      setTimeout(() => {
        setGameActive(true);
      }, 100);
      
    } catch (error: any) {
      console.error('Failed to join new tournament:', error);
      alert(error.message || 'Failed to start new tournament. Please try again.');
    }
  };

  const handleResultsClose = () => {
    setShowResultsModal(false);
    // Don't automatically leave - let user choose to play again or leave
  };

  if (!tournament) {
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
            🏆 Tournament Game #{entryCount} 🏆
          </h1>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 inline-block">
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-white">Entry: ${tournament.entry_fee.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Tournament #{entryCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-orange-400" />
                <span className="text-white">{tournament.current_participants}/{tournament.max_participants} Players</span>
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
          {finalScore !== null && !showNicknameModal && !showResultsModal && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-royal-blue-300 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-royal-blue-700 mb-2">
                    🎉 Tournament #{entryCount} Complete! 🎉
                  </h3>
                  <p className="text-lg text-royal-blue-600 mb-4">
                    Final Score: <span className="font-bold text-2xl">{finalScore}</span> points
                  </p>
                  <p className="text-sm text-royal-blue-500 mb-4">
                    Your score will be submitted to the tournament leaderboard!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tournament Info */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h3 className="text-white font-semibold mb-3">Tournament Format:</h3>
          <ul className="text-royal-blue-200 text-sm space-y-1">
            <li>• $1 entry fee per game attempt</li>
            <li>• Play as many times as you want (balance permitting)</li>
            <li>• Each score is added to the tournament leaderboard</li>
            <li>• Compete for the highest scores across all players</li>
            <li>• Multiple entries allowed - improve your ranking!</li>
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
        tournamentId={tournamentId}
        onPlayAgain={handlePlayAgain}
        onLeaveTournament={onLeaveTournament}
        canPlayAgain={user ? user.balance >= 1 : false}
        entryNumber={entryCount}
        scoreResult={scoreResult}
      />
    </div>
  );
};

export default TournamentGameSession;