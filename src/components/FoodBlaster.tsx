import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, Pause } from 'lucide-react';

interface GameState {
  playerX: number;
  bullets: Array<{ x: number; y: number; id: number }>;
  enemies: Array<{ x: number; y: number; type: number; id: number }>;
  score: number;
  lives: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  wave: number;
  enemyDirection: number;
  enemySpeed: number;
  lastShot: number;
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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const lastShotTimeRef = useRef<number>(0);
  const eventListenersAttachedRef = useRef<boolean>(false);
  
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const PLAYER_WIDTH = 30;
  const PLAYER_HEIGHT = 20;
  const BULLET_WIDTH = 3;
  const BULLET_HEIGHT = 8;
  const ENEMY_WIDTH = 25;
  const ENEMY_HEIGHT = 25;
  const BULLET_SPEED = 8;
  const ENEMY_BULLET_SPEED = 3;
  const PLAYER_SPEED = 5;
  const SHOT_COOLDOWN = 200; // milliseconds

  // Food emojis for enemies
  const FOOD_TYPES = ['🍕', '🍔', '🌮', '🍟', '🍗', '🥪', '🌭', '🍝', '🍜', '🍱'];

  console.log('FoodBlaster: Component rendered/remounted with props:', {
    gameActive,
    resetTrigger,
    timestamp: Date.now()
  });

