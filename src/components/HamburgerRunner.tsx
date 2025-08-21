import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, Pause } from 'lucide-react';

interface GameState {
  hamburgerX: number;
  hamburgerY: number;
  hamburgerVelocityY: number;
  isJumping: boolean;
  enemies: Array<{ x: number; y: number; speed: number; width: number; height: number }>;
  coins: Array<{ x: number; y: number; collected: boolean }>;
  score: number;
  distance: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  speed: number;
  lastTapTime: number;
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
  const gameEndCalledRef = useRef<boolean>(false);
  const lastInputTimeRef = useRef<number>(0);
  
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const HAMBURGER_SIZE = 40;
  const PLAYER_WIDTH = 30;
  const PLAYER_HEIGHT = 30;
  const GROUND_HEIGHT = 80;
  const GRAVITY = 0.3; // Enhanced gravity for faster ascent
  const JUMP_FORCE = -14; // Enhanced jump force for higher jumps
  const INITIAL_SPEED = 3;
  const SPEED_INCREASE = 0.001;
  const ENEMY_SPEED = 5; // Speed of moving enemies
  const ENEMY_SPAWN_DISTANCE = 300; // Distance between enemy spawns
  const MAX_ENEMIES = 2; // Maximum enemies on screen
  const INPUT_DEBOUNCE = 150; // Debounce time in ms for responsive input

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
      enemies: [] as Array<{ x: number; y: number; speed: number; width: number; height: number }>,
      coins: [] as Array<{ x: number; y: number; collected: boolean }>,
      score: 0,
      distance: 0,
      gameStarted: false,
      gameOver: false,
      isPaused: false,
      speed: INITIAL_SPEED,
      lastTapTime: 0
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
    
