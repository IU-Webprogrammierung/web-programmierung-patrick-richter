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
/**
 * Prüft ob ein Element oder Index den Footer repräsentiert
 * Berücksichtigt die besondere Beziehung zwischen navigableElements und uiState.projects
 */
export function checkFooter(elementOrIndex, elements) {
  // Element-direkte Prüfung
  if (elementOrIndex instanceof Element) {
    return elementOrIndex.id === "site-footer";
  }
  
  // Index-basierte Prüfung
  if (typeof elementOrIndex === 'number') {
    // Fall 1: Der Footer ist das letzte Element in navigableElements
    // (wird durch index === navigableElements.length - 1 identifiziert)
    const navigableElements = [
      ...document.querySelectorAll(".project"),
      document.getElementById("site-footer")
    ];
    
    if (elementOrIndex === navigableElements.length - 1) {
      return true;
    }
    
    // Fall 2: Wenn ein elements-Array übergeben wurde, prüfe ob der Index
    // auf ein existierendes Element verweist und ob dieses der Footer ist
    if (Array.isArray(elements) && elementOrIndex < elements.length) {
      return elements[elementOrIndex]?.id === "site-footer";
    }
  }
  
  return false;
}