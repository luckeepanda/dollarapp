import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import TacoGame from '../components/TacoGame';
import { 
  ArrowLeft,
  Trophy,
  Star,
  GamepadIcon,
  Home
} from 'lucide-react';

const FreePlay: React.FC = () => {
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const handleGameEnd = (score: number) => {
    setFinalScore(score);
    setGameActive(false);
  };

  const restartGame = () => {
    setFinalScore(null);
    setGameActive(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Simple Header for Free Play */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-lg">
                <GamepadIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Free Play Mode
              </span>
            </Link>
            
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                🌮 Free Taco Flyer 🌮
              </h1>
              <p className="text-gray-600 mt-2">Practice your skills with unlimited free plays!</p>
            </div>
          </div>
          
          {/* Game Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 inline-block">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <GamepadIcon className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Free Play Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>No Entry Fee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-blue-500" />
                <span>Practice & Have Fun!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <TacoGame onGameEnd={handleGameEnd} gameActive={gameActive} />
          
          {/* Game Over Screen */}
          {finalScore !== null && (
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200">
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  🎉 Great Job! 🎉
                </h3>
                <p className="text-lg text-purple-700 mb-4">
                  You scored <span className="font-bold text-2xl">{finalScore}</span> points!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={restartGame}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    Play Again
                  </button>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
                  >
                    Join for Real Prizes!
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions & Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <GamepadIcon className="h-5 w-5 text-purple-600" />
              <span>How to Play</span>
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Click or press SPACE to make the taco fly</li>
              <li>• Navigate through the blue pipes</li>
              <li>• Each pipe you pass gives you 1 point</li>
              <li>• Try to beat your high score!</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>Ready for Real Prizes?</span>
            </h3>
            <p className="text-gray-700 mb-4">
              Join Dollar App to compete for real food prizes at local restaurants!
            </p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <span>Get Started</span>
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreePlay;