import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import TacoGame from '../components/TacoGame';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp,
  ArrowLeft,
  Play,
  GamepadIcon
} from 'lucide-react';

const GameEntry: React.FC = () => {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentGameData, setCurrentGameData] = useState<any>(null);

  const games = [
    {
      id: 1,
      name: 'Taco Flyer Challenge',
      description: 'Guide the taco through obstacles to win lunch!',
      prizePool: 127.50,
      players: 89,
      maxPlayers: 100,
      timeLeft: '2h 15m',
      difficulty: 'Easy',
      category: 'Lunch',
      image: '🌮',
      minScore: 5
    },
    {
      id: 2,
      name: 'Dinner Taco Battle',
      description: 'Premium dinner experience for high scorers',
      prizePool: 234.75,
      players: 156,
      maxPlayers: 200,
      timeLeft: '4h 30m',
      difficulty: 'Medium',
      category: 'Dinner',
      image: '🌮',
      minScore: 10
    },
    {
      id: 3,
      name: 'Weekend Taco Festival',
      description: 'Grand prize food festival experience',
      prizePool: 567.25,
      players: 287,
      maxPlayers: 500,
      timeLeft: '1d 6h',
      difficulty: 'Hard',
      category: 'Special',
      image: '🌮',
      minScore: 20
    },
    {
      id: 4,
      name: 'Morning Taco Run',
      description: 'Breakfast treats for early birds',
      prizePool: 45.50,
      players: 34,
      maxPlayers: 50,
      timeLeft: '45m',
      difficulty: 'Easy',
      category: 'Breakfast',
      image: '🌮',
      minScore: 3
    }
  ];

  const handleJoinGame = async (gameId: number) => {
    if (user && user.balance < 1) {
      alert('Insufficient balance. Please add funds to play.');
      return;
    }

    const game = games.find(g => g.id === gameId);
    if (!game) return;

    setIsJoining(true);
    setSelectedGame(gameId);

    // Simulate API call
    setTimeout(() => {
      setCurrentGameData(game);
      setGameActive(true);
      setIsJoining(false);
      setSelectedGame(null);
    }, 2000);
  };

  const handleGameEnd = (score: number) => {
    if (!currentGameData) return;

    const qualified = score >= currentGameData.minScore;
    
    if (qualified) {
      alert(`Congratulations! You scored ${score} points and qualified for the ${currentGameData.name}! You've been entered into the prize draw.`);
    } else {
      alert(`Game over! You scored ${score} points. You need at least ${currentGameData.minScore} points to qualify for ${currentGameData.name}. Try again!`);
    }
    
    setGameActive(false);
    setCurrentGameData(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (gameActive && currentGameData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={() => {
                  setGameActive(false);
                  setCurrentGameData(null);
                }}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentGameData.name}</h1>
                <p className="text-gray-600">Score at least {currentGameData.minScore} points to qualify!</p>
              </div>
            </div>
            
            {/* Game Info */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 inline-block">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>Prize: ${currentGameData.prizePool}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-royal-blue-500" />
                  <span>{currentGameData.players} players</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-steel-blue-500" />
                  <span>Min Score: {currentGameData.minScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Container */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <TacoGame onGameEnd={handleGameEnd} gameActive={gameActive} resetTrigger={0} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/player/dashboard"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Taco Flyer Games</h1>
              <p className="text-gray-600">Join a game for $1 and compete for amazing prizes!</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">Your Balance</p>
              <p className="text-xl font-bold text-steel-blue-600">${user?.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Balance Warning */}
        {user && user.balance < 1 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Insufficient Balance</p>
                <p className="text-xs text-orange-600">
                  You need at least $1 to join a game. 
                  <Link to="/deposit" className="font-semibold hover:underline ml-1">
                    Add funds now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Game Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{game.image}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                <p className="text-orange-100 text-sm">{game.description}</p>
              </div>

              {/* Game Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-gray-600">Prize Pool</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">${game.prizePool}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Users className="h-4 w-4 text-royal-blue-500" />
                      <span className="text-xs text-gray-600">Players</span>
                    </div>
                    <p className="text-lg font-bold text-royal-blue-600">{game.players}/{game.maxPlayers}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Spots Filled</span>
                    <span className="text-sm font-medium">
                      {Math.round((game.players / game.maxPlayers) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${(game.players / game.maxPlayers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Game Details */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Ends in {game.timeLeft}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GamepadIcon className="h-4 w-4 text-steel-blue-500" />
                    <span className="text-sm text-gray-600">Min Score: {game.minScore}</span>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinGame(game.id)}
                  disabled={isJoining && selectedGame === game.id || (user && user.balance < 1)}
                  className="w-full bg-gradient-to-r from-royal-blue-600 to-steel-blue-600 text-white py-3 rounded-xl font-semibold hover:from-royal-blue-700 hover:to-steel-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isJoining && selectedGame === game.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Play Game - $1</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Game Rules */}
        <div className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-royal-blue-600" />
            <span>How Taco Flyer Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Join & Play</h3>
              <p>Pay $1 to enter a game. Guide your taco through obstacles by clicking or pressing SPACE.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Score Points</h3>
              <p>Each obstacle you pass gives you 1 point. Reach the minimum score to qualify for the prize draw.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Win Prizes</h3>
              <p>Qualified players are entered into a random draw. Winners receive QR codes for restaurant redemption.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEntry;