import React, { useRef, useEffect, useState } from 'react';

interface FoodBlasterProps {
  onGameEnd: (score: number) => void;
  gameActive: boolean;
  resetTrigger: number;
}

const FoodBlaster: React.FC<FoodBlasterProps> = ({ onGameEnd, gameActive, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    playerX: 200,
    playerY: 540,
    enemies: [] as Array<{ x: number; y: number; type: number; alive: boolean }>,
    playerBullets: [] as Array<{ x: number; y: number }>,
    enemyBullets: [] as Array<{ x: number; y: number }>,
    score: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    isPaused: false,
    wave: 1,
    enemyDirection: 1,
    enemySpeed: 1,
    isMovingLeft: false,
    isMovingRight: false
  });
  const animationRef = useRef<number>();
  const touchStartXRef = useRef<number>(0);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Reset game
  useEffect(() => {
    stateRef.current = {
      playerX: 200,
      playerY: 540,
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
      enemySpeed: 1,
      isMovingLeft: false,
      isMovingRight: false
    };
  }, [resetTrigger]);

  // Setup canvas and events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    // Prevent default behaviors
    const preventDefault = (e: Event) => e.preventDefault();
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
    document.body.addEventListener('touchstart', preventDefault, { passive: false });

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (!stateRef.current.gameStarted && !stateRef.current.gameOver) {
        startGame();
        return;
      }
      if (stateRef.current.gameOver || stateRef.current.isPaused) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      touchStartXRef.current = touch.clientX - rect.left;

      // Tap to shoot
      if (stateRef.current.playerBullets.length < 3) {
        stateRef.current.playerBullets.push({ x: stateRef.current.playerX, y: stateRef.current.playerY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!stateRef.current.gameStarted || stateRef.current.gameOver || stateRef.current.isPaused) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const currentX = touch.clientX - rect.left;
      const deltaX = currentX - touchStartXRef.current;

      // Hold and swipe for direction
      stateRef.current.isMovingLeft = deltaX < 0;
      stateRef.current.isMovingRight = deltaX > 0;

      // Update touch start for continuous hold
      if (Math.abs(deltaX) > 5) {
        touchStartXRef.current = currentX;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      stateRef.current.isMovingLeft = false;
      stateRef.current.isMovingRight = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (!stateRef.current.gameStarted && !stateRef.current.gameOver) {
          startGame();
          return;
        }
        if (stateRef.current.gameOver || stateRef.current.isPaused) return;
        if (stateRef.current.playerBullets.length < 3) {
          stateRef.current.playerBullets.push({ x: stateRef.current.playerX, y: stateRef.current.playerY });
        }
      }
      if (e.key === 'ArrowLeft') stateRef.current.isMovingLeft = true;
      if (e.key === 'ArrowRight') stateRef.current.isMovingRight = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') stateRef.current.isMovingLeft = false;
      if (e.key === 'ArrowRight') stateRef.current.isMovingRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    const gameLoop = (time: number) => {
      if (!gameActive || !stateRef.current.gameStarted || stateRef.current.gameOver || stateRef.current.isPaused) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Update
      const moveSpeed = 4;
      if (stateRef.current.isMovingLeft && stateRef.current.playerX > 15) {
        stateRef.current.playerX -= moveSpeed;
      }
      if (stateRef.current.isMovingRight && stateRef.current.playerX < 385) {
        stateRef.current.playerX += moveSpeed;
      }

      // Move player bullets
      stateRef.current.playerBullets = stateRef.current.playerBullets
        .map(b => ({ ...b, y: b.y - 8 }))
        .filter(b => b.y > 0);

      // Move enemy bullets
      stateRef.current.enemyBullets = stateRef.current.enemyBullets
        .map(b => ({ ...b, y: b.y + 6 }))
        .filter(b => b.y < 600);

      // Move enemies
      let shouldMoveDown = false;
      const aliveEnemies = stateRef.current.enemies.filter(e => e.alive);

      if (aliveEnemies.length > 0) {
        const leftmost = Math.min(...aliveEnemies.map(e => e.x));
        const rightmost = Math.max(...aliveEnemies.map(e => e.x));

        if (rightmost >= 385 || leftmost <= 15) {
          shouldMoveDown = true;
          stateRef.current.enemyDirection *= -1;
          stateRef.current.enemySpeed = Math.min(stateRef.current.enemySpeed + 0.2, 3);
        }
      }

      stateRef.current.enemies = stateRef.current.enemies.map(e => {
        if (!e.alive) return e;
        if (shouldMoveDown) {
          return { ...e, y: e.y + 20 };
        }
        return { ...e, x: e.x + stateRef.current.enemyDirection * stateRef.current.enemySpeed };
      });

      // Collisions player bullets vs enemies
      stateRef.current.playerBullets = stateRef.current.playerBullets.filter(pb => {
        for (let i = 0; i < stateRef.current.enemies.length; i++) {
          const e = stateRef.current.enemies[i];
          if (e.alive && Math.abs(pb.x - e.x) < 15 && Math.abs(pb.y - e.y) < 15) {
            stateRef.current.enemies[i].alive = false;
            stateRef.current.score += (e.type + 1) * 10;
            return false;
          }
        }
        return true;
      });

      // Collisions enemy bullets vs player
      stateRef.current.enemyBullets = stateRef.current.enemyBullets.filter(eb => {
        if (Math.abs(eb.x - stateRef.current.playerX) < 15 && Math.abs(eb.y - stateRef.current.playerY) < 15) {
          stateRef.current.lives -= 1;
          if (stateRef.current.lives <= 0) {
            stateRef.current.gameOver = true;
            onGameEnd(stateRef.current.score);
          }
          return false;
        }
        return true;
      });

      // Enemy shooting
      if (Math.random() < 0.008 * aliveEnemies.length / 40) {
        const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        if (shooter) {
          stateRef.current.enemyBullets.push({ x: shooter.x, y: shooter.y + 15 });
        }
      }

      // Check win/next wave
      if (aliveEnemies.length === 0) {
        stateRef.current.wave += 1;
        stateRef.current.enemies = [];
        const rows = Math.min(5 + Math.floor(stateRef.current.wave / 3), 8);
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < 8; col++) {
            stateRef.current.enemies.push({
              x: 50 + col * 40,
              y: 50 + row * 35,
              type: row % 3,
              alive: true
            });
          }
        }
        stateRef.current.enemyDirection = 1;
        stateRef.current.enemySpeed = 1 + (stateRef.current.wave - 1) * 0.3;
      }

      // Check enemies reach bottom
      if (aliveEnemies.some(e => e.y > 500) || stateRef.current.lives <= 0) {
        stateRef.current.gameOver = true;
        onGameEnd(stateRef.current.score);
      }

      // Draw
      ctx.clearRect(0, 0, 400, 600);
      ctx.fillStyle = '#000011';
      ctx.fillRect(0, 0, 400, 600);

      // Player
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.moveTo(stateRef.current.playerX, stateRef.current.playerY - 15);
      ctx.lineTo(stateRef.current.playerX - 15, stateRef.current.playerY + 15);
      ctx.lineTo(stateRef.current.playerX + 15, stateRef.current.playerY + 15);
      ctx.fill();

      // Enemies
      const foodEmojis = ['🍔', '🌮', '🍕'];
      ctx.font = '24px Arial';
      stateRef.current.enemies.forEach(e => {
        if (e.alive) ctx.fillText(foodEmojis[e.type], e.x - 12, e.y + 6);
      });

      // Player bullets
      ctx.fillStyle = '#FFFF00';
      stateRef.current.playerBullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 8));

      // Enemy bullets
      ctx.fillStyle = '#FF0000';
      stateRef.current.enemyBullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 8));

      // UI
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`Score: ${stateRef.current.score}`, 10, 25);
      ctx.fillText(`Lives: ${stateRef.current.lives}`, 10, 45);
      ctx.fillText(`Wave: ${stateRef.current.wave}`, 320, 25);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameActive) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      document.body.removeEventListener('touchmove', preventDefault);
      document.body.removeEventListener('touchstart', preventDefault);
    };
  }, [gameActive, onGameEnd]);

  const startGame = () => {
    const enemies = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        enemies.push({
          x: 50 + col * 40,
          y: 50 + row * 35,
          type: row % 3,
          alive: true
        });
      }
    }
    stateRef.current.enemies = enemies;
    stateRef.current.gameStarted = true;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-purple-400 rounded-xl shadow-lg bg-black"
        style={{ 
          touchAction: 'none',
          userSelect: 'none'
        }}
      />
      
      {stateRef.current.score > 0 && (
        <div className="flex items-center justify-center space-x-2 text-purple-300 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30">
          <span className="font-bold text-lg">
            Score: {stateRef.current.score} | Lives: {stateRef.current.lives} | Wave: {stateRef.current.wave}
          </span>
        </div>
      )}
    </div>
  );
};

export default FoodBlaster;
