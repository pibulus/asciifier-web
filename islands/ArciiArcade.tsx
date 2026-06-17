import { useEffect, useRef, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";

// ===================================================================
// ARCII ARCADE - Retro ASCII Games (Snake & Game of Life)
// ===================================================================

type GameType = "snake" | "life" | "tetris";

// Conway's Game of Life Preset patterns
const PRESETS = {
  clear: { name: "🧹 Clear", grid: [] as [number, number][] },
  glider: {
    name: "🚀 Glider",
    grid: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  },
  pulsar: {
    name: "💥 Pulsar",
    grid: [
      // Top left
      [2, 4],
      [2, 5],
      [2, 6],
      [2, 10],
      [2, 11],
      [2, 12],
      [4, 2],
      [4, 7],
      [4, 9],
      [4, 14],
      [5, 2],
      [5, 7],
      [5, 9],
      [5, 14],
      [6, 2],
      [6, 7],
      [6, 9],
      [6, 14],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 10],
      [7, 11],
      [7, 12],
      // Bottom left (symmetrical)
      [9, 4],
      [9, 5],
      [9, 6],
      [9, 10],
      [9, 11],
      [9, 12],
      [10, 2],
      [10, 7],
      [10, 9],
      [10, 14],
      [11, 2],
      [11, 7],
      [11, 9],
      [11, 14],
      [12, 2],
      [12, 7],
      [12, 9],
      [12, 14],
      [14, 4],
      [14, 5],
      [14, 6],
      [14, 10],
      [14, 11],
      [14, 12],
    ],
  },
  beacon: {
    name: "📟 Beacon",
    grid: [[1, 1], [1, 2], [2, 1], [2, 2], [3, 3], [3, 4], [4, 3], [4, 4]],
  },
  gosper: {
    name: "🔫 Gosper Gun",
    grid: [
      [5, 1],
      [5, 2],
      [6, 1],
      [6, 2], // Left block
      [5, 11],
      [6, 11],
      [7, 11],
      [4, 12],
      [8, 12],
      [3, 13],
      [9, 13],
      [3, 14],
      [9, 14],
      [6, 15],
      [4, 16],
      [8, 16],
      [5, 17],
      [6, 17],
      [7, 17],
      [6, 18],
      [3, 21],
      [4, 21],
      [5, 21],
      [3, 22],
      [4, 22],
      [5, 22],
      [2, 23],
      [6, 23],
      [1, 25],
      [2, 25],
      [6, 25],
      [7, 25], // Gun body
      [3, 35],
      [4, 35],
      [3, 36],
      [4, 36], // Right block
    ],
  },
};

