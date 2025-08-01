import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const PizzaHunter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas sizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = Math.min(window.innerHeight * 0.8, 600);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let width = canvas.width;
    let height = canvas.height;

    // Pizzas
    interface Pizza {
      x: number;
      y: number;
      speed: number;
      size: number;
    }
    const pizzas: Pizza[] = [];
    const pizzaSpawnInterval = 1500; // ms between spawns
    const maxMisses = 3;
    const pizzaSpeedMin = 5;
    const pizzaSpeedMax = 10;

    let animationFrameId: number;
    let spawnTimer: NodeJS.Timeout;

    const spawnPizza = () => {
      const y = Math.random() * (height - 100) + 50; // Random vertical position
      const speed = Math.random() * (pizzaSpeedMax - pizzaSpeedMin) + pizzaSpeedMin;
      const size = 40;
      pizzas.push({ x: -size, y, speed, size }); // Start from left side
    };

    const drawBackground = () => {
      ctx.fillStyle = '#87CEEB'; // Sky blue
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#228B22'; // Green ground
      ctx.fillRect(0, height - 50, width, 50);
    };

    const drawPizzas = () => {
      pizzas.forEach(pizza => {
        ctx.font = `${pizza.size}px Arial`;
        ctx.fillText('🍕', pizza.x, pizza.y);
      });
    };

    const updatePizzas = () => {
      pizzas.forEach((pizza, i) => {
        pizza.x += pizza.speed;
        if (pizza.x > width) {
          pizzas.splice(i, 1);
          setMisses(prev => prev + 1);
          if (misses + 1 >= maxMisses) setGameOver(true);
        }
      });
    };

    const gameLoop = () => {
      width = canvas.width; // Update in case of resize
      height = canvas.height;

      drawBackground();
      drawPizzas();
      updatePizzas();

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    // Spawn pizzas
    spawnTimer = setInterval(spawnPizza, pizzaSpawnInterval);

    // Touch tap to hunt
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (gameOver) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const tapX = touch.clientX - rect.left;
      const tapY = touch.clientY - rect.top;

      // Check hit on pizzas
      for (let i = pizzas.length - 1; i >= 0; i--) {
        const pizza = pizzas[i];
        if (tapX > pizza.x && tapX < pizza.x + pizza.size &&
            tapY > pizza.y - pizza.size && tapY < pizza.y) {
          pizzas.splice(i, 1);
          setScore(prev => prev + 10);
          break; // Hit one at a time
        }
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);

    // Mouse click for desktop
    const handleClick = (e: MouseEvent) => {
      if (gameOver) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = pizzas.length - 1; i >= 0; i--) {
        const pizza = pizzas[i];
        if (clickX > pizza.x && clickX < pizza.x + pizza.size &&
            clickY > pizza.y - pizza.size && clickY < pizza.y) {
          pizzas.splice(i, 1);
          setScore(prev => prev + 10);
          break;
        }
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnTimer);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gameOver, misses]);

  const restartGame = () => {
    setScore(0);
    setMisses(0);
    setGameOver(false);
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Pizza Hunter
                </span>
              </div>
            </div>
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 relative">
          <canvas ref={canvasRef} className="w-full bg-black"></canvas>
          
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-orange-200 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-orange-800 mb-2">
                    Game Over!
                  </h3>
                  <p className="text-lg text-orange-700 mb-4">
                    Score: <span className="font-bold text-2xl">{score}</span>
                  </p>
                  <div className="flex space-x-3">
                    <button onClick={restartGame} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg">
                      Play Again
                    </button>
                    <button onClick={goBack} className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg">
                      Back to Games
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PizzaHunter;
