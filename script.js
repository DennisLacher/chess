document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("chessboard");
  if (!canvas) {
    console.log("Canvas element not found.");
    return;
  }