export default function ArciiArcade() {
  const [activeGame, setActiveGame] = useState<GameType>("snake");

  const selectGame = (game: GameType) => {
    sounds.click();
    setActiveGame(game);
  };

  return (
    <div class="space-y-6">
      {/* Sub-Header & Selector */}
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-4 rounded-2xl bg-white shadow-brutal"
        style="border-color: var(--color-border, #0A0A0A)"
      >
        <div class="flex items-center gap-3">
          <span class="text-3xl">🕹️</span>
          <div>
            <h2 class="text-xl font-bold font-mono text-gray-900">
              ARCII ARCADE
            </h2>
            <p class="text-xs font-mono text-gray-500">
              Retro ASCII fun & cellular wonder
            </p>
          </div>
        </div>

        <div
          class="flex gap-2 border-3 rounded-xl overflow-hidden"
          style="border-color: var(--color-border, #0A0A0A)"
        >
          <button
            type="button"
            onClick={() => selectGame("snake")}
            class={`px-4 py-2 font-mono font-bold text-sm transition-all ${
              activeGame === "snake"
                ? "bg-yellow-400 text-black shadow-inner"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🐍 SNAKE
          </button>
          <div class="w-0.5 bg-black"></div>
          <button
            type="button"
            onClick={() => selectGame("life")}
            class={`px-4 py-2 font-mono font-bold text-sm transition-all ${
              activeGame === "life"
                ? "bg-yellow-400 text-black shadow-inner"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🦠 CONWAY
          </button>
          <div class="w-0.5 bg-black"></div>
          <button
            type="button"
            onClick={() => selectGame("tetris")}
            class={`px-4 py-2 font-mono font-bold text-sm transition-all ${
              activeGame === "tetris"
                ? "bg-yellow-400 text-black shadow-inner"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🧱 TETRIS
          </button>
        </div>
      </div>

      {activeGame === "snake"
        ? <SnakeGame />
        : activeGame === "life"
        ? <GameOfLife />
        : <TetrisGame />}

      <style>
        {`
        .crt-screen {
          position: relative;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.95), inset 0 0 20px rgba(0,255,65,0.25);
        }
        .scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.2) 50%
          );
          background-size: 100% 4px;
          opacity: 0.45;
          z-index: 10;
        }
        /* Custom 40 column layout since standard Tailwind stops at 12 */
        .grid-cols-40 {
          grid-template-columns: repeat(40, minmax(0, 1fr));
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.65; }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s infinite ease-in-out;
        }

        /* Fullscreen responsive styles */
        .game-container:fullscreen {
          background-color: #0F172A !important;
          padding: 1.5rem !important;
          width: 100vw !important;
          height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          overflow-y: auto !important;
        }
        .game-container:fullscreen > div {
          width: 100% !important;
          max-width: 1100px !important;
          margin: auto !important;
        }

        /* Webkit support */
        .game-container:-webkit-full-screen {
          background-color: #0F172A !important;
          padding: 1.5rem !important;
          width: 100vw !important;
          height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          overflow-y: auto !important;
        }
        .game-container:-webkit-full-screen > div {
          width: 100% !important;
          max-width: 1100px !important;
          margin: auto !important;
        }
        `}
      </style>
    </div>
  );
}

// ===================================================================
// TETRIS GAME ISLAND
// ===================================================================
const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], char: "▒" },
  O: { shape: [[1, 1], [1, 1]], char: "█" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], char: "▓" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], char: "▞" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], char: "▚" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], char: "▜" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], char: "▛" },
};

type PieceType = keyof typeof TETROMINOES;
const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

function TetrisGame() {
  const COLS = 10;
  const ROWS = 20;

  const [board, setBoard] = useState<string[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill("."))
  );
  const [currentPiece, setCurrentPiece] = useState<
    {
      shape: number[][];
      char: string;
      x: number;
      y: number;
    } | null
  >(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);
  const [_isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        globalThis.document?.fullscreenElement === consoleRef.current,
      );
    };
    globalThis.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      globalThis.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = () => {
    sounds.click();
    if (!consoleRef.current) return;
    if (!globalThis.document?.fullscreenElement) {
      consoleRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      globalThis.document.exitFullscreen();
    }
  };

  const boardRef = useRef(board);
  boardRef.current = board;
  const currentPieceRef = useRef(currentPiece);
  currentPieceRef.current = currentPiece;

  // Spawning random piece
  const spawnPiece = (currentBoard: string[][]) => {
    const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    const proto = TETROMINOES[type];
    const newPiece = {
      shape: proto.shape,
      char: proto.char,
      x: Math.floor((COLS - proto.shape[0].length) / 2),
      y: 0,
    };

    // Check spawn collision
    if (checkCollision(newPiece, 0, 0, currentBoard)) {
      sounds.error();
      setIsGameOver(true);
      setIsPlaying(false);
      setCurrentPiece(null);
    } else {
      setCurrentPiece(newPiece);
    }
  };

  const checkCollision = (
    piece: { shape: number[][]; x: number; y: number },
    offsetX: number,
    offsetY: number,
    currentBoard: string[][],
  ): boolean => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const targetX = piece.x + c + offsetX;
          const targetY = piece.y + r + offsetY;

          // Out of horizontal bounds
          if (targetX < 0 || targetX >= COLS) return true;
          // Out of vertical bounds
          if (targetY >= ROWS) return true;
          // Target cell already occupied
          if (targetY >= 0 && currentBoard[targetY][targetX] !== ".") {
            return true;
          }
        }
      }
    }
    return false;
  };

  const startGame = () => {
    sounds.resume();
    sounds.click();
    const cleanBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill("."));
    setBoard(cleanBoard);
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnPiece(cleanBoard);
  };

  const movePiece = (dirX: number, dirY: number) => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return false;

    if (!checkCollision(piece, dirX, dirY, boardRef.current)) {
      setCurrentPiece({
        ...piece,
        x: piece.x + dirX,
        y: piece.y + dirY,
      });
      if (dirX !== 0 || dirY > 0) sounds.toggle();
      return true;
    }
    return false;
  };

  const rotatePiece = () => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;

    // Transpose and reverse rows for clockwise rotation
    const N = piece.shape.length;
    const M = piece.shape[0].length;
    const rotatedShape: number[][] = Array(M).fill(null).map(() =>
      Array(N).fill(0)
    );

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < M; c++) {
        rotatedShape[c][N - 1 - r] = piece.shape[r][c];
      }
    }

    const rotatedPiece = {
      ...piece,
      shape: rotatedShape,
    };

    // Kick piece if it collides on rotate
    let offsetX = 0;
    if (checkCollision(rotatedPiece, 0, 0, boardRef.current)) {
      if (!checkCollision(rotatedPiece, -1, 0, boardRef.current)) offsetX = -1;
      else if (!checkCollision(rotatedPiece, 1, 0, boardRef.current)) {
        offsetX = 1;
      } else if (!checkCollision(rotatedPiece, -2, 0, boardRef.current)) {
        offsetX = -2;
      } else if (!checkCollision(rotatedPiece, 2, 0, boardRef.current)) {
        offsetX = 2;
      } else return; // Can't rotate
    }

    sounds.click();
    setCurrentPiece({
      ...rotatedPiece,
      x: rotatedPiece.x + offsetX,
    });
  };

  const hardDrop = () => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;

    let dropDistance = 0;
    while (!checkCollision(piece, 0, dropDistance + 1, boardRef.current)) {
      dropDistance++;
    }

    sounds.drop();
    const finalPiece = {
      ...piece,
      y: piece.y + dropDistance,
    };
    lockPiece(finalPiece);
  };

  const lockPiece = (
    piece: { shape: number[][]; char: string; x: number; y: number },
  ) => {
    const nextBoard = boardRef.current.map((row) => [...row]);

    // Copy piece shape to board
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const targetY = piece.y + r;
          if (targetY >= 0 && targetY < ROWS) {
            nextBoard[targetY][piece.x + c] = piece.char;
          }
        }
      }
    }

    // Clear complete lines
    let clearedLinesCount = 0;
    const filteredBoard = nextBoard.filter((row) => {
      const isLineComplete = row.every((cell) => cell !== ".");
      if (isLineComplete) clearedLinesCount++;
      return !isLineComplete;
    });

    // Add empty lines at the top
    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill("."));
    }

    if (clearedLinesCount > 0) {
      sounds.success();
      setLines((prevLines) => {
        const nextLines = prevLines + clearedLinesCount;
        setLevel(Math.floor(nextLines / 10) + 1);
        return nextLines;
      });

      // Score weight: single = 100, double = 300, triple = 500, tetris = 800
      const scoreTable = [0, 100, 300, 500, 800];
      setScore((s) => s + (scoreTable[clearedLinesCount] || 800) * level);
    }

    setBoard(filteredBoard);
    spawnPiece(filteredBoard);
  };

  // Level speed selection
  const getSpeed = () => {
    return Math.max(80, 700 - (level - 1) * 65);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          movePiece(-1, 0);
          e.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          movePiece(1, 0);
          e.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          movePiece(0, 1);
          e.preventDefault();
          break;
        case "ArrowUp":
        case "w":
        case "W":
          rotatePiece();
          e.preventDefault();
          break;
        case " ":
          hardDrop();
          e.preventDefault();
          break;
        default:
          return;
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Tick interval for gravity
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      const piece = currentPieceRef.current;
      if (!piece) return;

      if (!checkCollision(piece, 0, 1, boardRef.current)) {
        setCurrentPiece({
          ...piece,
          y: piece.y + 1,
        });
      } else {
        lockPiece(piece);
      }
    }, getSpeed());

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, level]);

  const handleQuit = () => {
    sounds.error();
    setIsGameOver(true);
    setIsPlaying(false);
  };

  const renderScreen = () => {
    if (!isPlaying && !isGameOver) {
      return (
        <div class="h-full flex flex-col items-center justify-center text-center font-mono space-y-4 p-4">
          <div class="text-[#00FF41] text-3xl font-black tracking-widest animate-pulse-soft">
            🧱 TETRIS.TXT
          </div>
          <p class="text-xs text-gray-400 max-w-xs leading-relaxed">
            Move and rotate falling blocks to clear horizontal lines. Build your
            stack carefully!
          </p>
          <button
            type="button"
            onClick={startGame}
            class="px-5 py-2.5 border-3 rounded-xl font-bold text-xs shadow-brutal bg-yellow-400 text-black transition-all hover:scale-105"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            START MISSION
          </button>
        </div>
      );
    }

    // Grid clone to overlay current falling piece
    const renderGrid = board.map((row) => [...row]);
    const piece = currentPiece;

    if (piece) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const targetY = piece.y + r;
            if (targetY >= 0 && targetY < ROWS) {
              renderGrid[targetY][piece.x + c] = piece.char;
            }
          }
        }
      }
    }

    return (
      <div class="font-mono text-center py-1 select-none">
        <pre class="inline-block text-left text-xs sm:text-sm md:text-base leading-none tracking-wider text-[#00FF41]">
          {renderGrid.map((row) => row.join(" ")).join("\n")}
        </pre>
      </div>
    );
  };

  return (
    <div
      ref={consoleRef}
      class="game-container rounded-3xl p-1 md:p-4 transition-all"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tetris screen (2 columns) */}
        <div
          class="md:col-span-2 border-4 rounded-3xl overflow-hidden shadow-brutal bg-black flex flex-col relative"
          style="border-color: var(--color-border, #0A0A0A)"
        >
          <div
            class="px-4 py-2 bg-gray-900 border-b-4 flex items-center justify-between"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex space-x-1.5">
              <button
                type="button"
                onClick={handleQuit}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleQuit();
                }}
                class="w-3 h-3 rounded-full bg-red-500 hover:scale-125 transition-transform cursor-pointer"
                title="Quit Game"
                aria-label="Quit Game"
              />
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <button
                type="button"
                onClick={toggleFullscreen}
                onTouchStart={(e) => {
                  e.preventDefault();
                  toggleFullscreen();
                }}
                class="w-3 h-3 rounded-full bg-green-500 hover:scale-125 transition-transform cursor-pointer"
                title="Toggle Full Screen"
                aria-label="Toggle Full Screen"
              />
            </div>
            <span class="text-xs font-mono text-[#00FF41] opacity-75">
              ~/arcade/tetris.sh
            </span>
            <div class="text-xs font-mono text-gray-500">LEVEL: {level}</div>
          </div>

          <div class="relative flex-1 p-2 md:p-4 flex items-center justify-center min-h-[360px] max-h-[440px] select-none bg-black overflow-hidden crt-screen">
            <div class="absolute inset-0 scanlines pointer-events-none z-10">
            </div>
            {renderScreen()}

            {isGameOver && (
              <div class="absolute inset-0 bg-black bg-opacity-90 z-20 flex flex-col items-center justify-center font-mono space-y-4 text-center p-6">
                <div class="text-red-500 text-2xl font-black tracking-widest animate-bounce">
                  ⚠️ STACK OVERFLOW
                </div>
                <p class="text-gray-400 text-xs">
                  Game Over! Score:{" "}
                  <span class="text-yellow-400 font-bold">{score}</span>
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startGame();
                  }}
                  class="px-5 py-2 border-3 rounded-xl font-bold text-xs bg-red-500 text-white shadow-brutal hover:scale-105 transition-transform"
                  style="border-color: var(--color-border, #0A0A0A)"
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </div>

          <div
            class="px-4 py-3 bg-gray-900 border-t-4 flex items-center justify-between font-mono text-xs text-[#00FF41]"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            <div>
              SCORE: <span class="text-yellow-400 font-bold">{score}</span>
            </div>
            <div>
              LINES: <span class="text-yellow-400 font-bold">{lines}</span>
            </div>
            {isPlaying && (
              <button
                type="button"
                onClick={handleQuit}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleQuit();
                }}
                class="text-red-400 hover:text-red-300 font-bold border border-red-500 px-2 py-0.5 rounded text-[10px]"
              >
                QUIT
              </button>
            )}
          </div>
        </div>

        {/* Tetris Controller (1 column) */}
        <div
          class="border-4 rounded-3xl p-5 bg-white shadow-brutal flex flex-col justify-between space-y-4"
          style="border-color: var(--color-border, #0A0A0A)"
        >
          <div class="space-y-3">
            <h3 class="font-mono font-bold text-lg text-gray-900 border-b-2 pb-1.5">
              TETROMINO PAD
            </h3>
            <p class="text-[11px] font-mono text-gray-500 leading-normal">
              Steer with{" "}
              <span class="bg-gray-100 px-1 py-0.5 rounded border font-bold">
                A/D
              </span>{" "}
              or Left/Right. Rotate with{" "}
              <span class="bg-gray-100 px-1 py-0.5 rounded border font-bold">
                W
              </span>
              /Up. Soft drop with{" "}
              <span class="bg-gray-100 px-1 py-0.5 rounded border font-bold">
                S
              </span>
              /Down. Hard drop with{" "}
              <span class="bg-gray-100 px-1 py-0.5 rounded border font-bold">
                SPACE
              </span>
              .
            </p>
          </div>

          {/* Gameboy-style Tactile Controls */}
          <div class="flex flex-col items-center gap-4 py-2 select-none">
            <div class="flex items-center justify-between gap-6 w-full max-w-[280px] mx-auto">
              {/* Left: Classic D-Pad Cross */}
              <div
                class="relative w-24 h-24 flex items-center justify-center bg-gray-200 rounded-full border-3 shadow-inner"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                {/* LEFT button */}
                <button
                  type="button"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    movePiece(-1, 0);
                  }}
                  onClick={() => movePiece(-1, 0)}
                  disabled={!isPlaying}
                  aria-label="Move Left"
                  class="absolute left-0 w-8 h-8 bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500 border-2 border-black rounded-l flex items-center justify-center active:scale-90 font-bold text-xs"
                >
                  ◀
                </button>
                {/* RIGHT button */}
                <button
                  type="button"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    movePiece(1, 0);
                  }}
                  onClick={() => movePiece(1, 0)}
                  disabled={!isPlaying}
                  aria-label="Move Right"
                  class="absolute right-0 w-8 h-8 bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500 border-2 border-black rounded-r flex items-center justify-center active:scale-90 font-bold text-xs"
                >
                  ▶
                </button>
                {/* DOWN button (Soft Drop) */}
                <button
                  type="button"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    movePiece(0, 1);
                  }}
                  onClick={() => movePiece(0, 1)}
                  disabled={!isPlaying}
                  aria-label="Soft Drop"
                  class="absolute bottom-0 w-8 h-8 bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500 border-2 border-black rounded-b flex items-center justify-center active:scale-90 font-bold text-xs"
                >
                  ▼
                </button>
                <div class="w-8 h-8 bg-gray-800 border-x-2 border-black"></div>
              </div>

              {/* Right: Gameboy A/B Action Buttons */}
              <div class="flex gap-3 items-center">
                <div class="flex flex-col items-center">
                  <button
                    type="button"
                    onTouchStart={(e) => {
                      e.preventDefault();
                      hardDrop();
                    }}
                    onClick={hardDrop}
                    disabled={!isPlaying}
                    aria-label="Hard Drop"
                    class="w-10 h-10 bg-red-500 hover:bg-red-400 disabled:bg-gray-300 border-3 border-black rounded-full flex items-center justify-center shadow active:scale-90 text-white font-black text-[10px]"
                  >
                    B
                  </button>
                  <span class="text-[8px] font-mono font-bold mt-1 text-gray-400">
                    DROP
                  </span>
                </div>
                <div class="flex flex-col items-center -mt-4">
                  <button
                    type="button"
                    onTouchStart={(e) => {
                      e.preventDefault();
                      rotatePiece();
                    }}
                    onClick={rotatePiece}
                    disabled={!isPlaying}
                    aria-label="Rotate"
                    class="w-12 h-12 bg-red-600 hover:bg-red-500 disabled:bg-gray-300 border-3 border-black rounded-full flex items-center justify-center shadow active:scale-90 text-white font-black text-xs"
                  >
                    A
                  </button>
                  <span class="text-[8px] font-mono font-bold mt-1 text-gray-400">
                    ROTATE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!isPlaying && (
            <button
              type="button"
              onClick={startGame}
              onTouchStart={(e) => {
                e.preventDefault();
                startGame();
              }}
              class="w-full py-3.5 border-4 rounded-2xl font-mono font-black text-sm shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-yellow-400 text-black"
              style="border-color: var(--color-border, #0A0A0A)"
            >
              {isGameOver ? "RETRY MISSION 🔁" : "START MISSION 🎮"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// SNAKE GAME ISLAND
// ===================================================================
function SnakeGame() {
  const COLS = 28;
  const ROWS = 16;
  const INITIAL_SPEED = 140;

  const [snake, setSnake] = useState<{ x: number; y: number }[]>([]);
  const [direction, setDirection] = useState<{ x: number; y: number }>({
    x: 1,
    y: 0,
  });
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);
  const [_isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        globalThis.document?.fullscreenElement === consoleRef.current,
      );
    };
    globalThis.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      globalThis.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = () => {
    sounds.click();
    if (!consoleRef.current) return;
    if (!globalThis.document?.fullscreenElement) {
      consoleRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      globalThis.document.exitFullscreen();
    }
  };

  const directionRef = useRef(direction);
  directionRef.current = direction;

  // Load High Score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("arcii-snake-highscore");
      if (stored) setHighScore(parseInt(stored, 10));
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      const currentDir = directionRef.current;
      let newDir = { ...currentDir };

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDir.y !== 1) newDir = { x: 0, y: -1 };
          e.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDir.y !== -1) newDir = { x: 0, y: 1 };
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDir.x !== 1) newDir = { x: -1, y: 0 };
          e.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDir.x !== -1) newDir = { x: 1, y: 0 };
          e.preventDefault();
          break;
        default:
          return;
      }

      // Play soft tap sound on steer
      if (newDir.x !== currentDir.x || newDir.y !== currentDir.y) {
        sounds.toggle();
        setDirection(newDir);
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Spawn Food
  const spawnFood = (currentSnake: { x: number; y: number }[]) => {
    let newFood;
    let onSnake = true;
    while (onSnake) {
      newFood = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
      onSnake = currentSnake.some((segment) =>
        segment.x === newFood!.x && segment.y === newFood!.y
      );
    }
    setFood(newFood!);
  };

  // Start / Reset
  const startGame = () => {
    sounds.resume();
    sounds.click();
    const initialSnake = [
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
    ];
    setSnake(initialSnake);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    spawnFood(initialSnake);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  // Game loop tick
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

        // Wall collision
        if (
          newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 ||
          newHead.y >= ROWS
        ) {
          handleGameOver();
          return prevSnake;
        }

        // Body collision
        if (
          prevSnake.some((segment) =>
            segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          handleGameOver();
          return prevSnake;
        }

        const nextSnake = [newHead, ...prevSnake];

        // Eat food check
        if (newHead.x === food.x && newHead.y === food.y) {
          sounds.success();
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "arcii-snake-highscore",
                  nextScore.toString(),
                );
              }
            }
            return nextScore;
          });
          spawnFood(prevSnake); // spawn using previous to avoid placing on new segment
        } else {
          nextSnake.pop(); // remove tail
        }

        return nextSnake;
      });
    }, INITIAL_SPEED);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, food, highScore]);

  const handleGameOver = () => {
    sounds.error();
    setIsGameOver(true);
    setIsPlaying(false);
  };

  const steer = (dir: { x: number; y: number }) => {
    sounds.resume();
    if (!isPlaying || isGameOver) return;
    const currentDir = directionRef.current;
    if (dir.x !== 0 && currentDir.x !== 0) return; // Prevent 180 horizontal
    if (dir.y !== 0 && currentDir.y !== 0) return; // Prevent 180 vertical
    sounds.toggle();
    setDirection(dir);
  };

  // Render text-based screen matrix
  const renderScreen = () => {
    if (snake.length === 0) {
      return (
        <div class="h-full flex flex-col items-center justify-center text-center font-mono space-y-4 p-4">
          <div class="text-[#00FF41] text-3xl font-black tracking-widest animate-pulse-soft">
            🐍 SNAKE.TXT
          </div>
          <p class="text-xs text-gray-400 max-w-xs leading-relaxed">
            Navigate the grid, eat the{" "}
            <span class="text-yellow-400 font-bold">@</span>{" "}
            signs, and avoid the screen borders. Simple retro joy.
          </p>
          <button
            type="button"
            onClick={startGame}
            class="px-5 py-2.5 border-3 rounded-xl font-bold text-xs shadow-brutal bg-yellow-400 text-black transition-all hover:scale-105"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            START GAME
          </button>
        </div>
      );
    }

    // Grid rendering
    const grid: string[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(".")
    );

    // Draw snake
    snake.forEach((seg, idx) => {
      if (idx === 0) {
        grid[seg.y][seg.x] = "█"; // Head
      } else {
        grid[seg.y][seg.x] = "■"; // Body
      }
    });

    // Draw food
    grid[food.y][food.x] = "@";

    return (
      <div class="font-mono text-center overflow-auto py-2">
        <pre class="inline-block text-left text-sm md:text-base leading-none tracking-wider text-[#00FF41]">
          {grid.map((row) => row.join(" ")).join("\n")}
        </pre>
      </div>
    );
  };

  return (
    <div
      ref={consoleRef}
      class="game-container rounded-3xl p-1 md:p-4 transition-all"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Screen & Left Controls */}
        <div
          class="md:col-span-2 border-4 rounded-3xl overflow-hidden shadow-brutal bg-black flex flex-col relative"
          style="border-color: var(--color-border, #0A0A0A)"
        >
          {/* Terminal Header */}
          <div
            class="px-4 py-2 bg-gray-900 border-b-4 flex items-center justify-between"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex space-x-1.5">
              <button
                type="button"
                onClick={handleGameOver}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleGameOver();
                }}
                class="w-3 h-3 rounded-full bg-red-500 hover:scale-125 transition-transform cursor-pointer"
                title="Quit Game"
                aria-label="Quit Game"
              />
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <button
                type="button"
                onClick={toggleFullscreen}
                onTouchStart={(e) => {
                  e.preventDefault();
                  toggleFullscreen();
                }}
                class="w-3 h-3 rounded-full bg-green-500 hover:scale-125 transition-transform cursor-pointer"
                title="Toggle Full Screen"
                aria-label="Toggle Full Screen"
              />
            </div>
            <span class="text-xs font-mono text-[#00FF41] opacity-75">
              ~/arcade/snake.sh
            </span>
            <div class="text-xs font-mono text-gray-500">GRID: 28x16</div>
          </div>

          {/* The Screen */}
          <div class="relative flex-1 p-4 flex items-center justify-center min-h-[300px] select-none bg-black overflow-hidden crt-screen">
            {/* Curving scanlines effect */}
            <div class="absolute inset-0 scanlines pointer-events-none z-10">
            </div>
            {renderScreen()}

            {/* Game Over Modal Overlaid */}
            {isGameOver && (
              <div class="absolute inset-0 bg-black bg-opacity-85 z-20 flex flex-col items-center justify-center font-mono space-y-4 text-center p-6">
                <div class="text-red-500 text-2xl font-black tracking-widest animate-bounce">
                  ⚠️ GAME OVER
                </div>
                <p class="text-gray-400 text-xs">
                  You crashed! Score:{" "}
                  <span class="text-yellow-400 font-bold">{score}</span>
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startGame();
                  }}
                  class="px-5 py-2 border-3 rounded-xl font-bold text-xs bg-red-500 text-white shadow-brutal hover:scale-105 transition-transform"
                  style="border-color: var(--color-border, #0A0A0A)"
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Bar */}
          <div
            class="px-4 py-3 bg-gray-900 border-t-4 flex items-center justify-between font-mono text-xs text-[#00FF41]"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            <div>
              SCORE: <span class="text-yellow-400 font-bold">{score}</span>
            </div>
            <div>
              HIGH: <span class="text-yellow-400 font-bold">{highScore}</span>
            </div>
            {isPlaying && (
              <button
                type="button"
                onClick={() => {
                  sounds.click();
                  handleGameOver();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  sounds.click();
                  handleGameOver();
                }}
                class="text-red-400 hover:text-red-300 font-bold border border-red-500 px-2 py-0.5 rounded text-[10px]"
              >
                QUIT
              </button>
            )}
          </div>
        </div>

        {/* Controller Pad (Right Column) */}
        <div
          class="border-4 rounded-3xl p-6 bg-white shadow-brutal flex flex-col justify-between space-y-6"
          style="border-color: var(--color-border, #0A0A0A)"
        >
          <div class="space-y-4">
            <h3 class="font-mono font-bold text-lg text-gray-900 border-b-2 pb-2">
              CONTROLLER
            </h3>
            <p class="text-xs font-mono text-gray-500 leading-relaxed">
              Use{" "}
              <span class="bg-gray-100 px-1.5 py-0.5 rounded border font-bold">
                W A S D
              </span>{" "}
              or arrow keys on your keyboard, or the touch controls below.
            </p>
          </div>

          {/* Tactile D-pad */}
          <div class="flex justify-center py-4">
            <div
              class="relative w-40 h-40 bg-gray-200 rounded-full border-4 shadow-brutal flex items-center justify-center select-none"
              style="border-color: var(--color-border, #0A0A0A)"
            >
              {/* UP button */}
              <button
                type="button"
                onClick={() => steer({ x: 0, y: -1 })}
                onTouchStart={(e) => {
                  e.preventDefault();
                  steer({ x: 0, y: -1 });
                }}
                disabled={!isPlaying}
                aria-label="Steer Up"
                class="absolute top-1 w-12 h-12 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-300 border-3 font-bold rounded-xl flex items-center justify-center transition-all active:scale-90"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                ▲
              </button>
              {/* DOWN button */}
              <button
                type="button"
                onClick={() => steer({ x: 0, y: 1 })}
                onTouchStart={(e) => {
                  e.preventDefault();
                  steer({ x: 0, y: 1 });
                }}
                disabled={!isPlaying}
                aria-label="Steer Down"
                class="absolute bottom-1 w-12 h-12 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-300 border-3 font-bold rounded-xl flex items-center justify-center transition-all active:scale-90"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                ▼
              </button>
              {/* LEFT button */}
              <button
                type="button"
                onClick={() => steer({ x: -1, y: 0 })}
                onTouchStart={(e) => {
                  e.preventDefault();
                  steer({ x: -1, y: 0 });
                }}
                disabled={!isPlaying}
                aria-label="Steer Left"
                class="absolute left-1 w-12 h-12 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-300 border-3 font-bold rounded-xl flex items-center justify-center transition-all active:scale-90"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                ◀
              </button>
              {/* RIGHT button */}
              <button
                type="button"
                onClick={() => steer({ x: 1, y: 0 })}
                onTouchStart={(e) => {
                  e.preventDefault();
                  steer({ x: 1, y: 0 });
                }}
                disabled={!isPlaying}
                aria-label="Steer Right"
                class="absolute right-1 w-12 h-12 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-300 border-3 font-bold rounded-xl flex items-center justify-center transition-all active:scale-90"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                ▶
              </button>
              <div class="w-8 h-8 rounded-full bg-gray-700 border-2 border-black">
              </div>
            </div>
          </div>

          {/* Start Game buttons */}
          {!isPlaying && (
            <button
              type="button"
              onClick={startGame}
              onTouchStart={(e) => {
                e.preventDefault();
                startGame();
              }}
              class="w-full py-4 border-4 rounded-2xl font-mono font-black text-sm shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-yellow-400 text-black"
              style="border-color: var(--color-border, #0A0A0A)"
            >
              {isGameOver ? "RETRY MISSION 🔁" : "START MISSION 🎮"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// CONWAY'S GAME OF LIFE ISLAND
// ===================================================================
function GameOfLife() {
  const COLS = 40;
  const ROWS = 22;

  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(false))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(150); // ms per generation
  const [generation, setGeneration] = useState(0);

  const consoleRef = useRef<HTMLDivElement>(null);
  const [_isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        globalThis.document?.fullscreenElement === consoleRef.current,
      );
    };
    globalThis.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      globalThis.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = () => {
    sounds.click();
    if (!consoleRef.current) return;
    if (!globalThis.document?.fullscreenElement) {
      consoleRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      globalThis.document.exitFullscreen();
    }
  };

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const gridRef = useRef(grid);
  gridRef.current = grid;

  // Toggle cell on click
  const toggleCell = (r: number, c: number) => {
    sounds.resume();
    sounds.toggle();
    const newGrid = grid.map((row, rIdx) =>
      row.map((val, cIdx) => (rIdx === r && cIdx === c ? !val : val))
    );
    setGrid(newGrid);
  };

  // Run cellular updates
  const computeNextGeneration = () => {
    let changed = false;
    const currentGrid = gridRef.current;
    const nextGrid = currentGrid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        // Count neighbors (8 directions)
        let neighbors = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const rNeigh = rIdx + i;
            const cNeigh = cIdx + j;

            // Wrap around edges
            const wrapR = (rNeigh + ROWS) % ROWS;
            const wrapC = (cNeigh + COLS) % COLS;

            if (currentGrid[wrapR][wrapC]) {
              neighbors++;
            }
          }
        }

        // Apply Conway's rules
        let nextVal = cell;
        if (cell && (neighbors < 2 || neighbors > 3)) {
          nextVal = false; // Death by under/over-population
        } else if (!cell && neighbors === 3) {
          nextVal = true; // Birth
        }

        if (nextVal !== cell) changed = true;
        return nextVal;
      })
    );

    if (!changed && isRunningRef.current) {
      // Grid stabilized
      setIsRunning(false);
    } else {
      setGrid(nextGrid);
      setGeneration((g) => g + 1);
    }
  };

  // Generation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      computeNextGeneration();
    }, speed);

    return () => clearInterval(interval);
  }, [isRunning, speed]);

  // Command handlers
  const handleStartStop = () => {
    sounds.resume();
    sounds.click();
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    sounds.resume();
    sounds.click();
    computeNextGeneration();
  };

  const handleClear = () => {
    sounds.resume();
    sounds.click();
    setIsRunning(false);
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(false)));
    setGeneration(0);
  };

  const handleRandomize = () => {
    sounds.resume();
    sounds.success();
    setIsRunning(false);
    const randomized = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => Math.random() < 0.22)
    );
    setGrid(randomized);
    setGeneration(0);
  };

  // Pattern Loaders
  const loadPreset = (presetKey: keyof typeof PRESETS) => {
    sounds.resume();
    sounds.success();
    setIsRunning(false);
    const newGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    const offsetR = Math.floor(ROWS / 2) - 3;
    const offsetC = Math.floor(COLS / 2) - 6;

    PRESETS[presetKey].grid.forEach(([r, c]) => {
      const targetR = r + offsetR;
      const targetC = c + offsetC;
      if (targetR >= 0 && targetR < ROWS && targetC >= 0 && targetC < COLS) {
        newGrid[targetR][targetC] = true;
      }
    });

    setGrid(newGrid);
    setGeneration(0);
  };

  return (
    <div
      ref={consoleRef}
      class="game-container rounded-3xl p-1 md:p-4 transition-all"
    >
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game board & screen */}
        <div
          class="lg:col-span-3 border-4 rounded-3xl overflow-hidden shadow-brutal bg-black flex flex-col relative"
          style="border-color: var(--color-border, #0A0A0A)"
        >
          {/* Header */}
          <div
            class="px-4 py-2 bg-gray-900 border-b-4 flex items-center justify-between"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex space-x-1.5">
              <button
                type="button"
                onClick={handleClear}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleClear();
                }}
                class="w-3 h-3 rounded-full bg-red-500 hover:scale-125 transition-transform cursor-pointer"
                title="Clear Board"
                aria-label="Clear Board"
              />
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <button
                type="button"
                onClick={toggleFullscreen}
                onTouchStart={(e) => {
                  e.preventDefault();
                  toggleFullscreen();
                }}
                class="w-3 h-3 rounded-full bg-green-500 hover:scale-125 transition-transform cursor-pointer"
                title="Toggle Full Screen"
                aria-label="Toggle Full Screen"
              />
            </div>
            <span class="text-xs font-mono text-[#00FF41] opacity-75">
              ~/arcade/game-of-life.sh
            </span>
            <div class="text-xs font-mono text-gray-500">
              GEN: <span class="text-white font-bold">{generation}</span>
            </div>
          </div>

          {/* Conway Grid Screen */}
          <div class="relative p-2 sm:p-4 min-h-[340px] select-none bg-black overflow-auto crt-screen flex items-center justify-center">
            <div class="absolute inset-0 scanlines pointer-events-none z-10">
            </div>
            <div class="grid grid-cols-40 gap-[1px] bg-gray-950 p-1 rounded-lg border border-gray-800">
              {grid.map((row, rIdx) =>
                row.map((cell, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => toggleCell(rIdx, cIdx)}
                    class={`w-[7px] h-[7px] sm:w-[10px] sm:h-[10px] md:w-[13px] md:h-[13px] transition-colors duration-75 cursor-pointer rounded-sm ${
                      cell
                        ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                    style={cell ? "background-color: #00FF41;" : ""}
                  />
                ))
              )}
            </div>
          </div>

          {/* Dashboard Bar */}
          <div
            class="px-4 py-3 bg-gray-900 border-t-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#00FF41]"
            style="border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartStop}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleStartStop();
                }}
                class={`px-3 py-1 border rounded font-bold transition-all text-black ${
                  isRunning
                    ? "bg-red-400 hover:bg-red-300"
                    : "bg-green-400 hover:bg-green-300"
                }`}
                style="border-color: var(--color-border, #0A0A0A)"
              >
                {isRunning ? "⏹️ PAUSE" : "▶️ RUN"}
              </button>
              <button
                type="button"
                onClick={handleStep}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleStep();
                }}
                disabled={isRunning}
                class="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black border rounded font-bold"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                ⏩ STEP
              </button>
              <button
                type="button"
                onClick={handleClear}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleClear();
                }}
                class="px-3 py-1 bg-gray-300 hover:bg-gray-200 text-black border rounded font-bold"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                🧹 CLEAR
              </button>
            </div>

            <div class="flex items-center gap-2">
              <span>SPEED:</span>
              <input
                type="range"
                min="50"
                max="600"
                step="20"
                value={speed}
                onChange={(e) => {
                  const val = parseInt(
                    (e.target as HTMLInputElement).value,
                    10,
                  );
                  setSpeed(val);
                  sounds.slide(Math.floor((600 - val) / 5.5));
                }}
                class="w-20 md:w-28 accent-[#00FF41]"
              />
              <span class="w-12 text-right">{speed}ms</span>
            </div>
          </div>
        </div>

        {/* Control panel (Right Column) */}
        <div
          class="border-4 rounded-3xl p-5 bg-white shadow-brutal flex flex-col justify-between space-y-4"
          style="border-color: var(--color-border, #0A0A0A)"
        >
          <div class="space-y-4">
            <h3 class="font-mono font-bold text-lg text-gray-900 border-b-2 pb-2">
              CELL LIFE LAB
            </h3>
            <p class="text-xs font-mono text-gray-500 leading-relaxed">
              Click on cells in the grid to flip their state between alive and
              dead. Start the simulation to watch them evolve based on Conway's
              Rules.
            </p>
          </div>

          {/* Presets and options */}
          <div class="space-y-3">
            <h4 class="font-mono text-xs font-bold text-gray-700 uppercase tracking-wider">
              🔬 ECOLOGICAL PRESETS
            </h4>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loadPreset("glider")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  loadPreset("glider");
                }}
                class="px-2.5 py-2 text-left font-mono text-xs font-bold border-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all hover:scale-[1.02]"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                🚀 Glider
              </button>
              <button
                type="button"
                onClick={() => loadPreset("pulsar")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  loadPreset("pulsar");
                }}
                class="px-2.5 py-2 text-left font-mono text-xs font-bold border-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all hover:scale-[1.02]"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                💥 Pulsar
              </button>
              <button
                type="button"
                onClick={() => loadPreset("beacon")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  loadPreset("beacon");
                }}
                class="px-2.5 py-2 text-left font-mono text-xs font-bold border-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all hover:scale-[1.02]"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                📟 Beacon
              </button>
              <button
                type="button"
                onClick={() => loadPreset("gosper")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  loadPreset("gosper");
                }}
                class="px-2.5 py-2 text-left font-mono text-xs font-bold border-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all hover:scale-[1.02]"
                style="border-color: var(--color-border, #0A0A0A)"
              >
                🔫 Glider Gun
              </button>
            </div>

            <button
              type="button"
              onClick={handleRandomize}
              onTouchStart={(e) => {
                e.preventDefault();
                handleRandomize();
              }}
              class="w-full mt-2 py-3 border-4 rounded-2xl font-mono font-black text-xs shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all bg-yellow-400 text-black flex items-center justify-center gap-2"
              style="border-color: var(--color-border, #0A0A0A)"
            >
              <span>🎲 RANDOM POPULATION</span>
            </button>
          </div>

          <div class="border-t border-gray-200 pt-3">
            <h4 class="font-mono text-[10px] font-bold text-gray-400 uppercase">
              THE LAWS:
            </h4>
            <ul class="list-disc pl-4 font-mono text-[9px] text-gray-500 space-y-1 mt-1 leading-normal">
              <li>Any live cell with 2 or 3 live neighbours survives.</li>
              <li>
                Any dead cell with exactly 3 live neighbours becomes a live
                cell.
              </li>
              <li>All other live cells die in the next generation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