  const createInitialGameState = useCallback((): GameState => {
    const initialState = {
      playerX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      bullets: [],
      enemies: [],
      enemyBullets: [],
      enemyBullets: [],
      score: 0,
      lives: 5,
      gameStarted: false,
      gameOver: false,
      isPaused: false,
      wave: 1,
      enemyDirection: 1,
      enemySpeed: 0.5,
      lastShot: 0
    };
    console.log('FoodBlaster: Created fresh initial game state:', initialState);
    return initialState;
  }, []);

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  // Debug logging for state changes
  useEffect(() => {
    console.log('FoodBlaster: Game state changed:', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      isPaused: gameState.isPaused,
      score: gameState.score,
      lives: gameState.lives,
      wave: gameState.wave,
      enemyCount: gameState.enemies.length
    });
  }, [gameState]);

  // Comprehensive cleanup function
  const cleanupGame = useCallback(() => {
    console.log('FoodBlaster: Performing comprehensive cleanup');
    
    if (gameLoopRef.current) {
      console.log('FoodBlaster: Cancelling animation frame:', gameLoopRef.current);
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    
    lastTimeRef.current = 0;
    touchStartRef.current = null;
    touchMoveRef.current = null;
    
    if (eventListenersAttachedRef.current) {
      console.log('FoodBlaster: Removing event listeners');
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
      eventListenersAttachedRef.current = false;
    }
  }, []);

  // Reset game function
  const resetGame = useCallback(() => {
    console.log('FoodBlaster: resetGame called - performing full reset');
    
    cleanupGame();
    
    const newState = createInitialGameState();
    console.log('FoodBlaster: Setting fresh initial state:', newState);
    setGameState(newState);
  }, [cleanupGame, createInitialGameState]);

  // Start game function
  const startGame = useCallback(() => {
    console.log('FoodBlaster: startGame called - initializing fresh game');
    
    const enemies = createEnemyWave(1);
    const newState = {
      ...createInitialGameState(),
      gameStarted: true,
      gameOver: false,
      isPaused: false,
      enemies
    };
    
    console.log('FoodBlaster: Starting game with fresh state:', newState);
    setGameState(newState);
  }, [createInitialGameState]);

  // Handle reset trigger from parent component
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('FoodBlaster: Reset trigger received:', resetTrigger);
      resetGame();
    }
  }, [resetTrigger, resetGame]);

  // Create enemy wave
  const createEnemyWave = useCallback((wave: number) => {
    const enemies = [];
    const rows = Math.min(3 + Math.floor(wave / 3), 6);
    const cols = 8;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push({
          x: col * (ENEMY_WIDTH + 10) + 40,
          y: row * (ENEMY_HEIGHT + 10) + 50,
          type: Math.floor(Math.random() * FOOD_TYPES.length),
          id: Date.now() + Math.random()
        });
      }
    }
    
    return enemies;
  }, []);

  // Toggle pause function
  const togglePause = useCallback(() => {
    console.log('FoodBlaster: Toggling pause state');
    setGameState(prev => {
      const newPauseState = !prev.isPaused;
      console.log('FoodBlaster: Pause state changed to:', newPauseState);
      return {
        ...prev,
        isPaused: newPauseState
      };
    });
  }, []);

  // Event handler functions
  const handleCanvasClick = useCallback(() => {
    console.log('FoodBlaster: Canvas clicked');
    
    if (!gameState.gameStarted && !gameState.gameOver) {
      console.log('FoodBlaster: Game not started - starting from canvas click');
      startGame();
    }
  }, [gameState.gameStarted, gameState.gameOver, startGame]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      touchStartRef.current = { x, y };
      touchMoveRef.current = { x, y };
    }
    
    // Start game if not started
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
    }
    
    // Fire bullet if game is active
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      const currentTime = Date.now();
      if (currentTime - lastShotTimeRef.current > SHOT_COOLDOWN) {
        setGameState(prev => ({
          ...prev,
          bullets: [...prev.bullets, {
            x: prev.playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
            y: CANVAS_HEIGHT - 50,
            id: Date.now() + Math.random()
          }]
        }));
        lastShotTimeRef.current = currentTime;
      }
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (!touchStartRef.current || !gameState.gameStarted || gameState.gameOver || gameState.isPaused) return;

    const touch = e.touches[0];
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      touchMoveRef.current = { x, y };
    }

    // Move player based on touch position
    setGameState(prev => {
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, touchMoveRef.current.x - PLAYER_WIDTH / 2));
      return {
        ...prev,
        playerX: newX
      };
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, CANVAS_WIDTH, PLAYER_WIDTH]);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    touchStartRef.current = null;
    touchMoveRef.current = null;
  }, []);

  // Check if enemy should fire
  const shouldEnemyFire = useCallback((enemy: any) => {
    // Random chance based on game progress and enemy position
    const baseChance = 0.005; // 0.5% chance per frame
    const positionFactor = 1 + (CANVAS_HEIGHT - enemy.y) / CANVAS_HEIGHT; // More likely to fire when closer to player
    
    // Random check with adjusted probability
    return Math.random() < baseChance * positionFactor;
  }, [CANVAS_HEIGHT]);

  // Drawing functions
  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number) => {
    // Draw spaceship
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + 10, CANVAS_HEIGHT - 40, 10, 15);
    
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(x + 5, CANVAS_HEIGHT - 25, 20, 10);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 12, CANVAS_HEIGHT - 30, 6, 8);
    
    // Engine glow
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(x + 13, CANVAS_HEIGHT - 15, 4, 6);
  };

  const drawBullet = (ctx: CanvasRenderingContext2D, bullet: any) => {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    
    // Add glow effect
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 5;
    ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    ctx.shadowBlur = 0;
  };

  const drawEnemyBullet = (ctx: CanvasRenderingContext2D, bullet: any) => {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 5;
    ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    ctx.shadowBlur = 0;
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: any) => {
    const foodEmoji = FOOD_TYPES[enemy.type];
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(foodEmoji, enemy.x + ENEMY_WIDTH / 2, enemy.y + ENEMY_HEIGHT);
  };

  const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  // Collision detection
  const checkCollision = (rect1: any, rect2: any, w1: number, h1: number, w2: number, h2: number) => {
    return rect1.x < rect2.x + w2 &&
           rect1.x + w1 > rect2.x &&
           rect1.y < rect2.y + h2 &&
           rect1.y + h1 > rect2.y;
  };

  // Main game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameActive || !gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
      return;
    }

    // Capture touch reference at the beginning to avoid null access later
    const currentTouchMove = touchMoveRef.current;

    const deltaTime = currentTime - lastTimeRef.current;
    if (deltaTime < 16) { // Cap at ~60 FPS
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = currentTime;

    setGameState(prev => {
      // Use touch position for player movement if available
      let newPlayerX = currentTouchMove 
        ? Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, currentTouchMove.x - PLAYER_WIDTH / 2))
        : prev.playerX;
        
      let newBullets = [...prev.bullets];
      let newEnemyBullets = [...prev.enemyBullets];
      let newEnemies = [...prev.enemies];
      let newScore = prev.score;
      let newLives = prev.lives;
      let newWave = prev.wave;
      let newEnemyDirection = prev.enemyDirection;
      let newEnemySpeed = prev.enemySpeed;

      // Move bullets
      newBullets = newBullets.map(bullet => ({
        ...bullet,
        y: bullet.y - BULLET_SPEED
      })).filter(bullet => bullet.y > -BULLET_HEIGHT);

      // Move enemy bullets
      newEnemyBullets = (newEnemyBullets || []).map(bullet => ({
        ...bullet,
        y: bullet.y + ENEMY_BULLET_SPEED
      })).filter(bullet => bullet.y < CANVAS_HEIGHT + BULLET_HEIGHT);

      // Move enemies
      let shouldMoveDown = false;
      for (const enemy of newEnemies) {
        if ((enemy.x <= 0 && newEnemyDirection === -1) || 
            (enemy.x >= CANVAS_WIDTH - ENEMY_WIDTH && newEnemyDirection === 1)) {
          shouldMoveDown = true;
          break;
        }
      }

      if (shouldMoveDown) {
        newEnemyDirection *= -1;
        newEnemies = newEnemies.map(enemy => ({
          ...enemy,
          y: enemy.y + 20
        }));
      } else {
        newEnemies = newEnemies.map(enemy => ({
          ...enemy,
          x: enemy.x + newEnemyDirection * newEnemySpeed
        }));
        
        // Enemies randomly fire bullets
        newEnemies.forEach(enemy => {
          if (shouldEnemyFire(enemy)) {
            newEnemyBullets = [...newEnemyBullets, {
              x: enemy.x + ENEMY_WIDTH / 2,
              y: enemy.y + ENEMY_HEIGHT,
              id: Date.now() + Math.random()
            }];
          }
        });
      }

      // Check bullet-enemy collisions
      const bulletsToRemove = new Set();
      const enemiesToRemove = new Set();

      newBullets.forEach(bullet => {
        newEnemies.forEach(enemy => {
          if (checkCollision(bullet, enemy, BULLET_WIDTH, BULLET_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT)) {
            bulletsToRemove.add(bullet.id);
            enemiesToRemove.add(enemy.id);
            newScore += 10;
          }
        });
      });

      newBullets = newBullets.filter(bullet => !bulletsToRemove.has(bullet.id));
      newEnemies = newEnemies.filter(enemy => !enemiesToRemove.has(enemy.id));

      // Check enemy bullet-player collisions
      const playerHit = (newEnemyBullets || []).some(bullet => 
        checkCollision(
          { x: newPlayerX, y: CANVAS_HEIGHT - 40 },
          bullet,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          BULLET_WIDTH,
          BULLET_HEIGHT
        )
      );
      
      if (playerHit) {
        newEnemyBullets = newEnemyBullets.filter(bullet => !playerHit);
      }

      // Check if wave is complete
      if (newEnemies.length === 0) {
        newWave++;
        newEnemies = createEnemyWave(newWave);
        newEnemySpeed = Math.min(3, 0.5 + (newWave - 1) * 0.3);
        newScore += newWave * 50; // Bonus for completing wave
      }

      // Check if enemies reached player or player was hit by bullet
      const enemyReachedPlayer = newEnemies.some(enemy => enemy.y + ENEMY_HEIGHT >= CANVAS_HEIGHT - 50);
      if (enemyReachedPlayer) {
        newLives--;
        if (newLives <= 0) {
          console.log('FoodBlaster: Game over - calling onGameEnd with score:', newScore);
          onGameEnd(newScore);
          return {
            ...prev,
            gameOver: true
          };
        }
        // Reset enemy positions
        newEnemies = createEnemyWave(newWave);
      }

      // Handle player hit by enemy bullet
      if (playerHit) {
        newLives--;
        if (newLives <= 0) {
          console.log('FoodBlaster: Game over from bullet hit - calling onGameEnd with score:', newScore);
          onGameEnd(newScore);
          return {
            ...prev,
            gameOver: true
          };
        }
      }

      return {
        ...prev,
        playerX: newPlayerX,
        bullets: newBullets,
        enemyBullets: newEnemyBullets,
        enemyBullets: newEnemyBullets,
        enemies: newEnemies,
        score: newScore,
        lives: newLives,
        wave: newWave,
        enemyDirection: newEnemyDirection,
        enemySpeed: newEnemySpeed
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, gameState.gameStarted, gameState.gameOver, gameState.isPaused, onGameEnd, createEnemyWave]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with space background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000011');
    gradient.addColorStop(0.5, '#000033');
    gradient.addColorStop(1, '#000055');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 73) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(0, 0, 50, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('FOOD BLASTER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.fillText('FOOD BLASTER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      ctx.font = 'bold 16px Arial';
      ctx.strokeStyle = '#0088ff';
      ctx.lineWidth = 2;
      ctx.strokeText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      ctx.font = 'bold 14px Arial';
      ctx.strokeText('Arrow keys to move, SPACE to shoot', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      ctx.fillText('Arrow keys to move, SPACE to shoot', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      
      ctx.strokeText('Destroy all the food invaders!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.fillText('Destroy all the food invaders!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      return;
    }

    if (gameState.gameOver) {
      return;
    }

    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 4;
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    // Draw game objects
    drawPlayer(ctx, gameState.playerX);

    gameState.bullets.forEach(bullet => {
      drawBullet(ctx, bullet);
    });

    // Draw enemy bullets
    gameState.enemyBullets?.forEach(bullet => {
      drawEnemyBullet(ctx, bullet);
    });

    // Draw enemy bullets
    gameState.enemyBullets?.forEach(bullet => {
      drawEnemyBullet(ctx, bullet);
    });

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      drawEnemy(ctx, enemy);
    });

    // Draw UI
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = '#0088ff';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#FFFFFF';
    
    ctx.strokeText(`Score: ${gameState.score}`, 10, 25);
    ctx.fillText(`Score: ${gameState.score}`, 10, 25);
    
    // Draw lives with heart emojis
    ctx.fillText(`Lives: ${"❤️".repeat(gameState.lives)}`, 10, 45);
    
    ctx.strokeText(`Wave: ${gameState.wave}`, 10, 65);
    ctx.fillText(`Wave: ${gameState.wave}`, 10, 65);

  }, [gameState]);

  // Start game loop
  useEffect(() => {
    if (gameActive && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      console.log('FoodBlaster: Starting game loop');
      lastTimeRef.current = performance.now();
      lastShotTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('FoodBlaster: Cleaning up game loop in useEffect');
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, gameLoop, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Touch event listeners management
  useEffect(() => {
    if (!eventListenersAttachedRef.current) {
      console.log('FoodBlaster: Attaching event listeners');
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      }
      
      eventListenersAttachedRef.current = true;
    }

    return () => {
      console.log('FoodBlaster: Cleaning up event listeners');
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
      eventListenersAttachedRef.current = false;
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleCanvasClick]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('FoodBlaster: Component mounted, setting up cleanup');
    
    return () => {
      console.log('FoodBlaster: Component unmounting - performing final cleanup');
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
          className="border-4 border-purple-200 rounded-xl shadow-lg cursor-pointer bg-gradient-to-b from-purple-900 to-black touch-none"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Game controls overlay - pause button */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-all border border-purple-200"
            >
              {gameState.isPaused ? (
                <Play className="h-4 w-4 text-purple-700" />
              ) : (
                <Pause className="h-4 w-4 text-purple-700" />
              )}
            </button>
          )}
        </div>
      </div>

      {gameState.score > 0 && (
        <div className="flex items-center justify-center space-x-2 text-purple-700 mt-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
          <Trophy className="h-5 w-5" />
          <span className="font-bold text-lg text-center">
            Score: {gameState.score} | Wave: {gameState.wave} | Lives: {gameState.lives}
          </span>
        </div>
      )}
    </div>
  );
};

export default FoodBlaster;