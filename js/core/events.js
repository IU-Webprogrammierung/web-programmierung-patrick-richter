/**
 * @module events
 * @description Zentrale Definition von Event-Typen und Event-Handling-Hilfsfunktionen.
 * Stellt einheitliche Event-Namen zur Verfügung für eine konsistente eventbasierte Kommunikation zwischen Modulen.
 * 
 * Funktionen: dispatchCustomEvent(), addEventListener(), removeEventListener()
 */

// Event-Typen als Konstanten definieren für konsistente Nutzung
export const EVENT_TYPES = {
  ACTIVE_PROJECT_CHANGED: 'activeProjectChanged',
  ACTIVE_IMAGE_CHANGED: 'activeImageChanged',
  FOOTER_ACTIVATED: 'footerActivated'  // Neues standardisiertes Event
};
  
  // Hilfsfunktionen für Event-Handling
  export function dispatchCustomEvent(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  
  export function addEventListener(eventName, handler) {
    document.addEventListener(eventName, handler);
  }
  
  export function removeEventListener(eventName, handler) {
    document.removeEventListener(eventName, handler);
  }