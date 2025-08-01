import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const FoodBlaster: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas sizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.9; // 90% of viewport width
      canvas.height = Math.min(window.innerHeight * 0.8, 600); // Cap height
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let width = canvas.width;
    let height = canvas.height;

    // Player spaceship
    let playerX = width / 2;
    const playerY = height - 50;
    const playerWidth = 50;
    const playerHeight = 30;
    const playerSpeed = 5;

    // Projectiles
    const playerProjectiles: { x: number; y: number }[] = [];
    const enemyProjectiles: { x: number; y: number }[] = [];
    const projectileSpeed = 7;

    // Enemies (food items)
    const enemyRows = 4;
    const enemyCols = 10;
    const enemyWidth = 40;
    const enemyHeight = 30;
    const enemyPadding = 10;
    let enemyDirection = 1;
    let enemyX = 0;
    let enemyY = 50;
    const enemySpeed = 1;
    const enemies: boolean[][] = Array.from({ length: enemyRows }, () => Array(enemyCols).fill(true));

    // Food types for variety
    const foodTypes = ['🍔', '🌮', '🍕', '🍟', '🍦'];

    // Touch controls state
    let isMovingLeft = false;
    let isMovingRight = false;
    let touchStartX = 0;

    let animationFrameId: number;

    const drawPlayer = () => {
      ctx.fillStyle = '#00FF00'; // Green spaceship
      ctx.beginPath();
      ctx.moveTo(playerX - playerWidth / 2, playerY);
      ctx.lineTo(playerX + playerWidth / 2, playerY);
      ctx.lineTo(playerX, playerY - playerHeight);
      ctx.closePath();
      ctx.fill();
    };

    const drawEnemies = () => {
      for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
          if (enemies[row][col]) {
            const x = enemyX + col * (enemyWidth + enemyPadding);
            const y = enemyY + row * (enemyHeight + enemyPadding);
            ctx.font = '30px Arial';
            ctx.fillText(foodTypes[row % foodTypes.length], x, y + enemyHeight / 2);
          }
        }
      }
    };

    const drawProjectiles = () => {
      ctx.fillStyle = '#FFFF00'; // Yellow for player shots
      playerProjectiles.forEach(p => {
        ctx.fillRect(p.x - 2, p.y, 4, 10);
      });

      ctx.fillStyle = '#FF0000'; // Red for enemy shots
      enemyProjectiles.forEach(p => {
        ctx.fillRect(p.x - 2, p.y, 4, 10);
      });
    };

    const updateProjectiles = () => {
      playerProjectiles.forEach((p, i) => {
        p.y -= projectileSpeed;
        if (p.y < 0) playerProjectiles.splice(i, 1);
      });

      enemyProjectiles.forEach((p, i) => {
        p.y += projectileSpeed;
        if (p.y > height) enemyProjectiles.splice(i, 1);
      });
    };

    const detectCollisions = () => {
      playerProjectiles.forEach((pp, pi) => {
        for (let row = 0; row < enemyRows; row++) {
          for (let col = 0; col < enemyCols; col++) {
            if (enemies[row][col]) {
              const ex = enemyX + col * (enemyWidth + enemyPadding);
              const ey = enemyY + row * (enemyHeight + enemyPadding);
              if (pp.x > ex && pp.x < ex + enemyWidth && pp.y > ey && pp.y < ey + enemyHeight) {
                enemies[row][col] = false;
                playerProjectiles.splice(pi, 1);
                setScore(prev => prev + 10);
                return;
              }
            }
          }
        }
      });

      enemyProjectiles.forEach((ep, ei) => {
        if (ep.x > playerX - playerWidth / 2 && ep.x < playerX + playerWidth / 2 && ep.y > playerY - playerHeight && ep.y < playerY) {
          enemyProjectiles.splice(ei, 1);
          setLives(prev => prev - 1);
          if (lives - 1 <= 0) setGameOver(true);
        }
      });
    };

    const updateEnemies = () => {
      enemyX += enemySpeed * enemyDirection;

      const rightmost = enemyX + (enemyCols - 1) * (enemyWidth + enemyPadding) + enemyWidth;
      if (rightmost > width || enemyX < 0) {
        enemyDirection *= -1;
        enemyY += enemyHeight / 2;
      }

      if (Math.random() < 0.01) {
        const activeEnemies = [];
        for (let row = 0; row < enemyRows; row++) {
          for (let col = 0; col < enemyCols; col++) {
            if (enemies[row][col]) activeEnemies.push({ row, col });
          }
        }
        if (activeEnemies.length > 0) {
          const randomEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
          const ex = enemyX + randomEnemy.col * (enemyWidth + enemyPadding) + enemyWidth / 2;
          const ey = enemyY + randomEnemy.row * (enemyHeight + enemyPadding) + enemyHeight;
          enemyProjectiles.push({ x: ex, y: ey });
        }
      }

      if (enemyY + enemyRows * (enemyHeight + enemyPadding) > playerY) {
        setGameOver(true);
      }
    };

    const updatePlayerMovement = () => {
      if (isMovingLeft && playerX - playerWidth / 2 > 0) playerX -= playerSpeed;
      if (isMovingRight && playerX + playerWidth / 2 < width) playerX += playerSpeed;
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, width, height);

      drawPlayer();
      drawEnemies();
      drawProjectiles();

      updateProjectiles();
      updateEnemies();
      detectCollisions();
      updatePlayerMovement();

      const remainingEnemies = enemies.flat().filter(e => e).length;
      if (remainingEnemies === 0) {
        setGameOver(true);
      }

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    // Keyboard controls (for desktop)
    const keys = new Set<string>();
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key);
      if (e.key === ' ' && playerProjectiles.length < 3) {
        playerProjectiles.push({ x: playerX, y: playerY - playerHeight });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const keyboardInterval = setInterval(() => {
      isMovingLeft = keys.has('ArrowLeft');
      isMovingRight = keys.has('ArrowRight');
    }, 16);

    // Touch controls (for mobile)
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touchStartX = e.touches[0].clientX;
      // Tap to shoot (if not too much movement)
      if (playerProjectiles.length < 3) {
        playerProjectiles.push({ x: playerX, y: playerY - playerHeight });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 0) return;
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartX;

      // Hold and move direction
      if (Math.abs(deltaX) > 10) { // Threshold to detect swipe/hold direction
        isMovingLeft = deltaX < 0;
        isMovingRight = deltaX > 0;
      } else {
        isMovingLeft = false;
        isMovingRight = false;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isMovingLeft = false;
      isMovingRight = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(keyboardInterval);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameOver, lives]);

  const restartGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Food Blaster
                </span>
              </div>
            </div>
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 relative">
          <canvas ref={canvasRef} className="w-full bg-black"></canvas>
          
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-orange-200 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-orange-800 mb-2">
                    {lives <= 0 ? 'Game Over!' : 'You Win!'}
                  </h3>
                  <p className="text-lg text-orange-700 mb-4">
                    Score: <span className="font-bold text-2xl">{score}</span>
                  </p>
                  <div className="flex space-x-3">
                    <button onClick={restartGame} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg">
                      Play Again
                    </button>
                    <button onClick={goBack} className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg">
                      Back to Games
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodBlaster;
