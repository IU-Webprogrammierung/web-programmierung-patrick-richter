/**
 * navigationUtils.js
 * Hilfsfunktionen für die Projekt-Navigation und API-Zugriff
 */

// Speichert die API-Instanz zur Laufzeit
let navigationAPI = null;

/**
 * Registriert die Navigation-API für andere Module
 * @param {Object} api - Die Navigation-API aus projectNavigator.js
 */
export function registerNavigationAPI(api) {
  console.log('Navigation-API registriert');
  navigationAPI = api;
  return api;
}

/**
 * Gibt die aktuell registrierte Navigation-API zurück
 * @returns {Object} Die Navigation-API oder null, wenn nicht initialisiert
 */
export function getNavigationAPI() {
  if (!navigationAPI) {
    console.warn('Navigation-API noch nicht initialisiert.');
  }
  return navigationAPI;
}

/**
 * Prüft, ob ein Element der Footer ist
 * @param {Element} element - Das zu prüfende Element
 * @returns {boolean} True, wenn das Element der Footer ist
 */
export function isFooter(element) {
  console.log('Footer-Element gefunden');
  return element && element.classList.contains('footer-container');
}

/**
 * Findet das letzte reguläre Projekt (vor dem Footer)
 * @param {NodeList|Array} projects - Die Liste aller Projekte
 * @returns {Element} Das letzte reguläre Projekt
 */
export function getLastRegularProject(projects) {
  // Footer ist normalerweise das letzte Element
  const lastIndex = projects.length - 1;
  const secondLastIndex = lastIndex - 1;
  
  // Prüfen, ob das letzte Element der Footer ist
  if (isFooter(projects[lastIndex])) {
    return projects[secondLastIndex];
  }
  
  // Fallback, falls Footer nicht gefunden wurde
  return projects[lastIndex];
}

/**
 * Verzögert eine Funktion um eine bestimmte Zeit
 * @param {Function} func - Die auszuführende Funktion
 * @param {number} delay - Die Verzögerung in Millisekunden
 * @returns {Function} Die verzögerte Funktion
 */
export function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Findet den nächsten oder vorherigen Projektindex
 * @param {number} currentIndex - Der aktuelle Projektindex
 * @param {number} direction - Die Richtung (1 = nächstes, -1 = vorheriges)
 * @param {number} total - Gesamtzahl der Projekte
 * @returns {number} Der neue Projektindex
 */
export function getAdjacentProjectIndex(currentIndex, direction, total) {
  const newIndex = currentIndex + direction;
  
  // Wraparound von Ende zum Anfang und umgekehrt
  if (newIndex < 0) return total - 1;
  if (newIndex >= total) return 0;
  
  return newIndex;
}