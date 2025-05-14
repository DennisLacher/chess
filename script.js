<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chess Game</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f0f0;
      transition: background-color 0.3s, color 0.3s;
    }

    body.darkmode {
      background-color: #1f1f1f;
      color: #ffffff;
    }

    #startScreen {
      text-align: center;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s, color 0.3s;
    }

    body.darkmode #startScreen {
      background-color: #333333;
      color: #ffffff;
    }

    #startScreen h1 {
      margin-bottom: 20px;
      font-size: 2em;
    }

    #startScreen button, #gameContainer button {
      padding: 10px 20px;
      margin: 5px;
      font-size: 1em;
      cursor: pointer;
      border: none;
      border-radius: 5px;
      background-color: #4CAF50;
      color: white;
      transition: background-color 0.3s, transform 0.1s;
    }

    #startScreen button:hover, #gameContainer button:hover {
      background-color: #45a049;
      transform: scale(1.05);
    }

    body.darkmode #startScreen button, body.darkmode #gameContainer button {
      background-color: #666;
    }

    body.darkmode #startScreen button:hover, body.darkmode #gameContainer button:hover {
      background-color: #555;
    }

    #gameContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s, color 0.3s;
    }

    body.darkmode #gameContainer {
      background-color: #333333;
      color: #ffffff;
    }

    #gameWrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    #turnIndicator {
      margin: 10px 0;
      font-size: 1.2em;
    }

    #moveList {
      list-style: none;
      margin: 10px 0;
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
      width: 100%;
      max-width: 300px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
      transition: background-color 0.3s, color 0.3s;
    }

    body.darkmode #moveList {
      background-color: #444;
      border-color: #666;
    }

    body.darkmode #moveList li {
      color: #ffffff;
    }

    #moveList li {
      padding: 5px;
      color: #333;
    }

    #openingDisplay {
      margin-top: 10px;
      font-style: italic;
      color: #666;
      transition: color 0.3s;
    }

    body.darkmode #openingDisplay {
      color: #bbb;
    }

    .hidden {
      display: none !important;
    }

    @media (min-width: 641px) {
      #gameWrapper {
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
      }
      #gameWrapper > div:first-child {
        order: 1;
      }
      #moveList {
        order: 2;
        width: 200px;
        margin: 0 0 0 5px; /* Reduziert von 20px auf 5px, um die Liste näher ans Brett zu bringen */
        max-height: 400px;
      }
    }

    @media (max-width: 640px) {
      #gameWrapper {
        flex-direction: column;
        align-items: center;
      }
      #moveList {
        width: 100%;
        max-width: 300px;
        margin: 10px 0;
      }
    }
  </style>
</head>
<body>
  <div id="startScreen">
    <h1>Schachspiel</h1>
    <button id="startButton">Spiel starten</button>
    <button id="startFreestyleButton">Freestyle-Modus</button>
    <button id="darkmodeToggleButton">Darkmode</button>
  </div>

  <div id="gameContainer" class="hidden">
    <div id="gameWrapper">
      <div>
        <canvas id="chessboard"></canvas>
        <div id="turnIndicator">Am Zug: Weiß</div>
        <div>
          <button id="rotateButton">Brett drehen</button>
          <button id="smartphoneModeButton">Smartphone-Modus</button>
          <button id="soundToggleButton">Sound ausschalten</button>
          <button id="undoButton">Rückgängig</button>
          <button id="darkmodeToggleButton">Darkmode</button>
        </div>
      </div>
      <ul id="moveList"></ul>
    </div>
    <div id="openingDisplay">Zug: Kein Zug</div>
    <button id="restartButton" class="hidden">Neustart</button>
  </div>

  <script src="script.js"></script>
</body>
</html>
