/**
 * @module routerUtils
 * @description Hilfsfunktionen für Routing-Operationen und URL-Manipulation.
 * Enthält Funktionen zur Slug-Normalisierung, URL-Pfadverarbeitung und Projektvalidierung.
 * 
 * Funktionen:
 * - normalizeSlug() - Konvertiert Strings in URL-freundliche Slugs
 * - getSlugFromPath() - Extrahiert den Slug aus einem URL-Pfad
 * - isValidProject() - Prüft, ob ein Projektindex gültig ist
 * - updateURL() - Aktualisiert die Browser-URL
 */

/**
 * Konvertiert einen String in einen URL-freundlichen Slug
 * @param {string} str - Der zu konvertierende String
 * @returns {string} Der normalisierte URL-Slug
 */
export function normalizeSlug(str) {
    if (!str) return "";
  
    return str
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  
  /**
   * Extrahiert den Slug aus einem URL-Pfad
   * @param {string} path - Der URL-Pfad
   * @returns {string} Der extrahierte Slug
   */
  export function getSlugFromPath(path) {
    return path.replace(/^\/|\/$/g, "");
  }
  
  /**
   * Prüft, ob ein Projektindex gültig ist
   * @param {number} index - Der zu prüfende Index
   * @param {Array} projects - Die Liste der Projekte
   * @returns {boolean} True, wenn der Index gültig ist
   */
  export function isValidProject(index, projects) {
    return index >= 0 && index < projects.length;
  }
  
  /**
   * Aktualisiert die Browser-URL ohne Seitenneuladen
   * @param {string} path - Der neue Pfad
   * @param {Object} state - Optionales State-Objekt für History API
   */
  export function updateURL(path, state = {}) {
    if (window.location.pathname !== path) {
      console.log(`URL-Update: "${path}"`);
      window.history.replaceState(state, "", path);
    }
  }