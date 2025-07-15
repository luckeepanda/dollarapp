import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, Pause } from 'lucide-react';

interface GameState {
  tacoY: number;
  tacoVelocity: number;
  obstacles: Array<{ x: number; gapY: number; passed: boolean }>;
  score: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
}

interface TacoGameProps {
  onGameEnd: (score: number) => void;
  gameActive: boolean;
  resetTrigger: number;
}

const TacoGame: React.FC<TacoGameProps> = ({ onGameEnd, gameActive, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const eventListenersAttachedRef = useRef<boolean>(false);
  
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const TACO_SIZE = 30;
  const OBSTACLE_WIDTH = 60;
  const OBSTACLE_GAP = 150;
  const GRAVITY = 0.4;
  const JUMP_FORCE = -8;
  const OBSTACLE_SPEED = 2;
  const OBSTACLE_SPAWN_DISTANCE = 200;

  console.log('TacoGame: Component rendered/remounted with props:', {
    gameActive,
    resetTrigger,
    timestamp: Date.now()
  });

  // Initial game state factory
  const createInitialGameState = useCallback((): GameState => {
    const initialState = {
      tacoY: 250,
      tacoVelocity: 0,
      obstacles: [],
      score: 0,
      gameStarted: false,
      gameOver: false,
      isPaused: false
    };
    console.log('TacoGame: Created fresh initial game state:', initialState);
    return initialState;
  }, []);

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  // Debug logging for state changes
  useEffect(() => {
    console.log('TacoGame: Game state changed:', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      isPaused: gameState.isPaused,
      score: gameState.score,
      tacoY: Math.round(gameState.tacoY),
      obstacleCount: gameState.obstacles.length,
      velocity: Math.round(gameState.tacoVelocity * 100) / 100
    });
  }, [gameState]);

  // Comprehensive cleanup function
  const cleanupGame = useCallback(() => {
    console.log('TacoGame: Performing comprehensive cleanup');
    
    // Cancel animation frame
    if (gameLoopRef.current) {
      console.log('TacoGame: Cancelling animation frame:', gameLoopRef.current);
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    
    // Reset timing reference
    lastTimeRef.current = 0;
    
    // Remove event listeners
    if (eventListenersAttachedRef.current) {
      console.log('TacoGame: Removing event listeners');
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
    console.log('TacoGame: resetGame called - performing full reset');
    
    // Cleanup first
    cleanupGame();
    
    // Reset to initial state
    const newState = createInitialGameState();
    console.log('TacoGame: Setting fresh initial state:', newState);
    setGameState(newState);
  }, [cleanupGame, createInitialGameState]);

  // Start game function with logging
  const startGame = useCallback(() => {
    console.log('TacoGame: startGame called - initializing fresh game');
    
    const newState = {
      ...createInitialGameState(),
      gameStarted: true,
      gameOver: false,
      isPaused: false,
      obstacles: [{
        x: CANVAS_WIDTH + 100,
        gapY: Math.random() * (CANVAS_HEIGHT - OBSTACLE_GAP - 100) + 50,
        passed: false
      }]
    };
    
    console.log('TacoGame: Starting game with fresh state:', newState);
    setGameState(newState);
  }, [createInitialGameState, CANVAS_WIDTH, CANVAS_HEIGHT, OBSTACLE_GAP]);

  // Handle reset trigger from parent component
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('TacoGame: Reset trigger received:', resetTrigger);
      resetGame();
    }
  }, [resetTrigger, resetGame]);

  // Toggle pause function
  const togglePause = useCallback(() => {
    console.log('TacoGame: Toggling pause state');
    setGameState(prev => {
      const newPauseState = !prev.isPaused;
      console.log('TacoGame: Pause state changed to:', newPauseState);
      return {
        ...prev,
        isPaused: newPauseState
      };
    });
  }, []);

  // Jump function with state validation
  const jump = useCallback(() => {
    console.log('TacoGame: Jump called', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      isPaused: gameState.isPaused
    });

    if (!gameState.gameStarted && !gameState.gameOver) {
      console.log('TacoGame: Starting game from jump');
      startGame();
      return;
    }
    
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      console.log('TacoGame: Applying jump force');
      setGameState(prev => ({
        ...prev,
        tacoVelocity: JUMP_FORCE
      }));
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame]);

  // Event handler functions (defined outside useEffect to prevent recreation)
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      console.log('TacoGame: Space key pressed');
      // Only handle jump during active gameplay, not restart
      if (!gameState.gameOver) {
        jump();
      }
    }
  }, [gameState.gameOver, jump]);

  const handleCanvasClick = useCallback(() => {
    console.log('TacoGame: Canvas clicked', {
      gameOver: gameState.gameOver,
      gameStarted: gameState.gameStarted
    });
    
    // Only handle clicks during active gameplay, not restart
    if (!gameState.gameOver) {
      if (!gameState.gameStarted) {
        console.log('TacoGame: Game not started - starting from canvas click');
        startGame();
      } else {
        console.log('TacoGame: Game active - jumping from canvas click');
        jump();
      }
    }
  }, [gameState.gameOver, gameState.gameStarted, startGame, jump]);

  // Drawing functions
  const drawTaco = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number) => {
    ctx.save();
    // Center the taco for rotation
    const centerX = x + TACO_SIZE / 2;
    const centerY = y + TACO_SIZE / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    
    // More pixelated retro style taco
    // Taco shell (rectangular for pixel art style)
    ctx.fillStyle = '#D4A574'; // Golden brown
    ctx.fillRect(-12, -6, 24, 12);
    ctx.fillRect(-10, -10, 20, 4);
    
    // Taco filling (pixelated)
    ctx.fillStyle = '#FF0000'; // Bright red for retro tomato
    ctx.fillRect(-8, -4, 16, 2);
    
    ctx.fillStyle = '#00FF00'; // Bright green for retro lettuce
    ctx.fillRect(-10, -2, 20, 2);
    
    ctx.fillStyle = '#FFFF00'; // Bright yellow for retro cheese
    ctx.fillRect(-6, 0, 12, 2);
    
    // Pixelated taco outline
    ctx.strokeStyle = '#000000'; // Black outline for retro look
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -6, 24, 12);
    ctx.strokeRect(-10, -10, 20, 4);
    
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, x: number, gapY: number) => {
    // More pixelated retro style obstacles
    ctx.fillStyle = '#4682B4'; // Solid steel blue for retro look
    
    // Top obstacle
    const topX = Math.floor(x);
    ctx.fillRect(topX, 0, OBSTACLE_WIDTH, gapY);
    
    // Bottom obstacle
    const bottomX = Math.floor(x);
    const bottomY = Math.floor(gapY + OBSTACLE_GAP);
    ctx.fillRect(bottomX, bottomY, OBSTACLE_WIDTH, CANVAS_HEIGHT - bottomY);
    
    // Pixelated obstacle details
    ctx.fillStyle = '#87CEEB'; // Lighter blue for details
    
    // Top obstacle details
    for (let i = 0; i < gapY; i += 10) {
      ctx.fillRect(topX + 5, i + 5, OBSTACLE_WIDTH - 10, 2);
    }
    
    // Bottom obstacle details
    for (let i = bottomY; i < CANVAS_HEIGHT; i += 10) {
      ctx.fillRect(bottomX + 5, i + 5, OBSTACLE_WIDTH - 10, 2);
    }
    
    // Pixelated borders
    ctx.strokeStyle = '#000000'; // Black outline for retro look
    ctx.lineWidth = 1;
    ctx.strokeRect(topX, 0, OBSTACLE_WIDTH, gapY);
    ctx.strokeRect(bottomX, bottomY, OBSTACLE_WIDTH, CANVAS_HEIGHT - bottomY);
  };

  // Collision detection
  const checkCollision = (tacoY: number, obstacles: Array<{ x: number; gapY: number }>) => {
    const tacoX = 80;
    
    // Check ground and ceiling collision
    if (tacoY <= 0 || tacoY >= CANVAS_HEIGHT - TACO_SIZE) {
      console.log('TacoGame: Collision detected - boundary hit at Y:', tacoY);
      return true;
    }
    
    // Check obstacle collision
    for (const obstacle of obstacles) {
      if (tacoX + TACO_SIZE > obstacle.x && tacoX < obstacle.x + OBSTACLE_WIDTH) {
        if (tacoY < obstacle.gapY || tacoY + TACO_SIZE > obstacle.gapY + OBSTACLE_GAP) {
          console.log('TacoGame: Collision detected - obstacle hit at:', { tacoY, obstacleGap: obstacle.gapY });
          return true;
        }
      }
    }
    
    return false;
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
      let newTacoY = prev.tacoY + prev.tacoVelocity;
      let newTacoVelocity = prev.tacoVelocity + GRAVITY;
      let newObstacles = [...prev.obstacles];
      let newScore = prev.score;

      // Move obstacles
      newObstacles = newObstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - OBSTACLE_SPEED
      }));

      // Check for scoring
      newObstacles = newObstacles.map(obstacle => {
        if (obstacle.x + OBSTACLE_WIDTH < 80 && !obstacle.passed) {
          newScore += 1;
          console.log('TacoGame: Score increased to:', newScore);
          return { ...obstacle, passed: true };
        }
        return obstacle;
      });

      // Remove off-screen obstacles
      newObstacles = newObstacles.filter(obstacle => obstacle.x + OBSTACLE_WIDTH > -50);

      // Add new obstacles
      const lastObstacle = newObstacles[newObstacles.length - 1];
      if (!lastObstacle || lastObstacle.x < CANVAS_WIDTH - OBSTACLE_SPAWN_DISTANCE) {
        newObstacles.push({
          x: CANVAS_WIDTH,
          gapY: Math.random() * (CANVAS_HEIGHT - OBSTACLE_GAP - 100) + 50,
          passed: false
        });
      }

      // Check collision
      if (checkCollision(newTacoY, newObstacles)) {
        console.log('TacoGame: Game over - calling onGameEnd with score:', newScore);
        onGameEnd(newScore);
        return {
          ...prev,
          gameOver: true
        };
      }

      return {
        ...prev,
        tacoY: newTacoY,
        tacoVelocity: newTacoVelocity,
        obstacles: newObstacles,
        score: newScore
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
    // More vibrant retro colors
    gradient.addColorStop(0, '#1E90FF'); // Bright blue
    gradient.addColorStop(0.7, '#00FF7F'); // Spring green
    gradient.addColorStop(1, '#32CD32'); // Lime green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(0, 0, 139, 0.9)'; // Darker blue for retro feel
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Title text with better contrast
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000'; // Black outline for retro look
      ctx.lineWidth = 5; // Thicker outline
      ctx.font = 'bold 28px monospace'; // Pixelated font
      ctx.textAlign = 'center';
      ctx.strokeText('Taco Flyer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.fillText('Taco Flyer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      // Instructions with better contrast
      ctx.font = 'bold 18px monospace'; // Pixelated font
      ctx.strokeStyle = '#000000'; // Black outline
      ctx.lineWidth = 4;
      ctx.strokeText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      ctx.font = 'bold 16px monospace'; // Pixelated font
      ctx.strokeText('Guide the taco through the pipes', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      ctx.fillText('Guide the taco through the pipes', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      
      // Draw taco in center
      drawTaco(ctx, CANVAS_WIDTH / 2 - TACO_SIZE / 2, CANVAS_HEIGHT / 2 + 60, 0);
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
      ctx.fillStyle = 'rgba(0, 0, 139, 0.8)'; // Darker blue for retro feel
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Pause text with better contrast
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000'; // Black outline
      ctx.lineWidth = 5; // Thicker outline
      ctx.font = 'bold 28px monospace'; // Pixelated font
      ctx.textAlign = 'center';
      ctx.strokeText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    // Draw obstacles
    gameState.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle.x, obstacle.gapY);
    });

    // Draw taco with rotation based on velocity
    const rotation = Math.max(-0.5, Math.min(0.5, gameState.tacoVelocity * 0.1));
    drawTaco(ctx, 80, gameState.tacoY, rotation);

    // Draw UI with enhanced visibility
    ctx.textAlign = 'left';
    
    // Score with retro pixelated style
    ctx.font = 'bold 22px monospace'; // Pixelated font
    ctx.strokeStyle = '#000000'; // Black outline
    ctx.lineWidth = 3; // Thicker outline
    ctx.fillStyle = '#FFFFFF'; // White text
    ctx.strokeText(`Score: ${gameState.score}`, 20, 35);
    ctx.fillText(`Score: ${gameState.score}`, 20, 35);
    
    // Draw pixelated border for retro feel
    ctx.strokeStyle = '#000000'; // Black
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  }, [gameState]);

  // Start game loop
  useEffect(() => {
    if (gameActive && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      console.log('TacoGame: Starting game loop');
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('TacoGame: Cleaning up game loop in useEffect');
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, gameLoop, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Event listeners management
  useEffect(() => {
    if (!eventListenersAttachedRef.current) {
      console.log('TacoGame: Attaching event listeners');
      
      window.addEventListener('keydown', handleKeyPress);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
      }
      
      eventListenersAttachedRef.current = true;
    }

    return () => {
      console.log('TacoGame: Cleaning up event listeners');
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
    console.log('TacoGame: Component mounted, setting up cleanup');
    
    return () => {
      console.log('TacoGame: Component unmounting - performing final cleanup');
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
          className="border-4 border-blue-300 rounded-xl shadow-lg cursor-pointer bg-black"
          style={{ 
            imageRendering: 'pixelated',
            boxShadow: '0 0 10px #3b82f6, inset 0 0 5px #3b82f6'
          }}
        />
        
        {/* Game controls overlay - pause button */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-all border border-blue-200"
            >
              {gameState.isPaused ? (
                <Play className="h-4 w-4 text-blue-700" />
              ) : (
                <Pause className="h-4 w-4 text-blue-700" />
              )}
            </button>
          )}
        </div>
      </div>

      {gameState.score > 0 && (
        <div className="flex items-center justify-center space-x-2 text-royal-blue-600 mt-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
          <Trophy className="h-5 w-5" />
          <span className="font-bold text-lg">Current Score: {gameState.score}</span>
        </div>
      )}
    </div>
  );
};

export default TacoGame;