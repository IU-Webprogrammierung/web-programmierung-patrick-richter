/**
 * @module events
 * @description Zentrale Definition von Event-Typen und Event-Handling-Hilfsfunktionen.
 * Stellt einheitliche Event-Namen zur Verfügung für eine konsistente eventbasierte Kommunikation zwischen Modulen.
 * 
 * Funktionen: dispatchCustomEvent(), addEventListener(), removeEventListener()
 */

// Event-Typen als Konstanten definieren für konsistente Nutzung
// Zu bestehenden Event-Typen hinzufügen:
export const EVENT_TYPES = {
  // Bestehende Events
  ACTIVE_PROJECT_CHANGED: 'activeProjectChanged',
  ACTIVE_IMAGE_CHANGED: 'activeImageChanged',
  FOOTER_ACTIVATED: 'footerActivated',
  FOOTER_DEACTIVATED: 'footerDeactivated',
  
  // Initialisierungs-Events
  APP_INIT_STARTED: 'appInitStarted',
  DATA_LOADED: 'dataLoaded',
  DOM_STRUCTURE_READY: 'domStructureReady',
  UI_COMPONENTS_READY: 'uiComponentsReady',
  APP_INIT_COMPLETE: 'appInitComplete'
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