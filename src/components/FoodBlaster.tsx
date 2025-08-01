import React, { useRef, useEffect, useState, useCallback } from 'react';

interface GameState {
  playerX: number;
  playerY: number;
  enemies: Array<{ x: number; y: number; type: number; alive: boolean }>;
  playerBullets: Array<{ x: number; y: number }>;
  enemyBullets: Array<{ x: number; y: number }>;
  score: number;
  lives: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  wave: number;
  enemyDirection: number;
  enemySpeed: number;
}

interface FoodBlasterProps {
  onGameEnd: (score: number) => void;
  gameActive: boolean;
  resetTrigger: number;
}

const FoodBlaster: React.FC<FoodBlasterProps> = ({ onGameEnd, gameActive, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const gameEndCalledRef = useRef<boolean>(false);
  const isMovingRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const isTouchDeviceRef = useRef<boolean>(false);
  
  // Game constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    playerX: CANVAS_WIDTH / 2,
    playerY: CANVAS_HEIGHT - 60,
    enemies: [],
    playerBullets: [],
    enemyBullets: [],
    score: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    isPaused: false,
    wave: 1,
    enemyDirection: 1,
    enemySpeed: 1
  });

  // Detect touch device
  useEffect(() => {
    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // Initialize game state
  const createInitialGameState = useCallback((): GameState => ({
    playerX: CANVAS_WIDTH / 2,
    playerY: CANVAS_HEIGHT - 60,
    enemies: [],
    playerBullets: [],
    enemyBullets: [],
    score: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    isPaused: false,
    wave: 1,
    enemyDirection: 1,
    enemySpeed: 1
  }), []);

  // Reset game
  const resetGame = useCallback(() => {
    gameEndCalledRef.current = false;
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
    const enemies = [];
    const rows = 5;
    const cols = 8;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push({
          x: 50 + col * 40,
          y: 50 + row * 35,
          type: row % 3,
          alive: true
        });
      }
    }

    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      enemies
    }));
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
      return;
    }

    if (gameState.gameOver || gameState.isPaused) return;

    // Shoot bullet on touch
    setGameState(prev => {
      if (prev.playerBullets.length < 3) {
        return {
          ...prev,
          playerBullets: [...prev.playerBullets, { x: prev.playerX, y: prev.playerY }]
        };
      }
      return prev;
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();

    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas || !touch) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;

    // Move player to touch position (scaled to canvas coordinates)
    const newPlayerX = Math.max(15, Math.min(CANVAS_WIDTH - 15, (currentX / rect.width) * CANVAS_WIDTH));
    setGameState(prev => ({
      ...prev,
      playerX: newPlayerX
    }));
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    isMovingRef.current.left = false;
    isMovingRef.current.right = false;
  }, []);

  // Mouse/click handlers for desktop
  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
      return;
    }

    if (gameState.gameOver || gameState.isPaused) return;

    // Shoot bullet
    setGameState(prev => {
      if (prev.playerBullets.length < 3) {
        return {
          ...prev,
          playerBullets: [...prev.playerBullets, { x: prev.playerX, y: prev.playerY }]
        };
      }
      return prev;
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame]);

  // Keyboard handlers for desktop
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      
      if (!gameState.gameStarted && !gameState.gameOver) {
        startGame();
        return;
      }

      if (gameState.gameOver || gameState.isPaused) return;

      // Shoot bullet
      setGameState(prev => {
        if (prev.playerBullets.length < 3) {
          return {
            ...prev,
            playerBullets: [...prev.playerBullets, { x: prev.playerX, y: prev.playerY }]
          };
        }
        return prev;
      });
    }

    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      isMovingRef.current.left = true;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      isMovingRef.current.right = true;
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      isMovingRef.current.left = false;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      isMovingRef.current.right = false;
    }
  }, []);

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
      let newState = { ...prev };

      // Player movement
      const moveSpeed = 4;
      if (isMovingRef.current.left && newState.playerX > 15) {
        newState.playerX -= moveSpeed;
      }
      if (isMovingRef.current.right && newState.playerX < CANVAS_WIDTH - 15) {
        newState.playerX += moveSpeed;
      }

      // Move player bullets
      newState.playerBullets = newState.playerBullets
        .map(bullet => ({ ...bullet, y: bullet.y - 8 }))
        .filter(bullet => bullet.y > 0);

      // Move enemy bullets
      newState.enemyBullets = newState.enemyBullets
        .map(bullet => ({ ...bullet, y: bullet.y + 6 }))
        .filter(bullet => bullet.y < CANVAS_HEIGHT);

      // Move enemies
      let shouldMoveDown = false;
      const aliveEnemies = newState.enemies.filter(enemy => enemy.alive);
      
      if (aliveEnemies.length > 0) {
        const leftmost = Math.min(...aliveEnemies.map(e => e.x));
        const rightmost = Math.max(...aliveEnemies.map(e => e.x));
        
        if (rightmost >= CANVAS_WIDTH - 30 || leftmost <= 10) {
          shouldMoveDown = true;
          newState.enemyDirection *= -1;
          newState.enemySpeed = Math.min(newState.enemySpeed + 0.2, 3);
        }
      }

      newState.enemies = newState.enemies.map(enemy => {
        if (!enemy.alive) return enemy;
        
        if (shouldMoveDown) {
          return { ...enemy, y: enemy.y + 20 };
        } else {
          return { ...enemy, x: enemy.x + newState.enemyDirection * newState.enemySpeed };
        }
      });

      // Collision detection - player bullets vs enemies
      newState.playerBullets = newState.playerBullets.filter(bullet => {
        for (let i = 0; i < newState.enemies.length; i++) {
          const enemy = newState.enemies[i];
          if (enemy.alive && 
              bullet.x > enemy.x - 15 && bullet.x < enemy.x + 15 &&
              bullet.y > enemy.y - 15 && bullet.y < enemy.y + 15) {
            newState.enemies[i] = { ...enemy, alive: false };
            newState.score += (enemy.type + 1) * 10;
            return false; // Remove bullet
          }
        }
        return true;
      });

      // Collision detection - enemy bullets vs player
      newState.enemyBullets = newState.enemyBullets.filter(bullet => {
        if (bullet.x > newState.playerX - 15 && bullet.x < newState.playerX + 15 &&
            bullet.y > newState.playerY - 15 && bullet.y < newState.playerY + 15) {
          newState.lives -= 1;
          if (newState.lives <= 0) {
            if (!gameEndCalledRef.current) {
              gameEndCalledRef.current = true;
              onGameEnd(newState.score);
            }
            newState.gameOver = true;
          }
          return false; // Remove bullet
        }
        return true;
      });

      // Enemy shooting
      if (Math.random() < 0.008) {
        const shooters = aliveEnemies.filter(enemy => enemy.y > 100);
        if (shooters.length > 0) {
          const shooter = shooters[Math.floor(Math.random() * shooters.length)];
          newState.enemyBullets.push({ x: shooter.x, y: shooter.y + 15 });
        }
      }

      // Check win condition
      if (aliveEnemies.length === 0) {
        // Next wave
        newState.wave += 1;
        newState.enemies = [];
        
        const rows = Math.min(5 + Math.floor(newState.wave / 3), 8);
        const cols = 8;
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            newState.enemies.push({
              x: 50 + col * 40,
              y: 50 + row * 35,
              type: row % 3,
              alive: true
            });
          }
        }
        
        newState.enemyDirection = 1;
        newState.enemySpeed = 1 + (newState.wave - 1) * 0.3;
      }

      // Check game over - enemies reached player
      if (aliveEnemies.some(enemy => enemy.y > CANVAS_HEIGHT - 100)) {
        if (!gameEndCalledRef.current) {
          gameEndCalledRef.current = true;
          onGameEnd(newState.score);
        }
        newState.gameOver = true;
      }

      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, gameState.gameStarted, gameState.gameOver, gameState.isPaused, onGameEnd]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Start screen
      ctx.fillStyle = 'rgba(0, 0, 50, 0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FOOD BLASTER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
      
      ctx.font = 'bold 16px monospace';
      ctx.fillText(isTouchDeviceRef.current ? 'TAP TO SHOOT' : 'SPACE TO SHOOT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.fillText(isTouchDeviceRef.current ? 'HOLD & DRAG TO MOVE' : 'ARROW KEYS TO MOVE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText(isTouchDeviceRef.current ? 'TAP TO START!' : 'CLICK OR SPACE TO START!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      
      return;
    }

    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 50, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      return;
    }

    // Draw player (spaceship)
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.moveTo(gameState.playerX, gameState.playerY - 15);
    ctx.lineTo(gameState.playerX - 15, gameState.playerY + 15);
    ctx.lineTo(gameState.playerX + 15, gameState.playerY + 15);
    ctx.closePath();
    ctx.fill();

    // Draw enemies (food items)
    const foodEmojis = ['🍔', '🌮', '🍕'];
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    gameState.enemies.forEach(enemy => {
      if (enemy.alive) {
        ctx.fillText(foodEmojis[enemy.type], enemy.x, enemy.y);
      }
    });

    // Draw bullets
    ctx.fillStyle = '#FFFF00';
    gameState.playerBullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 8);
    });

    ctx.fillStyle = '#FF0000';
    gameState.enemyBullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 2, bullet.y, 4, 8);
    });

    // Draw UI
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 10, 25);
    ctx.fillText(`Lives: ${gameState.lives}`, 10, 45);
    ctx.fillText(`Wave: ${gameState.wave}`, CANVAS_WIDTH - 80, 25);
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
    
    // Keyboard events (desktop)
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleClick, handleKeyDown, handleKeyUp]);

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
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-purple-400 rounded-xl shadow-lg bg-black"
        style={{ 
          imageRendering: 'pixelated',
          touchAction: 'none',
          userSelect: 'none'
        }}
      />
      
      {gameState.score > 0 && (
        <div className="flex items-center justify-center space-x-2 text-purple-300 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30">
          <span className="font-bold text-lg">
            Score: {gameState.score} | Lives: {gameState.lives} | Wave: {gameState.wave}
          </span>
        </div>
      )}
    </div>
  );
};

export default FoodBlaster;