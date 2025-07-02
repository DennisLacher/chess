document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded and DOMContentLoaded event fired at", new Date().toISOString());

    const CONFIG = {
        defaultBoardSize: 60,
        minBoardSize: 40,
        offset: 0.1,
        initialTime: 600,
        undoPenalty: 60,
    };

    const SOUND = {
        enabledByDefault: true,
        moveSound: "move.mp3",
        captureSound: "clap.mp3",
        checkSound: "check.mp3",
        checkmateSound: "checkmate.mp3",
    };

    const canvas = document.getElementById("gameBoard");
    const startScreen = document.getElementById("startScreen");
    const startChessButton = document.getElementById("startChessButton");
    const startLudoButton = document.getElementById("startLudoButton");
    const startFreestyleButton = document.getElementById("startFreestyleButton");
    const gameContainer = document.getElementById("gameContainer");
    const turnDisplay = document.getElementById("turnDisplay");
    const rollDiceButton = document.getElementById("rollDiceButton");
    const rotateButton = document.getElementById("rotateButton");
    const smartphoneModeButton = document.getElementById("smartphoneModeButton");
    const soundToggleButton = document.getElementById("soundToggleButton");
    const undoButton = document.getElementById("undoButton");
    const restartButton = document.getElementById("restartButton");
    const designButton = document.getElementById("designButton");
    const darkmodeToggleButton = document.getElementById("darkmodeToggleButton");
    const fullscreenButton = document.getElementById("fullscreenButton");
    const closeFullscreenButton = document.getElementById("closeFullscreenButton");
    const diceDisplay = document.getElementById("diceDisplay");
    const moveList = document.getElementById("moveList");

    const missingElements = [];
    if (!canvas) missingElements.push("canvas (id='gameBoard')");
    if (!startScreen) missingElements.push("startScreen (id='startScreen')");
    if (!startChessButton) missingElements.push("startChessButton (id='startChessButton')");
    if (!startLudoButton) missingElements.push("startLudoButton (id='startLudoButton')");
    if (!startFreestyleButton) missingElements.push("startFreestyleButton (id='startFreestyleButton')");
    if (!gameContainer) missingElements.push("gameContainer (id='gameContainer')");
    if (!turnDisplay) missingElements.push("turnDisplay (id='turnDisplay')");
    if (!rollDiceButton) missingElements.push("rollDiceButton (id='rollDiceButton')");
    if (!rotateButton) missingElements.push("rotateButton (id='rotateButton')");
    if (!smartphoneModeButton) missingElements.push("smartphoneModeButton (id='smartphoneModeButton')");
    if (!soundToggleButton) missingElements.push("soundToggleButton (id='soundToggleButton')");
    if (!undoButton) missingElements.push("undoButton (id='undoButton')");
    if (!restartButton) missingElements.push("restartButton (id='restartButton')");
    if (!designButton) missingElements.push("designButton (id='designButton')");
    if (!darkmodeToggleButton) missingElements.push("darkmodeToggleButton (id='darkmodeToggleButton')");
    if (!fullscreenButton) missingElements.push("fullscreenButton (id='fullscreenButton')");
    if (!closeFullscreenButton) missingElements.push("closeFullscreenButton (id='closeFullscreenButton')");
    if (!diceDisplay) missingElements.push("diceDisplay (id='diceDisplay')");
    if (!moveList) missingElements.push("moveList (id='moveList')");
    if (missingElements.length > 0) {
        console.error("Missing DOM elements:", missingElements.join(", "));
        alert("Error: Missing DOM elements: " + missingElements.join(", ") + ". Please check the HTML and consoleelder: console.log("Initial design and colors:", currentDesign, window.boardColors);

    window.updateBoardColors = function (designNum) {
        if (designs[designNum]) {
            currentDesign = designNum;
            window.boardColors = designs[currentDesign];
            console.log("Updated board colors to design", currentDesign, window.boardColors);
            if (gameStarted) drawBoard();
        } else {
            console.error("Invalid design number:", designNum);
        }
    };

    const pieces = {
        r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
        R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
        red: "🔴", yellow: "🟡"
    };

    const openings = [
        { name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], blackResponses: ["Bc5", "Nf6"] },
        { name: "Sicilian Defense", moves: ["e4", "c5"], blackResponses: ["Nc6", "e6"] },
        { name: "King's Gambit", moves: ["e4", "e5", "f4"], blackResponses: ["exf4", "d5"] },
        { name: "Ruy Lopez (Spanish Opening)", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], blackResponses: ["a6", "Nf6"] },
        { name: "French Defense", moves: ["e4", "e6"], blackResponses: ["d5", "c5"] },
        { name: "Queen's Gambit", moves: ["d4", "d5", "c4"], blackResponses: ["e6", "Nf6"] },
        { name: "English Opening", moves: ["c4"], blackResponses: ["e5", "Nf6"] }
    ];

    // Ludo board setup (40 fields, home and goal fields for red and yellow)
    let ludoBoard = Array(40).fill(null); // Main path (0-39)
    let redHome = Array(4).fill("red"); // Red's home pieces (R1, R2, R3, R4)
    let yellowHome = Array(4).fill("yellow"); // Yellow's home pieces (Y1, Y2, Y3, Y4)
    let redGoal = Array(4).fill(null); // Red's goal triangle
    let yellowGoal = Array(4).fill(null); // Yellow's goal triangle

    // Ludo field positions for drawing (simplified coordinates for an 11x11 grid)
    const fieldPositions = [
        { x: 5, y: 10 }, { x: 5, y: 9 }, { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 },
        { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 }, { x: 0, y: 7 }, { x: 0, y: 6 },
        { x: 0, y: 5 }, { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
        { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 },
        { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
        { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 },
        { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 }, { x: 9, y: 8 },
        { x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }, { x: 6, y: 9 }, { x: 6, y: 10 }
    ];
    const redStartField = 0;
    const yellowStartField = 20;
    const redGoalEntry = 39;
    const yellowGoalEntry = 19;
    const redHomePositions = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }
    ];
    const yellowHomePositions = [
        { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
    ];
    const redGoalPositions = [
        { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }
    ];
    const yellowGoalPositions = [
        { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 4 }, { x: 6, y: 4 }
    ];

    let chessBoard = [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]
    ];

    let kingPositions = { white: null, black: null };
    let castlingAvailability = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
    let isWhiteInCheck = false;
    let isBlackInCheck = false;

    startScreen.style.display = "block";
    gameContainer.style.display = "none";
    restartButton.classList.add("hidden");
    darkmodeToggleButton.style.display = "none";
    closeFullscreenButton.style.display = "none";

    function initializeDarkmodeToggle() {
        if (darkmodeToggleButton && gameStarted) {
            darkmodeToggleButton.textContent = isDarkmode ? "Light Mode" : "Dark Mode";
            darkmodeToggleButton.addEventListener("click", toggleDarkmodeHandler);
        } else if (darkmodeToggleButton && !gameStarted) {
            darkmodeToggleButton.style.display = "none";
        }
    }

    function toggleDarkmodeHandler() {
        isDarkmode = !isDarkmode;
        document.body.classList.toggle("darkmode", isDarkmode);
        darkmodeToggleButton.textContent = isDarkmode ? "Light Mode" : "Dark Mode";
        localStorage.setItem("darkmode", isDarkmode);
        window.updateBoardColors(currentDesign);
        drawBoard();
    }

    function updateTurnDisplay() {
        if (gameType === "ludo") {
            turnDisplay.textContent = gameOver ? winnerText : `${currentPlayer === "red" ? "Rot" : "Gelb"} ist dran`;
        } else {
            turnDisplay.textContent = gameOver ? winnerText : `${currentPlayer === "white" ? "Weiß" : "Schwarz"} ist dran`;
        }
    }

    function updateChessOpeningDisplay() {
        const moves = moveNotations.map((m) => m.notation).filter((n) => !n.includes("-"));
        let moveText = `Zug: ${moves[moves.length - 1] || "Keiner"}`;
        let openingText = "";
        if (moves.length > 0) {
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
                    openingText = `${opening.name}`;
                    if (moves.length >= openingMoves.length && opening.blackResponses.length > 0) {
                        openingText += ` (Schwarz: ${opening.blackResponses.join(" oder ")})`;
                    }
                    break;
                }
            }
        }
        const timeText = `Weiß: ${formatTime(whiteTime)} | Schwarz: ${formatTime(blackTime)}`;
        diceDisplay.textContent = `${moveText}${openingText ? " | " + openingText : ""} | ${timeText}`;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (gameOver) {
                clearInterval(timerInterval);
                return;
            }
            if (gameType === "ludo") {
                if (currentPlayer === "red") {
                    redTime--;
                    if (redTime <= 0) {
                        redTime = 0;
                        gameOver = true;
                        winnerText = "Gelb gewinnt (Zeit abgelaufen)!";
                        clearInterval(timerInterval);
                    }
                } else {
                    yellowTime--;
                    if (yellowTime <= 0) {
                        yellowTime = 0;
                        gameOver = true;
                        winnerText = "Rot gewinnt (Zeit abgelaufen)!";
                        clearInterval(timerInterval);
                    }
                }
                diceDisplay.textContent = `Würfel: ${diceRoll || "-"} | Rot: ${formatTime(redTime)} | Gelb: ${formatTime(yellowTime)}`;
            } else {
                if (currentPlayer === "white") {
                    whiteTime--;
                    if (whiteTime <= 0) {
                        whiteTime = 0;
                        gameOver = true;
                        winnerText = "Schwarz gewinnt (Zeit abgelaufen)!";
                        clearInterval(timerInterval);
                    }
                } else {
                    blackTime--;
                    if (blackTime <= 0) {
                        blackTime = 0;
                        gameOver = true;
                        winnerText = "Weiß gewinnt (Zeit abgelaufen)!";
                        clearInterval(timerInterval);
                    }
                }
                updateChessOpeningDisplay();
            }
            updateTurnDisplay();
            drawBoard();
        }, 1000);
    }

    function drawLudoBoard() {
        const gridSize = 11;
        const expectedWidth = size * gridSize + (fullscreenMode ? 0 : offsetX * 2);
        const expectedHeight = size * gridSize + (fullscreenMode ? 0 : offsetY * 2);
        canvas.width = expectedWidth;
        canvas.height = expectedHeight;
        canvas.style.width = `${expectedWidth}px`;
        canvas.style.height = `${expectedHeight}px`;

        const xPosBase = fullscreenMode ? 0 : offsetX;
        const yPosBase = fullscreenMode ? 0 : offsetY;

        ctx.fillStyle = isDarkmode ? "#444" : "#ddd";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                ctx.fillStyle = window.boardColors.light;
                const fieldIdx = fieldPositions.findIndex(pos => pos.x === x && pos.y === y);
                if (fieldIdx !== -1) {
                    ctx.fillStyle = window.boardColors.dark;
                    if (fieldIdx === redStartField) ctx.fillStyle = "#ff0000";
                    if (fieldIdx === yellowStartField) ctx.fillStyle = "#ffff00";
                } else if (redHomePositions.some(pos => pos.x === x && pos.y === y)) {
                    ctx.fillStyle = "#ff0000";
                } else if (yellowHomePositions.some(pos => pos.x === x && pos.y === y)) {
                    ctx.fillStyle = "#ffff00";
                } else if (redGoalPositions.some(pos => pos.x === x && pos.y === y) || yellowGoalPositions.some(pos => pos.x === x && pos.y === y)) {
                    ctx.fillStyle = "#888";
                }

                const xPos = xPosBase + x * size;
                const yPos = yPosBase + y * size;
                ctx.fillRect(xPos, yPos, size, size);

                if (fieldIdx !== -1 && ludoBoard[fieldIdx]) {
                    ctx.fillStyle = ludoBoard[fieldIdx].startsWith("red") ? "#ff0000" : "#ffff00";
                    ctx.beginPath();
                    ctx.arc(xPos + size / 2, yPos + size / 2, size * 0.4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }

        redHome.forEach((piece, i) => {
            if (piece) {
                const pos = redHomePositions[i];
                ctx.fillStyle = "#ff0000";
                ctx.beginPath();
                ctx.arc(xPosBase + pos.x * size + size / 2, yPosBase + pos.y * size + size / 2, size * 0.4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        yellowHome.forEach((piece, i) => {
            if (piece) {
                const pos = yellowHomePositions[i];
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(xPosBase + pos.x * size + size / 2, yPosBase + pos.y * size + size / 2, size * 0.4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        redGoal.forEach((piece, i) => {
            if (piece) {
                const pos = redGoalPositions[i];
                ctx.fillStyle = "#ff0000";
                ctx.beginPath();
                ctx.arc(xPosBase + pos.x * size + size / 2, yPosBase + pos.y * size + size / 2, size * 0.4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        yellowGoal.forEach((piece, i) => {
            if (piece) {
                const pos = yellowGoalPositions[i];
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(xPosBase + pos.x * size + size / 2, yPosBase + pos.y * size + size / 2, size * 0.4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        if (selectedPiece) {
            const pos = selectedPiece.pos;
            ctx.fillStyle = isDarkmode ? "#505050" : "#c0c0c0";
            ctx.fillRect(xPosBase + pos.x * size, yPosBase + pos.y * size, size, size);
        }

        legalMoves.forEach(move => {
            const pos = move.pos;
            ctx.fillStyle = isDarkmode ? "#a0a0a0" : "#808080";
            ctx.beginPath();
            ctx.arc(xPosBase + pos.x * size + size / 2, yPosBase + pos.y * size + size / 2, size * 0.1, 0, 2 * Math.PI);
            ctx.fill();
        });

        ctx.fillStyle = isDarkmode ? "#e0e0e0" : "#333";
        ctx.font = `${size * 0.25}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < gridSize; i++) {
            ctx.fillText(i + 1, xPosBase - size * 0.5, yPosBase + i * size + size / 2);
            ctx.fillText(String.fromCharCode(97 + i), xPosBase + i * size + size / 2, yPosBase + gridSize * size + size * 0.5);
        }

        if (gameOver) {
            diceDisplay.textContent = winnerText;
        } else {
            diceDisplay.textContent = `Würfel: ${diceRoll || "-"} | Rot: ${formatTime(redTime)} | Gelb: ${formatTime(yellowTime)}`;
        }
    }

    function drawChessBoard() {
        const extraSpace = fullscreenMode ? size * 0.7 : size * 0.7;
        const expectedWidth = size * 8 + (fullscreenMode ? 0 : offsetX * 2);
        const expectedHeight = size * 8 + (fullscreenMode ? 0 : offsetY * 2) + extraSpace;
        canvas.width = expectedWidth;
        canvas.height = expectedHeight;
        canvas.style.width = `${expectedWidth}px`;
        canvas.style.height = `${expectedHeight}px`;

        let effectiveRotation = rotateBoard;
        if (smartphoneMode) {
            effectiveRotation = currentPlayer === "black";
        }

        const xPosBase = fullscreenMode ? 0 : offsetX;
        const y позиции = fullscreenMode ? 0 : offsetY;

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const displayY = effectiveRotation ? 7 - y : y;
                const displayX = effectiveRotation ? 7 - x : x;
                ctx.fillStyle = (displayX + displayY) % 2 === 0 ? window.boardColors.light : window.boardColors.dark;

                if (lastMove && ((lastMove.fromX === x && lastMove.fromY === y) || (lastMove.toX === x && lastMove.toY === y))) {
                    ctx.fillStyle = isDarkmode ? "#808080" : "#f0f0f0";
                }

                if (selectedPiece && selectedPiece.x === x && selectedPiece.y === y) {
                    ctx.fillStyle = isDarkmode ? "#505050" : "#c0c0c0";
                }

                const legalMove = legalMoves.find((move) => move.toX === x && move.toY === y);
                if (legalMove) {
                    const targetPiece = chessBoard[y][x];
                    const isCapture = targetPiece && (targetPiece === targetPiece.toUpperCase()) !== (selectedPiece.piece === selectedPiece.piece.toUpperCase());
                    ctx.fillStyle = isCapture ? (isDarkmode ? "#cc6666" : "#ffcccc") : (isDarkmode ? "#505050" : "#c0c0c0");
                }

                const xPos = xPosBase + displayX * size;
                const yPos = yPosBase + displayY * size;
                ctx.fillRect(xPos, yPos, size, size);

                if (legalMove && !((chessBoard[y][x] && (chessBoard[y][x] === chessBoard[y][x].toUpperCase()) !== (selectedPiece.piece === selectedPiece.piece.toUpperCase())))) {
                    ctx.fillStyle = isDarkmode ? "#a0a0a0" : "#808080";
                    const dotRadius = size * 0.1;
                    const centerX = xPos + size / 2;
                    const centerY = yPos + size / 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
                    ctx.fill();
                }

                if ((isWhiteInCheck && kingPositions.white && kingPositions.white.x === x && kingPositions.white.y === y) ||
                    (isBlackInCheck && kingPositions.black && kingPositions.black.x === x && kingPositions.black.y === y)) {
                    ctx.fillStyle = gameOver ? "#a94442" : "#d9534f";
                    ctx.fillRect(xPos, yPos, size, size);
                }

                const piece = chessBoard[y][x];
                if (piece) {
                    const isWhite = piece === piece.toUpperCase();
                    ctx.fillStyle = isWhite ? "#FFFFFF" : "#000000";
                    ctx.font = `${size * 0.7}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(pieces[piece], xPos + size / 2, yPos + size / 2);
                }
            }
        }

        ctx.fillStyle = isDarkmode ? "#e0e0e0" : "#333";
        ctx.font = `${size * 0.25}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < 8; i++) {
            const displayY = effectiveRotation ? i : 7 - i;
            const displayX = effectiveRotation ? 7 - i : i;

            const numberX = fullscreenMode ? size * 0.25 : offsetX * 0.5;
            const numberY = yPosBase + displayY * size + size / 2;
            ctx.fillText(8 - i, numberX, numberY);

            const letterX = xPosBase + displayX * size + size / 2;
            const letterY = fullscreenMode ? (size * 8 + size * 0.3) : (yPosBase + 8 * size + size * 0.5);
            ctx.fillText(String.fromCharCode(97 + i), letterX, letterY);
        }

        if (gameOver) {
            diceDisplay.textContent = winnerText;
        } else {
            updateChessOpeningDisplay();
        }
    }

    function drawBoard() {
        console.log("drawBoard called with gameType:", gameType);
        if (gameType === "ludo") {
            drawLudoBoard();
        } else {
            drawChessBoard();
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function resizeCanvas() {
        console.log("resizeCanvas called");
        let maxWidth, maxHeight;

        if (fullscreenMode) {
            maxWidth = window.innerWidth;
            maxHeight = window.innerHeight;
            const boardDimension = Math.min(maxWidth, maxHeight) * 0.95;
            size = Math.floor(Math.max(boardDimension / (gameType === "ludo" ? 11 : 8), CONFIG.minBoardSize));
            const totalWidth = size * (gameType === "ludo" ? 11 : 8);
            const totalHeight = size * (gameType === "ludo" ? 11 : 8) + (gameType === "ludo" ? 0 : size * 0.7);

            canvas.width = totalWidth;
            canvas.height = totalHeight;
            canvas.style.width = `${totalWidth}px`;
            canvas.style.height = `${totalHeight}px`;
            canvas.style.position = "absolute";
            canvas.style.left = `${(window.innerWidth - totalWidth) / 2}px`;
            canvas.style.top = `${(window.innerHeight - totalHeight) / 2}px`;
            canvas.style.margin = "0";
            canvas.style.padding = "0";
            canvas.style.border = "0";
            canvas.style.boxSizing = "border-box";
        } else {
            maxWidth = window.innerWidth * 0.7;
            maxHeight = window.innerHeight * 0.6;

            if (window.innerWidth <= 768) {
                maxWidth = window.innerWidth * 0.9;
                maxHeight = window.innerHeight * 0.5;
            }

            const boardDimension = Math.min(maxWidth, maxHeight);
            size = Math.floor(Math.max(boardDimension / (gameType === "ludo" ? 11 : 8), CONFIG.minBoardSize));
            const totalWidth = size * (gameType === "ludo" ? 11 : 8);
            const totalHeight = size * (gameType === "ludo" ? 11 : 8);

            offsetX = (window.innerWidth - totalWidth) / 2 * CONFIG.offset;
            offsetY = (window.innerHeight - totalHeight) / 2 * CONFIG.offset;

            canvas.width = totalWidth + offsetX * 2;
            canvas.height = totalHeight + offsetY * 2 + (gameType === "ludo" ? 0 : size * 0.7);
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            canvas.style.position = "relative";
            canvas.style.left = "0px";
            canvas.style.top = "0px";
        }

        console.log("Canvas resized to:", canvas.width, canvas.height, "with offsetX:", offsetX, "offsetY:", offsetY);
        if (gameStarted) {
            console.log("Calling drawBoard from resizeCanvas");
            drawBoard();
        }
    }

    function toggleFullscreenMode() {
        console.log("toggleFullscreenMode called");
        if (!fullscreenMode) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch((err) => {
                    console.error("Failed to enter fullscreen mode:", err);
                });
            }
            fullscreenMode = true;
            document.body.classList.add("fullscreen");
            rotateButton.style.display = "none";
            smartphoneModeButton.style.display = "none";
            soundToggleButton.style.display = "none";
            undoButton.style.display = "none";
            restartButton.style.display = "none";
            designButton.style.display = "none";
            darkmodeToggleButton.style.display = "none";
            fullscreenButton.style.display = "none";
            turnDisplay.style.display = "none";
            moveList.style.display = "none";
            diceDisplay.style.display = gameType === "ludo" ? "block" : "none";
            closeFullscreenButton.style.display = "block";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch((err) => {
                    console.error("Failed to exit fullscreen mode:", err);
                });
            }
            fullscreenMode = false;
            document.body.classList.remove("fullscreen");
            rotateButton.style.display = "block";
            smartphoneModeButton.style.display = "block";
            soundToggleButton.style.display = "block";
            undoButton.style.display = "block";
            restartButton.style.display = "block";
            designButton.style.display = "block";
            darkmodeToggleButton.style.display = "block";
            fullscreenButton.style.display = "block";
            turnDisplay.style.display = "block";
            moveList.style.display = "block";
            diceDisplay.style.display = gameType === "ludo" ? "block" : "none";
            closeFullscreenButton.style.display = "none";
        }
        resizeCanvas();
        drawBoard();
    }

    function startLudoGame() {
        console.log("startLudoGame called");
        gameType = "ludo";
        currentPlayer = "red";
        gameStarted = true;
        gameOver = false;
        selectedPiece = null;
        legalMoves = [];
        moveHistory = [];
        moveNotations = [];
        lastMove = null;
        moveCount = 1;
        diceRoll = null;
        redTime = CONFIG.initialTime;
        yellowTime = CONFIG.initialTime;

        ludoBoard = Array(40).fill(null);
        redHome = ["red1", "red2", "red3", "red4"];
        yellowHome = ["yellow1", "yellow2", "yellow3", "yellow4"];
        redGoal = Array(4).fill(null);
        yellowGoal = Array(4).fill(null);

        document.body.classList.remove("fullscreen");
        document.body.classList.add("darkmode");
        rollDiceButton.style.display = "block";
        rotateButton.style.display = "block";
        smartphoneModeButton.style.display = "block";
        soundToggleButton.style.display = "block";
        undoButton.style.display = "block";
        restartButton.style.display = "block";
        designButton.style.display = "block";
        darkmodeToggleButton.style.display = "block";
        fullscreenButton.style.display = "block";
        turnDisplay.style.display = "block";
        moveList.style.display = "block";
        diceDisplay.style.display = "block";
        closeFullscreenButton.style.display = "none";
        moveList.innerHTML = "";
        startScreen.style.display = "none";
        gameContainer.style.display = "flex";
        gameContainer.style.visibility = "visible";
        gameContainer.style.opacity = "1";
        restartButton.classList.remove("hidden");
        darkmodeToggleButton.style.display = "block";

        resizeCanvas();
        drawBoard();
        startTimer();
        initializeDarkmodeToggle();
        updateTurnDisplay();
    }

    function startChessGame(freestyle = false) {
        console.log("startChessGame called with freestyle:", freestyle);
        gameType = "chess";
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
        whiteTime = CONFIG.initialTime;
        blackTime = CONFIG.initialTime;

        if (freestyle) {
            const shuffledRow = shuffleArray(["r", "n", "b", "q", "k", "b", "n", "r"]);
            chessBoard = [
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
            chessBoard = [
                ["r", "n", "b", "q", "k", "b", "n", "r"],
                ["p", "p", "p", "p", "p", "p", "p", "p"],
                ["", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", ""],
                ["P", "P", "P", "P", "P", "P", "P", "P"],
                ["R", "N", "B", "N", "K", "B", "N", "R"]
            ];
        }

        updateKingPositions();

        document.body.classList.remove("fullscreen");
        document.body.classList.add("darkmode");
        rollDiceButton.style.display = "none";
        rotateButton.style.display = "block";
        smartphoneModeButton.style.display = "block";
        soundToggleButton.style.display = "block";
        undoButton.style.display = "block";
        restartButton.style.display = "block";
        designButton.style.display = "block";
        darkmodeToggleButton.style.display = "block";
        fullscreenButton.style.display = "block";
        turnDisplay.style.display = "block";
        moveList.style.display = "block";
        diceDisplay.style.display = "none";
        closeFullscreenButton.style.display = "none";
        moveList.innerHTML = "";
        startScreen.style.display = "none";
        gameContainer.style.display = "flex";
        gameContainer.style.visibility = "visible";
        gameContainer.style.opacity = "1";
        restartButton.classList.remove("hidden");
        darkmodeToggleButton.style.display = "block";

        resizeCanvas();
        drawBoard();
        startTimer();
        initializeDarkmodeToggle();
        updateTurnDisplay();
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

    function updateKingPositions(tempBoard = chessBoard) {
        console.log("updateKingPositions called");
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = tempBoard[y][x];
                if (piece === "k") kingPositions.black = { x, y };
                if (piece === "K") kingPositions.white = { x, y };
            }
        }
        console.log("King positions updated:", kingPositions);
    }

    function isInCheck(color, tempBoard = chessBoard, tempKingPos = null) {
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

    function getLegalMovesForCheck(x, y, tempBoard = chessBoard) {
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
        console.log("getLegalMovesForCheck completed with moves:", moves);
        return moves;
    }

    function getLegalMoves(x, y, tempBoard = chessBoard) {
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
            directions.forEach(([dx, dy]) => {
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
            knightMoves.forEach(([dx, dy]) => {
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
            directions.forEach(([dx, dy]) => {
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
            directions.forEach(([dx, dy]) => {
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
            kingMoves.forEach(([dx, dy]) => {
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
        const piece = chessBoard[fromY][fromX]?.toLowerCase() || "";
        const pieceSymbol = piece === "p" ? "" : piece.toUpperCase();
        const simpleNotation = pieceSymbol === "" ? `${fileTo}${rankTo}` : `${pieceSymbol}${fileTo}${rankTo}`;
        const fullNotation = `${pieceSymbol}${fileFrom}${rankFrom}-${fileTo}${rankTo}`;
        console.log("getMoveNotation completed");
        return { simple: simpleNotation, full: fullNotation };
    }

    function updateMoveHistory() {
        console.log("updateMoveHistory called");
        if (!lastMove && gameType === "chess") {
            console.log("No last move to update");
            return;
        }
        if (gameType === "chess") {
            const notation = getMoveNotation(lastMove.fromX, lastMove.fromY, lastMove.toX, lastMove.toY);
            moveNotations.push({ moveCount, notation: notation.simple });
        }
        moveList.innerHTML = "";
        let movePairs = [];
        for (let i = 0; i < moveNotations.length; i++) {
            if (gameType === "ludo") {
                if (i % 2 === 0) {
                    movePairs.push({ red: moveNotations[i].notation });
                } else {
                    movePairs[movePairs.length - 1].yellow = moveNotations[i].notation;
                }
            } else {
                if (i % 2 === 0) {
                    movePairs.push({ white: moveNotations[i].notation });
                } else {
                    movePairs[movePairs.length - 1].black = moveNotations[i].notation;
                }
            }
        }
        movePairs.forEach((pair, index) => {
            const moveItem = document.createElement("li");
            if (gameType === "ludo") {
                moveItem.textContent = `${index + 1}. ${pair.red}${pair.yellow ? " " + pair.yellow : ""}`;
            } else {
                moveItem.textContent = `${index + 1}. ${pair.white}${pair.black ? " " + pair.black : ""}`;
            }
            if (index === movePairs.length - 1) {
                moveItem.classList.add("last-move");
            }
            moveList.appendChild(moveItem);
        });
        if ((gameType === "ludo" && currentPlayer === "yellow") || (gameType === "chess" && currentPlayer === "black")) moveCount++;
        moveList.scrollTop = moveList.scrollHeight;
        if (gameType === "chess") updateChessOpeningDisplay();
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
        const top = rect.top + (fullscreenMode ? 0 : offsetY) + displayY * size;
        const left = rect.left + (fullscreenMode ? 0 : offsetX) + displayX * size;
        promotionChoices.style.position = "absolute";
        promotionChoices.style.top = `${top}px`;
        promotionChoices.style.left = `${left}px`;
        const choices = isWhite ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"];
        choices.forEach((p) => {
            const button = document.createElement("button");
            button.textContent = pieces[p];
            button.className = "promotion-button";
            button.addEventListener("click", () => {
                chessBoard[y][x] = p;
                document.body.removeChild(promotionChoices);
                updateKingPositions();
                currentPlayer = currentPlayer === "white" ? "black" : "white";
                selectedPiece = null;
                legalMoves = [];
                updateMoveHistory();
                updateCheckStatus();
                checkChessGameOver();
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

    function checkChessGameOver() {
        console.log("checkChessGameOver called");
        let hasMoves = false;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = chessBoard[y][x];
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
                winnerText = isWhiteInCheck ? "Schwarz gewinnt!" : "Weiß gewinnt!";
                if (soundEnabled) {
                    const audio = new Audio(SOUND.checkmateSound);
                    audio.play().catch((e) => console.error("Checkmate audio play failed:", e));
                }
            } else {
                gameOver = true;
                winnerText = "Unentschieden (Patt)!";
            }
        }
        console.log("checkChessGameOver completed");
    }

    function getLudoLegalMoves(piece) {
        console.log("getLudoLegalMoves called for", piece);
        const moves = [];
        if (!diceRoll) return moves;
        const player = piece.startsWith("red") ? "red" : "yellow";
        if (player !== currentPlayer) return moves;

        if ((redHome.includes(piece) || yellowHome.includes(piece)) && diceRoll === 6) {
            moves.push({ piece, type: "家居到起始", to: player === "red" ? redStartField : yellowStartField, pos: fieldPositions[player === "red" ? redStartField : yellowStartField] });
        } else if (redHome.includes(piece) || yellowHome.includes(piece)) {
            return moves;
        }

        let currentPos = -1;
        if (ludoBoard.includes(piece)) {
            currentPos = ludoBoard.indexOf(piece);
        } else if (redGoal.includes(piece)) {
            currentPos = redGoal.indexOf(piece) + 40;
        } else if (yellowGoal.includes(piece)) {
            currentPos = yellowGoal.indexOf(piece) + 40;
        }

        if (currentPos >= 0 && currentPos < 40) {
            const startField = player === "red" ? redStartField : yellowStartField;
            const goalEntry = player === "red" ? redGoalEntry : yellowGoalEntry;
            let targetPos = (currentPos + diceRoll) % 40;
            if (currentPos < startField && targetPos >= startField && currentPos + diceRoll < 40 + startField) {
                const stepsToGoal = 40 - (currentPos >= startField ? currentPos : currentPos + 40 - startField);
                if (diceRoll <= stepsToGoal) {
                    moves.push({ piece, type: "main_to_main", to: targetPos, pos: fieldPositions[targetPos] });
                } else if (diceRoll <= stepsToGoal + 4) {
                    const goalIdx = diceRoll - stepsToGoal - 1;
                    if (!ludoBoard[goalEntry] || ludoBoard[goalEntry].startsWith(player)) {
                        moves.push({ piece, type: "main_to_goal", to: goalIdx, pos: (player === "red" ? redGoalPositions : yellowGoalPositions)[goalIdx] });
                    }
                }
            } else if (currentPos + diceRoll < startField || currentPos >= startField) {
                moves.push({ piece, type: "main_to_main", to: targetPos, pos: fieldPositions[targetPos] });
            }
        } else if (currentPos >= 40) {
            const goalIdx = currentPos - 40;
            const newGoalIdx = goalIdx + diceRoll;
            if (newGoalIdx < 4) {
                moves.push({ piece, type: "goal_to_goal", to: newGoalIdx, pos: (player === "red" ? redGoalPositions : yellowGoalPositions)[newGoalIdx] });
            }
        }

        return moves.filter(move => {
            if (move.type === "main_to_main") {
                return !ludoBoard[move.to] || ludoBoard[move.to].startsWith(player) || move.to === (player === "red" ? yellowStartField : redStartField);
            } else if (move.type === "main_to_goal") {
                return !ludoBoard[player === "red" ? redGoalEntry : yellowGoalEntry] && !(player === "red" ? redGoal : yellowGoal)[move.to];
            } else if (move.type === "goal_to_goal") {
                return !(player === "red" ? redGoal : yellowGoal)[move.to];
            }
            return true;
        });
    }

    function rollDice() {
        console.log("rollDice called");
        diceRoll = Math.floor(Math.random() * 6) + 1;
        diceDisplay.textContent = `Würfel: ${diceRoll} | Rot: ${formatTime(redTime)} | Gelb: ${formatTime(yellowTime)}`;
        legalMoves = [];
        const pieces = currentPlayer === "red" ? [...redHome.filter(p => p), ...ludoBoard.filter(p => p && p.startsWith("red")), ...redGoal.filter(p => p)] : 
                       [...yellowHome.filter(p => p), ...ludoBoard.filter(p => p && p.startsWith("yellow")), ...yellowGoal.filter(p => p)];
        pieces.forEach(piece => {
            legalMoves.push(...getLudoLegalMoves(piece));
        });
        if (legalMoves.length === 0 && diceRoll !== 6) {
            currentPlayer = currentPlayer === "red" ? "yellow" : "red";
            diceRoll = null;
            updateTurnDisplay();
        }
        drawBoard();
        console.log("rollDice completed");
    }

    function handleChessClick(event) {
        console.log("handleChessClick called");
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
        const x = Math.floor((adjustedX - (fullscreenMode ? 0 : offsetX)) / size);
        const y = Math.floor((adjustedY - (fullscreenMode ? 0 : offsetY)) / size);
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
        const piece = chessBoard[boardY][boardX];
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
                const newBoard = chessBoard.map(row => [...row]);
                const targetPiece = newBoard[boardY][boardX];
                const isCapture = targetPiece && (targetPiece.toLowerCase() !== selectedPiece.piece.toLowerCase()) && ((targetPiece === targetPiece.toUpperCase()) !== (selectedPiece.piece === selectedPiece.piece.toUpperCase()));
                newBoard[boardY][boardX] = selectedPiece.piece;
                newBoard[selectedPiece.y][selectedPiece.x] = "";
                const isWhite = selectedPiece.piece === selectedPiece.piece
