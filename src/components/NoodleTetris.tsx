import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, Pause } from 'lucide-react';

interface GameState {
  board: number[][];
  currentPiece: {
    shape: number[][];
    x: number;
    y: number;
    color: number;
  } | null;
  nextPiece: {
    shape: number[][];
    color: number;
  } | null;
  score: number;
  lines: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  dropTime: number;
}

interface NoodleTetrisProps {
  onGameEnd: (score: number) => void;
  gameActive: boolean;
  resetTrigger: number;
}

const NoodleTetris: React.FC<NoodleTetrisProps> = ({ onGameEnd, gameActive, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const dropTimeRef = useRef<number>(0);
  const eventListenersAttachedRef = useRef<boolean>(false);
  
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const CELL_SIZE = 30;
  const BOARD_X = (CANVAS_WIDTH - BOARD_WIDTH * CELL_SIZE) / 2;
  const BOARD_Y = 50;
  
  // Noodle-themed colors (different types of noodles)
  const NOODLE_COLORS = [
    '#8B4513', // Brown (Soba noodles)
    '#FFD700', // Gold (Egg noodles)
    '#FF6347', // Red (Spicy ramen)
    '#32CD32', // Green (Spinach noodles)
    '#FF69B4', // Pink (Beet noodles)
    '#87CEEB', // Blue (Butterfly pea noodles)
    '#DDA0DD'  // Purple (Purple sweet potato noodles)
  ];

  // Tetris pieces (tetrominoes) - representing different noodle shapes
  const PIECES = [
    // I-piece (Long straight noodle)
    [[[1, 1, 1, 1]]],
    // O-piece (Noodle nest)
    [[[1, 1], [1, 1]]],
    // T-piece (Ramen fork)
    [[[0, 1, 0], [1, 1, 1]]],
    // S-piece (Curved noodle)
    [[[0, 1, 1], [1, 1, 0]]],
    // Z-piece (Zigzag noodle)
    [[[1, 1, 0], [0, 1, 1]]],
    // J-piece (Hook noodle)
    [[[1, 0, 0], [1, 1, 1]]],
    // L-piece (Ladle noodle)
    [[[0, 0, 1], [1, 1, 1]]]
  ];

  console.log('NoodleTetris: Component rendered/remounted with props:', {
    gameActive,
    resetTrigger,
    timestamp: Date.now()
  });

  // Initial game state factory
  const createInitialGameState = useCallback((): GameState => {
    const initialState = {
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
      currentPiece: null,
      nextPiece: null,
      score: 0,
      lines: 0,
      level: 1,
      gameStarted: false,
      gameOver: false,
      isPaused: false,
      dropTime: 300 // Start fast - 300ms drop time
    };
    console.log('NoodleTetris: Created fresh initial game state:', initialState);
    return initialState;
  }, []);

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  // Debug logging for state changes
  useEffect(() => {
    console.log('NoodleTetris: Game state changed:', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      isPaused: gameState.isPaused,
      score: gameState.score,
      lines: gameState.lines,
      level: gameState.level
    });
  }, [gameState]);

  // Generate random piece
  const generatePiece = useCallback(() => {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    const colorIndex = Math.floor(Math.random() * NOODLE_COLORS.length) + 1;
    return {
      shape: PIECES[pieceIndex][0],
      color: colorIndex
    };
  }, []);

  // Comprehensive cleanup function
  const cleanupGame = useCallback(() => {
    console.log('NoodleTetris: Performing comprehensive cleanup');
    
    if (gameLoopRef.current) {
      console.log('NoodleTetris: Cancelling animation frame:', gameLoopRef.current);
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = undefined;
    }
    
    lastTimeRef.current = 0;
    dropTimeRef.current = 0;
    
    if (eventListenersAttachedRef.current) {
      console.log('NoodleTetris: Removing event listeners');
      window.removeEventListener('keydown', handleKeyPress);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
      eventListenersAttachedRef.current = false;
    }
  }, []);

  // Reset game function
  const resetGame = useCallback(() => {
    console.log('NoodleTetris: resetGame called - performing full reset');
    
    cleanupGame();
    const newState = createInitialGameState();
    console.log('NoodleTetris: Setting fresh initial state:', newState);
    setGameState(newState);
  }, [cleanupGame, createInitialGameState]);

  // Start game function
  const startGame = useCallback(() => {
    console.log('NoodleTetris: startGame called - initializing fresh game');
    
    const firstPiece = generatePiece();
    const secondPiece = generatePiece();
    
    const newState = {
      ...createInitialGameState(),
      gameStarted: true,
      gameOver: false,
      isPaused: false,
      currentPiece: {
        ...firstPiece,
        x: Math.floor(BOARD_WIDTH / 2) - 1,
        y: 0
      },
      nextPiece: secondPiece
    };
    
    console.log('NoodleTetris: Starting game with fresh state:', newState);
    setGameState(newState);
  }, [createInitialGameState, generatePiece]);

  // Handle reset trigger from parent component
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log('NoodleTetris: Reset trigger received:', resetTrigger);
      resetGame();
    }
  }, [resetTrigger, resetGame]);

  // Toggle pause function
  const togglePause = useCallback(() => {
    console.log('NoodleTetris: Toggling pause state');
    setGameState(prev => {
      const newPauseState = !prev.isPaused;
      console.log('NoodleTetris: Pause state changed to:', newPauseState);
      return {
        ...prev,
        isPaused: newPauseState
      };
    });
  }, []);

  // Check if piece can be placed at position
  const canPlacePiece = useCallback((board: number[][], piece: number[][], x: number, y: number) => {
    for (let py = 0; py < piece.length; py++) {
      for (let px = 0; px < piece[py].length; px++) {
        if (piece[py][px]) {
          const newX = x + px;
          const newY = y + py;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  // Place piece on board
  const placePiece = useCallback((board: number[][], piece: any, x: number, y: number) => {
    const newBoard = board.map(row => [...row]);
    
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px] && y + py >= 0) {
          newBoard[y + py][x + px] = piece.color;
        }
      }
    }
    
    return newBoard;
  }, []);

  // Clear completed lines
  const clearLines = useCallback((board: number[][]) => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    // Add empty rows at the top
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, linesCleared };
  }, []);

  // Rotate piece
  const rotatePiece = useCallback((piece: number[][]) => {
    const rotated = piece[0].map((_, index) =>
      piece.map(row => row[index]).reverse()
    );
    return rotated;
  }, []);

  // Move piece
  const movePiece = useCallback((direction: 'left' | 'right' | 'down' | 'rotate') => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused || !gameState.currentPiece) {
      return;
    }

    setGameState(prev => {
      if (!prev.currentPiece) return prev;

      let newX = prev.currentPiece.x;
      let newY = prev.currentPiece.y;
      let newShape = prev.currentPiece.shape;

      switch (direction) {
        case 'left':
          newX -= 1;
          break;
        case 'right':
          newX += 1;
          break;
        case 'down':
          newY += 1;
          break;
        case 'rotate':
          newShape = rotatePiece(prev.currentPiece.shape);
          break;
      }

      // Check if move is valid
      if (canPlacePiece(prev.board, newShape, newX, newY)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            x: newX,
            y: newY,
            shape: newShape
          }
        };
      }

      // If moving down failed, place the piece
      if (direction === 'down') {
        const newBoard = placePiece(prev.board, prev.currentPiece, prev.currentPiece.x, prev.currentPiece.y);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        
        // Calculate score (faster game = higher multiplier)
        const lineScore = linesCleared * 100 * prev.level;
        const newScore = prev.score + lineScore;
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        
        // Increase speed significantly with each level (very fast game)
        const newDropTime = Math.max(50, 300 - (newLevel - 1) * 30);

        // Generate next piece
        const nextPiece = generatePiece();
        const newCurrentPiece = {
          ...prev.nextPiece!,
          x: Math.floor(BOARD_WIDTH / 2) - 1,
          y: 0
        };

        // Check game over
        if (!canPlacePiece(clearedBoard, newCurrentPiece.shape, newCurrentPiece.x, newCurrentPiece.y)) {
          console.log('NoodleTetris: Game over - calling onGameEnd with score:', newScore);
          onGameEnd(newScore);
          return {
            ...prev,
            gameOver: true,
            board: clearedBoard
          };
        }

        return {
          ...prev,
          board: clearedBoard,
          currentPiece: newCurrentPiece,
          nextPiece: nextPiece,
          score: newScore,
          lines: newLines,
          level: newLevel,
          dropTime: newDropTime
        };
      }

      return prev;
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, canPlacePiece, placePiece, clearLines, rotatePiece, generatePiece, onGameEnd]);

  // Event handler functions
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!gameState.gameStarted && !gameState.gameOver) {
        startGame();
      } else if (!gameState.gameOver) {
        movePiece('rotate');
      }
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      movePiece('left');
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      movePiece('right');
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      movePiece('down');
    }
  }, [gameState.gameStarted, gameState.gameOver, startGame, movePiece]);

  const handleCanvasClick = useCallback(() => {
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
    }
  }, [gameState.gameStarted, gameState.gameOver, startGame]);

  // Drawing functions
  const drawCell = (ctx: CanvasRenderingContext2D, x: number, y: number, color: number) => {
    if (color === 0) return;
    
    const cellX = BOARD_X + x * CELL_SIZE;
    const cellY = BOARD_Y + y * CELL_SIZE;
    
    // Draw noodle cell with gradient
    const gradient = ctx.createLinearGradient(cellX, cellY, cellX + CELL_SIZE, cellY + CELL_SIZE);
    gradient.addColorStop(0, NOODLE_COLORS[color - 1]);
    gradient.addColorStop(1, NOODLE_COLORS[color - 1] + '80');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(cellX, cellY, CELL_SIZE - 1, CELL_SIZE - 1);
    
    // Add noodle texture
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(cellX, cellY, CELL_SIZE - 1, CELL_SIZE - 1);
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 6, 3);
  };

  const drawBoard = (ctx: CanvasRenderingContext2D) => {
    // Draw board background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(BOARD_X - 2, BOARD_Y - 2, BOARD_WIDTH * CELL_SIZE + 4, BOARD_HEIGHT * CELL_SIZE + 4);
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X + x * CELL_SIZE, BOARD_Y);
      ctx.lineTo(BOARD_X + x * CELL_SIZE, BOARD_Y + BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X, BOARD_Y + y * CELL_SIZE);
      ctx.lineTo(BOARD_X + BOARD_WIDTH * CELL_SIZE, BOARD_Y + y * CELL_SIZE);
      ctx.stroke();
    }
  };

  const drawPiece = (ctx: CanvasRenderingContext2D, piece: any, offsetX: number, offsetY: number) => {
    if (!piece) return;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          drawCell(ctx, offsetX + x, offsetY + y, piece.color);
        }
      }
    }
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

    // Handle piece dropping
    dropTimeRef.current += deltaTime;
    if (dropTimeRef.current >= gameState.dropTime) {
      dropTimeRef.current = 0;
      movePiece('down');
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, gameState.gameStarted, gameState.gameOver, gameState.isPaused, gameState.dropTime, movePiece]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with noodle-themed background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(139, 69, 19, 0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🍜 Noodle Tetris 🍜', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      
      ctx.font = '16px Arial';
      ctx.fillText('Click or press SPACE to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText('Arrow keys to move, SPACE to rotate', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      ctx.fillText('Fast-paced noodle stacking!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      return;
    }

    if (gameState.gameOver) {
      // Draw game over screen
      return;
    }

    if (gameState.isPaused) {
      // Draw pause overlay
      ctx.fillStyle = 'rgba(139, 69, 19, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    // Draw game board
    drawBoard(ctx);

    // Draw placed pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (gameState.board[y][x]) {
          drawCell(ctx, x, y, gameState.board[y][x]);
        }
      }
    }

    // Draw current piece
    if (gameState.currentPiece) {
      drawPiece(ctx, gameState.currentPiece, gameState.currentPiece.x, gameState.currentPiece.y);
    }

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    
    // Score
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    ctx.fillText(`Lines: ${gameState.lines}`, 20, 50);
    ctx.fillText(`Level: ${gameState.level}`, 20, 70);
    
    // Next piece preview
    ctx.fillText('Next:', 320, 30);
    if (gameState.nextPiece) {
      const previewX = 320;
      const previewY = 40;
      
      for (let y = 0; y < gameState.nextPiece.shape.length; y++) {
        for (let x = 0; x < gameState.nextPiece.shape[y].length; x++) {
          if (gameState.nextPiece.shape[y][x]) {
            const cellX = previewX + x * 15;
            const cellY = previewY + y * 15;
            
            ctx.fillStyle = NOODLE_COLORS[gameState.nextPiece.color - 1];
            ctx.fillRect(cellX, cellY, 14, 14);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(cellX, cellY, 14, 14);
          }
        }
      }
    }

  }, [gameState]);

  // Start game loop
  useEffect(() => {
    if (gameActive && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      console.log('NoodleTetris: Starting game loop');
      lastTimeRef.current = performance.now();
      dropTimeRef.current = 0;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('NoodleTetris: Cleaning up game loop in useEffect');
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, gameLoop, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Event listeners management
  useEffect(() => {
    if (!eventListenersAttachedRef.current) {
      console.log('NoodleTetris: Attaching event listeners');
      
      window.addEventListener('keydown', handleKeyPress);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
      }
      
      eventListenersAttachedRef.current = true;
    }

    return () => {
      console.log('NoodleTetris: Cleaning up event listeners');
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
    console.log('NoodleTetris: Component mounted, setting up cleanup');
    
    return () => {
      console.log('NoodleTetris: Component unmounting - performing final cleanup');
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
          className="border-4 border-amber-200 rounded-xl shadow-lg cursor-pointer bg-gradient-to-b from-amber-100 to-amber-200"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Game controls overlay - pause button */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-all border border-amber-200"
            >
              {gameState.isPaused ? (
                <Play className="h-4 w-4 text-amber-700" />
              ) : (
                <Pause className="h-4 w-4 text-amber-700" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Animated Prize Message */}
      <div className="text-center max-w-md">
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl shadow-lg">
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
          
          {/* Main text */}
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Trophy className="h-6 w-6 text-yellow-200 animate-bounce" />
              <span className="text-xl font-bold tracking-wide">100 POINTS</span>
              <Trophy className="h-6 w-6 text-yellow-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="text-lg font-semibold">
              Gets Free Food Prize! 🍕🍔🌮
            </div>
          </div>
          
          {/* Pulsing border effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-yellow-300 animate-pulse"></div>
        </div>
        
        {gameState.score > 0 && (
          <div className="flex items-center justify-center space-x-2 text-amber-600 mt-3">
            <Trophy className="h-4 w-4" />
            <span className="font-semibold">Score: {gameState.score} | Lines: {gameState.lines} | Level: {gameState.level}</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md">
        <p className="text-sm text-amber-700 mb-2">
          🍜 Stack noodle pieces to clear lines! Use arrow keys to move, SPACE to rotate.
        </p>
        <p className="text-xs text-amber-600">
          ⚡ Super fast-paced gameplay - speed increases every 10 lines!
        </p>
      </div>
    </div>
  );
};

export default NoodleTetris;