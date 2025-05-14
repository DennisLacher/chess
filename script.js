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

  console.log("Checking DOM elements...");
  console.log("startButton:", startButton);
  console.log("startFreestyleButton:", startFreestyleButton);
  if (!canvas || !startScreen || !startButton || !startFreestyleButton || !gameContainer || !turnIndicator || !moveList) {
    console.error("One or more DOM elements are missing. Check index.html for correct IDs.");
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

        ctx.fillStyle = (displayX + displayY) % 2 === 0 ? "#f0d9b5" : "#b58863";
        if (lastMove && ((lastMove.fromX === x && lastMove.fromY === y) || (lastMove.toX === x && lastMove.toY === y))) {
          ctx.fillStyle = "#d4e4d2";
        }
        if (legalMoves.some(move => move.toX === x && move.toY === y)) {
          ctx.fillStyle = "#a3e635";
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

    ctx.fillStyle = "#333";
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

  function isInCheck(color, tempBoard = board) {
    const kingPos = color === "white" ? kingPositions.white : kingPositions.black;
    if (!kingPos) return false;

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
      directions.forEach(([dx, dy]) => {
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
      knightMoves.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          moves.push({ toX: newX, toY: newY });
        }
      });
    } else if (piece.toLowerCase() === "b") {
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      directions.forEach(([dx, dy]) => {
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
      directions.forEach(([dx, dy]) => {
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
      kingMoves.forEach(([dx, dy]) => {
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
        if (y === startRow && !board[y + 2 * direction][x]) {
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
          }
        }
      });
    } else if (piece.toLowerCase() === "r") {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      directions.forEach(([dx, dy]) => {
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
      knightMoves.forEach(([dx, dy]) => {
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
      directions.forEach(([dx, dy]) => {
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
      directions.forEach(([dx, dy]) => {
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
      kingMoves.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          const targetPiece = board[newY][newX];
          if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
            moves.push({ toX: newX, toY: newY });
          }
        }
      });

      // Castling
      if (isWhite && y === 7 && x === 4 && !isInCheck("white")) {
        // Kingside castling (short)
        if (castlingAvailability.white.kingside && !board[7][5] && !board[7][6] && board[7][7] === "R") {
          let canCastle = true;
          for (let i = 5; i <= 6; i++) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[7][i] = "K";
            tempBoard[7][4] = "";
            updateKingPositions(tempBoard);
            if (isInCheck("white", tempBoard)) {
              canCastle = false;
              break;
            }
          }
          if (canCastle && !moveHistory.some(m => m.fromY === 7 && (m.fromX === 4 || m.fromX === 7))) {
            moves.push({ toX: 6, toY: 7, castling: "kingside" });
          }
        }
        // Queenside castling (long)
        if (castlingAvailability.white.queenside && !board[7][3] && !board[7][2] && !board[7][1] && board[7][0] === "R") {
          let canCastle = true;
          for (let i = 2; i <= 3; i++) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[7][i] = "K";
            tempBoard[7][4] = "";
            updateKingPositions(tempBoard);
            if (isInCheck("white", tempBoard)) {
              canCastle = false;
              break;
            }
          }
          if (canCastle && !moveHistory.some(m => m.fromY === 7 && (m.fromX === 4 || m.fromX === 0))) {
            moves.push({ toX: 2, toY: 7, castling: "queenside" });
          }
        }
      } else if (!isWhite && y === 0 && x === 4 && !isInCheck("black")) {
        // Kingside castling (short)
        if (castlingAvailability.black.kingside && !board[0][5] && !board[0][6] && board[0][7] === "r") {
          let canCastle = true;
          for (let i = 5; i <= 6; i++) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[0][i] = "k";
            tempBoard[0][4] = "";
            updateKingPositions(tempBoard);
            if (isInCheck("black", tempBoard)) {
              canCastle = false;
              break;
            }
          }
          if (canCastle && !moveHistory.some(m => m.fromY === 0 && (m.fromX === 4 || m.fromX === 7))) {
            moves.push({ toX: 6, toY: 0, castling: "kingside" });
          }
        }
        // Queenside castling (long)
        if (castlingAvailability.black.queenside && !board[0][3] && !board[0][2] && !board[0][1] && board[0][0] === "r") {
          let canCastle = true;
          for (let i = 2; i <= 3; i++) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[0][i] = "k";
            tempBoard[0][4] = "";
            updateKingPositions(tempBoard);
            if (isInCheck("black", tempBoard)) {
              canCastle = false;
              break;
            }
          }
          if (canCastle && !moveHistory.some(m => m.fromY === 0 && (m.fromX === 4 || m.fromX === 0))) {
            moves.push({ toX: 2, toY: 0, castling: "queenside" });
          }
        }
      }
    }

    // Filter moves that would put the king in check
    const validMoves = [];
    for (const move of moves) {
      const newBoard = board.map(row => [...row]);
      newBoard[move.toY][move.toX] = piece;
      newBoard[y][x] = "";
      if (move.castling) {
        if (move.castling === "kingside") {
          newBoard[move.toY][move.toX - 1] = isWhite ? "R" : "r";
          newBoard[move.toY][7] = "";
        } else if (move.castling === "queenside") {
          newBoard[move.toY][move.toX + 1] = isWhite ? "R" : "r";
          newBoard[move.toY][0] = "";
        }
      }
      updateKingPositions(newBoard);
      if (!isInCheck(isWhite ? "white" : "black", newBoard)) {
        validMoves.push(move);
      }
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
    return `${pieceSymbol}${fileFrom}${rankFrom}-${fileTo}${rankTo}`;
  }

  function updateMoveHistory() {
    if (lastMove) {
      const notation = getMoveNotation(lastMove.fromX, lastMove.fromY, lastMove.toX, lastMove.toY);
      moveNotations.push({ moveCount, notation });
      moveList.innerHTML = "";
      moveNotations.forEach(({ moveCount, notation }) => {
        const moveItem = document.createElement("li");
        moveItem.textContent = `${moveCount}. ${notation}`;
        moveList.appendChild(moveItem);
      });
      if (currentPlayer === "black") moveCount++;
      moveList.scrollTop = moveList.scrollHeight;
    }
  }

  function showPromotionChoice(x, y, isWhite) {
    const promotionChoices = document.createElement("div");
    promotionChoices.id = "promotionChoices";
    promotionChoices.style.position = "absolute";
    promotionChoices.style.top = `${offsetY + y * size}px`;
    promotionChoices.style.left = `${offsetX + x * size}px`;
    promotionChoices.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    promotionChoices.style.padding = "10px";
    promotionChoices.style.borderRadius = "5px";
    promotionChoices.style.zIndex = "1000";

    const choices = isWhite ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"];
    choices.forEach(p => {
      const button = document.createElement("button");
      button.textContent = pieces[p];
      button.style.margin = "5px";
      button.style.fontSize = "24px";
      button.addEventListener("click", () => {
        board[y][x] = p;
        document.body.removeChild(promotionChoices);
        updateKingPositions();
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        updateMoveHistory();
        if (soundEnabled) {
          const audio = new Audio(SOUND.moveSound);
          audio.play().catch(e => console.error("Audio play failed:", e));
        }
        drawBoard();
      });
      promotionChoices.appendChild(button);
    });

    document.body.appendChild(promotionChoices);
  }

  function handleCanvasClick(event) {
    if (!gameStarted) {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("Game not started yet.");
      }
      return;
    }
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Canvas clicked/touched, event:", event.type);
    }
    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY);
    if (!clientX || !clientY) {
      console.error("Client coordinates not found.");
      return;
    }

    const x = Math.floor((clientX - rect.left - offsetX) / size);
    const y = Math.floor((clientY - rect.top - offsetY) / size);
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Raw coordinates:", clientX, clientY);
      console.log("Canvas rect:", rect);
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
      } else {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("No valid piece selected at", boardX, boardY, "Piece:", piece, "Current player:", currentPlayer);
        }
      }
    } else {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("Selected piece:", selectedPiece.piece, "at", selectedPiece.x, selectedPiece.y);
        console.log("Legal moves:", legalMoves);
      }
      const move = legalMoves.find(m => m.toX === boardX && m.toY === boardY);
      if (move) {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Moving piece from", selectedPiece.x, selectedPiece.y, "to", boardX, boardY);
        }
        const newBoard = board.map(row => [...row]);
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
        } else if (move.promotion) {
          showPromotionChoice(boardX, boardY, isWhite);
          board = newBoard;
          updateKingPositions();
          return;
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
        moveHistory.push({ board: board.map(row => [...row]), currentPlayer, moveCount, castlingAvailability: { ...castlingAvailability } });
        lastMove = { fromX: selectedPiece.x, fromY: selectedPiece.y, toX: boardX, toY: boardY };
        board = newBoard;
        updateKingPositions();
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Move executed. New current player:", currentPlayer);
        }
        updateMoveHistory();
        if (soundEnabled) {
          const audio = new Audio(SOUND.moveSound);
          audio.play().catch(e => console.error("Audio play failed:", e));
        }
      } else {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Invalid move to", boardX, boardY);
        }
      }
      selectedPiece = null;
      legalMoves = [];
      drawBoard();
    }
  }

  console.log("Adding event listeners...");
  startButton.addEventListener("click", () => {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Start button clicked");
    }
    startGame();
  });

  startFreestyleButton.addEventListener("click", () => {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Freestyle button clicked");
    }
    startGame(true);
  });

  if (rotateButton) {
    rotateButton.addEventListener("click", () => {
      if (gameStarted && !smartphoneMode) {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Rotate button clicked");
        }
        rotateBoard = !rotateBoard;
        drawBoard();
      }
    });
  }

  if (smartphoneModeButton) {
    smartphoneModeButton.addEventListener("click", () => {
      if (gameStarted) {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Smartphone mode button clicked");
        }
        smartphoneMode = !smartphoneMode;
        smartphoneModeButton.textContent = smartphoneMode ? "Smartphone-Modus aus" : "Smartphone-Modus";
        if (smartphoneMode) {
          rotateBoard = false;
        }
        drawBoard();
      }
    });
  }

  if (soundToggleButton) {
    soundToggleButton.addEventListener("click", () => {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("Sound toggle button clicked");
      }
      soundEnabled = !soundEnabled;
      soundToggleButton.textContent = soundEnabled ? "Sound ausschalten" : "Sound einschalten";
    });
  }

  if (undoButton) {
    undoButton.addEventListener("click", () => {
      if (moveHistory.length > 0 && gameStarted) {
        if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
          console.log("Undo button clicked");
        }
        const lastState = moveHistory.pop();
        board = lastState.board;
        currentPlayer = lastState.currentPlayer;
        moveCount = lastState.moveCount;
        lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1].lastMove : null;
        castlingAvailability = lastState.castlingAvailability;
        moveNotations.pop();
        moveList.innerHTML = "";
        moveNotations.forEach(({ moveCount, notation }) => {
          const moveItem = document.createElement("li");
          moveItem.textContent = `${moveCount}. ${notation}`;
          moveList.appendChild(moveItem);
        });
        selectedPiece = null;
        legalMoves = [];
        updateKingPositions();
        drawBoard();
      }
    });
  }

  if (restartButton) {
    restartButton.addEventListener("click", () => {
      if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
        console.log("Restart button clicked");
      }
      gameStarted = false;
      startScreen.style.display = "block";
      gameContainer.classList.add("hidden");
      restartButton.classList.add("hidden");
      resizeCanvas();
    });
  }

  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleCanvasClick(e);
  });

  window.addEventListener("resize", () => {
    if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
      console.log("Window resized");
    }
    resizeCanvas();
  });

  if (DEBUG.enableLogging && DEBUG.logLevel === "debug") {
    console.log("Initializing game...");
  }
  resizeCanvas();
});
