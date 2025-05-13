// Konfigurationsdatei für das Schachspiel

// Brett-Einstellungen
export const CONFIG = {
  defaultBoardSize: 45, // Standardgröße der Felder in Pixeln (anpassbar)
  minBoardSize: 35,    // Minimale Größe für kleine Bildschirme
  maxWidthFactor: 0.9, // Maximale Breite relativ zum Fenster (90%)
  offset: 0.5,         // Offset für Koordinaten in Feldern
};

// Debugging-Einstellungen
export const DEBUG = {
  enableLogging: true, // Aktiviert detaillierte Logs in der Konsole
  logLevel: "debug",   // Mögliche Werte: "debug", "info", "error"
};

// Sound-Einstellungen (optional)
export const SOUND = {
  enabledByDefault: true, // Standardmäßig Sound aktiviert
  moveSound: "move.mp3",  // Platzhalter für einen Sound (muss noch hinzugefügt werden)
};