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
 * Prüft, ob ein Element oder ein Index zum Footer gehört
 * @param {Element|number} elementOrIndex - Element oder Index zu prüfen
 * @param {Array} [elements] - Optional: Array von Elementen für Index-Zugriff
 * @returns {boolean} True, wenn es sich um den Footer handelt
 */
export function isFooter(elementOrIndex, elements) {
  // Wenn ein Index übergeben wurde und elements vorhanden ist
  if (typeof elementOrIndex === 'number' && Array.isArray(elements)) {
    // Prüfen, ob der Index auf den Footer verweist (letztes Element)
    return elementOrIndex === elements.length - 1 && 
           elements[elementOrIndex]?.id === "site-footer";
  }
  
  // Wenn ein Element übergeben wurde
  if (elementOrIndex instanceof Element) {
    return elementOrIndex.id === "site-footer";
  }
  
  // In allen anderen Fällen: kein Footer
  return false;
}