const canvas = document.getElementById("chessboard");
const ctx = canvas.getContext("2d");

const tileSize = canvas.width / 8;

const pieces = [];
let selectedPiece = null;

// Brettfarben
const darkColor = "#769656";
const lightColor = "#eeeed2";
const highlightColor = "#a9a9a9";

// Brett zeichnen
function drawBoard() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? lightColor : darkColor;
            ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        }
    }
}

// Schachfiguren darstellen (einige als Unicode)
const pieceSymbols = {
    white: {
        pawn: "♙",
        rook: "♖",
        knight: "♘",
        bishop: "♗",
        queen: "♕",
        king: "♔",
    },
    black: {
        pawn: "♟",
        rook: "♜",
        knight: "♞",
        bishop: "♝",
        queen: "♛",
        king: "♚",
    }
};

// Startpositionen der Figuren
function setupPieces() {
    pieces.length = 0;

    const order = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

    for (let col = 0; col < 8; col++) {
        pieces.push({ type: "pawn", color: "white", row: 6, col });
        pieces.push({ type: "pawn", color: "black", row: 1, col });
        pieces.push({ type: order[col], color: "white", row: 7, col });
        pieces.push({ type: order[col], color: "black", row: 0, col });
    }
}

// Figuren zeichnen
function drawPieces() {
    ctx.font = `${tileSize * 0.75}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const piece of pieces) {
        const x = piece.col * tileSize + tileSize / 2;
        const y = piece.row * tileSize + tileSize / 2;
        ctx.fillStyle = piece.color === "white" ? "#fff" : "#000";
        ctx.fillText(pieceSymbols[piece.color][piece.type], x, y);
    }
}

// Spielbrett und Figuren neu zeichnen
function render() {
    drawBoard();
    drawPieces();

    if (selectedPiece) {
        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(
            selectedPiece.col * tileSize,
            selectedPiece.row * tileSize,
            tileSize,
            tileSize
        );
    }
}

// Koordinaten aus Mausklick ermitteln
function getClickedTile(x, y) {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    return { row, col };
}

// Klick-Logik
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { row, col } = getClickedTile(x, y);
    const clickedPiece = pieces.find(p => p.row === row && p.col === col);

    if (selectedPiece && (!clickedPiece || clickedPiece.color !== selectedPiece.color)) {
        // Bewegung durchführen
        selectedPiece.row = row;
        selectedPiece.col = col;

        // Gegenspielerfigur schlagen
        if (clickedPiece) {
            const index = pieces.indexOf(clickedPiece);
            if (index !== -1) pieces.splice(index, 1);
        }

        selectedPiece = null;
    } else if (clickedPiece) {
        selectedPiece = clickedPiece;
    } else {
        selectedPiece = null;
    }

    render();
});

// Initialisierung
setupPieces();
render();
