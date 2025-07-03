import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import GameWaitingRoom from '../components/GameWaitingRoom';
import TournamentGameSession from '../components/TournamentGameSession';
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
  Users,
  Crown
} from 'lucide-react';

const PlayerDashboard: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<'dashboard' | 'tournament' | 'results'>('dashboard');
  const [isJoining, setIsJoining] = useState(false);
  const [gameResults, setGameResults] = useState<any>(null);

  useEffect(() => {
    checkCurrentSession();
  }, [user]);

  const checkCurrentSession = async () => {
    if (!user) return;
    
    try {
      const session = await gameSessionService.getCurrentSession(user.id);
      if (session) {
        setCurrentSession(session);
        setGameState('tournament');
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
      setGameState('tournament');
    } catch (error: any) {
      console.error('Failed to join game:', error);
      alert(error.message || 'Failed to join game. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleGameComplete = (results: any) => {
    setGameResults(results);
    setGameState('results');
  };

  const handleLeaveSession = () => {
    setCurrentSession(null);
    setGameState('dashboard');
    setGameResults(null);
  };

  // Render tournament game session
  if (gameState === 'tournament' && currentSession) {
    return (
      <TournamentGameSession
        sessionId={currentSession.id}
        onGameComplete={handleGameComplete}
        onLeaveSession={handleLeaveSession}
      />
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
          <p className="text-steel-blue-300">Ready to compete in the tournament and win big?</p>
        </div>

        {/* Balance Warning */}
        {user && user.balance < 1 && (
          <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-600">Insufficient Balance</p>
                <p className="text-xs text-orange-400">
                  You need at least $1 to join a tournament. 
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

          {/* Featured Tournament */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-steel-blue-100">Taco Flyer Tournament</h2>
            </div>
            
            {/* Tournament Card */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl overflow-hidden shadow-lg">
              {/* Tournament Header */}
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🏆</div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Tournament Mode
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">$1 Entry • Winner Takes All</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Compete against 4 other players - highest score wins the entire prize pool!
                </p>
                
                {/* Tournament Stats */}
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
                    <p className="text-lg font-bold">5 Total</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Crown className="h-4 w-4 text-yellow-300" />
                      <span className="text-xs text-orange-100">Prize</span>
                    </div>
                    <p className="text-lg font-bold">$5.00</p>
                  </div>
                </div>

                {/* How it Works */}
                <div className="bg-white/10 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold mb-2">Tournament Format:</h4>
                  <ul className="text-sm text-orange-100 space-y-1">
                    <li>• 5 players each pay $1 to enter</li>
                    <li>• Each player plays the taco game once</li>
                    <li>• Player with the highest score wins all $5</li>
                    <li>• Tournament starts when 5 players join</li>
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
                      <span>Joining Tournament...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Join Tournament - $1</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Rules */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-steel-blue-100">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            <span>How Tournaments Work</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-steel-blue-300">
            <div>
              <h3 className="font-semibold text-steel-blue-100 mb-2">1. Join & Wait</h3>
              <p>Pay $1 to join a tournament. Wait for 4 other players to join before the tournament begins.</p>
            </div>
            <div>
              <h3 className="font-semibold text-steel-blue-100 mb-2">2. Play Your Best</h3>
              <p>Each player gets one attempt at the taco game. Your final score is recorded on the tournament leaderboard.</p>
            </div>
            <div>
              <h3 className="font-semibold text-steel-blue-100 mb-2">3. Winner Takes All</h3>
              <p>The player with the highest score wins the entire $5 prize pool. Results are shown when everyone finishes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;