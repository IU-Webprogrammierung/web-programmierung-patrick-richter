/**
 * @module logger
 * @description Zentraler Logger-Service für konsistente Logging-Kontrolle.
 * Unterdrückt alle Logs außer Fehler und Warnungen in der Produktionsumgebung.
 */

// Umgebung erkennen (Vite-spezifisch)
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

const logger = {
  /**
   * Debug-Meldungen (nur in Entwicklungsumgebung)
   * @param {...any} args - Die zu loggenden Argumente
   */
  debug(...args) {
    if (!isProduction) {
      console.debug(...args);
    }
  },

  /**
   * Standard-Logs (nur in Entwicklungsumgebung)
   * @param {...any} args - Die zu loggenden Argumente
   */
  log(...args) {
    if (!isProduction) {
      console.log(...args);
    }
  },

  /**
   * Warnungen (immer sichtbar)
   * @param {...any} args - Die zu loggenden Argumente
   */
  warn(...args) {
    console.warn(...args);
  },

  /**
   * Fehler (immer sichtbar)
   * @param {...any} args - Die zu loggenden Argumente
   */
  error(...args) {
    console.error(...args);
  }
};

export default logger;