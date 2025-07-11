import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FoodBlaster from '../components/FoodBlaster';
import { 
  Trophy,
  GamepadIcon,
  Home,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

const FoodBlasterGame: React.FC = () => {
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  console.log('FoodBlasterGame: Component rendered', { 
    gameActive, 
    finalScore, 
    gameKey, 
    resetTrigger 
  });

  const handleGameEnd = useCallback((score: number) => {
    console.log('FoodBlasterGame: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
  }, []);

  const restartGame = useCallback(() => {
    console.log('FoodBlasterGame: Restarting game - forcing component remount');
    
    setFinalScore(null);
    setGameActive(false);
    
    setGameKey(prev => {
      const newKey = prev + 1;
      console.log('FoodBlasterGame: Game key incremented to force remount:', newKey);
      return newKey;
    });
    
    setResetTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('FoodBlasterGame: Reset trigger incremented to:', newTrigger);
      return newTrigger;
    });
    
    setTimeout(() => {
      console.log('FoodBlasterGame: Activating game after reset and remount');
      setGameActive(true);
    }, 100);
  }, []);

  const goBackToFreePlay = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      {/* Header */}
      <div className="bg-black/50 shadow-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBackToFreePlay}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-purple-300" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-500 p-2 rounded-lg">
                  <GamepadIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Food Blaster
                </span>
              </div>
            </div>
            
            <Link
              to="/"
              className="flex items-center space-x-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Container */}
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-500/30 mb-8 relative">
          <FoodBlaster 
            key={gameKey}
            onGameEnd={handleGameEnd} 
            gameActive={gameActive}
            resetTrigger={resetTrigger}
          />
          
          {/* Game Over Overlay */}
          {finalScore !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-purple-400 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-purple-300 mb-2">
                    🚀 Mission Complete! 🚀
                  </h3>
                  <p className="text-lg text-purple-200 mb-4">
                    You scored <span className="font-bold text-2xl text-yellow-400">{finalScore}</span> points!
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={restartGame}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Play Again</span>
                    </button>
                    <button
                      onClick={goBackToFreePlay}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Back to Games
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-purple-500/30">
          <h3 className="text-purple-300 font-semibold mb-3">🎮 How to Play:</h3>
          <ul className="text-purple-200 text-sm space-y-1">
            <li>• Use <kbd className="bg-purple-800 px-2 py-1 rounded text-xs">←</kbd> <kbd className="bg-purple-800 px-2 py-1 rounded text-xs">→</kbd> arrow keys or <kbd className="bg-purple-800 px-2 py-1 rounded text-xs">A</kbd> <kbd className="bg-purple-800 px-2 py-1 rounded text-xs">D</kbd> to move your spaceship</li>
            <li>• Press <kbd className="bg-purple-800 px-2 py-1 rounded text-xs">SPACE</kbd> or <kbd className="bg-purple-800 px-2 py-1 rounded text-xs">↑</kbd> to shoot at the food invaders</li>
            <li>• Destroy all food items to advance to the next wave</li>
            <li>• Don't let the food invaders reach your spaceship!</li>
            <li>• Each wave gets faster and more challenging</li>
            <li>• Score points for each food item destroyed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoodBlasterGame;