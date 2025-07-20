import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, X, User, Calendar, Crown, RotateCcw, Home, QrCode, Copy, CheckCircle } from 'lucide-react';
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
  const [copiedQR, setCopiedQR] = useState(false);

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

  const copyQRCode = async (qrCode: string) => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopiedQR(true);
      setTimeout(() => setCopiedQR(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  const generateQRCodeDataURL = (text: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    canvas.width = 150;
    canvas.height = 150;
    
    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 150, 150);
    
    // Create a simple pattern for the QR code
    ctx.fillStyle = '#000000';
    const cellSize = 8;
    const padding = 15;
    
    // Generate a deterministic pattern based on the text
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const hash = text.charCodeAt((x + y * 15) % text.length);
        if (hash % 3 === 0) {
          ctx.fillRect(
            padding + x * cellSize,
            padding + y * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
    
    // Add corner markers
    const markerSize = 24;
    // Top-left
    ctx.fillRect(padding, padding, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(padding + 4, padding + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(padding + 8, padding + 8, markerSize - 16, markerSize - 16);
    
    // Top-right
    ctx.fillStyle = '#000000';
    ctx.fillRect(150 - padding - markerSize, padding, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(150 - padding - markerSize + 4, padding + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(150 - padding - markerSize + 8, padding + 8, markerSize - 16, markerSize - 16);
    
    // Bottom-left
    ctx.fillStyle = '#000000';
    ctx.fillRect(padding, 150 - padding - markerSize, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(padding + 4, 150 - padding - markerSize + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(padding + 8, 150 - padding - markerSize + 8, markerSize - 16, markerSize - 16);
    
    return canvas.toDataURL();
  };

  if (!isOpen) return null;

  const isWinner = scoreResult?.winner_id && scoreResult.your_score === scoreResult.winning_score;
  const winnerQRCode = scoreResult?.qr_code || (scoreResult?.tournament_completed && isWinner ? `TOURNAMENT-${scoreResult.winner_id}-${Date.now()}` : null);

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
            {scoreResult?.tournament_completed && (
              <p className="text-sm text-yellow-300 mt-1">
                {isWinner ? '🏆 You Won!' : `Winner: ${scoreResult.winning_score} points`}
              </p>
            )}
          </div>
          
          {/* Winner QR Code Display */}
          {winnerQRCode && (
            <div className="mt-4 p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-lg font-bold text-yellow-300">Winner's QR Code</h3>
                </div>
                
                <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                  <img 
                    src={generateQRCodeDataURL(winnerQRCode)} 
                    alt="Winner QR Code"
                    className="w-24 h-24 mx-auto"
                  />
                </div>
                
                <div className="bg-white/10 p-3 rounded-lg mb-3">
                  <p className="text-xs text-yellow-200 mb-1">QR Code:</p>
                  <p className="font-mono text-sm text-yellow-100 break-all">{winnerQRCode}</p>
                </div>
                
                <button
                  onClick={() => copyQRCode(winnerQRCode)}
                  className="flex items-center justify-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors mx-auto"
                >
                  {copiedQR ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy QR Code</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-yellow-200 mt-3">
                  Present this QR code to claim your tournament prize!
                </p>
              </div>
            </div>
          )}
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
                const isYourEntry = entry.user_id === scoreResult?.winner_id && isWinner;
                
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border-2 transition-all ${getRankBg(entry.rank)} ${
                      isYourEntry ? 'ring-2 ring-royal-blue-500 ring-offset-2' : ''
                    } ${entry.is_winner ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' : ''}`}
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
                    
                    {entry.is_winner && (
                      <div className="mt-3 p-2 bg-yellow-50/10 rounded-lg border border-yellow-200/20">
                        <div className="flex items-center justify-center space-x-1">
                          <QrCode className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs text-yellow-300 font-medium">
                            QR Code Generated
                          </span>
                        </div>
                      </div>
                    )}
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
            onClick={onLeaveTournament}
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