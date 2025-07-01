import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, Pause } from 'lucide-react';

interface GameState {
  hamburgerX: number;
  hamburgerY: number;
  hamburgerVelocityY: number;
  isJumping: boolean;
  obstacles: Array<{ x: number; type: 'low' | 'high'; width: number; height: number }>;
  coins: Array<{ x: number; y: number; collected: boolean }>;
  score: number;
  distance: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  speed: number;
}

interface HamburgerRunnerProps {
  onGameEnd: (score: number) => void;
  gameActive: boolean;
  resetTrigger: number;
}

const HamburgerRunner: React.FC<HamburgerRunnerProps> = ({ onGameEnd, gameActive, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const eventListenersAttachedRef = useRef<boolean>(false);
  
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const HAMBURGER_SIZE = 40;
  const GROUND_HEIGHT = 80;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const INITIAL_SPEED = 3;
  const SPEED_INCREASE = 0.001;

  console.log('HamburgerRunner: Component rendered/remounted with props:', {
    gameActive,
    resetTrigger,
    timestamp: Date.now()
  });

  // Initial game state factory
  const createInitialGameState = useCallback((): GameState => {
    const initialState = {
      hamburgerX: 80,
      hamburgerY: CANVAS_HEIGHT - GROUND_HEIGHT - HAMBURGER_SIZE,
      hamburgerVelocityY: 0,
      isJumping: false,
      obstacles: [],
      coins: [],
      score: 0,
      distance: 0,
      gameStarted: false,
      gameOver: false,
      isPaused: false,
      speed: INITIAL_SPEED
    };
    console.log('HamburgerRunner: Created fresh initial game state:', initialState);
    return initialState;
  }, []);

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  // Debug logging for state changes
  useEffect(() => {
    console.log('HamburgerRunner: Game state changed:', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      isPaused: gameState.isPaused,
      score: gameState.score,
      distance: Math.round(gameState.distance),
      hamburgerY: Math.round(gameState.hamburgerY),
      velocity: Math.round(gameState.hamburgerVelocityY * 100) / 100
    });
  }, [gameState]);

  // Comprehensive cleanup function
  const cleanupGame = useCallback(() => {
    console.log('HamburgerRunner: Performing comprehensive cleanup');
    
    // Cancel animation frame
    if (gameLoopRef.current) {
      console.log('HamburgerRunner: Cancelling animation frame:', gameLoopRef.current);
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    
    // Reset timing reference
    lastTimeRef.current = 0;
    
    // Remove event listeners
    if (eventListenersAttachedRef.current) {
      console.log('HamburgerRunner: Removing event listeners');
      window.removeEventListener('keydown', handleKeyPress);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
      eventListenersAttachedRef.current = false;
    }
  }, []);

  // Reset game function with comprehensive logging
  const resetGame = useCallback(() => {
    console.log('HamburgerRunner: resetGame called - performing full reset');
    
    // Cleanup first
    cleanupGame();
    
    // Reset to initial state
    const newState = createInitialGameState();
    console.log('HamburgerRunner: Setting fresh initial state:', newState);
    setGameState(newState);
  }, [cleanupGame, createInitialGameState]);

  // Start game function with logging
  const startGame = useCallback(() => {
    console.log('HamburgerRunner: startGame called - initializing fresh game');
    
    const newState = {
      ...createInitialGameState(),
      gameStarted: true,
      gameOver: false,
      isPaused: false,
      obstacles: [{
        x: CANVAS_WIDTH + 100,
        type: Math.random() > 0.5 ? 'low' : 'high' as 'low' | 'high',
        width: 40,
        height: Math.random() > 0.5 ? 60 : 40
      }],
      coins: [{
        x: CANVAS_WIDTH + 200,
        y: CANVAS_HEIGHT - GROUND_HEIGHT - 100,
        collected: false
      }]
    };
    
    console.log('HamburgerRunner: Starting game with fresh state:', newState);
    setGameState(newState);
  }, [createInitialGameState, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT]);

  // Handle reset trigger from parent component
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('HamburgerRunner: Reset trigger received:', resetTrigger);
      resetGame();
    }
  }, [resetTrigger, resetGame]);

  // Toggle pause function
  const togglePause = useCallback(() => {
    console.log('HamburgerRunner: Toggling pause state');
    setGameState(prev => {
      const newPauseState = !prev.isPaused;
      console.log('HamburgerRunner: Pause state changed to:', newPauseState);
      return {
        ...prev,
        isPaused: newPauseState
      };
    });
  }, []);

  // Jump function with state validation
  const jump = useCallback(() => {
    console.log('HamburgerRunner: Jump called', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      isPaused: gameState.isPaused,
      isJumping: gameState.isJumping
    });

    if (!gameState.gameStarted && !gameState.gameOver) {
      console.log('HamburgerRunner: Starting game from jump');
      startGame();
      return;
    }
    
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused && !gameState.isJumping) {
      console.log('HamburgerRunner: Applying jump force');
      setGameState(prev => ({
        ...prev,
        hamburgerVelocityY: JUMP_FORCE,
        isJumping: true
      }));
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, gameState.isJumping, startGame]);

  // Event handler functions
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      console.log('HamburgerRunner: Space key pressed');
      if (!gameState.gameOver) {
        jump();
      }
    }
  }, [gameState.gameOver, jump]);

  const handleCanvasClick = useCallback(() => {
    console.log('HamburgerRunner: Canvas clicked', {
      gameOver: gameState.gameOver,
      gameStarted: gameState.gameStarted
    });
    
    if (!gameState.gameOver) {
      if (!gameState.gameStarted) {
        console.log('HamburgerRunner: Game not started - starting from canvas click');
        startGame();
      } else {
        console.log('HamburgerRunner: Game active - jumping from canvas click');
        jump();
      }
    }
  }, [gameState.gameOver, gameState.gameStarted, startGame, jump]);

  // Drawing functions
  const drawHamburger = (ctx: CanvasRenderingContext2D, x: number, y: number, isRunning: boolean) => {
    ctx.save();
    ctx.translate(x + HAMBURGER_SIZE / 2, y + HAMBURGER_SIZE / 2);
    
    // Add slight rotation when running
    if (isRunning) {
      ctx.rotate(Math.sin(Date.now() * 0.01) * 0.1);
    }
    
    // Bottom bun
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(0, 8, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Lettuce
    ctx.fillStyle = '#228B22';
    ctx.fillRect(-15, 0, 30, 4);
    
    // Tomato
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(-12, -4, 24, 3);
    
    // Cheese
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-14, -8, 28, 3);
    
    // Meat patty
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-16, -12, 32, 6);
    
    // Top bun
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.arc(0, -12, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Sesame seeds
    ctx.fillStyle = '#F5DEB3';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const seedX = Math.cos(angle) * 10;
      const seedY = Math.sin(angle) * 5 - 12;
      ctx.beginPath();
      ctx.arc(seedX, seedY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Running legs (simple animation)
    if (isRunning) {
      const legOffset = Math.sin(Date.now() * 0.02) * 3;
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-8 + legOffset, 15, 6, 8);
      ctx.fillRect(2 - legOffset, 15, 6, 8);
    }
    
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: any) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, obstacle.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#654321');
    
    ctx.fillStyle = gradient;
    
    if (obstacle.type === 'low') {
      // Ground obstacle (rock/log)
      ctx.fillRect(obstacle.x, CANVAS_HEIGHT - GROUND_HEIGHT - obstacle.height, obstacle.width, obstacle.height);
    } else {
      // High obstacle (hanging branch)
      ctx.fillRect(obstacle.x, CANVAS_HEIGHT - GROUND_HEIGHT - 150, obstacle.width, obstacle.height);
    }
    
    // Add texture
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x, 
      obstacle.type === 'low' ? CANVAS_HEIGHT - GROUND_HEIGHT - obstacle.height : CANVAS_HEIGHT - GROUND_HEIGHT - 150, 
      obstacle.width, obstacle.height);
  };

  const drawCoin = (ctx: CanvasRenderingContext2D, coin: any) => {
    if (coin.collected) return;
    
    ctx.save();
    ctx.translate(coin.x + 10, coin.y + 10);
    ctx.rotate(Date.now() * 0.005);
    
    // Coin body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Coin border
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dollar sign
    ctx.fillStyle = '#B8860B';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('$', 0, 3);
    
    ctx.restore();
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    // Ground
    const gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#8FBC8F');
    gradient.addColorStop(1, '#556B2F');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Ground texture
    ctx.strokeStyle = '#6B8E23';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, CANVAS_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(i + 10, CANVAS_HEIGHT - GROUND_HEIGHT + 10);
      ctx.stroke();
    }
  };

  // Collision detection
  const checkCollision = (hamburgerX: number, hamburgerY: number, obstacles: any[]) => {
    const hamburgerBottom = hamburgerY + HAMBURGER_SIZE;
    const hamburgerRight = hamburgerX + HAMBURGER_SIZE;
    const hamburgerLeft = hamburgerX;
    const hamburgerTop = hamburgerY;
    
    // Check ground collision
    if (hamburgerBottom > CANVAS_HEIGHT - GROUND_HEIGHT) {
      return true;
    }
    
    // Check obstacle collision
    for (const obstacle of obstacles) {
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = obstacle.type === 'low' 
        ? CANVAS_HEIGHT - GROUND_HEIGHT - obstacle.height 
        : CANVAS_HEIGHT - GROUND_HEIGHT - 150;
      const obstacleBottom = obstacleTop + obstacle.height;
      
      if (hamburgerRight > obstacleLeft && 
          hamburgerLeft < obstacleRight && 
          hamburgerBottom > obstacleTop && 
          hamburgerTop < obstacleBottom) {
        console.log('HamburgerRunner: Collision detected with obstacle');
        return true;
      }
    }
    
    return false;
  };

  // Check coin collection
  const checkCoinCollection = (hamburgerX: number, hamburgerY: number, coins: any[]) => {
    const hamburgerCenterX = hamburgerX + HAMBURGER_SIZE / 2;
    const hamburgerCenterY = hamburgerY + HAMBURGER_SIZE / 2;
    
    return coins.map(coin => {
      if (coin.collected) return coin;
      
      const coinCenterX = coin.x + 10;
      const coinCenterY = coin.y + 10;
      const distance = Math.sqrt(
        Math.pow(hamburgerCenterX - coinCenterX, 2) + 
        Math.pow(hamburgerCenterY - coinCenterY, 2)
      );
      
      if (distance < 25) {
        return { ...coin, collected: true };
      }
      
      return coin;
    });
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
      let newHamburgerY = prev.hamburgerY + prev.hamburgerVelocityY;
      let newHamburgerVelocityY = prev.hamburgerVelocityY + GRAVITY;
      let newIsJumping = prev.isJumping;
      let newObstacles = [...prev.obstacles];
      let newCoins = [...prev.coins];
      let newScore = prev.score;
      let newDistance = prev.distance + prev.speed;
      let newSpeed = prev.speed + SPEED_INCREASE;

      // Ground collision check for landing
      if (newHamburgerY >= CANVAS_HEIGHT - GROUND_HEIGHT - HAMBURGER_SIZE) {
        newHamburgerY = CANVAS_HEIGHT - GROUND_HEIGHT - HAMBURGER_SIZE;
        newHamburgerVelocityY = 0;
        newIsJumping = false;
      }

      // Move obstacles
      newObstacles = newObstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - newSpeed
      }));

      // Move coins
      newCoins = newCoins.map(coin => ({
        ...coin,
        x: coin.x - newSpeed
      }));

      // Check coin collection
      newCoins = checkCoinCollection(prev.hamburgerX, newHamburgerY, newCoins);
      const coinsCollected = newCoins.filter(coin => coin.collected).length - prev.coins.filter(coin => coin.collected).length;
      newScore += coinsCollected * 10;

      // Remove off-screen obstacles and coins
      newObstacles = newObstacles.filter(obstacle => obstacle.x + obstacle.width > -50);
      newCoins = newCoins.filter(coin => coin.x > -50);

      // Add new obstacles
      const lastObstacle = newObstacles[newObstacles.length - 1];
      if (!lastObstacle || lastObstacle.x < CANVAS_WIDTH - 200) {
        newObstacles.push({
          x: CANVAS_WIDTH,
          type: Math.random() > 0.6 ? 'high' : 'low',
          width: 30 + Math.random() * 20,
          height: 40 + Math.random() * 40
        });
      }

      // Add new coins
      const lastCoin = newCoins[newCoins.length - 1];
      if (!lastCoin || lastCoin.x < CANVAS_WIDTH - 150) {
        newCoins.push({
          x: CANVAS_WIDTH + Math.random() * 100,
          y: CANVAS_HEIGHT - GROUND_HEIGHT - 50 - Math.random() * 100,
          collected: false
        });
      }

      // Check collision
      if (checkCollision(prev.hamburgerX, newHamburgerY, newObstacles)) {
        console.log('HamburgerRunner: Game over - calling onGameEnd with score:', newScore);
        onGameEnd(newScore);
        return {
          ...prev,
          gameOver: true
        };
      }

      // Add distance score
      newScore += Math.floor(newDistance / 100) - Math.floor(prev.distance / 100);

      return {
        ...prev,
        hamburgerY: newHamburgerY,
        hamburgerVelocityY: newHamburgerVelocityY,
        isJumping: newIsJumping,
        obstacles: newObstacles,
        coins: newCoins,
        score: newScore,
        distance: newDistance,
        speed: newSpeed
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, gameState.gameStarted, gameState.gameOver, gameState.isPaused, onGameEnd]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98FB98');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(34, 139, 34, 0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Hamburger Runner', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      ctx.font = '16px Arial';
      ctx.fillText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('Jump over obstacles and collect coins', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      
      // Draw hamburger in center
      drawHamburger(ctx, CANVAS_WIDTH / 2 - HAMBURGER_SIZE / 2, CANVAS_HEIGHT / 2 + 60, false);
      return;
    }

    if (gameState.gameOver) {
      // Draw game over screen - REMOVED "Game Over!" text and score display
      // Just show the final game state without overlay text
      // The parent component will handle the game over UI
      return;
    }

    if (gameState.isPaused) {
      // Draw pause overlay
      ctx.fillStyle = 'rgba(34, 139, 34, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    // Draw ground
    drawGround(ctx);

    // Draw obstacles
    gameState.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle);
    });

    // Draw coins
    gameState.coins.forEach(coin => {
      drawCoin(ctx, coin);
    });

    // Draw hamburger
    drawHamburger(ctx, gameState.hamburgerX, gameState.hamburgerY, gameState.gameStarted && !gameState.gameOver);

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 3;
    
    // Score
    ctx.strokeText(`Score: ${gameState.score}`, 20, 30);
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    
    // Distance
    ctx.strokeText(`Distance: ${Math.floor(gameState.distance)}m`, 20, 55);
    ctx.fillText(`Distance: ${Math.floor(gameState.distance)}m`, 20, 55);

  }, [gameState]);

  // Start game loop
  useEffect(() => {
    if (gameActive && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      console.log('HamburgerRunner: Starting game loop');
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('HamburgerRunner: Cleaning up game loop in useEffect');
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, gameLoop, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Event listeners management
  useEffect(() => {
    if (!eventListenersAttachedRef.current) {
      console.log('HamburgerRunner: Attaching event listeners');
      
      window.addEventListener('keydown', handleKeyPress);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
      }
      
      eventListenersAttachedRef.current = true;
    }

    return () => {
      console.log('HamburgerRunner: Cleaning up event listeners');
      window.removeEventListener('keydown', handleKeyPress);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
      eventListenersAttachedRef.current = false;
    };
  }, [handleKeyPress, handleCanvasClick]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('HamburgerRunner: Component mounted, setting up cleanup');
    
    return () => {
      console.log('HamburgerRunner: Component unmounting - performing final cleanup');
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
          className="border-4 border-green-200 rounded-xl shadow-lg cursor-pointer bg-gradient-to-b from-green-100 to-green-200"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Game controls overlay - pause button */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-all border border-green-200"
            >
              {gameState.isPaused ? (
                <Play className="h-4 w-4 text-green-700" />
              ) : (
                <Pause className="h-4 w-4 text-green-700" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md">
        <p className="text-sm text-green-700 mb-2">
          Click or press SPACE to jump! Avoid obstacles and collect coins for points.
        </p>
        {gameState.score > 0 && (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Trophy className="h-4 w-4" />
            <span className="font-semibold">Score: {gameState.score} | Distance: {Math.floor(gameState.distance)}m</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HamburgerRunner;