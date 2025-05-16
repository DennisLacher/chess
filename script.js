body {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
  transition: background-color 0.3s;
}

body.darkmode {
  background-color: #333;
  color: #e0e0e0;
}

#startScreen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

#startButton, #startFreestyleButton {
  width: 200px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

#startButton:hover, #startFreestyleButton:hover {
  background-color: #45a049;
}

#gameContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

#turnDisplay {
  width: 100%;
  text-align: center;
  padding: 5px;
  background-color: #f0f0f0;
  color: #333;
  font-size: 16px;
}

body.darkmode #turnDisplay {
  background-color: #333;
  color: #e0e0e0;
}

#boardAndControls {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

#boardContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#chessboard {
  display: block;
  width: auto !important;
  height: auto !important;
  transform: none !important;
}

#openingDisplay {
  margin-top: 10px;
  font-size: 14px;
  text-align: center;
  color: #333;
}

body.darkmode #openingDisplay {
  color: #e0e0e0;
}

#buttonContainer {
  margin-left: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

#buttonContainer button {
  width: 120px;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

#buttonContainer button:hover {
  background-color: #45a049;
}

body.darkmode #buttonContainer button {
  background-color: #666;
}

body.darkmode #buttonContainer button:hover {
  background-color: #555;
}

#moveListContainer {
  margin-top: 20px;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  box-sizing: border-box;
}

body.darkmode #moveListContainer {
  background-color: #444;
  border-color: #666;
}

#moveList {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
}

#moveList li {
  padding: 5px 0;
}

.hidden {
  display: none;
}

.penalty-message {
  position: absolute;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  animation: fadeOut 2s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

#promotionChoices {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #ccc;
  z-index: 1000;
}

body.darkmode #promotionChoices {
  background-color: #444;
  border-color: #666;
}

#promotionChoices button {
  padding: 5px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 24px;
}

@media (max-width: 768px) {
  #gameContainer {
    max-width: 100%;
    padding: 10px;
  }

  #boardAndControls {
    flex-direction: column;
    align-items: center;
  }

  #buttonContainer {
    margin-left: 0;
    margin-top: 10px;
    justify-content: center;
  }

  #buttonContainer button {
    width: 100px;
    padding: 8px;
    font-size: 12px;
  }

  #moveListContainer {
    max-height: 100px;
  }

  #startButton, #startFreestyleButton {
    width: 180px;
    padding: 10px;
    font-size: 14px;
  }
}

body.fullscreen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}

body.fullscreen #gameContainer {
  justify-content: center;
  align-items: center;
}

body.fullscreen #boardAndControls {
  justify-content: center;
  align-items: center;
}

body.fullscreen #turnDisplay,
body.fullscreen #buttonContainer,
body.fullscreen #moveListContainer,
body.fullscreen #openingDisplay {
  display: none;
}

body.fullscreen #boardContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