    // Reset game end flag
    gameEndCalledRef.current = false;
    
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
      enemies: [] as Array<{ x: number; y: number; speed: number; width: number; height: number }>,
      coins: [] as Array<{ x: number; y: number; collected: boolean }>
    };
    
    // Initialize first enemy and coin after state creation
    newState.enemies = [{
      x: CANVAS_WIDTH + 100,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - HAMBURGER_SIZE, // Same height as player
      speed: ENEMY_SPEED,
      width: 35,
      height: HAMBURGER_SIZE
    }];
    
    newState.coins = [{
      x: CANVAS_WIDTH + 200,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - 100,
      collected: false
    }];
    
    console.log('HamburgerRunner: Starting game with fresh state:', newState);
    setGameState(newState);
  }, [createInitialGameState, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT]);

  // Handle reset trigger from parent component
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('HamburgerRunner: Reset trigger received:', resetTrigger);
      gameEndCalledRef.current = false;
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
    const currentTime = Date.now();
    
    // Debounce input for responsiveness without spam
    if (currentTime - lastInputTimeRef.current < INPUT_DEBOUNCE) {
      return;
    }
    lastInputTimeRef.current = currentTime;
    
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
    
    if (gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      console.log('HamburgerRunner: Applying jump force');
      setGameState(prev => ({
        ...prev,
        hamburgerVelocityY: JUMP_FORCE,
        isJumping: true,
        lastTapTime: currentTime
      }));
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, startGame]);

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
  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number) => {
    // Draw hamburger emoji
    ctx.save();
    ctx.font = `${PLAYER_WIDTH}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw the hamburger emoji
    const hamburgerCenterX = x + PLAYER_WIDTH / 2;
    const hamburgerCenterY = CANVAS_HEIGHT - 40 + PLAYER_HEIGHT / 2;
    ctx.fillText('🍔', hamburgerCenterX, hamburgerCenterY);
    
    // Draw animated running legs
    const legOffset = Math.sin(Date.now() * 0.02) * 3;
    ctx.fillStyle = '#8B4513'; // Brown legs
    
    // Left leg
    ctx.fillRect(x + 8 + legOffset, CANVAS_HEIGHT - 15, 4, 12);
    // Right leg  
    ctx.fillRect(x + 18 - legOffset, CANVAS_HEIGHT - 15, 4, 12);
    
    // Leg joints (knees)
    ctx.fillStyle = '#654321'; // Darker brown
    ctx.fillRect(x + 9 + legOffset, CANVAS_HEIGHT - 9, 2, 2);
    ctx.fillRect(x + 19 - legOffset, CANVAS_HEIGHT - 9, 2, 2);
    
    ctx.restore();
  };

  const drawHamburger = (ctx: CanvasRenderingContext2D, x: number, y: number, isRunning: boolean) => {
    ctx.save();
    // Center the hamburger for rotation
    const centerX = x + HAMBURGER_SIZE / 2;
    const centerY = y + HAMBURGER_SIZE / 2;
    ctx.translate(centerX, centerY);
    
    // Add slight rotation when running
    if (isRunning) {
      ctx.rotate(Math.sin(Date.now() * 0.01) * 0.1);
    }
    
    // More pixelated retro style hamburger
    // Bottom bun (rectangular for pixel art style)
    ctx.fillStyle = '#D2691E'; // Brown
    ctx.fillRect(-16, 0, 32, 8);
    ctx.fillRect(-18, 4, 36, 6);
    
    // Lettuce
    ctx.fillStyle = '#22DD22'; // Brighter green for retro look
    ctx.fillRect(-15, -2, 30, 4);
    
    // Tomato
    ctx.fillStyle = '#FF4500'; // Bright red
    ctx.fillRect(-12, -6, 24, 4);
    
    // Cheese
    ctx.fillStyle = '#FFFF00'; // Bright yellow for retro look
    ctx.fillRect(-14, -10, 28, 4);
    
    // Meat patty
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(-16, -14, 32, 6);
    
    // Top bun (rectangular for pixel art style)
    ctx.fillStyle = '#DEB887'; // Tan
    ctx.fillRect(-18, -20, 36, 6);
    ctx.fillRect(-16, -24, 32, 4);
    
    // Sesame seeds
    ctx.fillStyle = '#F5DEB3';
    // More pixelated seeds
    for (let i = 0; i < 4; i++) {
      const seedX = -10 + i * 7;
      ctx.fillRect(seedX, -22, 2, 2);
    }
    
    // Running legs (simple animation)
    if (isRunning) {
      const legOffset = Math.sin(Date.now() * 0.02) * 3;
      ctx.fillStyle = '#8B4513'; // Brown
      // Pixelated legs
      ctx.fillRect(-8 + legOffset, 15, 6, 10);
      ctx.fillRect(2 - legOffset, 15, 6, 10);
    }
    
    ctx.restore();
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: any) => {
    // Draw pizza slice enemy at same height as player
    const x = Math.floor(enemy.x);
    const y = Math.floor(enemy.y);
    
    ctx.save();
    ctx.translate(x + enemy.width / 2, y + enemy.height / 2);
    
    // Rotate pizza slice for movement effect
    ctx.rotate(Date.now() * 0.005);
    
    // Pizza slice shape
    ctx.fillStyle = '#FFD700'; // Golden crust
    ctx.beginPath();
    ctx.moveTo(0, -enemy.height / 2);
    ctx.lineTo(-enemy.width / 2, enemy.height / 2);
    ctx.lineTo(enemy.width / 2, enemy.height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Pizza toppings (pepperoni)
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(-5, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Pizza outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -enemy.height / 2);
    ctx.lineTo(-enemy.width / 2, enemy.height / 2);
    ctx.lineTo(enemy.width / 2, enemy.height / 2);
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  };

  const drawCoin = (ctx: CanvasRenderingContext2D, coin: any) => {
    if (coin.collected) return;
    
    // More pixelated retro style coin
    const x = Math.floor(coin.x);
    const y = Math.floor(coin.y);
    const size = 16;
    const halfSize = size / 2;
    
    ctx.save();
    ctx.translate(x + halfSize, y + halfSize);
    ctx.rotate(Date.now() * 0.003); // Slower rotation for retro feel
    
    // Pixelated coin (square with rounded corners)
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.fillRect(-6, -6, 12, 12);
    
    // Pixelated dollar sign
    ctx.fillStyle = '#B8860B'; // Darker gold
    ctx.font = 'bold 10px monospace'; // Pixelated font
    ctx.textAlign = 'center';
    ctx.fillText('$', 0, 3);
    
    ctx.restore();
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    // Ground
    // More pixelated retro style ground
    ctx.fillStyle = '#8FBC8F'; // Solid green for retro look
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Pixelated ground texture
    ctx.fillStyle = '#556B2F'; // Darker green
    ctx.lineWidth = 1;
    
    // Draw pixelated grass tufts
    for (let i = 0; i < CANVAS_WIDTH; i += 16) {
      ctx.fillRect(i, CANVAS_HEIGHT - GROUND_HEIGHT, 8, 2);
      ctx.fillRect(i + 4, CANVAS_HEIGHT - GROUND_HEIGHT - 2, 2, 2);
    }
    
    // Draw a solid line at the top of the ground
    ctx.fillStyle = '#000000'; // Black outline
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 1);
  };

  // Collision detection
  const checkCollision = (hamburgerX: number, hamburgerY: number, enemies: any[]) => {
    const hamburgerBottom = hamburgerY + HAMBURGER_SIZE;
    const hamburgerRight = hamburgerX + HAMBURGER_SIZE;
    const hamburgerLeft = hamburgerX;
    const hamburgerTop = hamburgerY;
    
    // Check ground collision
    if (hamburgerBottom > CANVAS_HEIGHT - GROUND_HEIGHT) {
      return true;
    }
    
    // Check enemy collision
    for (const enemy of enemies) {
      const enemyLeft = enemy.x;
      const enemyRight = enemy.x + enemy.width;
      const enemyTop = enemy.y;
      const enemyBottom = enemy.y + enemy.height;
      
      if (hamburgerRight > enemyLeft && 
          hamburgerLeft < enemyRight && 
          hamburgerBottom > enemyTop && 
          hamburgerTop < enemyBottom) {
        console.log('HamburgerRunner: Collision detected with enemy');
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
      let newEnemies = [...(prev.enemies || [])]; // Guard against undefined
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

      // Move enemies
      newEnemies = newEnemies.map(enemy => ({
        ...enemy,
        x: enemy.x - newSpeed
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

      // Remove off-screen enemies and coins
      newEnemies = newEnemies.filter(enemy => enemy.x + enemy.width > -50);
      newCoins = newCoins.filter(coin => coin.x > -50);

      // Add new enemies (max 2 on screen)
      const lastEnemy = newEnemies[newEnemies.length - 1];
      if (newEnemies.length < MAX_ENEMIES && (!lastEnemy || lastEnemy.x < CANVAS_WIDTH - ENEMY_SPAWN_DISTANCE)) {
        newEnemies.push({
          x: CANVAS_WIDTH,
          y: CANVAS_HEIGHT - GROUND_HEIGHT - HAMBURGER_SIZE, // Same height as player
          speed: ENEMY_SPEED,
          width: 35,
          height: HAMBURGER_SIZE
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
      if (checkCollision(prev.hamburgerX, newHamburgerY, newEnemies)) {
        // Prevent multiple game end calls
        if (!gameEndCalledRef.current) {
          gameEndCalledRef.current = true;
          console.log('HamburgerRunner: Game over - calling onGameEnd with score:', newScore);
          onGameEnd(newScore);
        }
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
        enemies: newEnemies,
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
    // More vibrant retro colors
    gradient.addColorStop(0, '#87CEEB'); // Bright sky blue
    gradient.addColorStop(0.7, '#00FF7F'); // Spring green
    gradient.addColorStop(1, '#32CD32'); // Lime green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(0, 100, 0, 0.9)'; // Darker green for retro feel
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Title text with better contrast
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000'; // Black outline for retro look
      ctx.lineWidth = 5; // Thicker outline
      ctx.font = 'bold 28px monospace'; // Pixelated font
      ctx.textAlign = 'center';
      ctx.strokeText('Hamburger Runner', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.fillText('Hamburger Runner', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      // Instructions with better contrast
      ctx.font = 'bold 18px monospace'; // Pixelated font
      ctx.strokeStyle = '#000000'; // Black outline
      ctx.lineWidth = 4;
      ctx.strokeText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      ctx.font = 'bold 16px monospace'; // Pixelated font
      ctx.strokeText('Jump over obstacles and collect coins', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
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
      ctx.fillStyle = 'rgba(0, 100, 0, 0.8)'; // Darker green for retro feel
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

    // Draw ground
    drawGround(ctx);

    // Draw enemies (with null check)
    (gameState.enemies || []).forEach(enemy => {
      drawEnemy(ctx, enemy);
    });

    // Draw coins
    (gameState.coins || []).forEach(coin => {
      drawCoin(ctx, coin);
    });

    // Draw hamburger
    drawHamburger(ctx, gameState.hamburgerX, gameState.hamburgerY, gameState.gameStarted && !gameState.gameOver);

    // Draw UI with enhanced visibility
    ctx.textAlign = 'left';
    
    // Score with retro pixelated style
    ctx.font = 'bold 22px monospace'; // Pixelated font
    ctx.strokeStyle = '#000000'; // Black outline
    ctx.lineWidth = 3; // Thicker outline
    ctx.fillStyle = '#FFFFFF'; // White text
    ctx.strokeText(`Score: ${gameState.score}`, 20, 35);
    ctx.fillText(`Score: ${gameState.score}`, 20, 35);
    
    // Distance with retro pixelated style
    ctx.strokeText(`Distance: ${Math.floor(gameState.distance)}m`, 20, 65);
    ctx.fillText(`Distance: ${Math.floor(gameState.distance)}m`, 20, 65);
    
    // Draw pixelated border for retro feel
    ctx.strokeStyle = '#000000'; // Black
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
          className="border-4 border-green-300 rounded-xl shadow-lg cursor-pointer bg-black"
          style={{ 
            imageRendering: 'pixelated',
            boxShadow: '0 0 10px #22c55e, inset 0 0 5px #22c55e'
          }}
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

      {gameState.score > 0 && (
        <div className="flex items-center justify-center space-x-2 text-green-700 mt-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
          <Trophy className="h-5 w-5" />
          <span className="font-bold text-lg">Score: {gameState.score} | Distance: {Math.floor(gameState.distance)}m</span>
        </div>
      )}
    </div>
  );
};

export default HamburgerRunner;