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
}

const TacoGame: React.FC<TacoGameProps> = ({ onGameEnd, gameActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const TACO_SIZE = 30;
  const OBSTACLE_WIDTH = 60;
  const OBSTACLE_GAP = 150;
  const GRAVITY = 0.4;
  const JUMP_FORCE = -8;
  const OBSTACLE_SPEED = 2;
  const OBSTACLE_SPAWN_DISTANCE = 200;

  // Initial game state
  const getInitialGameState = useCallback((): GameState => ({
    tacoY: 250,
    tacoVelocity: 0,
    obstacles: [],
    score: 0,
    gameStarted: false,
    gameOver: false,
    isPaused: false
  }), []);

  const [gameState, setGameState] = useState<GameState>(getInitialGameState);

  const resetGame = useCallback(() => {
    // Cancel any running animation frame
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    
    // Reset to initial state
    setGameState(getInitialGameState());
    lastTimeRef.current = 0;
  }, [getInitialGameState]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      isPaused: false,
      tacoY: 250,
      tacoVelocity: 0,
      score: 0,
      obstacles: [{
        x: CANVAS_WIDTH + 100,
        gapY: Math.random() * (CANVAS_HEIGHT - OBSTACLE_GAP - 100) + 50,
        passed: false
      }]
    }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const jump = useCallback(() => {
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
      return;
    }
    
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      setGameState(prev => ({
        ...prev,
        tacoVelocity: JUMP_FORCE
      }));
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame]);

  const handleGameRestart = useCallback(() => {
    resetGame();
    // Small delay to ensure state is fully reset
    setTimeout(() => {
      startGame();
    }, 10);
  }, [resetGame, startGame]);

  const drawTaco = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number) => {
    ctx.save();
    ctx.translate(x + TACO_SIZE / 2, y + TACO_SIZE / 2);
    ctx.rotate(rotation);
    
    // Taco shell (golden brown)
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.arc(0, 0, TACO_SIZE / 2, 0, Math.PI);
    ctx.fill();
    
    // Taco filling (colorful)
    ctx.fillStyle = '#E74C3C'; // Tomato
    ctx.fillRect(-8, -5, 16, 3);
    
    ctx.fillStyle = '#27AE60'; // Lettuce
    ctx.fillRect(-10, -2, 20, 2);
    
    ctx.fillStyle = '#F39C12'; // Cheese
    ctx.fillRect(-6, 0, 12, 2);
    
    // Taco outline
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, TACO_SIZE / 2, 0, Math.PI);
    ctx.stroke();
    
    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, x: number, gapY: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    
    ctx.fillStyle = gradient;
    
    // Top obstacle
    ctx.fillRect(x, 0, OBSTACLE_WIDTH, gapY);
    
    // Bottom obstacle
    ctx.fillRect(x, gapY + OBSTACLE_GAP, OBSTACLE_WIDTH, CANVAS_HEIGHT - gapY - OBSTACLE_GAP);
    
    // Obstacle borders
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, 0, OBSTACLE_WIDTH, gapY);
    ctx.strokeRect(x, gapY + OBSTACLE_GAP, OBSTACLE_WIDTH, CANVAS_HEIGHT - gapY - OBSTACLE_GAP);
  };

  const checkCollision = (tacoY: number, obstacles: Array<{ x: number; gapY: number }>) => {
    const tacoX = 80;
    
    // Check ground and ceiling collision
    if (tacoY <= 0 || tacoY >= CANVAS_HEIGHT - TACO_SIZE) {
      return true;
    }
    
    // Check obstacle collision
    for (const obstacle of obstacles) {
      if (tacoX + TACO_SIZE > obstacle.x && tacoX < obstacle.x + OBSTACLE_WIDTH) {
        if (tacoY < obstacle.gapY || tacoY + TACO_SIZE > obstacle.gapY + OBSTACLE_GAP) {
          return true;
        }
      }
    }
    
    return false;
  };

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

    // Clear canvas with baby blue gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#E6F3FF');
    gradient.addColorStop(1, '#B3D9FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(135, 206, 235, 0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Taco Flyer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      ctx.font = '16px Arial';
      ctx.fillText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('Guide the taco through the pipes', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      
      // Draw taco in center
      drawTaco(ctx, CANVAS_WIDTH / 2 - TACO_SIZE / 2, CANVAS_HEIGHT / 2 + 60, 0);
      return;
    }

    if (gameState.gameOver) {
      // Draw game over screen
      ctx.fillStyle = 'rgba(135, 206, 235, 0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      
      ctx.font = '20px Arial';
      ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      ctx.font = '16px Arial';
      ctx.fillText('Click to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      return;
    }

    if (gameState.isPaused) {
      // Draw pause overlay
      ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
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

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 3;
    ctx.strokeText(`Score: ${gameState.score}`, 20, 40);
    ctx.fillText(`Score: ${gameState.score}`, 20, 40);

  }, [gameState]);

  // Start game loop
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

  // Event handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState.gameOver) {
          handleGameRestart();
        } else {
          jump();
        }
      }
    };

    const handleCanvasClick = () => {
      if (gameState.gameOver) {
        handleGameRestart();
      } else if (!gameState.gameStarted) {
        startGame();
      } else {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [jump, gameState.gameOver, gameState.gameStarted, handleGameRestart, startGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-blue-200 rounded-xl shadow-lg cursor-pointer bg-gradient-to-b from-blue-100 to-blue-200"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Game controls overlay - only show pause button */}
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

      {/* Instructions */}
      <div className="text-center max-w-md">
        <p className="text-sm text-blue-700 mb-2">
          Click or press SPACE to make the taco fly! Navigate through the blue pipes.
        </p>
        {gameState.score > 0 && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Trophy className="h-4 w-4" />
            <span className="font-semibold">Current Score: {gameState.score}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacoGame;