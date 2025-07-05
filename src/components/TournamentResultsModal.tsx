import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, X, User, Calendar, Crown, RotateCcw, Home } from 'lucide-react';
import { tournamentService, type TournamentResult, type ScoreSubmissionResult } from '../services/tournamentService';

interface TournamentResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userScore: number;
  tournamentId: string;
  onPlayAgain: () => void;
  onLeaveTournament: () => void;
  canPlayAgain: boolean;
  entryNumber: number;
  scoreResult: ScoreSubmissionResult | null;
}

const TournamentResultsModal: React.FC<TournamentResultsModalProps> = ({ 
  isOpen, 
  onClose, 
  userScore,
  tournamentId,
  onPlayAgain,
  onLeaveTournament,
  canPlayAgain,
  entryNumber,
  scoreResult
}) => {
  const [tournamentResults, setTournamentResults] = useState<TournamentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTournamentResults();
    }
  }, [isOpen, tournamentId]);

  const fetchTournamentResults = async () => {
    try {
      setIsLoading(true);
      const results = await tournamentService.getTournamentResults(tournamentId);
      setTournamentResults(results);
    } catch (error) {
      console.error('Failed to fetch tournament results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-royal-blue-800 flex items-center justify-center">
            <span className="text-sm font-bold text-royal-blue-100">{rank}</span>
          </div>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-white-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-300" />
            <h2 className="text-2xl font-bold">Tournament Leaderboard</h2>
          </div>
          <p className="text-royal-blue-100">
            {scoreResult?.tournament_completed ? 'Tournament Complete!' : `${scoreResult?.entries_count || 0}/5 Players Completed`}
          </p>
          
          <div className="mt-4 p-3 bg-white/20 rounded-xl">
            <p className="text-sm text-royal-blue-100">Your Entry #{entryNumber} Score</p>
            <p className="text-xl font-bold">{userScore} points</p>
            {scoreResult?.tournament_completed && scoreResult.winner_id && (
              <p className="text-sm text-yellow-300 mt-1">
                {scoreResult.your_score === scoreResult.winning_score ? '🏆 You Won!' : `Winner: ${scoreResult.winning_score} points`}
              </p>
            )}
          </div>
        </div>

        {/* Results Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue-500"></div>
            </div>
          ) : tournamentResults.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-white-300 mx-auto mb-4" />
              <p className="text-white-200">No entries yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tournamentResults.map((entry, index) => {
                const isCurrentUser = entry.user_id === scoreResult?.winner_id && entry.is_winner;
                const isYourEntry = entry.score === userScore;
                
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border-2 transition-all ${getRankBg(entry.rank)} ${
                      isYourEntry ? 'ring-2 ring-royal-blue-500 ring-offset-2' : ''
                    } ${entry.is_winner ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' : ''}`}
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {entry.is_winner ? (
                          <Crown className="h-6 w-6 text-yellow-500 animate-pulse" />
                        ) : (
                          getRankIcon(entry.rank)
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white-100">
                              {entry.username}
                            </span>
                            {entry.is_winner && (
                              <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full font-medium">
                                WINNER
                              </span>
                            )}
                            {isYourEntry && (
                              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-white-300">
                            <Calendar className="h-3 w-3" />
                            <span>Rank #{entry.rank}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white-100">
                          {entry.score}
                        </div>
                        <div className="text-sm text-white-300">points</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-steel-blue-900 border-t border-white-400 space-y-3">
          {canPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Play Again - $1</span>
            </button>
          )}
          
          {!canPlayAgain && (
            <div className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold text-center opacity-50">
              Insufficient Balance - Add Funds to Play Again
            </div>
          )}
          
          <button
            onClick={onLeaveSession}
            className="w-full bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white py-3 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentResultsModal;