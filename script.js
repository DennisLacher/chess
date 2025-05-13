document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("chessboard");
  if (!canvas) {
    console.log("Canvas element not found.");
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.log("Canvas context could not be initialized.");
    return;
  }
  const turnIndicator = document.getElementById("turnIndicator");
  const startScreen = document.getElementById("startScreen");
  const startWhiteButton = document.getElementById("startWhiteButton");
  const startFreestyleButton = document.getElementById("startFreestyleButton");
  const rotateButton = document.getElementById("rotateButton");
  const undoButton = document.getElementById("undoButton");
  const restartButton = document.getElementById("restartButton");

  if (!startWhiteButton || !startFreestyleButton) {
    console.log("Error: One or more buttons not found. Check IDs in index.html.");
    return;
  }

  let size = Math.min((window.innerWidth * 0.9 - 40) / 8, 45);
  let offsetX = size / 2;
  let offsetY = size / 2;
  let selected = null;
  let currentPlayer = null;
  let animatingPiece = null;
  let lastMove = null;
  let illegalMoveFields = null;
  let checkmateAnimation = null;
  let fadingPieces = [];
  let gameStarted = false;
  let piecesAnimation = [];
  let rotateBoard = false;
  let enPassantTarget = null;
  let moveHistory = [];
  let legalMoves = [];
  let wasInCheck = false;

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

  const castlingState = {
    whiteKingMoved: false,
    whiteRookA1Moved: false,
    whiteRookH1Moved: false,
    blackKingMoved: false,
    blackRookA8Moved: false,
    blackRookH8Moved: false
  };

  function playMoveSound() {
    const sound = new Audio("move.mp3");
    sound.addEventListener("loadeddata", () => console.log("Move sound loaded successfully"));
    sound.addEventListener("error", (e) => console.log("Error loading move sound:", e));
    console.log("Attempting to play move sound");
    sound.play().catch(error => console.log("Error playing move sound:", error));
  }

  function playCheckSound() {
    const sound = new Audio("check.mp3");
    sound.addEventListener("loadeddata", () => console.log("Check sound loaded successfully"));
    sound.addEventListener("error", (e) => console.log("Error loading check sound:", e));
    console.log("Attempting to play check sound");
    sound.play().catch(error => console.log("Error playing check sound:", error));
  }

  function playCheckmateSound() {
    const sound = new Audio("checkmate.mp3");
    sound.addEventListener("loadeddata", () => console.log("Checkmate sound loaded successfully"));
    sound.addEventListener("error", (e) => console.log("Error loading checkmate sound:", e));
    console.log("Attempting to play checkmate sound");
    sound.play().catch(error => console.log("Error playing checkmate sound:", error));
  }

  function isKingInCheck(player, tempBoard = board) {
    const kingPiece = player === "white" ? "K" : "k";
    let kingX = -1, kingY = -1;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (tempBoard[y][x] === kingPiece) {
          kingX = x;
          kingY = y;
          break;
        }
      }
      if (kingX !== -1) break;
    }
    if (kingX === -1) return false;

    const opponent = player === "white" ? "black" : "white";
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = tempBoard[y][x];
        if (piece && (piece === piece.toLowerCase()) === (opponent === "black")) {
          if (isPieceMoveLegal(piece, x, y, kingX, kingY, tempBoard)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function isPieceMoveLegal(piece, fromX, fromY, toX, toY, tempBoard = board) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const targetPiece = tempBoard[toY][toX];
    const isWhite = piece === piece.toUpperCase();

    if (targetPiece && isWhite === (targetPiece === targetPiece.toUpperCase()) && piece.toLowerCase() !== "p") {
      return false;
    }

    switch (piece.toLowerCase()) {
      case "k":
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) return true;
        return false;
      case "p":
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        if (dx === 0 && dy === direction && !targetPiece) return true;
        if (dx === 0 && dy === 2 * direction && fromY === startRow && !targetPiece && !tempBoard[fromY + direction][fromX]) {
          enPassantTarget = { x: toX, y: toY - direction, piece: piece };
          return true;
        }
        if (Math.abs(dx) === 1 && dy === direction && targetPiece && isWhite !== (targetPiece === targetPiece.toUpperCase())) return true;
        if (Math.abs(dx) === 1 && dy === direction && !targetPiece && enPassantTarget && enPassantTarget.x === toX && enPassantTarget.y === fromY && tempBoard[fromY][toX].toLowerCase() === "p") return true;
        return false;
      case "r":
        if (dx === 0 || dy === 0) {
          const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
          const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
          let x = fromX + stepX, y = fromY + stepY;
          while (x !== toX || y !== toY) {
            if (tempBoard[y][x]) return false;
            x += stepX;
            y += stepY;
          }
          return true;
        }
        return false;
      case "n":
        return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
      case "b":
        if (Math.abs(dx) === Math.abs(dy)) {
          const stepX = dx / Math.abs(dx);
          const stepY = dy / Math.abs(dy);
          let x = fromX + stepX, y = fromY + stepY;
          while (x !== toX || y !== toY) {
            if (tempBoard[y][x]) return false;
            x += stepX;
            y += stepY;
          }
          return true;
        }
        return false;
      case "q":
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
          const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
          const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
          let x = fromX + stepX, y = fromY + stepY;
          while (x !== toX || y !== toY) {
            if (tempBoard[y][x]) return false;
            x += stepX;
            y += stepY;
          }
          return true;
        }
        return false;
    }
    return false;
  }

  function isSquareAttacked(x, y, attackerColor, tempBoard = board) {
    const opponent = attackerColor === "white" ? "black" : "white";
    for (let py = 0; py < 8; py++) {
      for (let px = 0; px < 8; px++) {
        const piece = tempBoard[py][px];
        if (piece && (piece === piece.toLowerCase()) === (opponent === "black")) {
          if (isPieceMoveLegal(piece, px, py, x, y, tempBoard)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function isKingInCheckAfterMove(tempBoard, player) {
    return isKingInCheck(player, tempBoard);
  }

  function canCastle(player, side) {
    const isWhite = player === "white";
    const row = isWhite ? 7 : 0;
    const kingX = 4;
    const kingPiece = isWhite ? "K" : "k";
    const rookPiece = isWhite ? "R" : "r";

    if (isWhite) {
      if (castlingState.whiteKingMoved || board[row][kingX] !== kingPiece) return false;
      if (side === "short" && (castlingState.whiteRookH1Moved || board[row][7] !== rookPiece)) return false;
      if (side === "long" && (castlingState.whiteRookA1Moved || board[row][0] !== rookPiece)) return false;
      if (side === "short" && (board[row][5] !== "" || board[row][6] !== "")) return false;
      if (side === "long" && (board[row][1] !== "" || board[row][2] !== "" || board[row][3] !== "")) return false;
      if (isSquareAttacked(kingX, row, "black")) return false;
      if (side === "short" && (isSquareAttacked(5, row, "black") || isSquareAttacked(6, row, "black"))) return false;
      if (side === "long" && (isSquareAttacked(2, row, "black") || isSquareAttacked(3, row, "black"))) return false;
    } else {
      if (castlingState.blackKingMoved || board[row][kingX] !== kingPiece) return false;
      if (side === "short" && (castlingState.blackRookH8Moved || board[row][7] !== rookPiece)) return false;
      if (side === "long" && (castlingState.blackRookA8Moved || board[row][0] !== rookPiece)) return false;
      if (side === "short" && (board[row][5] !== "" || board[row][6] !== "")) return false;
      if (side === "long" && (board[row][1] !== "" || board[row][2] !== "" || board[row][3] !== "")) return false;
      if (isSquareAttacked(kingX, row, "white")) return false;
      if (side === "short" && (isSquareAttacked(5, row, "white") || isSquareAttacked(6, row, "white"))) return false;
      if (side === "long" && (isSquareAttacked(2, row, "white") || isSquareAttacked(3, row, "white"))) return false;
    }
    return true;
  }

  function performCastling(player, side) {
    const isWhite = player === "white";
    const row = isWhite ? 7 : 0;
    const kingPiece = isWhite ? "K" : "k";
    const rookPiece = isWhite ? "R" : "r";
    const fromKingX = 4;
    const toKingX = side === "short" ? 6 : 2;
    const fromRookX = side === "short" ? 7 : 0;
    const toRookX = side === "short" ? 5 : 3;

    board[row][toKingX] = kingPiece;
    board[row][fromKingX] = "";
    board[row][toRookX] = rookPiece;
    board[row][fromRookX] = "";

    if (isWhite) {
      castlingState.whiteKingMoved = true;
      if (side === "short") castlingState.whiteRookH1Moved = true;
      else castlingState.whiteRookA1Moved = true;
    } else {
      castlingState.blackKingMoved = true;
      if (side === "short") castlingState.blackRookH8Moved = true;
      else castlingState.blackRookA8Moved = true;
    }

    lastMove = { fromX: fromKingX, fromY: row, toX: toKingX, toY: row };
    moveHistory.push({
      board: board.map(row => [...row]),
      castlingState: { ...castlingState },
      enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null,
      currentPlayer,
      lastMove
    });
    currentPlayer = isWhite ? "black" : "white";
  }

  function getLegalMoves(piece, fromX, fromY, tempBoard = board) {
    const moves = [];
    for (let toY = 0; toY < 8; toY++) {
      for (let toX = 0; toX < 8; toX++) {
        if (isLegalMove(piece, fromX, fromY, toX, toY, tempBoard)) {
          moves.push({ toX, toY });
        }
      }
    }

    if (piece.toLowerCase() === "k" && fromX === 4) {
      const row = currentPlayer === "white" ? 7 : 0;
      if (fromY === row && canCastle(currentPlayer, "short")) {
        moves.push({ toX: 6, toY: row });
      }
      if (fromY === row && canCastle(currentPlayer, "long")) {
        moves.push({ toX: 2, toY: row });
      }
    }

    return moves;
  }

  function isLegalMove(piece, fromX, fromY, toX, toY, tempBoard = board) {
    if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) return false;

    const isWhite = piece === piece.toUpperCase();
    if (piece.toLowerCase() === "k" && fromX === 4 && Math.abs(toX - fromX) === 2 && toY === fromY) {
      const side = toX === 6 ? "short" : "long";
      return canCastle(currentPlayer, side);
    }

    if (!isPieceMoveLegal(piece, fromX, fromY, toX, toY, tempBoard)) return false;

    const originalBoard = board.map(row => [...row]);
    board = tempBoard.map(row => [...row]);
    let isEnPassant = false;
    const dx = toX - fromX;
    const dy = toY - fromY;

    if (piece.toLowerCase() === "p") {
      const direction = isWhite ? -1 : 1;
      if (dx === 0 && dy === 2 * direction && fromY === (isWhite ? 6 : 1)) {
        enPassantTarget = { x: toX, y: toY - direction, piece: piece };
      }
      if ((isWhite && toY === 0) || (!isWhite && toY === 7)) {
        board[toY][toX] = isWhite ? "Q" : "q";
        board[fromY][fromX] = "";
      }
      if (Math.abs(dx) === 1 && dy === direction && !board[toY][toX] && enPassantTarget && enPassantTarget.x === toX && enPassantTarget.y === fromY) {
        isEnPassant = true;
        board[fromY][toX] = "";
      }
    }

    if (!isEnPassant) {
      board[toY][toX] = board[fromY][fromX];
      board[fromY][fromX] = "";
    }

    const isValid = !isKingInCheckAfterMove(board, currentPlayer);
    board = originalBoard.map(row => [...row]);
    return isValid;
  }

  function isStalemate(player) {
    if (isKingInCheck(player)) return false;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && (piece === piece.toUpperCase()) === (player === "white")) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              if (isLegalMove(piece, x, y, toX, toY)) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  }

  function isCheckmate(player) {
    if (!isKingInCheck(player)) return false;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && (piece === piece.toUpperCase()) === (player === "white")) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              if (isLegalMove(piece, x, y, toX, toY)) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  }

  function drawBoard() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const displayY = rotateBoard ? 7 - y : y;
        const displayX = rotateBoard ? 7 - x : x;

        let color = (displayX + displayY) % 2 === 0 ? "#f0d9b5" : "#b58863";
        if (lastMove && ((lastMove.fromX === x && lastMove.fromY === y) || (lastMove.toX === x && lastMove.toY === y))) {
          color = "#d4e4d2";
        }
        if (illegalMoveFields && ((illegalMoveFields.startX === x && illegalMoveFields.startY === y) || (illegalMoveFields.toX === x && illegalMoveFields.toY === y))) {
          color = "#ff4d4d";
        }
        if (legalMoves.some(move => move.toX === x && move.toY === y)) {
          color = "#a3e635";
        }
        const kingPiece = currentPlayer === "white" ? "K" : "k";
        if (board[y][x] === kingPiece && isKingInCheck(currentPlayer)) {
          color = "#ff4d4d";
        }
        ctx.fillStyle = color;
        ctx.fillRect(offsetX + displayX * size, offsetY + displayY * size, size, size);

        const piece = board[y][x];
        if (piece && !fadingPieces.some(p => p.x === x && p.y === y)) {
          const isWhite = piece === piece.toUpperCase();
          ctx.fillStyle = isWhite ? "#ffffff" : "#000000";
          ctx.font = `${size * 0.7}px Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.save();
          if (checkmateAnimation && checkmateAnimation.kingX === x && checkmateAnimation.kingY === y) {
            ctx.translate(offsetX + displayX * size + size / 2, offsetY + displayY * size + size / 2);
            ctx.rotate((checkmateAnimation.angle * Math.PI) / 180);
            ctx.fillText(pieces[piece], 0, 0);
          } else {
            ctx.fillText(pieces[piece], offsetX + displayX * size + size / 2, offsetY + displayY * size + size / 2);
          }
          ctx.restore();
        }
      }
    }

    ctx.fillStyle = "#333";
    ctx.font = `${size * 0.25}px Arial`;
    if (!rotateBoard) {
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

    const isInCheck = isKingInCheck(currentPlayer);
    const isCheckmateResult = isCheckmate(currentPlayer);
    const isStalemateResult = isStalemate(currentPlayer);
    
    if (isInCheck && !wasInCheck && !isCheckmateResult && !isStalemateResult) {
      playCheckSound();
    }
    wasInCheck = isInCheck;

    turnIndicator.textContent = checkmateAnimation
      ? `${checkmateAnimation.winner} hat gewonnen!`
      : isCheckmateResult
      ? `${currentPlayer === "white" ? "Schwarz" : "Weiß"} hat gewonnen! (Schachmatt)`
      : isStalemateResult
      ? "Patt!"
      : `Am Zug: ${currentPlayer === "white" ? "Weiß" : "Schwarz"}${isInCheck ? " (Schach)" : ""}`;
  }

  function initStartScreen() {
    piecesAnimation = [];
    for (let i = 0; i < 10; i++) {
      piecesAnimation.push({
        piece: Object.values(pieces)[Math.floor(Math.random() * Object.values(pieces).length)],
        x: Math.random() * (size * 8),
        y: Math.random() * (size * 8),
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2
      });
    }
    animateStartScreen();
  }

  function animateStartScreen() {
    if (!gameStarted && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      piecesAnimation.forEach((piece) => {
        piece.x += piece.dx;
        piece.y += piece.dy;
        if (piece.x < 0 || piece.x > size * 8) piece.dx *= -1;
        if (piece.y < 0 || piece.y > size * 8) piece.dy *= -1;
        const isWhite = piece.piece === piece.piece.toUpperCase();
        ctx.fillStyle = isWhite ? "#ffffff" : "#000000";
        ctx.font = `${size * 0.7}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(piece.piece, piece.x, piece.y);
      });
      requestAnimationFrame(animateStartScreen);
    }
  }

  function startGame(player, freestyle = false) {
    if (!ctx) return;
    currentPlayer = "white";
    gameStarted = true;
    startScreen.style.display = "none";
    document.getElementById("gameContainer").classList.remove("hidden");
    if (freestyle) {
      const shuffledRow = shuffleAndMirror(["r", "n", "b", "q", "k", "b", "n", "r"]);
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
    castlingState.whiteKingMoved = false;
    castlingState.whiteRookA1Moved = false;
    castlingState.whiteRookH1Moved = false;
    castlingState.blackKingMoved = false;
    castlingState.blackRookA8Moved = false;
    castlingState.blackRookH8Moved = false;
    enPassantTarget = null;
    moveHistory = [];
    checkmateAnimation = null;
    fadingPieces = [];
    resizeCanvas();
    drawBoard();
  }

  function shuffleAndMirror(row) {
    let shuffled = [...row];
    let indices = [0, 1, 2, 3, 4, 5, 6, 7];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    let temp = [...shuffled];
    for (let i = 0; i < 8; i++) {
      shuffled[i] = temp[indices[i]];
    }
    return shuffled;
  }

  startWhiteButton.addEventListener("click", () => {
    console.log("Start White Button clicked");
    startGame("white");
  });

  startFreestyleButton.addEventListener("click", () => {
    console.log("Start Freestyle Button clicked");
    startGame("white", true);
  });

  rotateButton.addEventListener("click", () => {
    if (gameStarted) {
      rotateBoard = !rotateBoard;
      drawBoard();
    }
  });

  undoButton.addEventListener("click", () => {
    if (moveHistory.length > 0 && gameStarted && !checkmateAnimation) {
      const lastState = moveHistory.pop();
      board = lastState.board.map(row => [...row]);
      Object.assign(castlingState, lastState.castlingState);
      enPassantTarget = lastState.enPassantTarget;
      currentPlayer = lastState.currentPlayer === "white" ? "black" : "white";
      lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1].lastMove : null;
      drawBoard();
    }
  });

  restartButton.addEventListener("click", () => {
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
    castlingState.whiteKingMoved = false;
    castlingState.whiteRookA1Moved = false;
    castlingState.whiteRookH1Moved = false;
    castlingState.blackKingMoved = false;
    castlingState.blackRookA8Moved = false;
    castlingState.blackRookH8Moved = false;
    enPassantTarget = null;
    moveHistory = [];
    checkmateAnimation = null;
    fadingPieces = [];
    restartButton.classList.add("hidden");
    startScreen.style.display = "block";
    document.getElementById("gameContainer").classList.add("hidden");
    gameStarted = false;
    initStartScreen();
  });

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    size = Math.min((window.innerWidth * 0.9 - 40) / 8, 45);
    offsetX = size / 2;
    offsetY = size / 2;
    canvas.width = size * 8 + offsetX * 2;
    canvas.height = size * 8 + offsetY * 2;
    drawBoard();
  }

  window.addEventListener("resize", resizeCanvas);

  function animatePiece() {
    if (!animatingPiece || !ctx) return;

    const startX = offsetX + animatingPiece.fromX * size + size / 2;
    const startY = offsetY + animatingPiece.fromY * size + size / 2;
    const targetX = offsetX + animatingPiece.toX * size + size / 2;
    const targetY = offsetY + animatingPiece.toY * size + size / 2;
    const dx = (targetX - startX) / 20;
    const dy = (targetY - startY) / 20;

    animatingPiece.x += dx;
    animatingPiece.y += dy;

    drawBoard();
    const isWhite = animatingPiece.piece === animatingPiece.piece.toUpperCase();
    ctx.fillStyle = isWhite ? "#ffffff" : "#000000";
    ctx.font = `${size * 0.7}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pieces[animatingPiece.piece], animatingPiece.x, animatingPiece.y);

    if (Math.abs(animatingPiece.x - targetX) > 0.5 || Math.abs(animatingPiece.y - targetY) > 0.5) {
      requestAnimationFrame(animatePiece);
    } else {
      board[animatingPiece.toY][animatingPiece.toX] = animatingPiece.piece;
      board[animatingPiece.fromY][animatingPiece.fromX] = "";

      if (animatingPiece.piece.toLowerCase() === "p") {
        const isWhite = animatingPiece.piece === animatingPiece.piece.toUpperCase();
        if ((isWhite && animatingPiece.toY === 0) || (!isWhite && animatingPiece.toY === 7)) {
          board[animatingPiece.toY][animatingPiece.toX] = isWhite ? "Q" : "q";
        }
        const dx = animatingPiece.toX - animatingPiece.fromX;
        const dy = animatingPiece.toY - animatingPiece.fromY;
        const direction = isWhite ? -1 : 1;
        if (Math.abs(dx) === 1 && dy === direction && !board[animatingPiece.toY][animatingPiece.toX] && enPassantTarget && enPassantTarget.x === animatingPiece.toX && enPassantTarget.y === animatingPiece.fromY) {
          board[animatingPiece.fromY][animatingPiece.toX] = "";
        }
      }

      if (animatingPiece.piece.toLowerCase() === "r") {
        if (currentPlayer === "white") {
          if (animatingPiece.fromY === 7) {
            if (animatingPiece.fromX === 0) castlingState.whiteRookA1Moved = true;
            if (animatingPiece.fromX === 7) castlingState.whiteRookH1Moved = true;
          }
        } else {
          if (animatingPiece.fromY === 0) {
            if (animatingPiece.fromX === 0) castlingState.blackRookA8Moved = true;
            if (animatingPiece.fromX === 7) castlingState.blackRookH8Moved = true;
          }
        }
      }
      if (animatingPiece.piece.toLowerCase() === "k") {
        if (currentPlayer === "white") castlingState.whiteKingMoved = true;
        else castlingState.blackKingMoved = true;
      }

      animatingPiece = null;
      enPassantTarget = null;

      playMoveSound();

      const opponent = currentPlayer === "white" ? "black" : "white";
      if (isCheckmate(opponent)) {
        const kingPiece = opponent === "black" ? "k" : "K";
        let kingX = -1, kingY = -1;
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (board[y][x] === kingPiece) {
              kingX = x;
              kingY = y;
              break;
            }
          }
          if (kingX !== -1) break;
        }
        checkmateAnimation = { kingX, kingY, angle: 0, winner: currentPlayer === "white" ? "Weiß" : "Schwarz" };
        fadingPieces = [];
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (piece && (piece === piece.toLowerCase()) === (opponent === "black")) {
              fadingPieces.push({ x, y });
            }
          }
        }
        restartButton.classList.remove("hidden");
        animateCheckmate();
      } else if (isStalemate(opponent)) {
        checkmateAnimation = { kingX: -1, kingY: -1, angle: 0, winner: "Keiner" };
        fadingPieces = [];
        restartButton.classList.remove("hidden");
        animateCheckmate();
      } else {
        moveHistory.push({
          board: board.map(row => [...row]),
          castlingState: { ...castlingState },
          enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null,
          currentPlayer,
          lastMove
        });
        currentPlayer = opponent;
        drawBoard();
      }
    }
  }

  function animateCheckmate() {
    if (!checkmateAnimation || !ctx) return;

    checkmateAnimation.angle += 5;
    if (checkmateAnimation.angle < 90) {
      drawBoard();
      requestAnimationFrame(animateCheckmate);
    } else {
      playCheckmateSound();
      fadingPieces = [];
      drawBoard();
    }
  }

  canvas.addEventListener("mousedown", (event) => handleStart(event.clientX, event.clientY));
  canvas.addEventListener("mousemove", (event) => handleMove(event.clientX, event.clientY));
  canvas.addEventListener("mouseup", (event) => handleEnd(event.clientX, event.clientY));

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    handleStart(touch.clientX, touch.clientY);
  });

  canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    handleMove(touch.clientX, touch.clientY);
  });

  canvas.addEventListener("touchend", (event) => {
    event.preventDefault();
    const touch = event.changedTouches[0];
    handleEnd(touch.clientX, touch.clientY);
  });

  function handleStart(clientX, clientY) {
    if (!gameStarted || checkmateAnimation || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x = Math.floor((clientX - rect.left - offsetX) / size);
    let y = Math.floor((clientY - rect.top - offsetY) / size);

    if (rotateBoard) {
      x = 7 - x;
      y = 7 - y;
    }

    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const piece = board[y][x];
      if (piece && (piece === piece.toUpperCase()) === (currentPlayer === "white")) {
        selected = { x, y, piece };
        legalMoves = getLegalMoves(piece, x, y);
        drawBoard();
        const isWhite = selected.piece === selected.piece.toUpperCase();
        ctx.fillStyle = isWhite ? "#ffffff" : "#000000";
        ctx.font = `${size * 0.7}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pieces[selected.piece], clientX - rect.left, clientY - rect.top);
      }
    }
  }

  function handleMove(clientX, clientY) {
    if (!gameStarted || checkmateAnimation || !selected || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    selected.offsetX = clientX - rect.left;
    selected.offsetY = clientY - rect.top;
    drawBoard();
    const isWhite = selected.piece === selected.piece.toUpperCase();
    ctx.fillStyle = isWhite ? "#ffffff" : "#000000";
    ctx.font = `${size * 0.7}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pieces[selected.piece], selected.offsetX, selected.offsetY);
  }

  function handleEnd(clientX, clientY) {
    if (!gameStarted || checkmateAnimation || !selected || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    let toX = Math.floor((clientX - rect.left - offsetX) / size);
    let toY = Math.floor((clientY - rect.top - offsetY) / size);

    if (rotateBoard) {
      toX = 7 - toX;
      toY = 7 - toY;
    }

    legalMoves = [];

    if (toX >= 0 && toX < 8 && toY >= 0 && toY < 8) {
      if (selected.piece.toLowerCase() === "k" && selected.x === 4 && Math.abs(toX - selected.x) === 2 && toY === selected.y) {
        const side = toX === 6 ? "short" : "long";
        if (canCastle(currentPlayer, side)) {
          performCastling(currentPlayer, side);
          drawBoard();
          return;
        }
      }

      if (isLegalMove(selected.piece, selected.x, selected.y, toX, toY)) {
        lastMove = { fromX: selected.x, fromY: selected.y, toX, toY };
        animatingPiece = {
          piece: selected.piece,
          fromX: selected.x,
          fromY: selected.y,
          toX: toX,
          toY: toY,
          x: offsetX + selected.x * size + size / 2,
          y: offsetY + selected.y * size + size / 2
        };
        animatePiece();
      } else {
        console.log("Illegal move attempted");
        illegalMoveFields = { startX: selected.x, startY: selected.y, toX, toY };
        drawBoard();
        setTimeout(() => {
          illegalMoveFields = null;
          drawBoard();
        }, 500);
      }
    } else {
      console.log("Move outside board");
      illegalMoveFields = { startX: selected.x, startY: selected.y, toX: selected.x, toY: selected.y };
      drawBoard();
      setTimeout(() => {
        illegalMoveFields = null;
        drawBoard();
      }, 500);
    }
    selected = null;
  }

  resizeCanvas();
  initStartScreen();
});
