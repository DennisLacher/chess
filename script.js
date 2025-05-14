document.addEventListener("DOMContentLoaded", () => {
  console.log("Script loaded and DOMContentLoaded event fired.");

  const CONFIG = {
    defaultBoardSize: 45,
    minBoardSize: 35,
    maxWidthFactor: 0.9,
    offset: 0.5,
  };

  const DEBUG = {
    enableLogging: true,
    logLevel: "debug",
  };

  const SOUND = {
    enabledByDefault: true,
    moveSound: "move.mp3",
    checkSound: "check.mp3",
    captureSound: "clap.mp3",
  };

  if (DEBUG.enableLogging) {
    console.log("Initializing game with CONFIG:", CONFIG);
  }

  const canvas = document.getElementById("chessboard");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const startFreestyleButton = document.getElementById("startFreestyleButton");
  const gameContainer = document.getElementById("gameContainer");
  const turnIndicator = document.getElementById("turnIndicator");
  const rotateButton = document.getElementById("rotateButton");
  const smartphoneModeButton = document.getElementById("smartphoneModeButton");
  const soundToggleButton = document.getElementById("soundToggleButton");
  const undoButton = document.getElementById("undoButton");
  const restartButton = document.getElementById("restartButton");
  const moveList = document.getElementById("moveList");
  const openingDisplay = document.getElementById("openingDisplay");

  console.log("Checking DOM elements...");
  console.log("startScreen:", startScreen);
  console.log("startButton:", startButton);
  console.log("startFreestyleButton:", startFreestyleButton);
  console.log("gameContainer:", gameContainer);
  console.log("turnIndicator:", turnIndicator);
  console.log("moveList:", moveList);
  console.log("openingDisplay:", openingDisplay);
  if (!canvas || !startScreen || !startButton || !startFreestyleButton || !gameContainer || !turnIndicator || !moveList || !openingDisplay) {
    console.error("One or more DOM elements are missing. Check index.html for correct IDs:", {
      canvas, startScreen, startButton, startFreestyleButton, gameContainer, turnIndicator, moveList, openingDisplay
    });
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to initialize canvas context.");
    return;
  }

  let size = CONFIG.defaultBoardSize;
  let offsetX = size * CONFIG.offset;
  let offsetY = size * CONFIG.offset;
  let selectedPiece = null;
  let currentPlayer = "white";
  let gameStarted = false;
  let rotateBoard = false;
  let smartphoneMode = false;
  let soundEnabled = SOUND.enabledByDefault;
  let moveHistory = [];
  let legalMoves = [];
  let lastMove = null;
  let moveCount = 1;
  let moveNotations = [];
  let kingPositions = { white: null, black: null };
  let castlingAvailability = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
  let isWhiteInCheck = false;
  let isBlackInCheck = false;

  let isDarkmode = localStorage.getItem("darkmode") === "true";
  window.boardColors = isDarkmode
    ? { light: "#4a4a4a", dark: "#1f1f1f" }
    : { light: "#e0e0e0", dark: "#4a4a4a" };

  window.updateBoardColors = function(isDark) {
    window.boardColors = isDark
      ? { light: "#4a4a4a", dark: "#1f1f1f" }
      : { light: "#e0e0e0", dark: "#4a4a4a" };
    drawBoard();
  };

  const pieces = {
    r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
    R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
  };

  let board = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ];

  const openings = [
    { name: "Italienische Eröffnung", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], blackResponses: ["Bc5", "Nf6"] },
    { name: "Sizilianische Verteidigung", moves: ["e4", "c5"], blackResponses: ["Nc6", "e6"] },
    { name: "Französische Verteidigung", moves: ["e4", "e6"], blackResponses: ["d5"] },
    { name: "Skandinavische Verteidigung", moves: ["e4", "d5"], blackResponses: ["exd5"] },
    { name: "Spanische Eröffnung", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], blackResponses: ["a6"] },
    { name: "Englische Eröffnung", moves: ["c4"], blackResponses: ["e5", "c5"] },
    { name: "Königsgambit", moves: ["e4", "e5", "f4"], blackResponses: ["exf4", "d5"] },
    { name: "Damenbauernspiel", moves: ["d4", "d5", "c4"], blackResponses: ["e6", "dxc4"] },
    { name: "Niederländische Verteidigung", moves: ["d4", "f5"], blackResponses: ["e6"] },
    { name: "Katalanische Eröffnung", moves: ["d4", "Nf6", "c4", "e6", "g3"], blackResponses: ["d5"] },
    { name: "Russische Verteidigung", moves: ["e4", "e5", "Nf3", "Nf6"], blackResponses: ["Nxe4"] },
    { name: "Philidor-Verteidigung", moves: ["e4", "e5", "Nf3", "d6"], blackResponses: ["Nf6"] },
    { name: "Aljechin-Verteidigung", moves: ["e4", "Nf6"], blackResponses: ["e5"] },
    { name: "Pirc-Verteidigung", moves: ["e4", "d6"], blackResponses: ["Nf6"] },
    { name: "Moderne Verteidigung", moves: ["e4", "g6"], blackResponses: ["d6"] },
    { name: "Caro-Kann-Verteidigung", moves: ["e4", "c6"], blackResponses: ["d5"] },
    { name: "Schottische Eröffnung", moves: ["e4", "e5", "Nf3", "Nc6", "d4"], blackResponses: ["exd4"] },
    { name: "Wiener Partie", moves: ["e4", "e5", "Nc3"], blackResponses: ["Nf6"] },
    { name: "Zweispringer-Verteidigung", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"], blackResponses: ["d4"] },
    { name: "Dre Springer-Spiel", moves: ["e4", "e5", "Nf3", "Nf6", "Nc3"], blackResponses: ["d4"] },
    { name: "Boden-Kieseritzky-Gambit", moves: ["e4", "e5", "Nf3", "Nf6", "Bc4", "Nxe4", "Nc3"], blackResponses: ["Nxc3"] },
    { name: "Budapester Gambit", moves: ["d4", "Nf6", "c4", "e5"], blackResponses: ["dxe5"] },
    { name: "Benoni-Verteidigung", moves: ["d4", "Nf6", "c4", "c5"], blackResponses: ["d5"] },
    { name: "Grünfeld-Verteidigung", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"], blackResponses: ["cxd5"] },
    { name: "Königsindische Verteidigung", moves: ["d4", "Nf6", "c4", "g6"], blackResponses: ["d6"] },
    { name: "Nimzo-Indische Verteidigung", moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"], blackResponses: ["d5"] },
    { name: "Slawische Verteidigung", moves: ["d4", "d5", "c4", "c6"], blackResponses: ["Nf6"] },
    { name: "Tschechische Verteidigung", moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6"], blackResponses: ["d5"] },
    { name: "Alte Indische Verteidigung", moves: ["d4", "Nf6", "c4", "d6"], blackResponses: ["e5"] },
    { name: "Trompowsky-Angriff", moves: ["d4", "Nf6", "Bg5"], blackResponses: ["e6"] },
    { name: "Londoner System", moves: ["d4", "Nf6", "Nf3", "d5", "Bf4"], blackResponses: ["e6"] },
    { name: "Colle-System", moves: ["d4", "Nf6", "Nf3", "d5", "e3"], blackResponses: ["e6"] },
    { name: "Richter-Veresov-Angriff", moves: ["d4", "Nf6", "Nc3", "d5", "Bg5"], blackResponses: ["e6"] },
    { name: "Italienische Eröffnung (Traxler-Gegenangriff)", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "d4", "exd4", "Ng5"], blackResponses: ["Bc5"] },
    { name: "Schottisches Gambit", moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"], blackResponses: ["Nf6"] },
    { name: "Königsgambit (Falkbeer-Gegengambit)", moves: ["e4", "e5", "f4", "d5"], blackResponses: ["exd5"] },
    { name: "Königsgambit (Muzio-Gambit)", moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "g4", "O-O"], blackResponses: ["gxf3"] }
  ];

  let isDarkmode = localStorage.getItem("darkmode") === "true";
  document.body.classList.toggle("darkmode", isDarkmode);

  function initializeDarkmodeToggle() {
    const darkmodeToggleButtons = document.querySelectorAll("#darkmodeToggleButton");
    if (darkmodeToggleButtons.length > 0) {
      darkmodeToggleButtons.forEach(button => {
        button.textContent = isDarkmode ? "Lightmode" : "Darkmode";
        button.removeEventListener("click", toggleDarkmodeHandler); // Entferne vorhandene Listener
        button.addEventListener("click", toggleDarkmodeHandler);
      });
    } else {
      console.warn("No darkmodeToggleButton found in the DOM.");
    }
  }

  function toggleDarkmodeHandler() {
    isDarkmode = !isDarkmode;
    document.body.classList.toggle("darkmode", isDarkmode);
    const darkmodeToggleButtons = document.querySelectorAll("#darkmodeToggleButton");
    darkmodeToggleButtons.forEach(btn => {
      btn.textContent = isDarkmode ? "Lightmode" : "Darkmode";
    });
    localStorage.setItem("darkmode", isDarkmode);
    window.updateBoardColors(isDarkmode);
  }

  // Initialisiere Darkmode beim Laden
  initializeDarkmodeToggle();

  function updateOpeningDisplay() {
    const moves = moveNotations.map(m => m.notation).filter(n => !n.includes("-"));
    let displayText = `Zug: ${moves[moves.length - 1] || "Kein Zug"}`;

    for (let opening of openings) {
      const openingMoves = opening.moves;
      let matches = true;
      for (let i = 0; i < Math.min(moves.length, openingMoves.length); i++) {
        if (moves[i] !== openingMoves[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        displayText = `${opening.name}`;
        if (moves.length >= openingMoves.length && opening.blackResponses.length > 0) {
          displayText += ` (Schwarz: ${opening.blackResponses.join(" oder ")})`;
        }
        break;
      }
    }

    openingDisplay.textContent = displayText;
  }

  function drawBoard() {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Drawing board...");
    }
    if (!ctx) {
      console.error("Canvas context not available.");
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let effectiveRotation = rotateBoard;
    if (smartphoneMode) {
      effectiveRotation = currentPlayer === "black";
    }

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const displayY = effectiveRotation ? 7 - y : y;
        const displayX = effectiveRotation ? 7 - x : x;

        ctx.fillStyle = (displayX + displayY) % 2 === 0 ? window.boardColors.light : window.boardColors.dark;
        if (lastMove && ((lastMove.fromX === x && lastMove.fromY === y) || (lastMove.toX === x && lastMove.toY === y))) {
          ctx.fillStyle = "#b2f0b2"; // Sanftes Grün für letzten Zug
        }
        if (legalMoves.some(move => move.toX === x && move.toY === y)) {
          ctx.fillStyle = "#ffd700"; // Goldgelb für legale Züge
        }
        if ((isWhiteInCheck && kingPositions.white && kingPositions.white.x === x && kingPositions.white.y === y) ||
            (isBlackInCheck && kingPositions.black && kingPositions.black.x === x && kingPositions.black.y === y)) {
          ctx.fillStyle = "#ff4444"; // Weicheres Rot für Schach
        }
        ctx.fillRect(offsetX + displayX * size, offsetY + displayY * size, size, size);

        const piece = board[y][x];
        if (piece) {
          const isWhite = piece === piece.toUpperCase();
          ctx.fillStyle = isWhite ? "#ffffff" : "#000000"; // Weiße/schwarze Figuren
          ctx.font = `${size * 0.7}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(pieces[piece], offsetX + displayX * size + size / 2, offsetY + displayY * size + size / 2);
        }
      }
    }

    ctx.fillStyle = "#555555"; // Mittleres Grau für Koordinaten
    ctx.font = `${size * 0.25}px Arial`;
    if (!effectiveRotation) {
      for (let i = 0; i < 8; i++) {
        ctx.fillText(String.fromCharCode(97 + i), offsetX + i * size + size / 2, offsetY + 8 * size + size * 0.3);
        ctx.fillText(8 - i, offsetX - size * 0.4, offsetY + i * size + size / 2);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        ctx.fillText(String.fromCharCode(97 + (7 - i)), offsetX + i * size + size / 2, offsetY + 8 * size + size * 0.3);
        ctx.fillText(i + 1, offsetX - size * 0.4, offsetY + (7 - i) * size + size / 2);
      }
    }

    turnIndicator.textContent = `Am Zug: ${currentPlayer === "white" ? "Weiß" : "Schwarz"}`;
  }

  function resizeCanvas() {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Resizing canvas...");
    }
    const maxWidth = window.innerWidth * CONFIG.maxWidthFactor - 40;
    const maxHeight = window.innerHeight - 100;
    size = Math.min(maxWidth / 8, maxHeight / 8, CONFIG.defaultBoardSize);
    if (window.innerWidth < 640) {
      size = Math.min(size, CONFIG.minBoardSize);
    }
    offsetX = size * CONFIG.offset;
    offsetY = size * CONFIG.offset;
    canvas.width = size * 8 + offsetX * 2;
    canvas.height = size * 8 + offsetY * 2;
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("New canvas size:", canvas.width, "x", canvas.height);
    }
    if (gameStarted) {
      drawBoard();
    }
  }

  function startGame(freestyle = false) {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Starting game, freestyle mode:", freestyle);
    }
    currentPlayer = "white";
    gameStarted = true;
    selectedPiece = null;
    legalMoves = [];
    moveHistory = [];
    moveNotations = [];
    lastMove = null;
    moveCount = 1;
    kingPositions = { white: null, black: null };
    castlingAvailability = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
    isWhiteInCheck = false;
    isBlackInCheck = false;
    moveList.innerHTML = "";
    startScreen.style.display = "none";
    gameContainer.classList.remove("hidden");
    restartButton.classList.remove("hidden");

    if (freestyle) {
      const shuffledRow = shuffleArray(["r", "n", "b", "q", "k", "b", "n", "r"]);
      board = [
        shuffledRow,
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        shuffledRow.map(p => p.toUpperCase())
      ];
    } else {
      board = [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]
      ];
    }
    updateKingPositions();
    resizeCanvas();
    drawBoard();

    // Aktualisiere Darkmode-Listener nach Spielstart
    initializeDarkmodeToggle();
  }

  function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function updateKingPositions(tempBoard = board) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = tempBoard[y][x];
        if (piece === "k") kingPositions.black = { x, y };
        if (piece === "K") kingPositions.white = { x, y };
      }
    }
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Updated king positions:", kingPositions);
    }
  }

  function isInCheck(color, tempBoard = board, tempKingPos = null) {
    const kingPos = tempKingPos || (color === "white" ? kingPositions.white : kingPositions.black);
    if (!kingPos) {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log(`No king position found for ${color}`);
      }
      return false;
    }

    const opponentColor = color === "white" ? "black" : "white";
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = tempBoard[y][x];
        const isOpponent = piece && ((piece === piece.toUpperCase() && opponentColor === "white") || (piece !== piece.toUpperCase() && opponentColor === "black"));
        if (isOpponent) {
          const moves = getLegalMovesForCheck(x, y, tempBoard);
          if (moves.some(m => m.toX === kingPos.x && m.toY === kingPos.y)) {
            if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
              console.log(`${color} king at ${kingPos.x},${kingPos.y} is in check by piece at ${x},${y}`);
            }
            return true;
          }
        }
      }
    }
    return false;
  }

  function updateCheckStatus() {
    const whiteWasInCheck = isWhiteInCheck;
    const blackWasInCheck = isBlackInCheck;
    isWhiteInCheck = isInCheck("white");
    isBlackInCheck = isInCheck("black");

    if ((isWhiteInCheck && !whiteWasInCheck) || (isBlackInCheck && !blackWasInCheck)) {
      if (soundEnabled) {
        const audio = new Audio(SOUND.checkSound);
        audio.play().catch(e => console.error("Check audio play failed:", e));
      }
    }
  }

  function getLegalMovesForCheck(x, y, tempBoard = board) {
    const moves = [];
    const piece = tempBoard[y][x];
    if (!piece) return moves;

    const isWhite = piece === piece.toUpperCase();

    if (piece.toLowerCase() === "p") {
      const direction = isWhite ? -1 : 1;
      const attackDirs = [-1, 1];
      attackDirs.forEach(dx => {
        const newX = x + dx;
        const newY = y + direction;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "r") {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      directions.forEach([dx, dy] => {
        let newX = x;
        let newY = y;
        while (true) {
          newX += dx;
          newY += dy;
          if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;
          moves.push({ toX: newX, toY: newY });
          if (tempBoard[newY][newX]) break;
        }
      });
    } else if (piece.toLowerCase() === "n") {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightMoves.forEach([dx, dy] => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "b") {
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      directions.forEach([dx, dy] => {
        let newX = x;
        let newY = y;
        while (true) {
          newX += dx;
          newY += dy;
          if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;
          moves.push({ toX: newX, toY: newY });
          if (tempBoard[newY][newX]) break;
        }
      });
    } else if (piece.toLowerCase() === "q") {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      directions.forEach([dx, dy] => {
        let newX = x;
        let newY = y;
        while (true) {
          newX += dx;
          newY += dy;
          if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;
          moves.push({ toX: newX, toY: newY });
          if (tempBoard[newY][newX]) break;
        }
      });
    } else if (piece.toLowerCase() === "k") {
      const kingMoves = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];
      kingMoves.forEach([dx, dy] => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          moves.push({ toX: newX, toY: newY });
        }
      });
    }
    return moves;
  }

  function getLegalMoves(x, y) {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Calculating legal moves for position:", x, y, "Piece:", board[y][x]);
    }
    const moves = [];
    const piece = board[y][x];
    if (!piece) {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("No piece at", x, y);
      }
      return moves;
    }

    const isWhite = piece === piece.toUpperCase();
    if ((isWhite && currentPlayer !== "white") || (!isWhite && currentPlayer !== "black")) {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("Not the current player's turn for this piece.");
      }
      return moves;
    }

    if (piece.toLowerCase() === "p") {
      const direction = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;
      if (y + direction >= 0 && y + direction < 8 && !board[y + direction][x]) {
        moves.push({ toX: x, toY: y + direction, promotion: y + direction === (isWhite ? 0 : 7) });
        if (y === startRow && !board[y + 2 * direction][x] && !board[y + direction][x]) {
          moves.push({ toX: x, toY: y + 2 * direction });
        }
      }
      const attackDirs = [-1, 1];
      attackDirs.forEach(dx => {
        const newX = x + dx;
        const newY = y + direction;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          const targetPiece = board[newY][newX];
          if (targetPiece && (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
            moves.push({ toX: newX, toY: newY, promotion: newY === (isWhite ? 0 : 7) });
            if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
              console.log(`Pawn at ${x},${y} can capture ${targetPiece} at ${newX},${newY}`);
            }
          }
        }
      });
    } else if (piece.toLowerCase() === "r") {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      directions.forEach([dx, dy] => {
        let newX = x;
        let newY = y;
        while (true) {
          newX += dx;
          newY += dy;
          if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;
          const targetPiece = board[newY][newX];
          if (targetPiece) {
            if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
              moves.push({ toX: newX, toY: newY });
            }
            break;
          }
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "n") {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightMoves.forEach([dx, dy] => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          const targetPiece = board[newY][newX];
          if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
            moves.push({ toX: newX, toY: newY });
          }
        }
      });
    } else if (piece.toLowerCase() === "b") {
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      directions.forEach([dx, dy] => {
        let newX = x;
        let newY = y;
        while (true) {
          newX += dx;
          newY += dy;
          if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;
          const targetPiece = board[newY][newX];
          if (targetPiece) {
            if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
              moves.push({ toX: newX, toY: newY });
            }
            break;
          }
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "q") {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      directions.forEach([dx, dy] => {
        let newX = x;
        let newY = y;
        while (true) {
          newX += dx;
          newY += dy;
          if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;
          const targetPiece = board[newY][newX];
          if (targetPiece) {
            if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
              moves.push({ toX: newX, toY: newY });
            }
            break;
          }
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "k") {
      const kingMoves = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];
      kingMoves.forEach([dx, dy] => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          const targetPiece = board[newY][newX];
          if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
            moves.push({ toX: newX, toY: newY });
          }
        }
      });

      if (isWhite && y === 7 && x === 4) {
        if (
          castlingAvailability.white.kingside &&
          !board[7][5] &&
          !board[7][6] &&
          board[7][7] === "R" &&
          !isInCheck("white") &&
          !moveHistory.some(m => m.piece === "K" || (m.piece === "R" && m.fromX === 7 && m.fromY === 7))
        ) {
          let canCastle = true;
          for (let i = 4; i <= 6; i++) {
            const tempBoard = board.map(row => [...row]);
            if (i > 4) {
              tempBoard[7][i] = "K";
              tempBoard[7][i - 1] = "";
            }
            const tempKingPos = { x: i, y: 7 };
            if (isInCheck("white", tempBoard, tempKingPos)) {
              canCastle = false;
              if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
                console.log(`Kingside castling for white blocked: square ${i},7 is under attack`);
              }
              break;
            }
          }
          if (canCastle) {
            moves.push({ toX: 6, toY: 7, castling: "kingside" });
            if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
              console.log("Kingside castling for white is legal");
            }
          }
        }
        if (
          castlingAvailability.white.queenside &&
          !board[7][1] &&
          !board[7][2] &&
          !board[7][3] &&
          board[7][0] === "R" &&
          !isInCheck("white") &&
          !moveHistory.some(m => m.piece === "K" || (m.piece === "R" && m.fromX === 0 && m.fromY === 7))
        ) {
          let canCastle = true;
          for (let i = 4; i >= 2; i--) {
            const tempBoard = board.map(row => [...row]);
            if (i < 4) {
              tempBoard[7][i] = "K";
              tempBoard[7][i + 1] = "";
            }
            const tempKingPos = { x: i, y: 7 };
            if (isInCheck("white", tempBoard, tempKingPos)) {
              canCastle = false;
              if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
                console.log(`Queenside castling for white blocked: square ${i},7 is under attack`);
              }
              break;
            }
          }
          if (canCastle) {
            moves.push({ toX: 2, toY: 7, castling: "queenside" });
            if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
              console.log("Queenside castling for white is legal");
            }
          }
        }
      } else if (!isWhite && y === 0 && x === 4) {
        if (
          castlingAvailability.black.kingside &&
          !board[0][5] &&
          !board[0][6] &&
          board[0][7] === "r" &&
          !isInCheck("black") &&
          !moveHistory.some(m => m.piece === "k" || (m.piece === "r" && m.fromX === 7 && m.fromY === 0))
        ) {
          let canCastle = true;
          for (let i = 4; i <= 6; i++) {
            const tempBoard = board.map(row => [...row]);
            if (i > 4) {
              tempBoard[0][i] = "k";
              tempBoard[0][i - 1] = "";
            }
            const tempKingPos = { x: i, y: 0 };
            if (isInCheck("black", tempBoard, tempKingPos)) {
              canCastle = false;
              if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
                console.log(`Kingside castling for black blocked: square ${i},0 is under attack`);
              }
              break;
            }
          }
          if (canCastle) {
            moves.push({ toX: 6, toY: 0, castling: "kingside" });
            if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
              console.log("Kingside castling for black is legal");
            }
          }
        }
        if (
          castlingAvailability.black.queenside &&
          !board[0][1] &&
          !board[0][2] &&
          !board[0][3] &&
          board[0][0] === "r" &&
          !isInCheck("black") &&
          !moveHistory.some(m => m.piece === "k" || (m.piece === "r" && m.fromX === 0 && m.fromY === 0))
        ) {
          let canCastle = true;
          for (let i = 4; i >= 2; i--) {
            const tempBoard = board.map(row => [...row]);
            if (i < 4) {
              tempBoard[0][i] = "k";
              tempBoard[0][i + 1] = "";
            }
            const tempKingPos = { x: i, y: 0 };
            if (isInCheck("black", tempBoard, tempKingPos)) {
              canCastle = false;
              if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
                console.log(`Queenside castling for black blocked: square ${i},0 is under attack`);
              }
              break;
            }
          }
          if (canCastle) {
            moves.push({ toX: 2, toY: 0, castling: "queenside" });
            if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
              console.log("Queenside castling for black is legal");
            }
          }
        }
      }
    }

    const validMoves = [];
    for (const move of moves) {
      const tempBoard = board.map(row => [...row]);
      tempBoard[move.toY][move.toX] = piece;
      tempBoard[y][x] = "";
      if (move.castling) {
        if (move.castling === "kingside") {
          tempBoard[move.toY][move.toX - 1] = isWhite ? "R" : "r";
          tempBoard[move.toY][7] = "";
        } else if (move.castling === "queenside") {
          tempBoard[move.toY][move.toX + 1] = isWhite ? "R" : "r";
          tempBoard[move.toY][0] = "";
        }
      }
      updateKingPositions(tempBoard);
      if (!isInCheck(isWhite ? "white" : "black", tempBoard)) {
