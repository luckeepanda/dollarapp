import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GamepadIcon, Home, RotateCcw } from 'lucide-react';
import TacoGame from '../components/TacoGame';

const TryDollarGames: React.FC = () => {
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🌮');

  const characterOptions = ['🌮', '🍕', '🍺', '💅'];

  const handleGameEnd = useCallback((score: number) => {
    setFinalScore(score);
    setGameActive(false);
  }, []);

  const handleCharacterSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setFinalScore(null);
    setGameActive(false);
    setGameKey(prev => prev + 1);
    setResetTrigger(prev => prev + 1);
    setTimeout(() => {
      setGameActive(true);
    }, 100);
  };

  const restartGame = useCallback(() => {
    setFinalScore(null);
    setGameActive(false);
    setGameKey(prev => prev + 1);
    setResetTrigger(prev => prev + 1);
    setTimeout(() => {
      setGameActive(true);
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
                <GamepadIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent font-display">
                Try Dollar Games
              </span>
            </div>

            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Character Selection */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-display food-text-gradient mb-4 drop-shadow-lg">
            Choose Your Player
          </h2>
          <div className="flex justify-center mb-8">
            <div className="w-24 h-1 bg-gradient-to-r from-primary-400 via-success-500 to-accent-400 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
            {characterOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleCharacterSelect(emoji)}
                className={`p-6 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${
                  selectedEmoji === emoji
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : 'border-gray-200 hover:border-primary-300 bg-white hover:bg-primary-50'
                }`}
              >
                <div className="text-4xl mb-2">{emoji}</div>
                <div
                  className={`text-sm font-medium ${
                    selectedEmoji === emoji ? 'text-primary-700' : 'text-gray-600'
                  }`}
                >
                  {selectedEmoji === emoji ? 'Selected' : 'Select'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Container */}
        <div className="food-card p-8 relative">
          <TacoGame
            key={gameKey}
            onGameEnd={handleGameEnd}
            gameActive={gameActive}
            resetTrigger={resetTrigger}
            selectedEmoji={selectedEmoji}
          />

          {/* Floating Play Again Button */}
          {finalScore !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="food-card bg-white/95 p-6 shadow-2xl border-2 border-primary-200 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-display food-text-gradient mb-2">
                    Great Job!
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    You scored <span className="font-bold text-2xl food-text-gradient">{finalScore}</span> points!
                  </p>
                  <button
                    onClick={restartGame}
                    className="food-button px-6 py-3 font-semibold flex items-center space-x-2 mx-auto"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Play Again</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryDollarGames;
