import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, Pause } from 'lucide-react';

interface GameState {
  pizzas: Array<{ x: number; y: number; speed: number; size: number; caught: boolean }>;
  score: number;
  misses: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  spawnRate: number;
  maxMisses: number;
}

interface PizzaHunterProps {
  onGameEnd: (score: number) => void;
  gameActive: boolean;
  resetTrigger: number;
}

const PizzaHunter: React.FC<PizzaHunterProps> = ({ onGameEnd, gameActive, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const lastTimeRef = useRef<number>(0);
  const eventListenersAttachedRef = useRef<boolean>(false);
  const gameEndCalledRef = useRef<boolean>(false);
  
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const PIZZA_SIZE = 40;
  const INITIAL_SPAWN_RATE = 800; // ms between spawns - much faster
  const MIN_SPAWN_RATE = 200; // extremely fast spawning
  const SPAWN_RATE_DECREASE = 25; // faster difficulty increase
  const PIZZA_SPEED_MIN = 4; // faster minimum speed
  const PIZZA_SPEED_MAX = 12; // much faster maximum speed
  const MAX_MISSES = 5;

  console.log('PizzaHunter: Component rendered/remounted with props:', {
    gameActive,
    resetTrigger,
    timestamp: Date.now()
  });

  // Initial game state factory
  const createInitialGameState = useCallback((): GameState => {
    const initialState = {
      pizzas: [],
      score: 0,
      misses: 0,
      gameStarted: false,
      gameOver: false,
      isPaused: false,
      spawnRate: INITIAL_SPAWN_RATE,
      maxMisses: MAX_MISSES
    };
    console.log('PizzaHunter: Created fresh initial game state:', initialState);
    return initialState;
  }, []);

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  // Debug logging for state changes
  useEffect(() => {
    console.log('PizzaHunter: Game state changed:', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      isPaused: gameState.isPaused,
      score: gameState.score,
      misses: gameState.misses,
      pizzaCount: gameState.pizzas.length
    });
  }, [gameState]);

  // Comprehensive cleanup function
  const cleanupGame = useCallback(() => {
    console.log('PizzaHunter: Performing comprehensive cleanup');
    
    // Cancel animation frame
    if (gameLoopRef.current) {
      console.log('PizzaHunter: Cancelling animation frame:', gameLoopRef.current);
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    
    // Clear spawn timer
    if (spawnTimerRef.current) {
      console.log('PizzaHunter: Clearing spawn timer');
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = undefined;
    }
    
    // Reset timing reference
    lastTimeRef.current = 0;
    
    // Remove event listeners
    if (eventListenersAttachedRef.current) {
      console.log('PizzaHunter: Removing event listeners');
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
      }
      eventListenersAttachedRef.current = false;
    }
  }, []);

  // Reset game function with comprehensive logging
  const resetGame = useCallback(() => {
    console.log('PizzaHunter: resetGame called - performing full reset');
    
    // Cleanup first
    cleanupGame();
    
    // Reset game end flag
    gameEndCalledRef.current = false;
    
    // Reset to initial state
    const newState = createInitialGameState();
    console.log('PizzaHunter: Setting fresh initial state:', newState);
    setGameState(newState);
  }, [cleanupGame, createInitialGameState]);

  // Start game function with logging
  const startGame = useCallback(() => {
    console.log('PizzaHunter: startGame called - initializing fresh game');
    
    const newState = {
      ...createInitialGameState(),
      gameStarted: true,
      gameOver: false,
      isPaused: false
    };
    
    console.log('PizzaHunter: Starting game with fresh state:', newState);
    setGameState(newState);
  }, [createInitialGameState]);

  // Handle reset trigger from parent component
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('PizzaHunter: Reset trigger received:', resetTrigger);
      gameEndCalledRef.current = false;
      resetGame();
    }
  }, [resetTrigger, resetGame]);

  // Toggle pause function
  const togglePause = useCallback(() => {
    console.log('PizzaHunter: Toggling pause state');
    setGameState(prev => {
      const newPauseState = !prev.isPaused;
      console.log('PizzaHunter: Pause state changed to:', newPauseState);
      return {
        ...prev,
        isPaused: newPauseState
      };
    });
  }, []);

  // Spawn pizza function
  const spawnPizza = useCallback(() => {
    if (gameState.gameOver || gameState.isPaused) return;
    
    setGameState(prev => {
      // Spawn multiple pizzas at once for overwhelming effect
      const numPizzas = Math.random() > 0.7 ? 2 : 1; // 30% chance for double spawn
      const newPizzas = [];
      
      for (let i = 0; i < numPizzas; i++) {
        const newPizza = {
          x: -PIZZA_SIZE - (i * 60), // offset multiple pizzas
          y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
          speed: Math.random() * (PIZZA_SPEED_MAX - PIZZA_SPEED_MIN) + PIZZA_SPEED_MIN,
          size: PIZZA_SIZE,
          caught: false
        };
        newPizzas.push(newPizza);
      }
      
      return {
        ...prev,
        pizzas: [...prev.pizzas, ...newPizzas]
      };
    });
  }, [gameState.gameOver, gameState.isPaused]);

  // Handle pizza click/tap
  const handlePizzaClick = useCallback((x: number, y: number) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) return;
    
    setGameState(prev => {
      let newScore = prev.score;
      const newPizzas = prev.pizzas.map(pizza => {
        if (!pizza.caught && 
            x >= pizza.x && x <= pizza.x + pizza.size &&
            y >= pizza.y && y <= pizza.y + pizza.size) {
          newScore += 10;
          return { ...pizza, caught: true };
        }
        return pizza;
      });
      
      return {
        ...prev,
        pizzas: newPizzas,
        score: newScore
      };
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Event handler functions
  const handleCanvasClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('PizzaHunter: Canvas clicked at:', { x, y });
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      console.log('PizzaHunter: Starting game from click');
      startGame();
    } else {
      handlePizzaClick(x, y);
    }
  }, [gameState.gameStarted, gameState.gameOver, startGame, handlePizzaClick]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    console.log('PizzaHunter: Touch at:', { x, y });
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      console.log('PizzaHunter: Starting game from touch');
      startGame();
    } else {
      handlePizzaClick(x, y);
    }
  }, [gameState.gameStarted, gameState.gameOver, startGame, handlePizzaClick]);

  // Drawing functions
  const drawPizza = (ctx: CanvasRenderingContext2D, pizza: any) => {
    if (pizza.caught) return;
    
    ctx.save();
    ctx.font = `${pizza.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add slight rotation for movement effect
    const centerX = pizza.x + pizza.size / 2;
    const centerY = pizza.y + pizza.size / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(Date.now() * 0.002);
    
    // Draw pizza emoji
    ctx.fillText('🍕', 0, 0);
    
    ctx.restore();
  };

  // Main game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameActive || !gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    if (deltaTime < 16) { // Cap at ~60 FPS
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = currentTime;

    setGameState(prev => {
      let newPizzas = [...prev.pizzas];
      let newMisses = prev.misses;

      // Move pizzas
      newPizzas = newPizzas.map(pizza => ({
        ...pizza,
        x: pizza.x + pizza.speed
      }));

      // Check for missed pizzas
      const missedPizzas = newPizzas.filter(pizza => !pizza.caught && pizza.x > CANVAS_WIDTH);
      newMisses += missedPizzas.length;

      // Remove off-screen pizzas and caught pizzas (faster cleanup)
      newPizzas = newPizzas.filter(pizza => pizza.x <= CANVAS_WIDTH && !pizza.caught);
      
      // Also remove caught pizzas after a short delay for visual feedback
      newPizzas = newPizzas.filter(pizza => {
        if (pizza.caught) {
          // Remove caught pizzas immediately for faster gameplay
          return false;
        }
        return true;
      });

      // Check game over condition
      if (newMisses >= prev.maxMisses) {
        // Prevent multiple game end calls
        if (!gameEndCalledRef.current) {
          gameEndCalledRef.current = true;
          console.log('PizzaHunter: Game over - calling onGameEnd with score:', prev.score);
          onGameEnd(prev.score);
        }
        return {
          ...prev,
          gameOver: true,
          misses: newMisses
        };
      }

      return {
        ...prev,
        pizzas: newPizzas,
        misses: newMisses
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, gameState.gameStarted, gameState.gameOver, gameState.isPaused, onGameEnd]);

  // Pizza spawning
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      spawnTimerRef.current = setInterval(() => {
        spawnPizza();
        
        // Rapidly increase difficulty by decreasing spawn rate
        setGameState(prev => ({
          ...prev,
          spawnRate: Math.max(MIN_SPAWN_RATE, prev.spawnRate - SPAWN_RATE_DECREASE)
        }));
      }, gameState.spawnRate);
    }

    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, gameState.spawnRate, spawnPizza]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with orange gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#FF8C42'); // Light orange
    gradient.addColorStop(0.7, '#FF6B35'); // Primary orange
    gradient.addColorStop(1, '#E55A2B'); // Darker orange
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(229, 90, 43, 0.9)'; // Dark orange overlay
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Title text
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8B4513'; // Brown outline
      ctx.lineWidth = 5;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText('Pizza Hunter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.fillText('Pizza Hunter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      // Instructions
      ctx.font = 'bold 18px monospace';
      ctx.lineWidth = 4;
      ctx.strokeText('Tap or click to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('Tap or click to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      ctx.font = 'bold 16px monospace';
      ctx.strokeText('Catch the flying pizzas!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      ctx.fillText('Catch the flying pizzas!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      
      ctx.strokeText('They move FAST - be ready!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      ctx.fillText('They move FAST - be ready!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      
      // Draw pizza in center
      ctx.font = '60px Arial';
      ctx.fillText('🍕', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
      return;
    }

    if (gameState.gameOver) {
      // Just show the final game state without overlay text
      // The parent component will handle the game over UI
      return;
    }

    if (gameState.isPaused) {
      // Draw pause overlay
      ctx.fillStyle = 'rgba(229, 90, 43, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 5;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    // Draw pizzas
    gameState.pizzas.forEach(pizza => {
      drawPizza(ctx, pizza);
    });

    // Draw UI
    ctx.textAlign = 'left';
    
    // Score
    ctx.font = 'bold 22px monospace';
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeText(`Score: ${gameState.score}`, 20, 35);
    ctx.fillText(`Score: ${gameState.score}`, 20, 35);
    
    // Misses
    ctx.strokeText(`Misses: ${gameState.misses}/${gameState.maxMisses}`, 20, 65);
    ctx.fillText(`Misses: ${gameState.misses}/${gameState.maxMisses}`, 20, 65);
    
    // Draw border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  }, [gameState]);

  // Start game loop
  useEffect(() => {
    if (gameActive && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      console.log('PizzaHunter: Starting game loop');
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('PizzaHunter: Cleaning up game loop in useEffect');
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, gameLoop, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Event listeners management
  useEffect(() => {
    if (!eventListenersAttachedRef.current) {
      console.log('PizzaHunter: Attaching event listeners');
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('touchstart', handleTouchStart);
      }
      
      eventListenersAttachedRef.current = true;
    }

    return () => {
      console.log('PizzaHunter: Cleaning up event listeners');
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
      }
      eventListenersAttachedRef.current = false;
    };
  }, [handleCanvasClick, handleTouchStart]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('PizzaHunter: Component mounted, setting up cleanup');
    
    return () => {
      console.log('PizzaHunter: Component unmounting - performing final cleanup');
      cleanupGame();
    };
  }, [cleanupGame]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-orange-300 rounded-xl shadow-lg cursor-pointer bg-black"
          style={{ 
            imageRendering: 'pixelated',
            boxShadow: '0 0 10px #ff6b35, inset 0 0 5px #ff6b35'
          }}
        />
        
        {/* Game controls overlay - pause button */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-all border border-orange-200"
            >
              {gameState.isPaused ? (
                <Play className="h-4 w-4 text-orange-700" />
              ) : (
                <Pause className="h-4 w-4 text-orange-700" />
              )}
            </button>
          )}
        </div>
      </div>

      {gameState.score > 0 && (
        <div className="flex items-center justify-center space-x-2 text-orange-700 mt-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
          <Trophy className="h-5 w-5" />
          <span className="font-bold text-lg">Score: {gameState.score} | Misses: {gameState.misses}/{gameState.maxMisses}</span>
        </div>
      )}
    </div>
  );
};

export default PizzaHunter;