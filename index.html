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
        winSound: "checkmate.mp3",
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
        alert("Error: Missing DOM elements: " + missingElements.join(", ") + ". Please check the HTML and console.");
        throw new Error("Missing DOM elements: " + missingElements.join(", "));
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Failed to initialize canvas context.");
        alert("Error: Canvas context could not be initialized.");
        throw new Error("Canvas context initialization failed");
    }

    let size = CONFIG.defaultBoardSize;
    let offsetX = size * CONFIG.offset;
    let offsetY = size * CONFIG.offset;
    let currentPlayer = "red";
    let gameStarted = false;
    let gameType = null;
    let rotateBoard = false;
    let smartphoneMode = false;
    let soundEnabled = SOUND.enabledByDefault;
    let moveHistory = [];
    let legalMoves = [];
    let lastMove = null;
    let moveCount = 1;
    let moveNotations = [];
    let currentDesign = 3;
    let isDarkmode = true;
    let fullscreenMode = false;
    let gameOver = false;
    let winnerText = "";
    let redTime = CONFIG.initialTime;
    let yellowTime = CONFIG.initialTime;
    let timerInterval = null;
    let diceRoll = null;
    let selectedPiece = null;

    const designs = {
        1: { light: "#DEB887", dark: "#8B4513" },
        2: { light: "#E0E0E0", dark: "#808080" },
        3: { light: "#ADD8E6", dark: "#4682B4" },
        4: { light: "#90EE90", dark: "#228B22" },
        5: { light: "#FFD8B9", dark: "#CD853F" }
    };

    window.boardColors = designs[currentDesign];

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
    const redStartField = 0; // Red starts at field 0
    const yellowStartField = 20; // Yellow starts at field 20
    const redGoalEntry = 39; // Red enters goal from field 39
    const yellowGoalEntry = 19; // Yellow enters goal from field 19
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

    // Chess board setup
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

    const pieces = {
        r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
        R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
        red: "🔴", yellow: "🟡"
    };

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

    function updateBoardColors(designNum) {
        if (designs[designNum]) {
            currentDesign = designNum;
            window.boardColors = designs[currentDesign];
            if (gameStarted) drawBoard();
        }
    }

    function updateTurnDisplay() {
        turnDisplay.textContent = gameOver ? winnerText : `${currentPlayer === "red" ? "Rot" : "Gelb"} ist dran`;
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
    }

    function drawBoard() {
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
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function getLudoLegalMoves(piece) {
        const moves = [];
        if (!diceRoll) return moves;
        const player = piece.startsWith("red") ? "red" : "yellow";
        if (player !== currentPlayer) return moves;

        if (redHome.includes(piece) && diceRoll === 6) {
            moves.push({ piece, type: "home_to_start", to: player === "red" ? redStartField : yellowStartField });
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
                    moves.push({ piece, type: "main_to_main", to: targetPos });
                } else if (diceRoll <= stepsToGoal + 4) {
                    const goalIdx = diceRoll - stepsToGoal - 1;
                    if (!ludoBoard[goalEntry] || ludoBoard[goalEntry].startsWith(player)) {
                        moves.push({ piece, type: "main_to_goal", to: goalIdx });
                    }
                }
            } else if (currentPos + diceRoll < startField || currentPos >= startField) {
                moves.push({ piece, type: "main_to_main", to: targetPos });
            }
        } else if (currentPos >= 40) {
            const goalIdx = currentPos - 40;
            const newGoalIdx = goalIdx + diceRoll;
            if (newGoalIdx < 4) {
                moves.push({ piece, type: "goal_to_goal", to: newGoalIdx });
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
        diceRoll = Math.floor(Math.random() * 6) + 1;
        diceDisplay.textContent = `Würfel: ${diceRoll} | Rot: ${formatTime(redTime)} | Gelb: ${formatTime(yellowTime)}`;
        legalMoves = [];
        const pieces = currentPlayer === "red" ? [...redHome, ...ludoBoard.filter(p => p && p.startsWith("red")), ...redGoal.filter(p => p)] : 
                       [...yellowHome, ...ludoBoard.filter(p => p && p.startsWith("yellow")), ...yellowGoal.filter(p => p)];
        pieces.forEach(piece => {
            legalMoves.push(...getLudoLegalMoves(piece));
        });
        if (legalMoves.length === 0 && diceRoll !== 6) {
            currentPlayer = currentPlayer === "red" ? "yellow" : "red";
            diceRoll = null;
            updateTurnDisplay();
        }
        drawBoard();
    }

    function handleLudoClick(event) {
        if (!gameStarted || gameOver || !diceRoll) return;
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        if (event.type === "touchstart") {
            clientX = event.touches[0]?.clientX;
            clientY = event.touches[0]?.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        if (!clientX || !clientY) return;
        const adjustedX = (clientX - rect.left) * scaleX;
        const adjustedY = (clientY - rect.top) * scaleY;
        const x = Math.floor((adjustedX - (fullscreenMode ? 0 : offsetX)) / size);
        const y = Math.floor((adjustedY - (fullscreenMode ? 0 : offsetY)) / size);
        if (x < 0 || x >= 11 || y < 0 || y >= 11) {
            selectedPiece = null;
            legalMoves = [];
            drawBoard();
            return;
        }

        const fieldIdx = fieldPositions.findIndex(pos => pos.x === x && pos.y === y);
        const homeIdx = currentPlayer === "red" ? redHomePositions.findIndex(pos => pos.x === x && pos.y === y) : 
                        yellowHomePositions.findIndex(pos => pos.x === x && pos.y === y);
        const goalIdx = currentPlayer === "red" ? redGoalPositions.findIndex(pos => pos.x === x && pos.y === y) : 
                        yellowGoalPositions.findIndex(pos => pos.x === x && pos.y === y);

        if (!selectedPiece && (fieldIdx !== -1 || homeIdx !== -1 || goalIdx !== -1)) {
            let piece = null;
            if (fieldIdx !== -1 && ludoBoard[fieldIdx] && ludoBoard[fieldIdx].startsWith(currentPlayer)) {
                piece = ludoBoard[fieldIdx];
            } else if (homeIdx !== -1 && (currentPlayer === "red" ? redHome : yellowHome)[homeIdx]) {
                piece = (currentPlayer === "red" ? redHome : yellowHome)[homeIdx];
            } else if (goalIdx !== -1 && (currentPlayer === "red" ? redGoal : yellowGoal)[goalIdx]) {
                piece = (currentPlayer === "red" ? redGoal : yellowGoal)[goalIdx];
            }
            if (piece) {
                selectedPiece = { piece, pos: { x, y } };
                legalMoves = getLudoLegalMoves(piece);
                if (legalMoves.length === 0) selectedPiece = null;
                drawBoard();
            }
        } else if (selectedPiece) {
            let move = null;
            if (fieldIdx !== -1) {
                move = legalMoves.find(m => m.type === "main_to_main" && m.to === fieldIdx);
            } else if (goalIdx !== -1) {
                move = legalMoves.find(m => (m.type === "main_to_goal" || m.type === "goal_to_goal") && m.to === goalIdx);
            } else if (fieldIdx === (currentPlayer === "red" ? redStartField : yellowStartField)) {
                move = legalMoves.find(m => m.type === "home_to_start");
            }
            if (move) {
                const newBoard = [...ludoBoard];
                const newRedHome = [...redHome];
                const newYellowHome = [...yellowHome];
                const newRedGoal = [...redGoal];
                const newYellowGoal = [...yellowGoal];

                let fromPos = -1;
                if (ludoBoard.includes(selectedPiece.piece)) {
                    fromPos = ludoBoard.indexOf(selectedPiece.piece);
                } else if (redHome.includes(selectedPiece.piece)) {
                    fromPos = -2;
                } else if (yellowHome.includes(selectedPiece.piece)) {
                    fromPos = -3;
                } else if (redGoal.includes(selectedPiece.piece)) {
                    fromPos = 40 + redGoal.indexOf(selectedPiece.piece);
                } else if (yellowGoal.includes(selectedPiece.piece)) {
                    fromPos = 40 + yellowGoal.indexOf(selectedPiece.piece);
                }

                if (move.type === "home_to_start") {
                    if (currentPlayer === "red") {
                        newRedHome[newRedHome.indexOf(selectedPiece.piece)] = null;
                        if (newBoard[redStartField] && newBoard[redStartField].startsWith("yellow")) {
                            newYellowHome[newYellowHome.indexOf(null)] = newBoard[redStartField];
                        }
                        newBoard[redStartField] = selectedPiece.piece;
                    } else {
                        newYellowHome[newYellowHome.indexOf(selectedPiece.piece)] = null;
                        if (newBoard[yellowStartField] && newBoard[yellowStartField].startsWith("red")) {
                            newRedHome[newRedHome.indexOf(null)] = newBoard[yellowStartField];
                        }
                        newBoard[yellowStartField] = selectedPiece.piece;
                    }
                } else if (move.type === "main_to_main") {
                    if (newBoard[move.to] && newBoard[move.to].startsWith(currentPlayer === "red" ? "yellow" : "red")) {
                        const opponentPiece = newBoard[move.to];
                        if (currentPlayer === "red") {
                            newYellowHome[newYellowHome.indexOf(null)] = opponentPiece;
                        } else {
                            newRedHome[newRedHome.indexOf(null)] = opponentPiece;
                        }
                    }
                    newBoard[fromPos] = null;
                    newBoard[move.to] = selectedPiece.piece;
                } else if (move.type === "main_to_goal") {
                    newBoard[fromPos] = null;
                    (currentPlayer === "red" ? newRedGoal : newYellowGoal)[move.to] = selectedPiece.piece;
                } else if (move.type === "goal_to_goal") {
                    (currentPlayer === "red" ? newRedGoal : newYellowGoal)[fromPos - 40] = null;
                    (currentPlayer === "red" ? newRedGoal : newYellowGoal)[move.to] = selectedPiece.piece;
                }

                moveHistory.push({
                    board: [...ludoBoard],
                    redHome: [...redHome],
                    yellowHome: [...yellowHome],
                    redGoal: [...redGoal],
                    yellowGoal: [...yellowGoal],
                    currentPlayer,
                    moveCount,
                    diceRoll
                });
                ludoBoard = newBoard;
                redHome = newRedHome;
                yellowHome = newYellowHome;
                redGoal = newRedGoal;
                yellowGoal = newYellowGoal;

                moveNotations.push({ moveCount, notation: `${selectedPiece.piece}: ${move.type} (${diceRoll})` });
                updateMoveHistory();
                checkLudoGameOver();
                selectedPiece = null;
                legalMoves = [];
                if (diceRoll !== 6 || gameOver) {
                    currentPlayer = currentPlayer === "red" ? "yellow" : "red";
                    diceRoll = null;
                }
                updateTurnDisplay();
                if (soundEnabled) {
                    const audio = new Audio(move.type.includes("main_to_main") && newBoard[move.to] ? SOUND.captureSound : SOUND.moveSound);
                    audio.play().catch((e) => console.error("Audio play failed:", e));
                }
            } else {
                selectedPiece = null;
                legalMoves = [];
            }
            drawBoard();
        }
    }

    function updateMoveHistory() {
        moveList.innerHTML = "";
        let movePairs = [];
        for (let i = 0; i < moveNotations.length; i++) {
            if (i % 2 === 0) {
                movePairs.push({ red: moveNotations[i].notation });
            } else {
                movePairs[movePairs.length - 1].yellow = moveNotations[i].notation;
            }
        }
        movePairs.forEach((pair, index) => {
            const moveItem = document.createElement("li");
            moveItem.textContent = `${index + 1}. ${pair.red}${pair.yellow ? " " + pair.yellow : ""}`;
            if (index === movePairs.length - 1) {
                moveItem.classList.add("last-move");
            }
            moveList.appendChild(moveItem);
        });
        if (currentPlayer === "yellow") moveCount++;
        moveList.scrollTop = moveList.scrollHeight;
    }

    function checkLudoGameOver() {
        if (redGoal.every(piece => piece !== null)) {
            gameOver = true;
            winnerText = "Rot gewinnt!";
            if (soundEnabled) {
                const audio = new Audio(SOUND.winSound);
                audio.play().catch((e) => console.error("Win audio play failed:", e));
            }
        } else if (yellowGoal.every(piece => piece !== null)) {
            gameOver = true;
            winnerText = "Gelb gewinnt!";
            if (soundEnabled) {
                const audio = new Audio(SOUND.winSound);
                audio.play().catch((e) => console.error("Win audio play failed:", e));
            }
        }
    }

    function showPenaltyMessage() {
        const penaltyMessage = document.createElement("div");
        penaltyMessage.classList.add("penalty-message");
        penaltyMessage.textContent = "- 1 Minute";
        document.body.appendChild(penaltyMessage);
        const rect = undoButton.getBoundingClientRect();
        penaltyMessage.style.position = "absolute";
        penaltyMessage.style.left = `${rect.left + rect.width / 2}px`;
        penaltyMessage.style.top = `${rect.top - 30}px`;
        penaltyMessage.style.transform = "translateX(-50%)";
        setTimeout(() => {
            document.body.removeChild(penaltyMessage);
        }, 2000);
    }

    function initializeGameButtons() {
        startChessButton.addEventListener("click", () => startChessGame(false));
        startLudoButton.addEventListener("click", startLudoGame);
        startFreestyleButton.addEventListener("click", () => startChessGame(true));

        rollDiceButton.addEventListener("click", () => {
            if (gameType === "ludo" && !gameOver && !diceRoll) rollDice();
        });

        rotateButton.addEventListener("click", () => {
            rotateBoard = !rotateBoard;
            drawBoard();
        });

        smartphoneModeButton.addEventListener("click", () => {
            smartphoneMode = !smartphoneMode;
            smartphoneModeButton.textContent = `Rotate ${smartphoneMode ? "Off" : "On"}`;
            drawBoard();
        });

        soundToggleButton.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            soundToggleButton.textContent = `Sound ${soundEnabled ? "Off" : "On"}`;
        });

        undoButton.addEventListener("click", () => {
            if (moveHistory.length === 0) return;
            const lastState = moveHistory.pop();
            if (gameType === "ludo") {
                ludoBoard = lastState.board;
                redHome = lastState.redHome;
                yellowHome = lastState.yellowHome;
                redGoal = lastState.redGoal;
                yellowGoal = lastState.yellowGoal;
                currentPlayer = lastState.currentPlayer;
                moveCount = lastState.moveCount;
                diceRoll = lastState.diceRoll;
                if (currentPlayer === "red") redTime = Math.max(redTime - CONFIG.undoPenalty, 0);
                else yellowTime = Math.max(yellowTime - CONFIG.undoPenalty, 0);
                showPenaltyMessage();
                selectedPiece = null;
                legalMoves = [];
                moveNotations.pop();
                updateMoveHistory();
                drawBoard();
            }
        });

        restartButton.addEventListener("click", () => {
            if (gameType === "ludo") startLudoGame();
            else startChessGame(false);
        });

        designButton.addEventListener("click", () => {
            currentDesign = currentDesign % 5 + 1;
            window.updateBoardColors(currentDesign);
            drawBoard();
        });

        fullscreenButton.addEventListener("click", toggleFullscreenMode);
        closeFullscreenButton.addEventListener("click", toggleFullscreenMode);
        closeFullscreenButton.addEventListener("touchstart", (e) => {
            e.preventDefault();
            toggleFullscreenMode();
        }, { passive: false });

        canvas.addEventListener("click", (e) => {
            if (gameType === "ludo") handleLudoClick(e);
            // Add chess click handler here if needed
        });
        canvas.addEventListener("touchstart", (e) => {
            if (gameType === "ludo") handleLudoClick(e);
            // Add chess touch handler here if needed
        }, { passive: false });
    }

    const debouncedResizeCanvas = debounce(resizeCanvas, 200);
    window.addEventListener("resize", debouncedResizeCanvas);
    resizeCanvas();
    initializeGameButtons();
});
