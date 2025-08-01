import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PizzaHunter from '../components/PizzaHunter';
import { 
  GamepadIcon,
  Home,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

const PizzaHunterGame: React.FC = () => {
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  console.log('PizzaHunterGame: Component rendered', { 
    gameActive, 
    finalScore, 
    gameKey, 
    resetTrigger 
  });

  const handleGameEnd = useCallback((score: number) => {
    console.log('PizzaHunterGame: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
  }, []);

  const restartGame = useCallback(() => {
    console.log('PizzaHunterGame: Restarting game - forcing component remount');
    
    // Reset all game-related state
    setFinalScore(null);
    setGameActive(false);
    
    // Force component remount by changing key
    setGameKey(prev => {
      const newKey = prev + 1;
      console.log('PizzaHunterGame: Game key incremented to force remount:', newKey);
      return newKey;
    });
    
    // Trigger reset in PizzaHunter component
    setResetTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('PizzaHunterGame: Reset trigger incremented to:', newTrigger);
      return newTrigger;
    });
    
    // Small delay to ensure reset is processed, then activate game
    setTimeout(() => {
      console.log('PizzaHunterGame: Activating game after reset and remount');
      setGameActive(true);
    }, 100);
  }, []);

  const goBackToFreePlay = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBackToFreePlay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-orange-600 to-red-500 p-2 rounded-lg">
                  <GamepadIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                  Pizza Hunter
                </span>
              </div>
            </div>
            
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Container */}
        <div className="food-card p-8 mb-8 relative">
          {/* Force component remount with key prop */}
          <PizzaHunter 
            key={gameKey}
            onGameEnd={handleGameEnd} 
            gameActive={gameActive}
            resetTrigger={resetTrigger}
          />
          
          {/* Floating Play Again Button - positioned over the canvas */}
          {finalScore !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl border-2 border-orange-300 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-orange-700 mb-2 font-display">
                    🎉 Great Hunt! 🎉
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    You scored <span className="font-bold text-2xl">{finalScore}</span> points!
                  </p>
                  <div className="flex space-x-3 mb-4">
                    <button
                      onClick={restartGame}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Play Again</span>
                    </button>
                    <button
                      onClick={goBackToFreePlay}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg"
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
        <div className="food-card p-6">
          <h3 className="text-orange-700 font-semibold mb-3">🎮 How to Play:</h3>
          <ul className="text-orange-600 text-sm space-y-1">
            <li>• <strong>Tap or Click</strong> on the flying pizzas to catch them</li>
            <li>• Each pizza caught gives you 10 points</li>
            <li>• Don't let too many pizzas escape or the game ends</li>
            <li>• Pizzas move faster as the game progresses</li>
            <li>• Try to catch as many as possible for a high score!</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default PizzaHunterGame;