document.addEventListener("DOMContentLoaded", () => {
  console.log("Script loaded and DOMContentLoaded event fired at", new Date().toISOString());

  const CONFIG = {
    defaultBoardSize: 45,
    minBoardSize: 35,
    maxWidthFactor: 0.9,
    maxHeightFactor: 0.85,
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
  const designButton = document.getElementById("designButton");
  const darkmodeToggleButton = document.getElementById("darkmodeToggleButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const exitFullscreenButton = document.getElementById("exitFullscreenButton");

  console.log("Checking DOM elements...");
  console.log("canvas:", canvas);
  console.log("startScreen:", startScreen);
  console.log("startButton:", startButton);
  console.log("startFreestyleButton:", startFreestyleButton);
  console.log("gameContainer:", gameContainer);
  console.log("turnIndicator:", turnIndicator);
  console.log("moveList:", moveList);
  console.log("openingDisplay:", openingDisplay);
  console.log("designButton:", designButton);
  console.log("darkmodeToggleButton:", darkmodeToggleButton);
  console.log("fullscreenButton:", fullscreenButton);
  console.log("exitFullscreenButton:", exitFullscreenButton);
  if (!canvas || !startScreen || !startButton || !startFreestyleButton || !gameContainer || !turnIndicator || !moveList || !openingDisplay || !designButton || !fullscreenButton || !exitFullscreenButton) {
    console.error("One or more DOM elements are missing. Check index.html for correct IDs:", {
      canvas, startScreen, startButton, startFreestyleButton, gameContainer, turnIndicator, moveList, openingDisplay, designButton, fullscreenButton, exitFullscreenButton
    });
    alert("Fehler: Ein oder mehrere DOM-Elemente fehlen. Bitte überprüfe die Konsole für Details.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to initialize canvas context.");
    alert("Fehler: Canvas-Kontext konnte nicht initialisiert werden.");
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
  let currentDesign = 1;
  let isDarkmode = localStorage.getItem("darkmode") === "true";
  let fullscreenMode = false;
  let gameOver = false;
  let winnerText = "";

  const designs = {
    1: { light: "#f0d9b5", dark: "#b58863" }, // Altes Design
    2: { light: "#d7b899", dark: "#8b5a2b" }, // Holz
    3: { light: "#f5f5f5", dark: "#a0a0a0" }, // Marmor
    4: { light: "#c0c0c0", dark: "#404040" }, // Metall
    5: { light: "#d4e4d2", dark: "#6b8e23" }  // Natur
  };

  window.boardColors = designs[currentDesign];
  console.log("Initial design and colors:", currentDesign, window.boardColors);

  window.updateBoardColors = function (designNum) {
    currentDesign = designNum;
    window.boardColors = designs[currentDesign];
    if (gameStarted) drawBoard();
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
    ["", "", "", "", "", "", ""],
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

  document.body.classList.toggle("darkmode", isDarkmode);

  function initializeDarkmodeToggle() {
    if (darkmodeToggleButton && gameStarted) {
      darkmodeToggleButton.textContent = isDarkmode ? "Lightmode" : "Darkmode";
      darkmodeToggleButton.removeEventListener("click", toggleDarkmodeHandler);
      darkmodeToggleButton.addEventListener("click", toggleDarkmodeHandler);
      console.log("Darkmode toggle button initialized on game page.");
    } else if (darkmodeToggleButton && !gameStarted) {
      darkmodeToggleButton.style.display = "none";
      console.log("Darkmode toggle button hidden on start screen.");
    }
  }

  function toggleDarkmodeHandler() {
    isDarkmode = !isDarkmode;
    console.log("Darkmode toggled to:", isDarkmode);
    document.body.classList.toggle("darkmode", isDarkmode);
    darkmodeToggleButton.textContent = isDarkmode ? "Lightmode" : "Darkmode";
    localStorage.setItem("darkmode", isDarkmode);
    window.updateBoardColors(currentDesign);
  }

  function updateOpeningDisplay() {
    const moves = moveNotations.map((m) => m.notation).filter((n) => !n.includes("-"));
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
      console.log("Drawing board with design:", currentDesign);
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
          ctx.fillStyle = "#a3e4a3"; // Subtiles Grün für den letzten Zug
        }
        if (selectedPiece && selectedPiece.x === x && selectedPiece.y === y) {
          ctx.fillStyle = "#42a5f5"; // Blaue Hervorhebung für die ausgewählte Figur
        }
        if (legalMoves.some((move) => move.toX === x && move.toY === y)) {
          ctx.fillStyle = "#e6b800"; // Dunkles Gold für legale Züge
        }
        if ((isWhiteInCheck && kingPositions.white && kingPositions.white.x === x && kingPositions.white.y === y) ||
            (isBlackInCheck && kingPositions.black && kingPositions.black.x === x && kingPositions.black.y === y)) {
          ctx.fillStyle = gameOver ? "#c62828" : "#d32f2f"; // Dunkleres Rot bei Schachmatt, sonst kräftiges Rot
        }
        ctx.fillRect(offsetX + displayX * size, offsetY + displayY * size, size, size);

        const piece = board[y][x];
        if (piece) {
          const isWhite = piece === piece.toUpperCase();
          ctx.fillStyle = isWhite ? "#ffffff" : "#000000";
          ctx.font = `${size * 0.7}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(pieces[piece], offsetX + displayX * size + size / 2, offsetY + displayY * size + size / 2);
        }
      }
    }

    ctx.fillStyle = "#555555";
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

    turnIndicator.textContent = gameOver ? winnerText : `Am Zug: ${currentPlayer === "white" ? "Weiß" : "Schwarz"}`;
  }

  function resizeCanvas() {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Resizing canvas...");
    }
    let maxWidth, maxHeight;
    if (fullscreenMode) {
      maxWidth = window.innerWidth * CONFIG.maxWidthFactor; // 90% der Breite
      maxHeight = window.innerHeight * CONFIG.maxHeightFactor; // 85% der Höhe
    } else {
      maxWidth = Math.min(window.innerWidth * CONFIG.maxWidthFactor - 40, 800); // Begrenze auf 800px
      maxHeight = window.innerHeight - 100;
    }

    // Behalte das 1:1-Verhältnis für das 8x8-Brett
    const boardSize = Math.min(maxWidth / 8, maxHeight / 8, CONFIG.defaultBoardSize);
    size = Math.floor(Math.max(boardSize, CONFIG.minBoardSize));

    // Berechne Offset, um das Brett zu zentrieren
    const totalWidth = size * 8;
    const totalHeight = size * 8;
    offsetX = (maxWidth - totalWidth) / 2;
    offsetY = (maxHeight - totalHeight) / 2;

    // Setze Canvas-Größe basierend auf der verfügbaren Fläche
    canvas.width = totalWidth + offsetX * 2;
    canvas.height = totalHeight + offsetY * 2;

    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("New canvas size:", canvas.width, "x", canvas.height, "Calculated size:", size, "Offsets:", offsetX, offsetY);
    }
    if (gameStarted) {
      drawBoard();
    }
  }

  function toggleFullscreenMode() {
    fullscreenMode = !fullscreenMode;
    document.body.classList.toggle("fullscreen", fullscreenMode);
    fullscreenButton.textContent = fullscreenMode ? "Normalmodus" : "Vollbildmodus";
    exitFullscreenButton.style.display = fullscreenMode ? "block" : "none";
    resizeCanvas();
    drawBoard();
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
    gameOver = false;
    winnerText = "";
    fullscreenMode = false;
    document.body.classList.remove("fullscreen");
    fullscreenButton.textContent = "Vollbildmodus";
    exitFullscreenButton.style.display = "none";
    moveList.innerHTML = "";
    startScreen.style.display = "none";
    gameContainer.classList.remove("hidden");
    restartButton.classList.remove("hidden");
    darkmodeToggleButton.style.display = "block";

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
        shuffledRow.map((p) => p.toUpperCase())
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
          if (moves.some((m) => m.toX === kingPos.x && m.toY === kingPos.y)) {
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
        audio.play().catch((e) => console.error("Check audio play failed:", e));
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
      attackDirs.forEach((dx) => {
        const newX = x + dx;
        const newY = y + direction;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "r") {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      directions.forEach([dx, dy]) => {
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
      knightMoves.forEach([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "b") {
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      directions.forEach([dx, dy]) => {
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
      directions.forEach([dx, dy]) => {
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
      kingMoves.forEach([dx, dy]) => {
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
      attackDirs.forEach((dx) => {
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
      directions.forEach([dx, dy]) => {
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
      knightMoves.forEach([dx, dy]) => {
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
      directions.forEach([dx, dy]) => {
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
      directions.forEach([dx, dy]) => {
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
      kingMoves.forEach([dx, dy]) => {
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
          !moveHistory.some((m) => m.piece === "K" || (m.piece === "R" && m.fromX === 7 && m.fromY === 7))
        ) {
          let canCastle = true;
          for (let i = 4; i <= 6; i++) {
            const tempBoard = board.map((row) => [...row]);
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
          !moveHistory.some((m) => m.piece === "K" || (m.piece === "R" && m.fromX === 0 && m.fromY === 7))
        ) {
          let canCastle = true;
          for (let i = 4; i >= 2; i--) {
            const tempBoard = board.map((row) => [...row]);
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
          !moveHistory.some((m) => m.piece === "k" || (m.piece === "r" && m.fromX === 7 && m.fromY === 0))
        ) {
          let canCastle = true;
          for (let i = 4; i <= 6; i++) {
            const tempBoard = board.map((row) => [...row]);
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
          !moveHistory.some((m) => m.piece === "k" || (m.piece === "r" && m.fromX === 0 && m.fromY === 0))
        ) {
          let canCastle = true;
          for (let i = 4; i >= 2; i--) {
            const tempBoard = board.map((row) => [...row]);
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
      const tempBoard = board.map((row) => [...row]);
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
        validMoves.push(move);
      }
      updateKingPositions(board);
    }

    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Legal moves calculated:", validMoves);
    }
    return validMoves;
  }

  function getMoveNotation(fromX, fromY, toX, toY) {
    const fileFrom = String.fromCharCode(97 + fromX);
    const rankFrom = 8 - fromY;
    const fileTo = String.fromCharCode(97 + toX);
    const rankTo = 8 - toY;
    const piece = board[fromY][fromX]?.toLowerCase() || "";
    const pieceSymbol = piece === "p" ? "" : piece.toUpperCase();
    const simpleNotation = pieceSymbol === "" ? `${fileTo}${rankTo}` : `${pieceSymbol}${fileTo}${rankTo}`;
    const fullNotation = `${pieceSymbol}${fileFrom}${rankFrom}-${fileTo}${rankTo}`;
    return { simple: simpleNotation, full: fullNotation };
  }

  function updateMoveHistory() {
    if (lastMove) {
      const notation = getMoveNotation(lastMove.fromX, lastMove.fromY, lastMove.toX, lastMove.toY);
      moveNotations.push({ moveCount, notation: notation.simple });
      
      moveList.innerHTML = "";
      let movePairs = [];
      for (let i = 0; i < moveNotations.length; i++) {
        if (i % 2 === 0) {
          movePairs.push({ white: moveNotations[i].notation });
        } else {
          movePairs[movePairs.length - 1].black = moveNotations[i].notation;
        }
      }
      movePairs.forEach((pair, index) => {
        const moveItem = document.createElement("li");
        moveItem.textContent = `${index + 1}. ${pair.white}${pair.black ? " " + pair.black : ""}`;
        moveList.appendChild(moveItem);
      });
      if (currentPlayer === "black") moveCount++;
      moveList.scrollTop = moveList.scrollHeight;

      updateOpeningDisplay();
    }
  }

  function showPromotionChoice(x, y, isWhite) {
    const existingMenu = document.getElementById("promotionChoices");
    if (existingMenu) {
      document.body.removeChild(existingMenu);
    }

    const promotionChoices = document.createElement("div");
    promotionChoices.id = "promotionChoices";
    
    const rect = canvas.getBoundingClientRect();
    let effectiveRotation = rotateBoard;
    if (smartphoneMode) {
      effectiveRotation = currentPlayer === "black";
    }
    const displayX = effectiveRotation ? 7 - x : x;
    const displayY = effectiveRotation ? 7 - y : y;
    const top = rect.top + offsetY + displayY * size;
    const left = rect.left + offsetX + displayX * size;

    promotionChoices.style.position = "absolute";
    promotionChoices.style.top = `${top}px`;
    promotionChoices.style.left = `${left}px`;

    const menuWidth = 4 * (size * 0.8 + 5);
    const menuHeight = size * 0.8 + 10;
    if (left + menuWidth > window.innerWidth) {
      promotionChoices.style.left = `${window.innerWidth - menuWidth - 10}px`;
    }
    if (top + menuHeight > window.innerHeight) {
      promotionChoices.style.top = `${window.innerHeight - menuHeight - 10}px`;
    }

    const choices = isWhite ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"];
    choices.forEach((p) => {
      const button = document.createElement("button");
      button.textContent = pieces[p];
      button.style.fontSize = `${size * 0.6}px`;
      button.addEventListener("click", () => {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log(`Pawn promoted to ${p} at ${x},${y}`);
        }
        board[y][x] = p;
        document.body.removeChild(promotionChoices);
        updateKingPositions();
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        selectedPiece = null;
        legalMoves = [];
        updateMoveHistory();
        updateCheckStatus();
        checkGameOver();
        if (soundEnabled) {
          const audio = new Audio(SOUND.moveSound);
          audio.play().catch((e) => console.error("Promotion audio play failed:", e));
        }
        drawBoard();
      });
      promotionChoices.appendChild(button);
    });

    document.body.appendChild(promotionChoices);
  }

  function checkGameOver() {
    if (isWhiteInCheck || isBlackInCheck) {
      const kingPos = currentPlayer === "white" ? kingPositions.white : kingPositions.black;
      const legalKingMoves = getLegalMoves(kingPos.x, kingPos.y);
      if (legalKingMoves.length === 0) {
        gameOver = true;
        winnerText = isWhiteInCheck ? "Schwarz hat gewonnen!" : "Weiß hat gewonnen!";
        console.log("Game over:", winnerText);
      }
    }
  }

  function handleCanvasClick(event) {
    if (!gameStarted || gameOver) {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("Game not started or already over.");
      }
      return;
    }
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Canvas event triggered, type:", event.type);
    }

    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY);
    if (!clientX || !clientY) {
      console.error("Client coordinates not found.");
      return;
    }

    const adjustedX = clientX - rect.left;
    const adjustedY = clientY - rect.top;

    const x = Math.floor((adjustedX - offsetX) / size);
    const y = Math.floor((adjustedY - offsetY) / size);

    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Raw coordinates:", clientX, clientY);
      console.log("Canvas rect:", rect);
      console.log("Adjusted coordinates:", adjustedX, adjustedY);
      console.log("Converted to grid coordinates:", x, y);
      console.log("size:", size, "offsetX:", offsetX, "offsetY:", offsetY);
    }

    let boardX = x;
    let boardY = y;

    let effectiveRotation = rotateBoard;
    if (smartphoneMode) {
      effectiveRotation = currentPlayer === "black";
    }

    if (effectiveRotation) {
      boardX = 7 - x;
      boardY = 7 - y;
    }

    if (boardX < 0 || boardX >= 8 || boardY < 0 || boardY >= 8) {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("Click outside board:", boardX, boardY);
      }
      selectedPiece = null;
      legalMoves = [];
      drawBoard();
      return;
    }

    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Clicked position on board:", boardX, boardY, "Piece:", board[boardY][boardX]);
    }

    const piece = board[boardY][boardX];
    const isWhitePiece = piece && piece === piece.toUpperCase();

    if (!selectedPiece) {
      if (piece && (isWhitePiece === (currentPlayer === "white"))) {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Piece selected:", piece, "at", boardX, boardY);
        }
        selectedPiece = { x: boardX, y: boardY, piece };
        legalMoves = getLegalMoves(boardX, boardY);
        if (legalMoves.length === 0) {
          if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
            console.log("No legal moves available for this piece.");
          }
          selectedPiece = null;
        }
        drawBoard();
      }
    } else {
      const move = legalMoves.find((m) => m.toX === boardX && m.toY === boardY);
      if (move) {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Valid move found:", move);
        }
        const newBoard = board.map((row) => [...row]);
        const targetPiece = newBoard[boardY][boardX];
        const isCapture = targetPiece && (targetPiece.toLowerCase() !== selectedPiece.piece.toLowerCase()) && ((targetPiece === targetPiece.toUpperCase()) !== (selectedPiece.piece === selectedPiece.piece.toUpperCase()));
        newBoard[boardY][boardX] = selectedPiece.piece;
        newBoard[selectedPiece.y][selectedPiece.x] = "";
        const isWhite = selectedPiece.piece === selectedPiece.piece.toUpperCase();
        if (move.castling) {
          if (move.castling === "kingside") {
            newBoard[boardY][boardX - 1] = isWhite ? "R" : "r";
            newBoard[boardY][7] = "";
            if (isWhite) castlingAvailability.white.kingside = false;
            else castlingAvailability.black.kingside = false;
          } else if (move.castling === "queenside") {
            newBoard[boardY][boardX + 1] = isWhite ? "R" : "r";
            newBoard[boardY][0] = "";
            if (isWhite) castlingAvailability.white.queenside = false;
            else castlingAvailability.black.queenside = false;
          }
        } else {
          if (selectedPiece.piece.toLowerCase() === "k") {
            if (isWhite) {
              castlingAvailability.white.kingside = false;
              castlingAvailability.white.queenside = false;
            } else {
              castlingAvailability.black.kingside = false;
              castlingAvailability.black.queenside = false;
            }
          } else if (selectedPiece.piece.toLowerCase() === "r") {
            if (isWhite && selectedPiece.y === 7 && selectedPiece.x === 0) castlingAvailability.white.queenside = false;
            else if (isWhite && selectedPiece.y === 7 && selectedPiece.x === 7) castlingAvailability.white.kingside = false;
            else if (!isWhite && selectedPiece.y === 0 && selectedPiece.x === 0) castlingAvailability.black.queenside = false;
            else if (!isWhite && selectedPiece.y === 0 && selectedPiece.x === 7) castlingAvailability.black.kingside = false;
          }
        }
        if (move.promotion) {
          showPromotionChoice(boardX, boardY, isWhite);
          board = newBoard;
          lastMove = { fromX: selectedPiece.x, fromY: selectedPiece.y, toX: boardX, toY: boardY };
          updateKingPositions();
          moveHistory.push({
            board: board.map((row) => [...row]),
            currentPlayer,
            moveCount,
            castlingAvailability: { ...castlingAvailability },
            piece: selectedPiece.piece
          });
          return;
        }
        moveHistory.push({
          board: board.map((row) => [...row]),
          currentPlayer,
          moveCount,
          castlingAvailability: { ...castlingAvailability },
          piece: selectedPiece.piece
        });
        lastMove = { fromX: selectedPiece.x, fromY: selectedPiece.y, toX: boardX, toY: boardY };
        board = newBoard;
        updateKingPositions();
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        updateMoveHistory();
        updateCheckStatus();
        checkGameOver();
        if (soundEnabled) {
          const audio = new Audio(isCapture ? SOUND.captureSound : SOUND.moveSound);
          audio.play().catch((e) => console.error("Move audio play failed:", e));
        }
        selectedPiece = null;
        legalMoves = [];
      } else {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("No valid move found for target:", boardX, boardY);
        }
        selectedPiece = null;
        legalMoves = [];
      }
      drawBoard();
    }
  }

  function initializeGameButtons() {
    if (startButton) {
      startButton.removeEventListener("click", startGameNormalHandler);
      startButton.addEventListener("click", startGameNormalHandler);
      console.log("Start button initialized successfully and event listener added.");
      startButton.style.pointerEvents = "auto";
    } else {
      console.error("Start button not found in DOM. Check if ID 'startButton' exists in index.html.");
      alert("Fehler: Start-Button nicht gefunden. Bitte überprüfe die Konsole.");
    }

    if (startFreestyleButton) {
      startFreestyleButton.removeEventListener("click", startGameFreestyleHandler);
      startFreestyleButton.addEventListener("click", startGameFreestyleHandler);
      console.log("Freestyle button initialized successfully and event listener added.");
      startFreestyleButton.style.pointerEvents = "auto";
    } else {
      console.error("Freestyle button not found in DOM. Check if ID 'startFreestyleButton' exists in index.html.");
      alert("Fehler: Freestyle-Button nicht gefunden. Bitte überprüfe die Konsole.");
    }

    if (rotateButton) {
      rotateButton.addEventListener("click", () => {
        rotateBoard = !rotateBoard;
        drawBoard();
      });
    }

    if (smartphoneModeButton) {
      smartphoneModeButton.addEventListener("click", () => {
        smartphoneMode = !smartphoneMode;
        smartphoneModeButton.textContent = smartphoneMode ? "Smartphone-Modus aus" : "Smartphone-Modus";
        drawBoard();
      });
    }

    if (soundToggleButton) {
      soundToggleButton.textContent = soundEnabled ? "Sound aus" : "Sound ein";
      soundToggleButton.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggleButton.textContent = soundEnabled ? "Sound aus" : "Sound ein";
      });
    }

    if (undoButton) {
      undoButton.addEventListener("click", () => {
        if (moveHistory.length > 0 && !gameOver) {
          const lastState = moveHistory.pop();
          board = lastState.board;
          currentPlayer = lastState.currentPlayer;
          moveCount = lastState.moveCount;
          castlingAvailability = lastState.castlingAvailability;
          moveNotations.pop();
          if (currentPlayer === "white" && moveNotations.length % 2 === 0) moveCount--;
          lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
          updateKingPositions();
          updateCheckStatus();
          gameOver = false;
          winnerText = "";
          updateMoveHistory();
          drawBoard();
        }
      });
    }

    if (restartButton) {
      restartButton.addEventListener("click", () => startGame(false));
    }

    if (designButton) {
      designButton.addEventListener("click", () => {
        currentDesign = (currentDesign % 5) + 1;
        console.log("Switched to design:", currentDesign);
        window.updateBoardColors(currentDesign);
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", toggleFullscreenMode);
    }

    if (exitFullscreenButton) {
      exitFullscreenButton.addEventListener("click", toggleFullscreenMode);
    }
  }

  function startGameNormalHandler() {
    console.log("Start button clicked!");
    startGame(false);
  }

  function startGameFreestyleHandler() {
    console.log("Freestyle button clicked!");
    startGame(true);
  }

  initializeGameButtons();

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    canvas.addEventListener("touchstart", handleCanvasClick, { passive: false });
    if (DEBUG.enableLogging) {
      console.log("Touch events enabled for canvas.");
    }
  } else {
    canvas.addEventListener("click", handleCanvasClick);
    if (DEBUG.enableLogging) {
      console.log("Click events enabled for canvas.");
    }
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
});
