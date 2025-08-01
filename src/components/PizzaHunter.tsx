import React, { useState, useEffect, useRef, useCallback } from 'react';

interface GameState {
  pizzas: Array<{ 
    x: number; 
    y: number; 
    speed: number; 
    size: number; 
    caught: boolean;
    id: number;
  }>;
  score: number;
  misses: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  spawnRate: number;
  maxMisses: number;
  nextPizzaId: number;
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
  const gameEndCalledRef = useRef<boolean>(false);
  const isTouchDeviceRef = useRef<boolean>(false);
  
  // Game constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const PIZZA_SIZE = 40;
  const INITIAL_SPAWN_RATE = 800; // Slower initial spawn
  const MIN_SPAWN_RATE = 300; // Slower minimum
  const SPAWN_RATE_DECREASE = 20; // Gentler difficulty increase
  const PIZZA_SPEED_MIN = 2; // Slower minimum speed
  const PIZZA_SPEED_MAX = 6; // Slower maximum speed
  const MAX_MISSES = 5;

  // Detect touch device
  useEffect(() => {
    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // Initial game state factory
  const createInitialGameState = useCallback((): GameState => ({
    pizzas: [],
    score: 0,
    misses: 0,
    gameStarted: false,
    gameOver: false,
    isPaused: false,
    spawnRate: INITIAL_SPAWN_RATE,
    maxMisses: MAX_MISSES,
    nextPizzaId: 1
  }), []);

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  // Reset game
  const resetGame = useCallback(() => {
    gameEndCalledRef.current = false;
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = undefined;
    }
    setGameState(createInitialGameState());
  }, [createInitialGameState]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      resetGame();
    }
  }, [resetTrigger, resetGame]);

  // Start game
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      isPaused: false
    }));
  }, []);

  // Spawn pizza function
  const spawnPizza = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver || prev.isPaused) return prev;
      
      const newPizza = {
        x: -PIZZA_SIZE,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
        speed: Math.random() * (PIZZA_SPEED_MAX - PIZZA_SPEED_MIN) + PIZZA_SPEED_MIN,
        size: PIZZA_SIZE,
        caught: false,
        id: prev.nextPizzaId
      };
      
      return {
        ...prev,
        pizzas: [...prev.pizzas, newPizza],
        nextPizzaId: prev.nextPizzaId + 1
      };
    });
  }, []);

  // Handle pizza tap/click
  const handlePizzaClick = useCallback((x: number, y: number) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) return;
    
    setGameState(prev => {
      let newScore = prev.score;
      let hitDetected = false;
      
      const newPizzas = prev.pizzas.map(pizza => {
        if (!pizza.caught && !hitDetected &&
            x >= pizza.x && x <= pizza.x + pizza.size &&
            y >= pizza.y && y <= pizza.y + pizza.size) {
          newScore += 10;
          hitDetected = true;
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

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    handlePizzaClick(x, y);
  }, [gameState.gameStarted, gameState.gameOver, startGame, handlePizzaClick]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  // Mouse/click handlers for desktop
  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    handlePizzaClick(x, y);
  }, [gameState.gameStarted, gameState.gameOver, startGame, handlePizzaClick]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameActive || !gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
      return;
    }

    // Cap at 60 FPS
    const deltaTime = currentTime - lastTimeRef.current;
    if (deltaTime < 16.67) {
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

      // Remove off-screen and caught pizzas
      newPizzas = newPizzas.filter(pizza => 
        pizza.x <= CANVAS_WIDTH && !pizza.caught && pizza.x > -PIZZA_SIZE
      );

      // Check game over condition
      if (newMisses >= prev.maxMisses) {
        if (!gameEndCalledRef.current) {
          gameEndCalledRef.current = true;
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

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with orange gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#FF8C42');
    gradient.addColorStop(0.7, '#FF6B35');
    gradient.addColorStop(1, '#E55A2B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Start screen
      ctx.fillStyle = 'rgba(229, 90, 43, 0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 5;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText('Pizza Hunter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.fillText('Pizza Hunter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      ctx.font = 'bold 18px monospace';
      ctx.lineWidth = 4;
      const startText = isTouchDeviceRef.current ? 'TAP TO START!' : 'CLICK TO START!';
      ctx.strokeText(startText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText(startText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      ctx.font = 'bold 16px monospace';
      const instructText = isTouchDeviceRef.current ? 'TAP PIZZAS TO CATCH!' : 'CLICK PIZZAS TO CATCH!';
      ctx.strokeText(instructText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      ctx.fillText(instructText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      
      // Draw pizza emoji properly
      ctx.font = '60px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍕', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
      
      return;
    }

    if (gameState.gameOver) {
      return;
    }

    if (gameState.isPaused) {
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

    // Draw pizzas with proper emoji rendering
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    gameState.pizzas.forEach(pizza => {
      if (pizza.caught) return;
      
      ctx.save();
      const centerX = pizza.x + pizza.size / 2;
      const centerY = pizza.y + pizza.size / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(Date.now() * 0.003 + pizza.id * 0.5);
      ctx.fillText('🍕', 0, 0);
      ctx.restore();
    });

    // Draw UI
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px monospace';
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeText(`Score: ${gameState.score}`, 20, 35);
    ctx.fillText(`Score: ${gameState.score}`, 20, 35);
    
    ctx.strokeText(`Misses: ${gameState.misses}/${gameState.maxMisses}`, 20, 65);
    ctx.fillText(`Misses: ${gameState.misses}/${gameState.maxMisses}`, 20, 65);
    
    // Draw border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [gameState]);

  // Event listeners setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Touch events (mobile)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events (desktop)
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('click', handleClick);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleClick]);

  // Pizza spawning
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      spawnTimerRef.current = setInterval(() => {
        spawnPizza();
        
        // Increase difficulty gradually
        setGameState(prev => ({
          ...prev,
          spawnRate: Math.max(MIN_SPAWN_RATE, prev.spawnRate - SPAWN_RATE_DECREASE)
        }));
      }, gameState.spawnRate);
    }

    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
        spawnTimerRef.current = undefined;
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, gameState.spawnRate, spawnPizza]);

  // Game loop management
  useEffect(() => {
    if (gameActive && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, gameLoop, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Render loop
  useEffect(() => {
    draw();
  }, [draw]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-orange-300 rounded-xl shadow-lg bg-black"
        style={{ 
          imageRendering: 'auto',
          touchAction: 'none',
          userSelect: 'none'
        }}
      />
      
      {gameState.score > 0 && (
        <div className="flex items-center justify-center space-x-2 text-orange-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
          <span className="font-bold text-lg">
            Score: {gameState.score} | Misses: {gameState.misses}/{gameState.maxMisses}
          </span>
        </div>
      )}
    </div>
  );
};

export default PizzaHunter;