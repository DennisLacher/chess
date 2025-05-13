document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded, initializing game...");

  // DOM-Elemente
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

  // Überprüfung der DOM-Elemente
  if (!canvas || !startScreen || !startButton || !startFreestyleButton || !gameContainer || !turnIndicator || !moveList) {
    console.error("One or more DOM elements are missing. Check index.html for correct IDs.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to initialize canvas context.");
    return;
  }

  // Spielvariablen
  let size = 0;
  let offsetX = 0;
  let offsetY = 0;
  let selectedPiece = null;
  let currentPlayer = "white";
  let gameStarted = false;
  let rotateBoard = false;
  let smartphoneMode = false;
  let soundEnabled = true;
  let moveHistory = [];
  let legalMoves = [];
  let lastMove = null;
  let moveCount = 1;

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
    console.log("Drawing board...");
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
    console.log("Resizing canvas...");
    size = Math.min((window.innerWidth * 0.9 - 40) / 8, window.innerHeight < 600 ? 35 : 45);
    offsetX = size / 2;
    offsetY = size / 2;
    canvas.width = size * 8 + offsetX * 2;
    canvas.height = size * 8 + offsetY * 2;
    console.log("New canvas size:", canvas.width, "x", canvas.height);
    if (gameStarted) {
      drawBoard();
    }
  }

  function startGame(freestyle = false) {
    console.log("Starting game, freestyle mode:", freestyle);
    currentPlayer = "white";
    gameStarted = true;
    selectedPiece = null;
    legalMoves = [];
    moveHistory = [];
    lastMove = null;
    moveCount = 1;
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

  function getLegalMoves(x, y) {
    console.log("Calculating legal moves for position:", x, y);
    const moves = [];
    const piece = board[y][x];
    if (!piece) {
      console.log("No piece at", x, y);
      return moves;
    }

    const isWhite = piece === piece.toUpperCase();
    if ((isWhite && currentPlayer !== "white") || (!isWhite && currentPlayer !== "black")) {
      console.log("Not the current player's turn for this piece.");
      return moves;
    }

    if (piece.toLowerCase() === "p") {
      const direction = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;
      if (y + direction >= 0 && y + direction < 8 && !board[y + direction][x]) {
        moves.push({ toX: x, toY: y + direction });
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
            moves.push({ toX: newX, toY: newY });
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
    }

    console.log("Legal moves for", piece, "at", x, y, ":", moves);
    return moves;
  }

  function getMoveNotation(fromX, fromY, toX, toY) {
    const fileFrom = String.fromCharCode(97 + fromX);
    const rankFrom = 8 - fromY;
    const fileTo = String.fromCharCode(97 + toX);
    const rankTo = 8 - toY;
    const piece = board[fromY][fromX].toLowerCase();
    const pieceSymbol = piece === "p" ? "" : piece.toUpperCase();
    return `${pieceSymbol}${fileFrom}${rankFrom}-${fileTo}${rankTo}`;
  }

  function updateMoveHistory() {
    if (lastMove) {
      const moveNotation = getMoveNotation(lastMove.fromX, lastMove.fromY, lastMove.toX, lastMove.toY);
      const moveItem = document.createElement("li");
      moveItem.textContent = `${moveCount}. ${moveNotation}`;
      moveList.appendChild(moveItem);
      if (currentPlayer === "black") moveCount++;
      moveList.scrollTop = moveList.scrollHeight;
    }
  }

  function handleCanvasClick(event) {
    if (!gameStarted) {
      console.log("Game not started yet.");
      return;
    }
    console.log("Canvas clicked/touched");
    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY);
    if (!clientX || !clientY) {
      console.error("Client coordinates not found.");
      return;
    }

    const x = Math.floor((clientX - rect.left - offsetX) / size);
    const y = Math.floor((clientY - rect.top - offsetY) / size);

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
      console.log("Click outside board:", boardX, boardY);
      return;
    }

    console.log("Clicked position on board:", boardX, boardY);

    const piece = board[boardY][boardX];
    const isWhitePiece = piece && piece === piece.toUpperCase();

    if (!selectedPiece) {
      if (piece && (isWhitePiece === (currentPlayer === "white"))) {
        console.log("Piece selected:", piece, "at", boardX, boardY);
        selectedPiece = { x: boardX, y: boardY, piece };
        legalMoves = getLegalMoves(boardX, boardY);
        if (legalMoves.length === 0) {
          console.log("No legal moves available for this piece.");
          selectedPiece = null;
        }
        drawBoard();
      } else {
        console.log("No valid piece selected at", boardX, boardY, "Piece:", piece, "Current player:", currentPlayer);
      }
    } else {
      console.log("Selected piece:", selectedPiece.piece, "at", selectedPiece.x, selectedPiece.y);
      console.log("Legal moves:", legalMoves);
      const move = legalMoves.find(m => m.toX === boardX && m.toY === boardY);
      if (move) {
        console.log("Moving piece from", selectedPiece.x, selectedPiece.y, "to", boardX, boardY);
        const newBoard = board.map(row => [...row]);
        newBoard[boardY][boardX] = selectedPiece.piece;
        newBoard[selectedPiece.y][selectedPiece.x] = "";
        moveHistory.push({ board: board.map(row => [...row]), currentPlayer });
        lastMove = { fromX: selectedPiece.x, fromY: selectedPiece.y, toX: boardX, toY: boardY };
        board = newBoard;
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        console.log("Move executed. New current player:", currentPlayer);
        updateMoveHistory();
      } else {
        console.log("Invalid move to", boardX, boardY);
      }
      selectedPiece = null;
      legalMoves = [];
      drawBoard();
    }
  }

  // Event-Listener
  startButton.addEventListener("click", () => {
    console.log("Start button clicked");
    startGame();
  });

  startFreestyleButton.addEventListener("click", () => {
    console.log("Freestyle button clicked");
    startGame(true);
  });

  if (rotateButton) {
    rotateButton.addEventListener("click", () => {
      if (gameStarted && !smartphoneMode) {
        console.log("Rotate button clicked");
        rotateBoard = !rotateBoard;
        drawBoard();
      }
    });
  }

  if (smartphoneModeButton) {
    smartphoneModeButton.addEventListener("click", () => {
      if (gameStarted) {
        console.log("Smartphone mode button clicked");
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
      console.log("Sound toggle button clicked");
      soundEnabled = !soundEnabled;
      soundToggleButton.textContent = soundEnabled ? "Sound ausschalten" : "Sound einschalten";
    });
  }

  if (undoButton) {
    undoButton.addEventListener("click", () => {
      if (moveHistory.length > 0 && gameStarted) {
        console.log("Undo button clicked");
        const lastState = moveHistory.pop();
        board = lastState.board;
        currentPlayer = lastState.currentPlayer === "white" ? "black" : "white";
        lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1].lastMove : null;
        if (currentPlayer === "white" && moveCount > 1) moveCount--;
        moveList.removeChild(moveList.lastChild);
        selectedPiece = null;
        legalMoves = [];
        drawBoard();
      }
    });
  }

  if (restartButton) {
    restartButton.addEventListener("click", () => {
      console.log("Restart button clicked");
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
    console.log("Window resized");
    resizeCanvas();
  });

  // Initialisierung
  console.log("Initializing game...");
  resizeCanvas();
});
