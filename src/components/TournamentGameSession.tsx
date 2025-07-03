import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gameSessionService, type GameSession, type GameParticipant } from '../services/gameSessionService';
import TacoGame from './TacoGame';
import { Trophy, DollarSign, Users, Clock, Star, Crown } from 'lucide-react';

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
  const [gameActive, setGameActive] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<GameParticipant | null>(null);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'playing' | 'completed' | 'results'>('waiting');
  const [tournamentResults, setTournamentResults] = useState<GameParticipant[]>([]);

  useEffect(() => {
    loadSessionData();
    
    // Subscribe to real-time updates
    const sessionSubscription = gameSessionService.subscribeToSession(sessionId, (updatedSession) => {
      setSession(updatedSession);
      
      if (updatedSession.status === 'completed') {
        loadTournamentResults();
      }
    });

    const participantsSubscription = gameSessionService.subscribeToParticipants(sessionId, (updatedParticipants) => {
      setParticipants(updatedParticipants);
      checkGamePhase(updatedParticipants);
    });

    return () => {
      supabase.removeChannel(sessionSubscription);
      supabase.removeChannel(participantsSubscription);
    };
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const { session: sessionData, participants: participantsData } = await gameSessionService.getSessionDetails(sessionId);
      setSession(sessionData);
      setParticipants(participantsData);
      checkGamePhase(participantsData);
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  };

  const loadTournamentResults = async () => {
    try {
      const results = await gameSessionService.getTournamentResults(sessionId);
      setTournamentResults(results);
      setGamePhase('results');
    } catch (error) {
      console.error('Failed to load tournament results:', error);
    }
  };

  const checkGamePhase = (participantsList: GameParticipant[]) => {
    if (!session || !user) return;

    const userParticipant = participantsList.find(p => p.user_id === user.id);
    
    if (session.status === 'completed') {
      setGamePhase('results');
      return;
    }

    if (session.current_players < session.max_players) {
      setGamePhase('waiting');
      return;
    }

    // All players joined, check if user has played
    if (userParticipant && userParticipant.has_played) {
      setGamePhase('completed');
    } else {
      setGamePhase('playing');
      setCurrentPlayer(userParticipant || null);
    }
  };

  const startGame = () => {
    setGameActive(true);
  };

  const handleGameEnd = useCallback(async (score: number) => {
    console.log('TournamentGameSession: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
    setIsSubmittingScore(true);

    try {
      if (!user) throw new Error('User not found');

      // Submit score to the tournament
      await gameSessionService.submitScore(sessionId, user.id, score);
      
      // Check if tournament is complete
      const isComplete = await gameSessionService.checkSessionComplete(sessionId);
      
      if (isComplete) {
        // Load final results
        await loadTournamentResults();
      } else {
        setGamePhase('completed');
      }

    } catch (error) {
      console.error('Failed to submit score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmittingScore(false);
    }
  }, [sessionId, user]);

  const restartGame = useCallback(() => {
    console.log('TournamentGameSession: Restarting game');
    
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
          <p className="text-white text-lg">Loading tournament...</p>
        </div>
      </div>
    );
  }

  // Waiting for players phase
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold mb-1">Tournament Mode</h2>
              <p className="text-orange-100">Waiting for players...</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-green-500/20 p-3 rounded-xl mb-2">
                    <DollarSign className="h-6 w-6 text-green-400 mx-auto" />
                  </div>
                  <p className="text-sm text-royal-blue-200">Prize Pool</p>
                  <p className="text-xl font-bold text-green-400">${session.prize_pool.toFixed(2)}</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-royal-blue-500/20 p-3 rounded-xl mb-2">
                    <Crown className="h-6 w-6 text-yellow-400 mx-auto" />
                  </div>
                  <p className="text-sm text-royal-blue-200">Winner Takes All</p>
                  <p className="text-xl font-bold text-yellow-400">Highest Score</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="h-6 w-6 text-white" />
                    <span className="text-2xl font-bold text-white">
                      {session.current_players}/{session.max_players}
                    </span>
                  </div>
                  <p className="text-royal-blue-200">
                    {session.max_players - session.current_players > 0 
                      ? `Waiting for ${session.max_players - session.current_players} more player${session.max_players - session.current_players > 1 ? 's' : ''}...`
                      : 'Tournament starting soon!'
                    }
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Players in Tournament:</h3>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-royal-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-white font-medium">
                        {participant.profiles?.username || 'Player'}
                      </span>
                      <div className="flex-1"></div>
                      <Clock className="h-4 w-4 text-royal-blue-300" />
                    </div>
                  ))}
                  
                  {Array.from({ length: session.max_players - session.current_players }).map((_, index) => (
                    <div key={`empty-${index}`} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg opacity-50">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white/60 font-bold text-sm">{session.current_players + index + 1}</span>
                      </div>
                      <span className="text-white/60 font-medium">Waiting for player...</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl mb-6">
                <h4 className="text-white font-semibold mb-2">Tournament Rules:</h4>
                <ul className="text-sm text-royal-blue-200 space-y-1">
                  <li>• Each player pays $1 to enter</li>
                  <li>• Everyone plays the taco game once</li>
                  <li>• Player with highest score wins ${session.prize_pool.toFixed(2)}</li>
                  <li>• Tournament starts when all 5 players join</li>
                </ul>
              </div>

              <button
                onClick={onLeaveSession}
                className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                Leave Tournament
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-royal-blue-100 to-steel-blue-100 bg-clip-text text-transparent mb-4">
              🏆 Tournament Game 🏆
            </h1>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 inline-block">
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-white">Prize: ${session.prize_pool.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span className="text-white">Winner Takes All</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-royal-blue-300" />
                  <span className="text-white">{session.current_players} Players</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 mb-8 relative">
            <TacoGame 
              key={gameKey}
              onGameEnd={handleGameEnd} 
              gameActive={gameActive}
              resetTrigger={resetTrigger}
            />
            
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
                          🎉 Score Submitted! 🎉
                        </h3>
                        <p className="text-lg text-royal-blue-600 mb-4">
                          Final Score: <span className="font-bold text-2xl">{finalScore}</span> points
                        </p>
                        <p className="text-sm text-royal-blue-500 mb-4">
                          Waiting for other players to finish...
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

            {!gameActive && finalScore === null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-green-200 pointer-events-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      🎮 Your Turn! 🎮
                    </h3>
                    <p className="text-lg text-green-700 mb-4">
                      Play your best game to win the ${session.prize_pool.toFixed(2)} prize!
                    </p>
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Start Game
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <h3 className="text-white font-semibold mb-3">Tournament Format:</h3>
            <ul className="text-royal-blue-200 text-sm space-y-1">
              <li>• Each player gets one attempt at the taco game</li>
              <li>• Your final score is recorded on the tournament leaderboard</li>
              <li>• The player with the highest score wins the entire ${session.prize_pool.toFixed(2)} prize pool</li>
              <li>• Results will be shown when all players have finished</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Results phase
  if (gamePhase === 'results') {
    const winner = tournamentResults[0];
    const userResult = tournamentResults.find(p => p.user_id === user?.id);
    const userRank = tournamentResults.findIndex(p => p.user_id === user?.id) + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-royal-blue-100 to-steel-blue-100 bg-clip-text text-transparent mb-4">
              🏆 Tournament Results 🏆
            </h1>
          </div>

          {/* Winner Announcement */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-2xl shadow-lg mb-8 text-center">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {winner?.profiles?.username || 'Champion'} Wins!
            </h2>
            <p className="text-xl text-yellow-100 mb-4">
              Score: {winner?.final_score} points
            </p>
            <div className="bg-white/20 p-4 rounded-xl inline-block">
              <p className="text-2xl font-bold text-white">
                Prize Won: ${winner?.prize_won?.toFixed(2) || session.prize_pool.toFixed(2)}
              </p>
            </div>
          </div>

          {/* User's Result */}
          {userResult && (
            <div className={`p-6 rounded-2xl shadow-lg mb-8 ${
              userRank === 1 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-white/10 backdrop-blur-sm border border-white/20'
            }`}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Your Result: #{userRank}
                </h3>
                <p className="text-lg text-white mb-2">
                  Score: {userResult.final_score} points
                </p>
                {userRank === 1 ? (
                  <p className="text-xl font-bold text-yellow-200">
                    🎉 Congratulations! You won ${userResult.prize_won?.toFixed(2)}! 🎉
                  </p>
                ) : (
                  <p className="text-royal-blue-200">
                    Better luck next time! The winner scored {winner?.final_score} points.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Final Leaderboard</h3>
            <div className="space-y-3">
              {tournamentResults.map((participant, index) => (
                <div 
                  key={participant.id} 
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-yellow-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-amber-600 text-amber-100' :
                      'bg-royal-blue-500 text-white'
                    }`}>
                      {index === 0 ? '👑' : index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {participant.profiles?.username || 'Player'}
                        {participant.user_id === user?.id && ' (You)'}
                      </p>
                      <p className="text-sm text-royal-blue-200">
                        Score: {participant.final_score} points
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        ${participant.prize_won?.toFixed(2) || session.prize_pool.toFixed(2)}
                      </p>
                      <p className="text-sm text-green-300">Winner</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onLeaveSession}
              className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-royal-blue-600 hover:to-steel-blue-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completed phase (waiting for others)
  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white text-center">
            <div className="text-4xl mb-2">⏳</div>
            <h2 className="text-2xl font-bold mb-1">Game Complete!</h2>
            <p className="text-green-100">Waiting for other players...</p>
          </div>

          <div className="p-6 text-center">
            <div className="bg-white/10 p-4 rounded-xl mb-6">
              <p className="text-sm text-royal-blue-200 mb-2">Your Score</p>
              <p className="text-3xl font-bold text-white">{finalScore}</p>
            </div>

            <div className="bg-blue-500/20 p-4 rounded-xl mb-6">
              <p className="text-blue-300 text-sm">
                Tournament results will be shown when all players have finished their games.
              </p>
            </div>

            <button
              onClick={onLeaveSession}
              className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentGameSession;