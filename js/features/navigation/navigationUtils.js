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
  return element && element.id === "site-footer";
}