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
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const lastTimeRef = useRef<number>(0);
  const lastResizeRef = useRef<number>(0);
  const gameEndCalledRef = useRef<boolean>(false);
  const isTouchDeviceRef = useRef<boolean>(false);
  
  // Game constants - responsive sizing
  const BASE_WIDTH = 400;
  const BASE_HEIGHT = 500;
  const [canvasSize, setCanvasSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });
  const [scale, setScale] = useState(1);
  
  const PIZZA_SIZE = 40;
  const INITIAL_SPAWN_RATE = 600; // Faster initial spawn
  const MIN_SPAWN_RATE = 150; // Even faster minimum
  const SPAWN_RATE_DECREASE = 30; // Aggressive difficulty increase
  const PIZZA_SPEED_MIN = 5; // Faster minimum speed
  const PIZZA_SPEED_MAX = 15; // Much faster maximum speed
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

  // Responsive canvas sizing with debounced resize
  const updateCanvasSize = useCallback(() => {
    const now = Date.now();
    if (now - lastResizeRef.current < 100) return; // Debounce resize
    lastResizeRef.current = now;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const maxWidth = Math.min(containerRect.width - 32, window.innerWidth - 32);
    const maxHeight = Math.min(window.innerHeight * 0.7, 600);
    
    const scaleX = maxWidth / BASE_WIDTH;
    const scaleY = maxHeight / BASE_HEIGHT;
    const newScale = Math.min(scaleX, scaleY, 1.5); // Cap scale for performance
    
    const newWidth = BASE_WIDTH * newScale;
    const newHeight = BASE_HEIGHT * newScale;
    
    setCanvasSize({ width: newWidth, height: newHeight });
    setScale(newScale);
  }, []);

  // Setup canvas with proper pixel ratio
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set actual canvas size
    canvas.width = canvasSize.width * devicePixelRatio;
    canvas.height = canvasSize.height * devicePixelRatio;
    
    // Set display size
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    
    // Scale context for crisp rendering
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
  }, [canvasSize]);

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

  // Spawn pizza function - more aggressive spawning
  const spawnPizza = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver || prev.isPaused) return prev;
      
      // Spawn 1-3 pizzas at once for overwhelming effect
      const numPizzas = Math.random() > 0.5 ? (Math.random() > 0.7 ? 3 : 2) : 1;
      const newPizzas = [];
      
      for (let i = 0; i < numPizzas; i++) {
        const newPizza = {
          x: -PIZZA_SIZE - (i * 80), // Offset multiple pizzas
          y: Math.random() * (BASE_HEIGHT - 100) + 50,
          speed: Math.random() * (PIZZA_SPEED_MAX - PIZZA_SPEED_MIN) + PIZZA_SPEED_MIN,
          size: PIZZA_SIZE,
          caught: false,
          id: prev.nextPizzaId + i
        };
        newPizzas.push(newPizza);
      }
      
      return {
        ...prev,
        pizzas: [...prev.pizzas, ...newPizzas],
        nextPizzaId: prev.nextPizzaId + numPizzas
      };
    });
  }, []);

  // Handle pizza tap/click with improved hit detection
  const handlePizzaClick = useCallback((x: number, y: number) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) return;
    
    // Convert screen coordinates to game coordinates
    const gameX = x / scale;
    const gameY = y / scale;
    
    setGameState(prev => {
      let newScore = prev.score;
      let hitDetected = false;
      
      const newPizzas = prev.pizzas.map(pizza => {
        if (!pizza.caught && !hitDetected &&
            gameX >= pizza.x && gameX <= pizza.x + pizza.size &&
            gameY >= pizza.y && gameY <= pizza.y + pizza.size) {
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
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, scale]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    handlePizzaClick(x, y);
  }, [gameState.gameStarted, gameState.gameOver, startGame, handlePizzaClick]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    handlePizzaClick(x, y);
  }, [gameState.gameStarted, gameState.gameOver, startGame, handlePizzaClick]);

  // Game loop with FPS cap and optimizations
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
      const missedPizzas = newPizzas.filter(pizza => !pizza.caught && pizza.x > BASE_WIDTH);
      newMisses += missedPizzas.length;

      // Remove off-screen and caught pizzas immediately for performance
      newPizzas = newPizzas.filter(pizza => 
        pizza.x <= BASE_WIDTH && !pizza.caught && pizza.x > -PIZZA_SIZE
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
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
    gradient.addColorStop(0, '#FF8C42');
    gradient.addColorStop(0.7, '#FF6B35');
    gradient.addColorStop(1, '#E55A2B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Scale context for responsive rendering
    ctx.save();
    ctx.scale(scale, scale);

    if (!gameState.gameStarted) {
      // Start screen
      ctx.fillStyle = 'rgba(229, 90, 43, 0.9)';
      ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 5;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText('Pizza Hunter', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 50);
      ctx.fillText('Pizza Hunter', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 50);
      
      ctx.font = 'bold 18px monospace';
      ctx.lineWidth = 4;
      const startText = isTouchDeviceRef.current ? 'TAP TO START!' : 'CLICK TO START!';
      ctx.strokeText(startText, BASE_WIDTH / 2, BASE_HEIGHT / 2);
      ctx.fillText(startText, BASE_WIDTH / 2, BASE_HEIGHT / 2);
      
      ctx.font = 'bold 16px monospace';
      const instructText = isTouchDeviceRef.current ? 'TAP PIZZAS TO CATCH!' : 'CLICK PIZZAS TO CATCH!';
      ctx.strokeText(instructText, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 30);
      ctx.fillText(instructText, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 30);
      
      ctx.strokeText('They move SUPER FAST!', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);
      ctx.fillText('They move SUPER FAST!', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);
      
      // Draw pizza
      ctx.font = '60px Arial';
      ctx.fillText('🍕', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 100);
      
      ctx.restore();
      return;
    }

    if (gameState.gameOver) {
      ctx.restore();
      return;
    }

    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(229, 90, 43, 0.8)';
      ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 5;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText('PAUSED', BASE_WIDTH / 2, BASE_HEIGHT / 2);
      ctx.fillText('PAUSED', BASE_WIDTH / 2, BASE_HEIGHT / 2);
      
      ctx.restore();
      return;
    }

    // Draw pizzas with rotation
    ctx.font = `${PIZZA_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    gameState.pizzas.forEach(pizza => {
      if (pizza.caught) return;
      
      ctx.save();
      const centerX = pizza.x + pizza.size / 2;
      const centerY = pizza.y + pizza.size / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(Date.now() * 0.003 + pizza.id * 0.5); // Unique rotation per pizza
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
    ctx.strokeRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    ctx.restore();
  }, [gameState, canvasSize, scale]);

  // Setup resize listener
  useEffect(() => {
    updateCanvasSize();
    
    const debouncedResize = () => {
      clearTimeout(lastResizeRef.current);
      setTimeout(updateCanvasSize, 100);
    };
    
    window.addEventListener('resize', debouncedResize, { passive: true });
    return () => window.removeEventListener('resize', debouncedResize);
  }, [updateCanvasSize]);

  // Setup canvas when size changes
  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  // Event listeners setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Touch events (mobile) - prevent all default behaviors
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

  // Pizza spawning with aggressive timing
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      spawnTimerRef.current = setInterval(() => {
        spawnPizza();
        
        // Aggressively increase difficulty
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
    <div 
      ref={containerRef}
      className="flex flex-col items-center space-y-4 w-full"
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="border-4 border-orange-300 rounded-xl shadow-lg bg-black"
        style={{ 
          imageRendering: 'pixelated',
          touchAction: 'none',
          userSelect: 'none',
          maxWidth: '100%',
          height: 'auto'
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