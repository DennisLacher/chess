document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded at", new Date().toISOString());

    // Konfiguration
    const CONFIG = {
        defaultBoardSize: 60,
        minBoardSize: 40,
        offset: 0.1,
        initialTime: 600,
        undoPenalty: 60,
    };

    const SOUND = {
        enabledByDefault: false, // Sound deaktiviert, da Audiodateien nicht im Repository sind
    };

    // DOM-Elemente
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

    // DOM-Elemente prüfen
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
        alert("Error: Missing DOM elements: " + missingElements.join(", "));
        return;
    }

    // Spielvariablen
    let gameType = null;
    let currentPlayer = "white";
    let gameStarted = false;
    let gameOver = false;
    let selectedPiece = null;
    let legalMoves = [];
    let moveHistory = [];
    let moveNotations = [];
    let lastMove = null;
    let moveCount = 1;
    let diceRoll = null;
    let whiteTime = CONFIG.initialTime;
    let blackTime = CONFIG.initialTime;
    let redTime = CONFIG.initialTime;
    let yellowTime = CONFIG.initialTime;
    let size = CONFIG.defaultBoardSize;
    let offsetX = 0;
    let offsetY = 0;
    let rotateBoard = false;
    let smartphoneMode = false;
    let soundEnabled = SOUND.enabledByDefault;
    let isDarkmode = localStorage.getItem("darkmode") === "true";
    let fullscreenMode = false;
    let timerInterval = null;
    let winnerText = "";
    let currentDesign = 0;
    const ctx = canvas.getContext("2d");

    // Designs
    const designs = [
        { light: "#f0d9b5", dark: "#b58863" },
        { light: "#e0e0e0", dark: "#769656" },
        { light: "#fff", dark: "#4b7399" }
    ];
    window.boardColors = designs[currentDesign];
    window.updateBoardColors = (index) => { window.boardColors = designs[index]; };

    // Schachfiguren
    const pieces = {
        r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
        R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
        red: "🔴", yellow: "🟡"
    };

    // Schach-Openings
    const openings = [
        { name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], blackResponses: ["Bc5", "Nf6"] },
        { name: "Sicilian Defense", moves: ["e4", "c5"], blackResponses: ["Nc6", "e6"] },
        { name: "King's Gambit", moves: ["e4", "e5", "f4"], blackResponses: ["exf4", "d5"] },
        { name: "Ruy Lopez", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], blackResponses: ["a6", "Nf6"] },
        { name: "French Defense", moves: ["e4", "e6"], blackResponses: ["d5", "c5"] },
        { name: "Queen's Gambit", moves: ["d4", "d5", "c4"], blackResponses: ["e6", "Nf6"] },
        { name: "English Opening", moves: ["c4"], blackResponses: ["e5", "Nf6"] }
    ];

    // Ludo-Brett
    let ludoBoard = Array(40).fill(null);
    let redHome = Array(4).fill("red");
    let yellowHome = Array(4).fill("yellow");
    let redGoal = Array(4).fill(null);
    let yellowGoal = Array(4).fill(null);

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

    // Schachbrett
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

    // Initiale Anzeige
    startScreen.style.display = "block";
    gameContainer.style.display = "none";
    restartButton.classList.add("hidden");
    darkmodeToggleButton.style.display = "none";
    closeFullscreenButton.style.display = "none";

    // Event-Listener für Buttons
    startChessButton.addEventListener("click", () => startChessGame(false));
    startLudoButton.addEventListener("click", startLudoGame);
    startFreestyleButton.addEventListener("click", () => startChessGame(true));
    rollDiceButton.addEventListener("click", rollDice);
    rotateButton.addEventListener("click", toggleRotateBoard);
    smartphoneModeButton.addEventListener("click", toggleSmartphoneMode);
    soundToggleButton.addEventListener("click", toggleSound);
    undoButton.addEventListener("click", undoMove);
    restartButton.addEventListener("click", restartGame);
    designButton.addEventListener("click", changeDesign);
    darkmodeToggleButton.addEventListener("click", toggleDarkmode);
    fullscreenButton.addEventListener("click", toggleFullscreenMode);
    closeFullscreenButton.addEventListener("click", toggleFullscreenMode);
    canvas.addEventListener("click", (event) => {
        if (gameType === "chess") handleChessClick(event);
        else if (gameType === "ludo") handleLudoClick(event);
    });

    // Funktionen
    function initializeDarkmodeToggle() {
        if (darkmodeToggleButton && gameStarted) {
            darkmodeToggleButton.textContent = isDarkmode ? "Light Mode" : "Dark Mode";
            darkmodeToggleButton.addEventListener("click", toggleDarkmode);
        } else if (darkmodeToggleButton && !gameStarted) {
            darkmodeToggleButton.style.display = "none";
        }
    }

    function toggleDarkmode() {
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
        const yPosBase = fullscreenMode ? 0 : offsetY;

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
        if (gameType === "ludo") {
            drawLudoBoard();
        } else {
            drawChessBoard();
        }
    }

    function resizeCanvas() {
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

        if (gameStarted) drawBoard();
    }

    function toggleFullscreenMode() {
        if (!fullscreenMode) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch((err) => console.error("Failed to enter fullscreen:", err));
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
                document.exitFullscreen().catch((err) => console.error("Failed to exit fullscreen:", err));
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
        restartButton.classList.remove("hidden");
        darkmodeToggleButton.style.display = "block";

        resizeCanvas();
        drawBoard();
        startTimer();
        initializeDarkmodeToggle();
        updateTurnDisplay();
    }

    function startChessGame(freestyle = false) {
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
                ["R", "N", "B", "Q", "K", "B", "N", "R"]
            ];
        }

        updateKingPositions();

        document.body.classList.remove("fullscreen");
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
        restartButton.classList.remove("hidden");
        darkmodeToggleButton.style.display = "block";

        resizeCanvas();
        drawBoard();
        startTimer();
        initializeDarkmodeToggle();
        updateTurnDisplay();
    }

    function shuffleArray(array) {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function updateKingPositions(tempBoard = chessBoard) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = tempBoard[y][x];
                if (piece === "k") kingPositions.black = { x, y };
                if (piece === "K") kingPositions.white = { x, y };
            }
        }
    }

    function isInCheck(color, tempBoard = chessBoard, tempKingPos = null) {
        const kingPos = tempKingPos || (color === "white" ? kingPositions.white : kingPositions.black);
        if (!kingPos) return false;
        const opponentColor = color === "white" ? "black" : "white";
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = tempBoard[y][x];
                const isOpponent = piece && ((piece === piece.toUpperCase() && opponentColor === "white") || (piece !== piece.toUpperCase() && opponentColor === "black"));
                if (isOpponent) {
                    const moves = getLegalMovesForCheck(x, y, tempBoard);
                    if (moves.some((m) => m.toX === kingPos.x && m.toY === kingPos.y)) {
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
                console.log("Check sound would play if audio files were available");
            }
        }
    }

    function getLegalMovesForCheck(x, y, tempBoard = chessBoard) {
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

    function getLegalMoves(x, y, tempBoard = chessBoard) {
        const moves = [];
        const piece = tempBoard[y][x];
        if (!piece) return moves;
        const isWhite = piece === piece.toUpperCase();
        if ((isWhite && currentPlayer !== "white") || (!isWhite && currentPlayer !== "black")) return moves;

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
            if (isWhite && castlingAvailability.white.kingside && !tempBoard[7][5] && !tempBoard[7][6] && tempBoard[7][7] === "R") {
                if (!isInCheck("white") && !isInCheck("white", tempBoard, { x: 5, y: 7 }) && !isInCheck("white", tempBoard, { x: 6, y: 7 })) {
                    moves.push({ toX: 6, toY: 7, castling: "kingside" });
                }
            }
            if (isWhite && castlingAvailability.white.queenside && !tempBoard[7][3] && !tempBoard[7][2] && !tempBoard[7][1] && tempBoard[7][0] === "R") {
                if (!isInCheck("white") && !isInCheck("white", tempBoard, { x: 3, y: 7 }) && !isInCheck("white", tempBoard, { x: 2, y: 7 })) {
                    moves.push({ toX: 2, toY: 7, castling: "queenside" });
                }
            }
            if (!isWhite && castlingAvailability.black.kingside && !tempBoard[0][5] && !tempBoard[0][6] && tempBoard[0][7] === "r") {
                if (!isInCheck("black") && !isInCheck("black", tempBoard, { x: 5, y: 0 }) && !isInCheck("black", tempBoard, { x: 6, y: 0 })) {
                    moves.push({ toX: 6, toY: 0, castling: "kingside" });
                }
            }
            if (!isWhite && castlingAvailability.black.queenside && !tempBoard[0][3] && !tempBoard[0][2] && !tempBoard[0][1] && tempBoard[0][0] === "r") {
                if (!isInCheck("black") && !isInCheck("black", tempBoard, { x: 3, y: 0 }) && !isInCheck("black", tempBoard, { x: 2, y: 0 })) {
                    moves.push({ toX: 2, toY: 0, castling: "queenside" });
                }
            }
        }

        const legalMoves = [];
        moves.forEach((move) => {
            const tempBoardCopy = JSON.parse(JSON.stringify(tempBoard));
            tempBoardCopy[move.toY][move.toX] = tempBoard[y][x];
            tempBoardCopy[y][x] = "";
            const tempKingPos = piece.toLowerCase() === "k" ? { x: move.toX, y: move.toY } : null;
            if (!isInCheck(currentPlayer, tempBoardCopy, tempKingPos)) {
                legalMoves.push(move);
            }
        });
        return legalMoves;
    }

    function rollDice() {
        if (gameOver || gameType !== "ludo") return;
        diceRoll = Math.floor(Math.random() * 6) + 1;
        legalMoves = [];
        if (diceRoll === 6) {
            if (currentPlayer === "red" && redHome.some(piece => piece)) {
                legalMoves.push({ pos: redHomePositions[redHome.findIndex(piece => piece)], field: redStartField });
            } else if (currentPlayer === "yellow" && yellowHome.some(piece => piece)) {
                legalMoves.push({ pos: yellowHomePositions[yellowHome.findIndex(piece => piece)], field: yellowStartField });
            }
        }
        ludoBoard.forEach((piece, i) => {
            if (piece && piece.startsWith(currentPlayer)) {
                const newField = (i + diceRoll) % 40;
                if (newField !== redGoalEntry && newField !== yellowGoalEntry) {
                    legalMoves.push({ pos: fieldPositions[i], field: newField });
                } else if ((currentPlayer === "red" && newField === redGoalEntry && redGoal.some(g => !g)) ||
                          (currentPlayer === "yellow" && newField === yellowGoalEntry && yellowGoal.some(g => !g))) {
                    legalMoves.push({ pos: fieldPositions[i], field: newField, goal: true });
                }
            }
        });
        drawBoard();
        if (legalMoves.length === 0) {
            currentPlayer = currentPlayer === "red" ? "yellow" : "red";
            updateTurnDisplay();
            diceRoll = null;
            drawBoard();
        }
    }

    function toggleRotateBoard() {
        rotateBoard = !rotateBoard;
        drawBoard();
    }

    function toggleSmartphoneMode() {
        smartphoneMode = !smartphoneMode;
        drawBoard();
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundToggleButton.textContent = soundEnabled ? "Sound aus" : "Sound an";
    }

    function undoMove() {
        if (moveHistory.length === 0 || gameOver) return;
        const lastMove = moveHistory.pop();
        if (gameType === "ludo") {
            if (lastMove.goal) {
                const goalArray = lastMove.player === "red" ? redGoal : yellowGoal;
                const homeArray = lastMove.player === "red" ? redHome : yellowHome;
                goalArray[lastMove.toIndex] = null;
                homeArray[lastMove.fromIndex] = lastMove.piece;
            } else {
                ludoBoard[lastMove.toField] = null;
                if (lastMove.fromField !== null) {
                    ludoBoard[lastMove.fromField] = lastMove.piece;
                } else {
                    const homeArray = lastMove.player === "red" ? redHome : yellowHome;
                    homeArray[lastMove.fromIndex] = lastMove.piece;
                }
            }
            currentPlayer = lastMove.player;
            diceRoll = null;
            legalMoves = [];
        } else {
            chessBoard = lastMove.board;
            currentPlayer = lastMove.player;
            castlingAvailability = lastMove.castling;
            kingPositions = lastMove.kings;
            isWhiteInCheck = lastMove.whiteCheck;
            isBlackInCheck = lastMove.blackCheck;
            moveNotations.pop();
            moveCount = Math.floor((moveNotations.length + 1) / 2) + 1;
            selectedPiece = null;
            legalMoves = [];
        }
        updateTurnDisplay();
        drawBoard();
    }

    function restartGame() {
        if (gameType === "ludo") {
            startLudoGame();
        } else {
            startChessGame(gameType === "chess" && chessBoard[0][4] !== "k");
        }
    }

    function changeDesign() {
        currentDesign = (currentDesign + 1) % designs.length;
        window.updateBoardColors(currentDesign);
        drawBoard();
    }

    function handleChessClick(event) {
        if (gameOver || gameType !== "chess") return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let boardX = Math.floor((x - (fullscreenMode ? 0 : offsetX)) / size);
        let boardY = Math.floor((y - (fullscreenMode ? 0 : offsetY)) / size);
        if (rotateBoard || (smartphoneMode && currentPlayer === "black")) {
            boardX = 7 - boardX;
            boardY = 7 - boardY;
        }
        if (boardX < 0 || boardX >= 8 || boardY < 0 || boardY >= 8) return;

        if (selectedPiece) {
            const move = legalMoves.find(m => m.toX === boardX && m.toY === boardY);
            if (move) {
                const tempBoard = JSON.parse(JSON.stringify(chessBoard));
                const piece = chessBoard[selectedPiece.y][selectedPiece.x];
                const capturedPiece = chessBoard[move.toY][move.toX];
                chessBoard[move.toY][move.toX] = piece;
                chessBoard[selectedPiece.y][selectedPiece.x] = "";
                if (move.castling) {
                    if (move.castling === "kingside") {
                        chessBoard[move.toY][5] = chessBoard[move.toY][7];
                        chessBoard[move.toY][7] = "";
                    } else {
                        chessBoard[move.toY][3] = chessBoard[move.toY][0];
                        chessBoard[move.toY][0] = "";
                    }
                }
                if (piece.toLowerCase() === "k") {
                    castlingAvailability[currentPlayer].kingside = false;
                    castlingAvailability[currentPlayer].queenside = false;
                }
                if (piece.toLowerCase() === "r") {
                    if (selectedPiece.x === 0) castlingAvailability[currentPlayer].queenside = false;
                    if (selectedPiece.x === 7) castlingAvailability[currentPlayer].kingside = false;
                }
                updateKingPositions();
                updateCheckStatus();
                moveHistory.push({
                    board: tempBoard,
                    player: currentPlayer,
                    castling: JSON.parse(JSON.stringify(castlingAvailability)),
                    kings: JSON.parse(JSON.stringify(kingPositions)),
                    whiteCheck: isWhiteInCheck,
                    blackCheck: isBlackInCheck
                });
                const fromNotation = `${String.fromCharCode(97 + selectedPiece.x)}${8 - selectedPiece.y}`;
                const toNotation = `${String.fromCharCode(97 + boardX)}${8 - boardY}`;
                const notation = `${piece.toLowerCase() === "p" ? "" : piece.toUpperCase()}${capturedPiece ? "x" : ""}${toNotation}`;
                moveNotations.push({ notation, moveNumber: moveCount });
                moveList.innerHTML = moveNotations.map((m, i) => `<li${i === moveNotations.length - 1 ? ' class="last-move"' : ""}>${Math.floor(i / 2) + 1}. ${m.notation}</li>`).join("");
                moveCount = Math.floor((moveNotations.length + 1) / 2) + 1;
                currentPlayer = currentPlayer === "white" ? "black" : "white";
                selectedPiece = null;
                legalMoves = [];
                if (soundEnabled) {
                    console.log(capturedPiece ? "Capture sound would play" : "Move sound would play");
                }
                if (move.promotion) {
                    showPromotionChoices(boardX, boardY, piece === piece.toUpperCase());
                } else {
                    checkGameOver();
                }
                updateTurnDisplay();
                drawBoard();
            } else {
                selectedPiece = null;
                legalMoves = [];
                if (chessBoard[boardY][boardX] && (chessBoard[boardY][boardX] === chessBoard[boardY][boardX].toUpperCase() === (currentPlayer === "white"))) {
                    selectedPiece = { x: boardX, y: boardY, piece: chessBoard[boardY][boardX] };
                    legalMoves = getLegalMoves(boardX, boardY);
                }
                drawBoard();
            }
        } else {
            if (chessBoard[boardY][boardX] && (chessBoard[boardY][boardX] === chessBoard[boardY][boardX].toUpperCase() === (currentPlayer === "white"))) {
                selectedPiece = { x: boardX, y: boardY, piece: chessBoard[boardY][boardX] };
                legalMoves = getLegalMoves(boardX, boardY);
                drawBoard();
            }
        }
    }

    function showPromotionChoices(x, y, isWhite) {
        const choices = isWhite ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"];
        const promotionDiv = document.createElement("div");
        promotionDiv.id = "promotionChoices";
        choices.forEach(piece => {
            const button = document.createElement("button");
            button.classList.add("promotion-button");
            button.textContent = pieces[piece];
            button.addEventListener("click", () => {
                chessBoard[y][x] = piece;
                promotionDiv.remove();
                checkGameOver();
                drawBoard();
            });
            promotionDiv.appendChild(button);
        });
        gameContainer.appendChild(promotionDiv);
    }

    function checkGameOver() {
        let hasLegalMoves = false;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = chessBoard[y][x];
                if (piece && (piece === piece.toUpperCase() === (currentPlayer === "white"))) {
                    if (getLegalMoves(x, y).length > 0) {
                        hasLegalMoves = true;
                        break;
                    }
                }
            }
            if (hasLegalMoves) break;
        }
        if (!hasLegalMoves) {
            gameOver = true;
            if (isInCheck(currentPlayer)) {
                winnerText = currentPlayer === "white" ? "Schwarz gewinnt (Schachmatt)!" : "Weiß gewinnt (Schachmatt)!";
                if (soundEnabled) {
                    console.log("Checkmate sound would play");
                }
            } else {
                winnerText = "Patt!";
            }
            updateTurnDisplay();
            drawBoard();
        }
    }

    function handleLudoClick(event) {
        if (gameOver || gameType !== "ludo" || !diceRoll) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const boardX = Math.floor((x - (fullscreenMode ? 0 : offsetX)) / size);
        const boardY = Math.floor((y - (fullscreenMode ? 0 : offsetY)) / size);
        const fieldIdx = fieldPositions.findIndex(pos => pos.x === boardX && pos.y === boardY);
        const homeIdx = currentPlayer === "red" ? redHomePositions.findIndex(pos => pos.x === boardX && pos.y === boardY) : yellowHomePositions.findIndex(pos => pos.x === boardX && pos.y === boardY);

        if (fieldIdx !== -1 && ludoBoard[fieldIdx] && ludoBoard[fieldIdx].startsWith(currentPlayer)) {
            selectedPiece = { pos: fieldPositions[fieldIdx], piece: ludoBoard[fieldIdx], field: fieldIdx };
            legalMoves = legalMoves.filter(move => move.pos.x === boardX && move.pos.y === boardY);
            drawBoard();
        } else if (homeIdx !== -1 && (currentPlayer === "red" ? redHome[homeIdx] : yellowHome[homeIdx])) {
            selectedPiece = { pos: currentPlayer === "red" ? redHomePositions[homeIdx] : yellowHomePositions[homeIdx], piece: currentPlayer === "red" ? redHome[homeIdx] : yellowHome[homeIdx], homeIndex: homeIdx };
            legalMoves = legalMoves.filter(move => move.pos.x === boardX && move.pos.y === boardY);
            drawBoard();
        } else {
            const move = legalMoves.find(m => m.pos.x === boardX && m.pos.y === boardY);
            if (move && selectedPiece) {
                const tempBoard = JSON.parse(JSON.stringify(ludoBoard));
                const tempRedHome = [...redHome];
                const tempYellowHome = [...yellowHome];
                const tempRedGoal = [...redGoal];
                const tempYellowGoal = [...yellowGoal];
                let fromField = null;
                let fromIndex = null;

                if (selectedPiece.field != null) {
                    fromField = selectedPiece.field;
                    ludoBoard[selectedPiece.field] = null;
                } else {
                    fromIndex = selectedPiece.homeIndex;
                    if (currentPlayer === "red") {
                        redHome[fromIndex] = null;
                    } else {
                        yellowHome[fromIndex] = null;
                    }
                }

                if (move.goal) {
                    const goalArray = currentPlayer === "red" ? redGoal : yellowGoal;
                    const goalIndex = goalArray.findIndex(g => !g);
                    goalArray[goalIndex] = selectedPiece.piece;
                } else {
                    if (ludoBoard[move.field] && !ludoBoard[move.field].startsWith(currentPlayer)) {
                        const opponentPiece = ludoBoard[move.field];
                        const opponentHome = opponentPiece.startsWith("red") ? redHome : yellowHome;
                        const homeIndex = opponentHome.findIndex(h => !h);
                        opponentHome[homeIndex] = opponentPiece;
                    }
                    ludoBoard[move.field] = selectedPiece.piece;
                }

                moveHistory.push({
                    board: tempBoard,
                    redHome: tempRedHome,
                    yellowHome: tempYellowHome,
                    redGoal: tempRedGoal,
                    yellowGoal: tempYellowGoal,
                    player: currentPlayer,
                    piece: selectedPiece.piece,
                    fromField,
                    toField: move.field,
                    fromIndex,
                    toIndex: move.goal ? goalArray.findIndex(g => g === selectedPiece.piece) : null,
                    goal: move.goal
                });

                diceRoll = null;
                legalMoves = [];
                selectedPiece = null;

                if ((currentPlayer === "red" && redGoal.every(g => g)) || (currentPlayer === "yellow" && yellowGoal.every(g => g))) {
                    gameOver = true;
                    winnerText = `${currentPlayer === "red" ? "Rot" : "Gelb"} gewinnt!`;
                } else {
                    currentPlayer = currentPlayer === "red" ? "yellow" : "red";
                }

                updateTurnDisplay();
                drawBoard();
            }
        }
    }

    // Initialisierung
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
});
