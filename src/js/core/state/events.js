/**
 * @module events
 * @description Zentrale Definition von Event-Typen und Event-Handling-Hilfsfunktionen.
 * Steuert die gesamte event-basierte Kommunikation der Anwendung mit einem
 * festgelegten Initialisierungsfluss und Benutzerinteraktions-Events.
 * Enthält Funktionen:
 * - dispatchCustomEvent()
 * - addEventListener()
 * - removeEventListener()
 * 
 * @fires EVENT_TYPES.APP_INIT_STARTED - Start des Initialisierungsprozesses
 * @fires EVENT_TYPES.PROJECT_DATA_LOADED - Nach Ladung der Projektdaten
 * @fires EVENT_TYPES.ALL_DATA_LOADED - Nach Ladung aller Anwendungsdaten
 * @fires EVENT_TYPES.DOM_STRUCTURE_READY - Nach Erstellung der DOM-Struktur
 * @fires EVENT_TYPES.UI_COMPONENTS_READY - Nach UI-Komponenten-Initialisierung
 * @fires EVENT_TYPES.APP_INIT_COMPLETE - Abschluss der Anwendungsinitialisierung
 * @fires EVENT_TYPES.INITIAL_PROJECT_SET - Bei Festlegung des ersten Projekts
 * @fires EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Bei Wechsel des aktiven Projekts
 * @fires EVENT_TYPES.ACTIVE_IMAGE_CHANGED - Bei Wechsel des aktiven Bildes
 * @fires EVENT_TYPES.INITIAL_ANIMATION_STARTED/COMPLETED - Animation-Events
 */

// Event-Typen als Konstanten definieren für konsistente Nutzung
export const EVENT_TYPES = {
  // Initialisierungs-Events
  APP_INIT_STARTED: 'appInitStarted',          // Start des gesamten Initialisierungsprozesses
  PROJECT_DATA_LOADED: 'projectDataLoaded',    // Projektdaten erfolgreich geladen
  ALL_DATA_LOADED: 'allDataLoaded',            // Alle Daten (inkl. Footer, About) geladen
  DOM_STRUCTURE_READY: 'domStructureReady',    // DOM-Struktur vollständig aufgebaut
  UI_COMPONENTS_READY: 'uiComponentsReady',    // UI-Komponenten initialisiert
  APP_INIT_COMPLETE: 'appInitComplete',        // Anwendung vollständig initialisiert

  // Benutzerinteraktions-Events
  INITIAL_PROJECT_SET: 'initialProjectSet',    // Erstes Projekt gesetzt
  ACTIVE_PROJECT_CHANGED: 'activeProjectChanged', // Aktives Projekt gewechselt
  ACTIVE_IMAGE_CHANGED: 'activeImageChanged',     // Aktives Bild innerhalb eines Projekts gewechselt

  // Animations-Events
  INITIAL_ANIMATION_STARTED: 'initialAnimation:started',
  INITIAL_ANIMATION_COMPLETED: 'initialAnimation:completed'
};

/**
 * Erzeugt und versendet ein benutzerdefiniertes Event mit optionalen Details
 * @param {string} eventName - Name des zu sendenden Events (aus EVENT_TYPES)
 * @param {Object} [detail={}] - Optionale Detaildaten für das Event
 */
export function dispatchCustomEvent(eventName, detail = {}) {
  console.log(`Event wird gesendet: ${eventName}`, detail);
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Zentrale Registrierungsfunktion für Event-Listener
 * @param {string} eventName - Name des zu überwachenden Events (aus EVENT_TYPES)
 * @param {Function} handler - Event-Handler-Funktion
 * @returns {Function} Der Handler (für mögliche spätere Entfernung)
 */
export function addEventListener(eventName, handler) {
  console.log(`Event-Listener wird registriert für: ${eventName}`);
  document.addEventListener(eventName, handler);
  return handler; // Handler zurückgeben für mögliche Entfernung
}

/**
 * Entfernt einen zuvor registrierten Event-Listener
 * @param {string} eventName - Name des Events (aus EVENT_TYPES)
 * @param {Function} handler - Zu entfernender Event-Handler
 */
export function removeEventListener(eventName, handler) {
  console.log(`Event-Listener wird entfernt für: ${eventName}`);
  document.removeEventListener(eventName, handler);
}