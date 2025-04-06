/**
 * @module events
 * @description Zentrale Definition von Event-Typen und Event-Handling-Hilfsfunktionen.
 */

// Event-Typen als Konstanten definieren für konsistente Nutzung
export const EVENT_TYPES = {
  // Bestehende Events
  ACTIVE_PROJECT_CHANGED: 'activeProjectChanged',
  ACTIVE_IMAGE_CHANGED: 'activeImageChanged',
  
  // Initialisierungs-Events
  APP_INIT_STARTED: 'appInitStarted',
  PROJECT_DATA_LOADED: 'projectDataLoaded',
  ALL_DATA_LOADED: 'allDataLoaded',
  DOM_STRUCTURE_READY: 'domStructureReady',
  UI_COMPONENTS_READY: 'uiComponentsReady',
  APP_INIT_COMPLETE: 'appInitComplete'
};

// Hilfsfunktionen für Event-Handling mit verbessertem Logging
export function dispatchCustomEvent(eventName, detail) {
  console.log(`Event wird gesendet: ${eventName}`, detail || {});
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

export function addEventListener(eventName, handler) {
  console.log(`Event-Listener wird registriert für: ${eventName}`);
  document.addEventListener(eventName, handler);
  return handler; // Handler zurückgeben für mögliche Entfernung
}

export function removeEventListener(eventName, handler) {
  console.log(`Event-Listener wird entfernt für: ${eventName}`);
  document.removeEventListener(eventName, handler);
}