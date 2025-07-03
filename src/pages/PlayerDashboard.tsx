import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import GameWaitingRoom from '../components/GameWaitingRoom';
import PaidGameSession from '../components/PaidGameSession';
import { useAuth } from '../contexts/AuthContext';
import { gameSessionService, type GameSession } from '../services/gameSessionService';
import { 
  CreditCard, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  Play,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';

const PlayerDashboard: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<'dashboard' | 'waiting' | 'playing' | 'results'>('dashboard');
  const [isJoining, setIsJoining] = useState(false);
  const [gameResults, setGameResults] = useState<{
    qualified: boolean;
    score: number;
    prizeWon?: number;
  } | null>(null);

  useEffect(() => {
    checkCurrentSession();
  }, [user]);

  const checkCurrentSession = async () => {
    if (!user) return;
    
    try {
      const session = await gameSessionService.getCurrentSession(user.id);
      if (session) {
        setCurrentSession(session);
        if (session.status === 'waiting') {
          setGameState('waiting');
        } else if (session.status === 'active') {
          setGameState('playing');
        }
      }
    } catch (error) {
      console.error('Failed to check current session:', error);
    }
  };

  const handleJoinGame = async () => {
    if (!user) return;
    
    if (user.balance < 1) {
      alert('Insufficient balance. Please add funds to play.');
      return;
    }

    setIsJoining(true);
    try {
      const sessionId = await gameSessionService.joinGameSession(user.id, 'taco_flyer');
      
      // Update user balance locally
      updateBalance(user.balance - 1);
      
      // Get session details
      const { session } = await gameSessionService.getSessionDetails(sessionId);
      setCurrentSession(session);
      
      if (session.status === 'waiting') {
        setGameState('waiting');
      } else if (session.status === 'active') {
        setGameState('playing');
      }
    } catch (error: any) {
      console.error('Failed to join game:', error);
      alert(error.message || 'Failed to join game. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleGameStart = () => {
    setGameState('playing');
  };

  const handleGameComplete = (qualified: boolean, score: number, prizeWon?: number) => {
    setGameResults({ qualified, score, prizeWon });
    setGameState('results');
  };

  const handleLeaveSession = () => {
    setCurrentSession(null);
    setGameState('dashboard');
    setGameResults(null);
  };

  // Render different states
  if (gameState === 'waiting' && currentSession) {
    return (
      <GameWaitingRoom
        sessionId={currentSession.id}
        onGameStart={handleGameStart}
        onLeaveSession={handleLeaveSession}
      />
    );
  }

  if (gameState === 'playing' && currentSession) {
    return (
      <PaidGameSession
        sessionId={currentSession.id}
        onGameComplete={handleGameComplete}
        onLeaveSession={handleLeaveSession}
      />
    );
  }

  if (gameState === 'results' && gameResults) {
    return (
      <div className="min-h-screen bg-steel-blue-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="text-6xl mb-4">
                {gameResults.qualified ? '🎉' : '😔'}
              </div>
              
              <h2 className="text-3xl font-bold text-steel-blue-100 mb-4">
                {gameResults.qualified ? 'Congratulations!' : 'Better Luck Next Time!'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-royal-blue-200 text-sm">Your Score</p>
                  <p className="text-3xl font-bold text-steel-blue-100">{gameResults.score}</p>
                </div>
                
                {gameResults.qualified && gameResults.prizeWon && (
                  <div className="bg-green-500/20 p-4 rounded-xl border border-green-400/30">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      <p className="text-green-300 font-semibold">Prize Won!</p>
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                      ${gameResults.prizeWon.toFixed(2)}
                    </p>
                  </div>
                )}
                
                {!gameResults.qualified && (
                  <div className="bg-orange-500/20 p-4 rounded-xl border border-orange-400/30">
                    <p className="text-orange-300 text-sm">
                      You needed at least 5 points to qualify for the prize.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleJoinGame}
                  disabled={isJoining || (user?.balance || 0) < 1}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Play Again - $1</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleLeaveSession}
                  className="w-full bg-white/10 text-steel-blue-100 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-steel-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-steel-blue-100 mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-steel-blue-300">Ready to win some delicious prizes today?</p>
        </div>

        {/* Balance Warning */}
        {user && user.balance < 1 && (
          <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-600">Insufficient Balance</p>
                <p className="text-xs text-orange-400">
                  You need at least $1 to join a game. 
                  <Link to="/deposit" className="font-semibold hover:underline ml-1">
                    Add funds now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Only Balance */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-steel-blue-300">Current Balance</p>
                <p className="text-2xl font-bold text-green-400">${user?.balance.toFixed(2)}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-steel-blue-100">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/deposit"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-royal-blue-500/20 to-steel-blue-500/20 rounded-xl hover:from-royal-blue-500/30 hover:to-steel-blue-500/30 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-royal-blue-300" />
                  <span className="font-medium text-steel-blue-100">Add Funds</span>
                </div>
                <ArrowRight className="h-4 w-4 text-royal-blue-200 group-hover:text-steel-blue-100" />
              </Link>
            </div>
          </div>

          {/* Featured Game */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-steel-blue-100">Taco Flyer Challenge</h2>
            </div>
            
            {/* Game Card */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl overflow-hidden shadow-lg">
              {/* Game Header */}
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🌮</div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Live Game
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">$1 Entry • $5 Prize Pool</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Join 4 other players in this competitive taco flying challenge!
                </p>
                
                {/* Game Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <DollarSign className="h-4 w-4 text-yellow-300" />
                      <span className="text-xs text-orange-100">Entry Fee</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-300">$1.00</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Users className="h-4 w-4 text-orange-100" />
                      <span className="text-xs text-orange-100">Players</span>
                    </div>
                    <p className="text-lg font-bold">5 Max</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-300" />
                      <span className="text-xs text-orange-100">Min Score</span>
                    </div>
                    <p className="text-lg font-bold">5 Points</p>
                  </div>
                </div>

                {/* How it Works */}
                <div className="bg-white/10 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold mb-2">How it Works:</h4>
                  <ul className="text-sm text-orange-100 space-y-1">
                    <li>• Pay $1 to join a 5-player game</li>
                    <li>• Score 5+ points to qualify for prizes</li>
                    <li>• Qualified players split the $5 prize pool</li>
                    <li>• Game starts when 5 players join</li>
                  </ul>
                </div>

                {/* Join Button */}
                <button
                  onClick={handleJoinGame}
                  disabled={isJoining || (user && user.balance < 1)}
                  className="w-full bg-white text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg"
                >
                  {isJoining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <span>Joining Game...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Join Game - $1</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-steel-blue-100">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            <span>How Paid Games Work</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-steel-blue-300">
            <div>
              <h3 className="font-semibold text-steel-blue-100 mb-2">1. Join & Pay</h3>
              <p>Pay $1 to join a game session. You'll wait for 4 other players to join before the game starts.</p>
            </div>
            <div>
              <h3 className="font-semibold text-steel-blue-100 mb-2">2. Play & Score</h3>
              <p>Guide your taco through obstacles. Score at least 5 points to qualify for the prize pool.</p>
            </div>
            <div>
              <h3 className="font-semibold text-steel-blue-100 mb-2">3. Win Prizes</h3>
              <p>All qualified players split the $5 prize pool equally. The more players qualify, the smaller each share.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;