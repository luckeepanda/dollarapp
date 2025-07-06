import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy,
  GamepadIcon,
  Home,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

interface TetrisState {
  board: number[][];
  currentPiece: {
    shape: number[][];
    x: number;
    y: number;
    type: number;
  } | null;
  nextPiece: {
    shape: number[][];
    type: number;
  } | null;
  score: number;
  lines: number;
  level: number;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  dropTime: number;
  lastDrop: number;
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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const holdStartRef = useRef<number>(0);
  
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const CELL_SIZE = 20;
  const CANVAS_WIDTH = BOARD_WIDTH * CELL_SIZE;
  const CANVAS_HEIGHT = BOARD_HEIGHT * CELL_SIZE;

  // Tetris pieces (I, O, T, S, Z, J, L)
  const PIECES = [
    [[[1,1,1,1]]], // I
    [[[1,1],[1,1]]], // O
    [[[0,1,0],[1,1,1]]], // T
    [[[0,1,1],[1,1,0]]], // S
    [[[1,1,0],[0,1,1]]], // Z
    [[[1,0,0],[1,1,1]]], // J
    [[[0,0,1],[1,1,1]]]  // L
  ];

  const COLORS = [
    '#00f0f0', // I - cyan
    '#f0f000', // O - yellow
    '#a000f0', // T - purple
    '#00f000', // S - green
    '#f00000', // Z - red
    '#0000f0', // J - blue
    '#f0a000'  // L - orange
  ];

  const createInitialState = useCallback((): TetrisState => ({
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    gameStarted: false,
    gameOver: false,
    isPaused: false,
    dropTime: 1000,
    lastDrop: 0
  }), []);

  const [gameState, setGameState] = useState<TetrisState>(createInitialState);

