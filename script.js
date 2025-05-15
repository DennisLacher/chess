body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background: #f0f0f0; /* Altes, schlichtes Grau für den Hintergrund */
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

body.darkmode {
  background: #333; /* Dunkles Grau für Darkmode */
}

/* Neues Design nur für Startseite */
#startScreen {
  text-align: center;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border: 5px solid #d4a017;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
}

body.darkmode #startScreen {
  background: linear-gradient(45deg, #1a252f, #1e4c6e);
}

h1 {
  font-size: 3em;
  color: #f1c40f;
  text-shadow: 2px 2px 4px #000;
  margin-bottom: 30px;
  font-family: 'Georgia', serif;
}

/* Buttons auf Startseite */
#startScreen button {
  font-size: 1.5em;
  padding: 15px 30px;
  margin: 10px;
  border: none;
  border-radius: 10px;
  background: #e74c3c;
  color: white;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 200px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

#startScreen button:hover {
  transform: scale(1.1);
  background: #c0392b;
}

#startScreen button:active {
  transform: scale(0.95);
}

/* Altes Design für das Spielfeld */
#gameContainer {
  text-align: center;
  background: #f0f0f0; /* Altes, schlichtes Grau */
  height: 100vh;
  width: 100%;
  position: relative;
}

body.darkmode #gameContainer {
  background: #333; /* Dunkles Grau für Darkmode */
}

#chessboard {
  display: block;
  margin: 0 auto;
  max-width: 90%;
  max-height: 90%;
}

/* Alte Anordnung der UI-Elemente */
#turnIndicator {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #000;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border: 1px solid #000;
  font-size: 1.2em;
}

body.darkmode #turnIndicator {
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
}

#moveList {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: #000;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border: 1px solid #000;
  max-height: 150px;
  overflow-y: auto;
  width: 200px;
}

body.darkmode #moveList {
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
}

#openingDisplay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: #000;
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border: 1px solid #000;
  width: 200px;
}

body.darkmode #openingDisplay {
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
}

/* Alte Button-Stile für das Spielfeld */
button[id^="rotate"], button[id^="smartphoneMode"], button[id^="soundToggle"], button[id^="undo"], button[id^="restart"], button[id^="design"], button[id^="darkmodeToggle"], button[id^="fullscreen"], button[id^="exitFullscreen"] {
  position: absolute;
  font-size: 1em;
  padding: 8px 16px;
  margin: 5px;
  border: 1px solid #000;
  border-radius: 0; /* Keine abgerundeten Ecken */
  background: #ccc; /* Schlichtes Grau */
  color: #000;
  cursor: pointer;
}

body.darkmode button[id^="rotate"], body.darkmode button[id^="smartphoneMode"], body.darkmode button[id^="soundToggle"], body.darkmode button[id^="undo"], body.darkmode button[id^="restart"], body.darkmode button[id^="design"], body.darkmode button[id^="darkmodeToggle"], body.darkmode button[id^="fullscreen"], body.darkmode button[id^="exitFullscreen"] {
  background: #555;
  color: #fff;
  border: 1px solid #fff;
}

button[id^="rotate"]:hover, button[id^="smartphoneMode"]:hover, button[id^="soundToggle"]:hover, button[id^="undo"]:hover, button[id^="restart"]:hover, button[id^="design"]:hover, button[id^="darkmodeToggle"]:hover, button[id^="fullscreen"]:hover, button[id^="exitFullscreen"]:hover {
  background: #bbb; /* Leicht dunkleres Grau beim Hover */
}

body.darkmode button[id^="rotate"]:hover, body.darkmode button[id^="smartphoneMode"]:hover, body.darkmode button[id^="soundToggle"]:hover, body.darkmode button[id^="undo"]:hover, body.darkmode button[id^="restart"]:hover, body.darkmode button[id^="design"]:hover, body.darkmode button[id^="darkmodeToggle"]:hover, body.darkmode button[id^="fullscreen"]:hover, body.darkmode button[id^="exitFullscreen"]:hover {
  background: #666;
}

/* Positionen der Buttons */
#rotateButton { top: 10px; right: 10px; }
#smartphoneModeButton { top: 40px; right: 10px; }
#soundToggleButton { top: 70px; right: 10px; }
#undoButton { top: 100px; right: 10px; }
#restartButton { top: 130px; right: 10px; }
#designButton { top: 160px; right: 10px; }
#darkmodeToggleButton { top: 190px; right: 10px; }
#fullscreenButton { top: 220px; right: 10px; }
#exitFullscreenButton { top: 220px; right: 10px; }

.hidden {
  display: none !important;
}

.penalty-message {
  position: absolute;
  background: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 1em;
  animation: fadeOut 2s forwards;
  z-index: 1000;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; visibility: hidden; }
}

body.fullscreen {
  overflow: hidden;
}

body.fullscreen #gameContainer {
  display: block;
}
