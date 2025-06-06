/**
 * @module navigationUtils
 * @description Hilfsfunktionen für die Projekt-Navigation und API-Zugriff.
 * Stellt Funktionen für die Erkennung des Footers und die Verwaltung 
 * der Navigations-API bereit.
 * Enthält Funktionen:
 * - registerNavigationAPI()
 * - getNavigationAPI()
 * - checkFooter()
 */

import logger from '@core/logger';

// Speichert die API-Instanz zur Laufzeit
let navigationAPI = null;

/**
 * Registriert die Navigation-API für andere Module
 * @param {Object} api - Die Navigation-API aus projectNavigator.js
 * @returns {Object} Die übergebene API für Method-Chaining
 */
export function registerNavigationAPI(api) {
  logger.log('Navigation-API registriert');
  navigationAPI = api;
  return api;
}

/**
 * Gibt die aktuell registrierte Navigation-API zurück
 * @returns {Object} Die Navigation-API oder null, wenn nicht initialisiert
 */
export function getNavigationAPI() {
  if (!navigationAPI) {
    logger.warn('Navigation-API noch nicht initialisiert.');
  }
  return navigationAPI;
}

/**
 * Prüft, ob ein Element oder ein Index zum Footer gehört
 * @param {Element|number} elementOrIndex - Element oder Index zu prüfen
 * @param {Array} [elements] - Optional: Array von Elementen für Index-Zugriff
 * @returns {boolean} True, wenn es sich um den Footer handelt
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