    function startGame(freestyle = false) {
        console.log("startGame called with freestyle:", freestyle);
        try {
            console.log("Setting initial game state...");
            currentPlayer = "white";
            gameStarted = true;
            gameOver = false;
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
            winnerText = "";
            fullscreenMode = false;
            whiteTime = CONFIG.initialTime;
            blackTime = CONFIG.initialTime;

            console.log("Updating DOM elements visibility...");
            document.body.classList.remove("fullscreen");
            document.body.classList.add("darkmode");
            fullscreenButton.style.display = "block";
            exitFullscreenButton.style.display = "none";
            closeFullscreenButton.style.display = "none";
            moveList.innerHTML = "";
            startScreen.style.display = "none";
            gameContainer.style.display = "flex";
            gameContainer.style.visibility = "visible";
            gameContainer.style.opacity = "1";
            restartButton.classList.remove("hidden");
            darkmodeToggleButton.style.display = "block";
            console.log("startScreen display:", startScreen.style.display);
            console.log("gameContainer display:", gameContainer.style.display);

            console.log("Setting up the board...");
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

            console.log("Updating king positions...");
            updateKingPositions();

            console.log("Resizing canvas...");
            resizeCanvas();

            console.log("Drawing board with initial design...");
            drawBoard();

            console.log("Starting timer...");
            startTimer();

            console.log("Initializing dark mode toggle...");
            initializeDarkmodeToggle();

            console.log("Updating turn display...");
            updateTurnDisplay();

            console.log("startGame completed successfully");
        } catch (error) {
            console.error("Error in startGame:", error);
            alert("Failed to start the game. Check the console for details.");
            throw error;
        }
    }

    function shuffleArray(array) {
        console.log("shuffleArray called");
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        console.log("shuffleArray completed");
        return shuffled;
    }

    function updateKingPositions(tempBoard = board) {
        console.log("updateKingPositions called");
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = tempBoard[y][x];
                if (piece === "k") kingPositions.black = { x, y };
                if (piece === "K") kingPositions.white = { x, y };
            }
        }
        console.log("King positions updated:", kingPositions);
        console.log("updateKingPositions completed");
    }

    function isInCheck(color, tempBoard = board, tempKingPos = null) {
        console.log("isInCheck called for color:", color);
        const kingPos = tempKingPos || (color === "white" ? kingPositions.white : kingPositions.black);
        if (!kingPos) {
            console.log("No king position found for", color);
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
                        console.log("King in check at", kingPos, "by", piece, "at", x, y);
                        return true;
                    }
                }
            }
        }
        console.log("isInCheck completed, no check found");
        return false;
    }

    function updateCheckStatus() {
        console.log("updateCheckStatus called");
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
        console.log("updateCheckStatus completed");
    }

    function getLegalMovesForCheck(x, y, tempBoard = board) {
        console.log("getLegalMovesForCheck called for", x, y);
        const moves = [];
        const piece = tempBoard[y][x];
        if (!piece) {
            console.log("No piece at", x, y);
            return moves;
        }
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
        console.log("getLegalMovesForCheck completed with moves:", moves);
        return moves;
    }

    function getLegalMoves(x, y, tempBoard = board) {
        console.log("getLegalMoves called for", x, y);
        const moves = [];
        const piece = tempBoard[y][x];
        if (!piece) {
            console.log("No piece at", x, y);
            return moves;
        }
        const isWhite = piece === piece.toUpperCase();
        if ((isWhite && currentPlayer !== "white") || (!isWhite && currentPlayer !== "black")) {
            console.log("Not player's turn:", currentPlayer);
            return moves;
        }
        if (piece.toLowerCase() === "p") {
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            if (y + direction >= 0 && y + direction < 8 && !tempBoard[y + direction][x]) {
                moves.push({ toX: x, toY: y + direction, promotion: y + direction === (isWhite ? 0 : 7) });
                if (y === startRow && !tempBoard[y + 2 * direction][x] && !tempBoard[y + direction][x]) {
                    moves.push({ toX: x, toY: y + 2 * direction });
                }
            }
            const attackDirs = [-1, 1];
            attackDirs.forEach((dx) => {
                const newX = x + dx;
                const newY = y + direction;
                if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                    const targetPiece = tempBoard[newY][newX];
                    if (targetPiece && (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                        moves.push({ toX: newX, toY: newY, promotion: newY === (isWhite ? 0 : 7) });
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
                    const targetPiece = tempBoard[newY][newX];
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
                    const targetPiece = tempBoard[newY][newX];
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
                    const targetPiece = tempBoard[newY][newX];
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
                    const targetPiece = tempBoard[newY][newX];
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
                    const targetPiece = tempBoard[newY][newX];
                    if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                        moves.push({ toX: newX, toY: newY });
                    }
                }
            });
            if (isWhite && y === 7 && x === 4) {
                if (castlingAvailability.white.kingside && !tempBoard[7][5] && !tempBoard[7][6] && tempBoard[7][7] === "R" && !isInCheck("white") && !moveHistory.some(m => m.piece === "K" || (m.piece === "R" && m.fromX === 7 && m.fromY === 7))) {
                    let canCastle = true;
                    for (let i = 4; i <= 6; i++) {
                        const tempBoardCopy = tempBoard.map(row => [...row]);
                        if (i > 4) {
                            tempBoardCopy[7][i] = "K";
                            tempBoardCopy[7][i - 1] = "";
                        }
                        const tempKingPos = { x: i, y: 7 };
                        if (isInCheck("white", tempBoardCopy, tempKingPos)) {
                            canCastle = false;
                            break;
                        }
                    }
                    if (canCastle) moves.push({ toX: 6, toY: 7, castling: "kingside" });
                }
                if (castlingAvailability.white.queenside && !tempBoard[7][1] && !tempBoard[7][2] && !tempBoard[7][3] && tempBoard[7][0] === "R" && !isInCheck("white") && !moveHistory.some(m => m.piece === "K" || (m.piece === "R" && m.fromX === 0 && m.fromY === 7))) {
                    let canCastle = true;
                    for (let i = 4; i >= 2; i--) {
                        const tempBoardCopy = tempBoard.map(row => [...row]);
                        if (i < 4) {
                            tempBoardCopy[7][i] = "K";
                            tempBoardCopy[7][i + 1] = "";
                        }
                        const tempKingPos = { x: i, y: 7 };
                        if (isInCheck("white", tempBoardCopy, tempKingPos)) {
                            canCastle = false;
                            break;
                        }
                    }
                    if (canCastle) moves.push({ toX: 2, toY: 7, castling: "queenside" });
                }
            } else if (!isWhite && y === 0 && x === 4) {
                if (castlingAvailability.black.kingside && !tempBoard[0][5] && !tempBoard[0][6] && tempBoard[0][7] === "r" && !isInCheck("black") && !moveHistory.some(m => m.piece === "k" || (m.piece === "r" && m.fromX === 7 && m.fromY === 0))) {
                    let canCastle = true;
                    for (let i = 4; i <= 6; i++) {
                        const tempBoardCopy = tempBoard.map(row => [...row]);
                        if (i > 4) {
                            tempBoardCopy[0][i] = "k";
                            tempBoardCopy[0][i - 1] = "";
                        }
                        const tempKingPos = { x: i, y: 0 };
                        if (isInCheck("black", tempBoardCopy, tempKingPos)) {
                            canCastle = false;
                            break;
                        }
                    }
                    if (canCastle) moves.push({ toX: 6, toY: 0, castling: "kingside" });
                }
                if (castlingAvailability.black.queenside && !tempBoard[0][1] && !tempBoard[0][2] && !tempBoard[0][3] && tempBoard[0][0] === "r" && !isInCheck("black") && !moveHistory.some(m => m.piece === "k" || (m.piece === "r" && m.fromX === 0 && m.fromY === 0))) {
                    let canCastle = true;
                    for (let i = 4; i >= 2; i--) {
                        const tempBoardCopy = tempBoard.map(row => [...row]);
                        if (i < 4) {
                            tempBoardCopy[0][i] = "k";
                            tempBoardCopy[0][i + 1] = "";
                        }
                        const tempKingPos = { x: i, y: 0 };
                        if (isInCheck("black", tempBoardCopy, tempKingPos)) {
                            canCastle = false;
                            break;
                        }
                    }
                    if (canCastle) moves.push({ toX: 2, toY: 0, castling: "queenside" });
                }
            }
        }
        const validMoves = [];
        for (const move of moves) {
            const tempBoardCopy = tempBoard.map(row => [...row]);
            tempBoardCopy[move.toY][move.toX] = piece;
            tempBoardCopy[y][x] = "";
            if (move.castling) {
                if (move.castling === "kingside") {
                    tempBoardCopy[move.toY][move.toX - 1] = isWhite ? "R" : "r";
                    tempBoardCopy[move.toY][7] = "";
                } else if (move.castling === "queenside") {
                    tempBoardCopy[move.toY][move.toX + 1] = isWhite ? "R" : "r";
                    tempBoardCopy[move.toY][0] = "";
                }
            }
            updateKingPositions(tempBoardCopy);
            if (!isInCheck(isWhite ? "white" : "black", tempBoardCopy)) {
                validMoves.push(move);
            }
            updateKingPositions(tempBoard);
        }
        console.log("Legal moves for", piece, "at", x, y, ":", validMoves);
        return validMoves;
    }

    function getMoveNotation(fromX, fromY, toX, toY) {
        console.log("getMoveNotation called");
        const fileFrom = String.fromCharCode(97 + fromX);
        const rankFrom = 8 - fromY;
        const fileTo = String.fromCharCode(97 + toX);
        const rankTo = 8 - toY;
        const piece = board[fromY][fromX]?.toLowerCase() || "";
        const pieceSymbol = piece === "p" ? "" : piece.toUpperCase();
        const simpleNotation = pieceSymbol === "" ? `${fileTo}${rankTo}` : `${pieceSymbol}${fileTo}${rankTo}`;
        const fullNotation = `${pieceSymbol}${fileFrom}${rankFrom}-${fileTo}${rankTo}`;
        console.log("getMoveNotation completed");
        return { simple: simpleNotation, full: fullNotation };
    }

    function updateMoveHistory() {
        console.log("updateMoveHistory called");
        if (!lastMove) {
            console.log("No last move to update");
            return;
        }
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
            if (index === movePairs.length - 1) {
                moveItem.classList.add("last-move");
            }
            moveList.appendChild(moveItem);
        });
        if (currentPlayer === "black") moveCount++;
        moveList.scrollTop = moveList.scrollHeight;
        updateOpeningDisplay();
        console.log("updateMoveHistory completed");
    }

    function showPromotionChoice(x, y, isWhite) {
        console.log("showPromotionChoice called");
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
        const choices = isWhite ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"];
        choices.forEach((p) => {
            const button = document.createElement("button");
            button.textContent = pieces[p];
            button.className = "promotion-button";
            button.addEventListener("click", () => {
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
        console.log("showPromotionChoice completed");
    }

    function checkGameOver() {
        console.log("checkGameOver called");
        let hasMoves = false;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = board[y][x];
                if (piece && ((piece === piece.toUpperCase() && currentPlayer === "white") || (piece !== piece.toUpperCase() && currentPlayer === "black"))) {
                    const moves = getLegalMoves(x, y);
                    if (moves.length > 0) {
                        hasMoves = true;
                        break;
                    }
                }
            }
            if (hasMoves) break;
        }
        if (!hasMoves) {
            const isCheckmate = isWhiteInCheck || isBlackInCheck;
            if (isCheckmate) {
                gameOver = true;
                winnerText = isWhiteInCheck ? "Black wins!" : "White wins!";
                if (soundEnabled) {
                    const audio = new Audio(SOUND.checkmateSound);
                    audio.play().catch((e) => console.error("Checkmate audio play failed:", e));
                }
            } else {
                gameOver = true;
                winnerText = "Draw (Stalemate)!";
            }
        }
        console.log("checkGameOver completed");
    }

    function handleCanvasClick(event) {
        console.log("handleCanvasClick called");
        if (!gameStarted || gameOver) {
            console.log("Game not started or game over");
            return;
        }
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        if (event.type === "touchstart" || event.type === "touchmove") {
            clientX = event.touches[0]?.clientX;
            clientY = event.touches[0]?.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        if (!clientX || !clientY) {
            console.error("Client coordinates not found.");
            return;
        }
        const adjustedX = (clientX - rect.left) * scaleX;
        const adjustedY = (clientY - rect.top) * scaleY;
        const x = Math.floor((adjustedX - offsetX) / size);
        const y = Math.floor((adjustedY - offsetY) / size);
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
            selectedPiece = null;
            legalMoves = [];
            drawBoard();
            console.log("Click outside board");
            return;
        }
        const piece = board[boardY][boardX];
        const isWhitePiece = piece && piece === piece.toUpperCase();
        if (!selectedPiece) {
            if (piece && (isWhitePiece === (currentPlayer === "white"))) {
                selectedPiece = { x: boardX, y: boardY, piece };
                legalMoves = getLegalMoves(boardX, boardY);
                if (legalMoves.length === 0) {
                    selectedPiece = null;
                }
                drawBoard();
            }
        } else {
            const move = legalMoves.find((m) => m.toX === boardX && m.toY === boardY);
            if (move) {
                const newBoard = board.map(row => [...row]);
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
                        board: board.map(row => [...row]),
                        currentPlayer,
                        moveCount,
                        castlingAvailability: JSON.parse(JSON.stringify(castlingAvailability)),
                        isWhiteInCheck,
                        isBlackInCheck,
                        whiteTime,
                        blackTime
                    });
                } else {
                    board = newBoard;
                    lastMove = { fromX: selectedPiece.x, fromY: selectedPiece.y, toX: boardX, toY: boardY };
                    updateKingPositions();
                    currentPlayer = currentPlayer === "white" ? "black" : "white";
                    selectedPiece = null;
                    legalMoves = [];
                    moveHistory.push({
                        board: board.map(row => [...row]),
                        currentPlayer,
                        moveCount,
                        castlingAvailability: JSON.parse(JSON.stringify(castlingAvailability)),
                        isWhiteInCheck,
                        isBlackInCheck,
                        whiteTime,
                        blackTime
                    });
                    updateMoveHistory();
                    updateCheckStatus();
                    checkGameOver();
                    if (soundEnabled) {
                        const audio = new Audio(isCapture ? SOUND.captureSound : SOUND.moveSound);
                        audio.play().catch((e) => console.error("Move audio play failed:", e));
                    }
                }
                drawBoard();
                updateTurnDisplay();
            } else {
                const clickedPiece = board[boardY][boardX];
                if (clickedPiece && (clickedPiece === clickedPiece.toUpperCase()) === (currentPlayer === "white")) {
                    selectedPiece = { x: boardX, y: boardY, piece: clickedPiece };
                    legalMoves = getLegalMoves(boardX, boardY);
                    if (legalMoves.length === 0) {
                        selectedPiece = null;
                    }
                } else {
                    selectedPiece = null;
                    legalMoves = [];
                }
                drawBoard();
            }
        }
        console.log("handleCanvasClick completed");
    }

    function undoMove() {
        console.log("undoMove called");
        if (moveHistory.length === 0) {
            console.log("No moves to undo");
            return;
        }
        const lastState = moveHistory.pop();
        board = lastState.board;
        currentPlayer = lastState.currentPlayer;
        moveCount = lastState.moveCount;
        castlingAvailability = lastState.castlingAvailability;
        isWhiteInCheck = lastState.isWhiteInCheck;
        isBlackInCheck = lastState.isBlackInCheck;
        whiteTime = lastState.whiteTime;
        blackTime = lastState.blackTime;

        if (currentPlayer === "white") {
            whiteTime = Math.max(0, whiteTime - CONFIG.undoPenalty);
        } else {
            blackTime = Math.max(0, blackTime - CONFIG.undoPenalty);
        }

        if (moveNotations.length > 0) {
            moveNotations.pop();
            if (currentPlayer === "white") {
                moveCount--;
                if (moveNotations.length > 0) {
                    moveNotations.pop();
                }
            }
        }

        selectedPiece = null;
        legalMoves = [];
        lastMove = null;
        updateKingPositions();
        updateCheckStatus();
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
            if (index === movePairs.length - 1) {
                moveItem.classList.add("last-move");
            }
            moveList.appendChild(moveItem);
        });
        moveList.scrollTop = moveList.scrollHeight;
        updateOpeningDisplay();
        updateTurnDisplay();
        drawBoard();
        console.log("undoMove completed");
    }

    startButton.addEventListener("click", () => startGame(false));
    startFreestyleButton.addEventListener("click", () => startGame(true));
    rotateButton.addEventListener("click", () => {
        rotateBoard = !rotateBoard;
        drawBoard();
    });
    smartphoneModeButton.addEventListener("click", () => {
        smartphoneMode = !smartphoneMode;
        smartphoneModeButton.textContent = smartphoneMode ? "Disable Smartphone Mode" : "Enable Smartphone Mode";
        drawBoard();
    });
    soundToggleButton.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggleButton.textContent = soundEnabled ? "Disable Sound" : "Enable Sound";
    });
    undoButton.addEventListener("click", undoMove);
    restartButton.addEventListener("click", () => {
        startScreen.style.display = "block";
        gameContainer.style.display = "none";
        restartButton.classList.add("hidden");
        gameStarted = false;
        if (timerInterval) clearInterval(timerInterval);
    });
    designButton.addEventListener("click", () => {
        currentDesign = currentDesign % Object.keys(designs).length + 1;
        window.updateBoardColors(currentDesign);
    });
    fullscreenButton.addEventListener("click", toggleFullscreenMode);
    exitFullscreenButton.addEventListener("click", toggleFullscreenMode);
    closeFullscreenButton.addEventListener("click", toggleFullscreenMode);

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchstart", handleCanvasClick, { passive: false });

    window.addEventListener("resize", debouncedResizeCanvas);
    window.addEventListener("orientationchange", () => {
        setTimeout(debouncedResizeCanvas, 100);
    });

    resizeCanvas();
    console.log("Event listeners and initial setup completed");
});
