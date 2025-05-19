document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded and DOMContentLoaded event fired at", new Date().toISOString());

    const CONFIG = {
        defaultBoardSize: 60,
        minBoardSize: 40,
        maxWidthFactor: 1.5,
        maxHeightFactor: 1.2,
        offset: 0.1,
        initialTime: 600,
        undoPenalty: 60,
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
        checkmateSound: "checkmate.mp3",
    };

    const canvas = document.getElementById("chessboard");
    const startScreen = document.getElementById("startScreen");
    const startButton = document.getElementById("startButton");
    const startFreestyleButton = document.getElementById("startFreestyleButton");
    const gameContainer = document.getElementById("gameContainer");
    const turnDisplay = document.getElementById("turnDisplay");
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
    const closeFullscreenButton = document.getElementById("closeFullscreenButton");

    const missingElements = [];
    if (!canvas) missingElements.push("canvas (id='chessboard')");
    if (!startScreen) missingElements.push("startScreen (id='startScreen')");
    if (!startButton) missingElements.push("startButton (id='startButton')");
    if (!startFreestyleButton) missingElements.push("startFreestyleButton (id='startFreestyleButton')");
    if (!gameContainer) missingElements.push("gameContainer (id='gameContainer')");
    if (!turnDisplay) missingElements.push("turnDisplay (id='turnDisplay')");
    if (missingElements.length > 0) {
        console.error("The following DOM elements are missing:", missingElements.join(", "));
        alert("Error: Missing DOM elements: " + missingElements.join(", ") + ". Please check the HTML and console.");
        throw new Error("Missing DOM elements: " + missingElements.join(", "));
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Failed to initialize canvas context.");
        alert("Error: Canvas context could not be initialized.");
        throw new Error("Canvas context initialization failed");
    }

    canvas.style.display = "block";
    canvas.style.visibility = "visible";
    canvas.style.opacity = "1";
    canvas.style.position = "relative";
    console.log("Canvas initial styles set:", {
        display: canvas.style.display,
        visibility: canvas.style.visibility,
        opacity: canvas.style.opacity,
        position: canvas.style.position,
    });

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
    let currentDesign = 3;
    let isDarkmode = true; // Standardmäßig im Dark-Mode starten
    let fullscreenMode = false;
    let gameOver = false;
    let winnerText = "";
    let whiteTime = CONFIG.initialTime;
    let blackTime = CONFIG.initialTime;
    let timerInterval = null;

    const designs = {
        1: { light: "#DEB887", dark: "#8B4513" },
        2: { light: "#E0E0E0", dark: "#808080" },
        3: { light: "#ADD8E6", dark: "#4682B4" },
        4: { light: "#90EE90", dark: "#228B22" },
        5: { light: "#FFDAB9", dark: "#CD853F" }
    };

    window.boardColors = designs[currentDesign];
    console.log("Initial design and colors:", currentDesign, window.boardColors);

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
        { name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], blackResponses: ["Bc5", "Nf6"] },
        { name: "Sicilian Defense", moves: ["e4", "c5"], blackResponses: ["Nc6", "e6"] }
    ];

    startScreen.style.display = "block";
    gameContainer.style.display = "none";
    restartButton.classList.add("hidden");
    darkmodeToggleButton.style.display = "none";
    fullscreenButton.style.display = "none";
    exitFullscreenButton.style.display = "none";
    closeFullscreenButton.style.display = "none";
    console.log("Initial visibility set: startScreen visible, gameContainer hidden");

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
        turnDisplay.textContent = gameOver ? winnerText : `${currentPlayer === "white" ? "White" : "Black"} is next`;
    }

    function updateOpeningDisplay() {
        const moves = moveNotations.map((m) => m.notation).filter((n) => !n.includes("-"));
        let moveText = `Move: ${moves[moves.length - 1] || "None"}`;
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
                        openingText += ` (Black: ${opening.blackResponses.join(" or ")})`;
                    }
                    break;
                }
            }
        }
        const timeText = `White: ${formatTime(whiteTime)} | Black: ${formatTime(blackTime)}`;
        openingDisplay.textContent = `${moveText}${openingText ? " | " + openingText : ""} | ${timeText}`;
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
            if (currentPlayer === "white") {
                whiteTime--;
                if (whiteTime <= 0) {
                    whiteTime = 0;
                    gameOver = true;
                    winnerText = "Black wins (Time out)!";
                    clearInterval(timerInterval);
                }
            } else {
                blackTime--;
                if (blackTime <= 0) {
                    blackTime = 0;
                    gameOver = true;
                    winnerText = "White wins (Time out)!";
                    clearInterval(timerInterval);
                }
            }
            updateOpeningDisplay();
            updateTurnDisplay();
            drawBoard();
        }, 1000);
    }

    function drawBoard() {
        console.log("drawBoard called with colors:", window.boardColors);
        if (!ctx) {
            console.error("Canvas context not available.");
            return;
        }

        const expectedWidth = Math.round(size * 8 + offsetX * 2);
        const expectedHeight = Math.round(size * 8 + offsetY * 2);
        canvas.width = expectedWidth;
        canvas.height = expectedHeight;
        canvas.style.width = `${expectedWidth}px`;
        canvas.style.height = `${expectedHeight}px`;
        canvas.style.display = "block";
        canvas.style.visibility = "visible";
        canvas.style.opacity = "1";
        canvas.style.position = "relative";

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
                    ctx.fillStyle = isDarkmode ? "#808080" : "#f0f0f0";
                }

                if (selectedPiece && selectedPiece.x === x && selectedPiece.y === y) {
                    ctx.fillStyle = isDarkmode ? "#505050" : "#c0c0c0";
                }

                const legalMove = legalMoves.find((move) => move.toX === x && move.toY === y);
                if (legalMove) {
                    const targetPiece = board[y][x];
                    const isCapture = targetPiece && (targetPiece === targetPiece.toUpperCase()) !== (selectedPiece.piece === selectedPiece.piece.toUpperCase());
                    ctx.fillStyle = isCapture ? (isDarkmode ? "#cc6666" : "#ffcccc") : (isDarkmode ? "#505050" : "#c0c0c0");
                }

                ctx.fillRect(offsetX + displayX * size, offsetY + displayY * size, size, size);

                if (legalMove && !((board[y][x] && (board[y][x] === board[y][x].toUpperCase()) !== (selectedPiece.piece === selectedPiece.piece.toUpperCase())))) {
                    ctx.fillStyle = isDarkmode ? "#a0a0a0" : "#808080";
                    const dotRadius = size * 0.1;
                    const centerX = offsetX + displayX * size + size / 2;
                    const centerY = offsetY + displayY * size + size / 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
                    ctx.fill();
                }

                if ((isWhiteInCheck && kingPositions.white && kingPositions.white.x === x && kingPositions.white.y === y) ||
                    (isBlackInCheck && kingPositions.black && kingPositions.black.x === x && kingPositions.black.y === y)) {
                    ctx.fillStyle = gameOver ? "#a94442" : "#d9534f";
                    ctx.fillRect(offsetX + displayX * size, offsetY + displayY * size, size, size);
                }

                const piece = board[y][x];
                if (piece) {
                    const isWhite = piece === piece.toUpperCase();
                    ctx.fillStyle = isWhite ? "#FFFFFF" : "#000000";
                    ctx.font = `${size * 0.7}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(pieces[piece], offsetX + displayX * size + size / 2, offsetY + displayY * size + size / 2);
                }
            }
        }

        // Beschriftung a-h und 1-8 hinzufügen
        ctx.fillStyle = isDarkmode ? "#e0e0e0" : "#333";
        ctx.font = `${size * 0.25}px Arial`;
        if (!effectiveRotation) {
            for (let i = 0; i < 8; i++) {
                ctx.fillText(String.fromCharCode(97 + i), offsetX + i * size + size / 2, offsetY + 8 * size + size * 0.25); // a-h unten
                ctx.fillText(String.fromCharCode(97 + i), offsetX + i * size + size / 2, offsetY - size * 0.05); // a-h oben
                ctx.fillText(8 - i, offsetX - size * 0.25, offsetY + i * size + size / 2); // 1-8 links
                ctx.fillText(8 - i, offsetX + 8 * size + size * 0.1, offsetY + i * size + size / 2); // 1-8 rechts
            }
        } else {
            for (let i = 0; i < 8; i++) {
                ctx.fillText(String.fromCharCode(97 + (7 - i)), offsetX + i * size + size / 2, offsetY + 8 * size + size * 0.25); // a-h unten
                ctx.fillText(String.fromCharCode(97 + (7 - i)), offsetX + i * size + size / 2, offsetY - size * 0.05); // a-h oben
                ctx.fillText(i + 1, offsetX - size * 0.25, offsetY + (7 - i) * size + size / 2); // 1-8 links
                ctx.fillText(i + 1, offsetX + 8 * size + size * 0.1, offsetY + (7 - i) * size + size / 2); // 1-8 rechts
            }
        }

        if (gameOver) {
            openingDisplay.textContent = winnerText;
        } else {
            updateOpeningDisplay();
        }

        console.log("Canvas styles after drawBoard:", {
            display: canvas.style.display,
            visibility: canvas.style.visibility,
            opacity: canvas.style.opacity,
            position: canvas.style.position,
            width: canvas.style.width,
            height: canvas.style.height,
            computedWidth: canvas.offsetWidth,
            computedHeight: canvas.offsetHeight,
        });
        console.log("GameContainer styles:", {
            display: gameContainer.style.display,
            visibility: gameContainer.style.visibility,
            opacity: gameContainer.style.opacity,
        });
        console.log("drawBoard completed");
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
        let maxWidth = window.innerWidth * (fullscreenMode ? 0.9 : 0.7);
        let maxHeight = window.innerHeight * (fullscreenMode ? 0.9 : 0.6);
        
        if (window.innerWidth <= 768) {
            maxWidth = window.innerWidth * (fullscreenMode ? 0.95 : 0.9);
            maxHeight = window.innerHeight * (fullscreenMode ? 0.7 : 0.5);
        }

        const boardDimension = Math.min(maxWidth, maxHeight);
        size = Math.floor(Math.max(boardDimension / 8, CONFIG.minBoardSize));
        const totalWidth = size * 8;
        const totalHeight = size * 8;

        offsetX = (window.innerWidth - totalWidth) / 2 * CONFIG.offset;
        offsetY = (window.innerHeight - totalHeight) / 2 * CONFIG.offset;

        canvas.width = totalWidth + offsetX * 2;
        canvas.height = totalHeight + offsetY * 2;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;

        console.log("Canvas resized to:", canvas.width, canvas.height);
        if (gameStarted) {
            console.log("Calling drawBoard from resizeCanvas");
            drawBoard();
        }
        console.log("resizeCanvas completed");
    }

    const debouncedResizeCanvas = debounce(resizeCanvas, 200);

    function toggleFullscreenMode() {
        console.log("toggleFullscreenMode called");
        if (!fullscreenMode) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch((err) => {
                    console.error("Failed to enter fullscreen mode:", err);
                });
            }
            document.body.classList.add("fullscreen");
            fullscreenMode = true;
            turnDisplay.style.display = "none";
            moveList.style.display = "none";
            openingDisplay.style.display = "none";
            fullscreenButton.style.display = "none";
            exitFullscreenButton.style.display = "none";
            closeFullscreenButton.style.display = "block";
            closeFullscreenButton.textContent = "Back";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch((err) => {
                    console.error("Failed to exit fullscreen mode:", err);
                });
            }
            document.body.classList.remove("fullscreen");
            fullscreenMode = false;
            turnDisplay.style.display = "block";
            moveList.style.display = "block";
            openingDisplay.style.display = "block";
            fullscreenButton.style.display = "block";
            exitFullscreenButton.style.display = "none";
            closeFullscreenButton.style.display = "none";
        }
        resizeCanvas();
        drawBoard();
        console.log("toggleFullscreenMode completed");
    }

    document.addEventListener('fullscreenchange', () => {
        console.log("fullscreenchange event fired");
        fullscreenMode = !!document.fullscreenElement;
        document.body.classList.toggle("fullscreen", fullscreenMode);
        if (fullscreenMode) {
            turnDisplay.style.display = "none";
            moveList.style.display = "none";
            openingDisplay.style.display = "none";
            fullscreenButton.style.display = "none";
            exitFullscreenButton.style.display = "none";
            closeFullscreenButton.style.display = "block";
            closeFullscreenButton.textContent = "Back";
        } else {
            turnDisplay.style.display = "block";
            moveList.style.display = "block";
            openingDisplay.style.display = "block";
            fullscreenButton.style.display = "block";
            exitFullscreenButton.style.display = "none";
            closeFullscreenButton.style.display = "none";
        }
        resizeCanvas();
        drawBoard();
        console.log("fullscreenchange handler completed");
    });

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
                        castlingAvailability: { ...castlingAvailability },
                        piece: selectedPiece.piece
                    });
                    return;
                }
                moveHistory.push({
                    board: board.map(row => [...row]),
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
                if (piece && (isWhitePiece === (currentPlayer === "white"))) {
                    selectedPiece = { x: boardX, y: boardY, piece };
                    legalMoves = getLegalMoves(boardX, boardY);
                    if (legalMoves.length === 0) {
                        selectedPiece = null;
                    }
                } else {
                    selectedPiece = null;
                    legalMoves = [];
                }
            }
            drawBoard();
        }
        console.log("handleCanvasClick completed");
    }

    function showPenaltyMessage() {
        console.log("showPenaltyMessage called");
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
        console.log("showPenaltyMessage completed");
    }

    function initializeGameButtons() {
        console.log("Initializing game buttons...");
        console.log("startButton:", startButton);
        console.log("startFreestyleButton:", startFreestyleButton);

        if (!startButton) {
            console.error("startButton not found. Check HTML for ID 'startButton'.");
            alert("Error: Start Button not found. Please ensure the button with ID 'startButton' exists in the HTML.");
            return;
        }
        console.log("startButton initialized:", startButton);
        startButton.addEventListener("click", () => startGame(false));

        if (!startFreestyleButton) {
            console.error("startFreestyleButton not found. Check HTML for ID 'startFreestyleButton'.");
            alert("Error: Start Freestyle Button not found. Please ensure the button with ID 'startFreestyleButton' exists in the HTML.");
            return;
        }
        console.log("startFreestyleButton initialized:", startFreestyleButton);
        startFreestyleButton.addEventListener("click", () => startGame(true));

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
            board = lastState.board;
            currentPlayer = lastState.currentPlayer;
            moveCount = lastState.moveCount;
            castlingAvailability = lastState.castlingAvailability;
            updateKingPositions();
            updateCheckStatus();
            if (currentPlayer === "white") whiteTime = Math.max(whiteTime - CONFIG.undoPenalty, 0);
            else blackTime = Math.max(blackTime - CONFIG.undoPenalty, 0);
            showPenaltyMessage();
            selectedPiece = null;
            legalMoves = [];
            moveNotations.pop();
            lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
            updateMoveHistory();
            drawBoard();
        });

        restartButton.addEventListener("click", () => {
            startGame(false);
        });

        designButton.addEventListener("click", () => {
            console.log("Design button clicked");
            currentDesign = currentDesign % 5 + 1;
            window.updateBoardColors(currentDesign);
            drawBoard();
        });

        fullscreenButton.addEventListener("click", toggleFullscreenMode);
        exitFullscreenButton.addEventListener("click", toggleFullscreenMode);
        closeFullscreenButton.addEventListener("click", () => {
            if (fullscreenMode) {
                toggleFullscreenMode();
            }
        });

        canvas.addEventListener("click", handleCanvasClick);
        canvas.addEventListener("touchstart", handleCanvasClick, { passive: false });

        closeFullscreenButton.textContent = "Back";
    }

    window.addEventListener("resize", debouncedResizeCanvas);
    resizeCanvas();
    initializeGameButtons();
});