  // Reset game when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setGameState(createInitialState());
    }
  }, [resetTrigger, createInitialState]);

  const generatePiece = useCallback(() => {
    const type = Math.floor(Math.random() * PIECES.length);
    return {
      shape: PIECES[type][0],
      type,
    };
  }, []);

  const spawnPiece = useCallback((state: TetrisState) => {
    const piece = state.nextPiece || generatePiece();
    const newPiece = {
      ...piece,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0
    };

    return {
      ...state,
      currentPiece: newPiece,
      nextPiece: generatePiece()
    };
  }, [generatePiece]);

  const isValidPosition = useCallback((board: number[][], piece: any, x: number, y: number) => {
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
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

  const rotatePiece = useCallback((piece: any) => {
    const rotated = piece.shape[0].map((_: any, index: number) =>
      piece.shape.map((row: any) => row[index]).reverse()
    );
    return { ...piece, shape: [rotated] };
  }, []);

  const placePiece = useCallback((state: TetrisState) => {
    if (!state.currentPiece) return state;

    const newBoard = state.board.map(row => [...row]);
    const piece = state.currentPiece;

    // Place piece on board
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          const boardY = piece.y + py;
          const boardX = piece.x + px;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.type + 1;
          }
        }
      }
    }

    // Check for completed lines
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Check the same line again
      }
    }

    // Calculate score
    const linePoints = [0, 40, 100, 300, 1200];
    const newScore = state.score + linePoints[linesCleared] * state.level;
    const newLines = state.lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;

    return {
      ...state,
      board: newBoard,
      currentPiece: null,
      score: newScore,
      lines: newLines,
      level: newLevel,
      dropTime: Math.max(50, 1000 - (newLevel - 1) * 50)
    };
  }, []);

  const movePiece = useCallback((state: TetrisState, dx: number, dy: number) => {
    if (!state.currentPiece) return state;

    const newX = state.currentPiece.x + dx;
    const newY = state.currentPiece.y + dy;

    if (isValidPosition(state.board, state.currentPiece, newX, newY)) {
      return {
        ...state,
        currentPiece: { ...state.currentPiece, x: newX, y: newY }
      };
    }

    // If moving down and can't, place the piece
    if (dy > 0) {
      const placedState = placePiece(state);
      const newState = spawnPiece(placedState);
      
      // Check game over
      if (newState.currentPiece && !isValidPosition(newState.board, newState.currentPiece, newState.currentPiece.x, newState.currentPiece.y)) {
        onGameEnd(newState.score);
        return { ...newState, gameOver: true };
      }
      
      return newState;
    }

    return state;
  }, [isValidPosition, placePiece, spawnPiece, onGameEnd]);

  const rotatePieceInGame = useCallback((state: TetrisState) => {
    if (!state.currentPiece) return state;

    const rotated = rotatePiece(state.currentPiece);
    if (isValidPosition(state.board, rotated, state.currentPiece.x, state.currentPiece.y)) {
      return {
        ...state,
        currentPiece: rotated
      };
    }

    return state;
  }, [rotatePiece, isValidPosition]);

  const startGame = useCallback(() => {
    const newState = {
      ...createInitialState(),
      gameStarted: true,
      gameOver: false,
      isPaused: false
    };
    setGameState(spawnPiece(newState));
  }, [createInitialState, spawnPiece]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Touch controls
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    holdStartRef.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (!touchStartRef.current || !gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const holdTime = Date.now() - holdStartRef.current;

    // If held for less than 200ms, it's a tap (rotate)
    if (holdTime < 200 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
      setGameState(prev => rotatePieceInGame(prev));
    }
    // If held longer, it's a directional move
    else if (holdTime >= 200) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal movement
        const direction = deltaX > 0 ? 1 : -1;
        setGameState(prev => movePiece(prev, direction, 0));
      } else if (deltaY > 30) {
        // Downward movement
        setGameState(prev => movePiece(prev, 0, 1));
      }
    }

    touchStartRef.current = null;
  }, [gameState.gameStarted, gameState.gameOver, gameState.isPaused, rotatePieceInGame, movePiece]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameActive || !gameState.gameStarted || gameState.gameOver || gameState.isPaused) {
      return;
    }

    if (currentTime - gameState.lastDrop > gameState.dropTime) {
      setGameState(prev => ({
        ...movePiece(prev, 0, 1),
        lastDrop: currentTime
      }));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, gameState.gameStarted, gameState.gameOver, gameState.isPaused, gameState.lastDrop, gameState.dropTime, movePiece]);

  // Start game loop
  useEffect(() => {
    if (gameActive && gameState.gameStarted && !gameState.gameOver && !gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, gameLoop, gameState.gameStarted, gameState.gameOver, gameState.isPaused]);

  // Touch event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameState.gameStarted) {
      // Draw start screen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Noodle Tetris', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      
      ctx.font = '12px Arial';
      ctx.fillText('Tap to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.fillText('Hold & drag to move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
      ctx.fillText('Quick tap to rotate', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      return;
    }

    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      ctx.font = '12px Arial';
      ctx.fillText(`Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
      return;
    }

    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }

    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (gameState.board[y][x]) {
          ctx.fillStyle = COLORS[gameState.board[y][x] - 1];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#fff';
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw current piece
    if (gameState.currentPiece) {
      ctx.fillStyle = COLORS[gameState.currentPiece.type];
      for (let py = 0; py < gameState.currentPiece.shape.length; py++) {
        for (let px = 0; px < gameState.currentPiece.shape[py].length; px++) {
          if (gameState.currentPiece.shape[py][px]) {
            const x = (gameState.currentPiece.x + px) * CELL_SIZE;
            const y = (gameState.currentPiece.y + py) * CELL_SIZE;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE);
      ctx.stroke();
    }

  }, [gameState]);

  const handleCanvasClick = () => {
    if (!gameState.gameStarted && !gameState.gameOver) {
      startGame();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-purple-200 rounded-xl shadow-lg cursor-pointer bg-black"
          onClick={handleCanvasClick}
          style={{ touchAction: 'none' }}
        />
        
        {/* Game controls overlay */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {gameState.gameStarted && !gameState.gameOver && (
            <button
              onClick={togglePause}
              className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-all border border-purple-200"
            >
              {gameState.isPaused ? (
                <span className="text-purple-700 text-xs font-bold">▶</span>
              ) : (
                <span className="text-purple-700 text-xs font-bold">⏸</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-md border border-purple-200">
        <div className="flex items-center space-x-6 text-purple-800">
          <div className="text-center">
            <div className="text-xs text-purple-600">Score</div>
            <div className="text-lg font-bold">{gameState.score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-purple-600">Lines</div>
            <div className="text-lg font-bold">{gameState.lines}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-purple-600">Level</div>
            <div className="text-lg font-bold">{gameState.level}</div>
          </div>
        </div>
      </div>

      {/* Mobile Controls Info */}
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 max-w-xs">
        <h4 className="font-semibold text-purple-800 mb-2 text-center">🍜 Mobile Controls</h4>
        <div className="text-sm text-purple-700 space-y-1">
          <div>• <strong>Quick tap:</strong> Rotate piece</div>
          <div>• <strong>Hold & drag:</strong> Move left/right/down</div>
          <div>• <strong>Tap to start:</strong> Begin game</div>
        </div>
      </div>
    </div>
  );
};

const NoodleTetrisGame: React.FC = () => {
  const [gameActive, setGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleGameEnd = useCallback((score: number) => {
    console.log('NoodleTetris: Game ended with score:', score);
    setFinalScore(score);
    setGameActive(false);
  }, []);

  const restartGame = useCallback(() => {
    console.log('NoodleTetris: Restarting game');
    
    setFinalScore(null);
    setGameActive(false);
    
    setGameKey(prev => prev + 1);
    setResetTrigger(prev => prev + 1);
    
    setTimeout(() => {
      setGameActive(true);
    }, 100);
  }, []);

  const goBackToFreePlay = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBackToFreePlay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-lg">
                  <GamepadIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Noodle Tetris
                </span>
              </div>
            </div>
            
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Container */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 relative">
          <NoodleTetris 
            key={gameKey}
            onGameEnd={handleGameEnd} 
            gameActive={gameActive}
            resetTrigger={resetTrigger}
          />
          
          {/* Game Over Overlay */}
          {finalScore !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-purple-200 pointer-events-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-purple-800 mb-2">
                    🍜 Noodle-icious! 🍜
                  </h3>
                  <p className="text-lg text-purple-700 mb-4">
                    You scored <span className="font-bold text-2xl">{finalScore}</span> points!
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={restartGame}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Play Again</span>
                    </button>
                    <button
                      onClick={goBackToFreePlay}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg"
                    >
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

export default NoodleTetrisGame;