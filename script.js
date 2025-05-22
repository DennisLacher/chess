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
    if (!closeFullscreenButton) missingElements.push("closeFullscreenButton (id='closeFullscreenButton')");
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
        4: { light:
