/**
 * navigationUtils.js
 * Hilfsfunktionen für die Projekt-Navigation und Brücke zur neuen API
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
// TODO kann entfernt werden, wenn alle Module umgestellt sind
/**
 * Brückenfunktion: Navigiert zu einem Projekt per ID (für Kompatibilität)
 * @param {string|number} projectId - Die ID des Projekts
 */
export function navigateToProject(projectId) {
  console.log(`navigateToProject aufgerufen mit ID: ${projectId}`);
  
  if (!navigationAPI) {
    console.error('Navigation-API noch nicht initialisiert. Kann nicht zu Projekt navigieren.');
    return;
  }
  
  // Neue API-Funktion aufrufen
  navigationAPI.navigateToProject(projectId);
}

// Hilfsfunktionen für die Navigation
export function isFooter(element) {
  return element && element.classList.contains('footer-container');
}

export function getLastRegularProject(projects) {
  const lastIndex = projects.length - 1;
  const secondLastIndex = lastIndex - 1;
  
  if (isFooter(projects[lastIndex])) {
    return projects[secondLastIndex];
  }
  
  return projects[lastIndex];
}

export function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export function getAdjacentProjectIndex(currentIndex, direction, total) {
  const newIndex = currentIndex + direction;
  
  // Wraparound von Ende zum Anfang und umgekehrt
  if (newIndex < 0) return total - 1;
  if (newIndex >= total) return 0;
  
  return newIndex;
}