/**
 * @module events
 * @description Zentrale Definition von Event-Typen und Event-Handling-Hilfsfunktionen.
 * Dieses Modul steuert die gesamte event-basierte Kommunikation der Anwendung.
 * 
 * @fileoverview
 * # Initialisierungs- und Kommunikationsfluss
 * 
 * Der Initialisierungsprozess der Anwendung folgt einer definierten Eventkette:
 * 
 * 1. `APP_INIT_STARTED`: Ausgelöst in app.js nach DOM-Bereitschaft
 *    - Registriert Event-Listener in mehreren Modulen
 *    - Startet den Datenladeprozess
 * 
 * 2. `PROJECT_DATA_LOADED`: Ausgelöst durch dataStore nach Projektdaten-Ladung
 *    - Ermöglicht frühen Aufbau der DOM-Struktur basierend auf Projektdaten
 *    - Wird priorisiert vor anderen Daten (Footer, About, Clients), um UI schnell anzuzeigen
 * 
 * 3. `DOM_STRUCTURE_READY`: Ausgelöst durch projectLoader nach DOM-Erstellung
 *    - Signalisiert, dass die grundlegende Projektstruktur im DOM verfügbar ist
 *    - Löst die Initialisierung von UI-Komponenten aus
 * 
 * 4. `UI_COMPONENTS_READY`: Ausgelöst durch uiInitializer nach Komponenten-Init
 *    - Alle UI-Komponenten sind initialisiert und einsatzbereit
 *    - Startet die Initialisierung von Interaktionen (Touch, Keyboard, etc.)
 * 
 * 5. `APP_INIT_COMPLETE`: Ausgelöst nach Interaktions-Initialisierung
 *    - Finale Phase - Anwendung ist vollständig initialisiert und nutzbar
 *    - Blendet Loading-Anzeigen aus, macht alle UI-Elemente sichtbar
 * 
 * Parallel findet statt:
 * - `ALL_DATA_LOADED`: Ausgelöst durch dataStore nach Ladung aller Daten
 *    - Sekundäre Inhalte (Footer, About, Client-Liste) werden geladen und angezeigt
 *    - Löst keine kritischen UI-Updates aus, da diese auf Projektdaten basieren
 * 
 * ## Benutzerinteraktions-Events
 * 
 * Nach der Initialisierung werden folgende Events für Benutzerinteraktionen verwendet:
 * 
 * - `ACTIVE_PROJECT_CHANGED`: Ausgelöst bei Wechsel des aktiven Projekts
 *    - uiState aktualisiert sein internes Modell
 *    - Löst UI-Aktualisierungen in verschiedenen Komponenten aus
 * 
 * - `ACTIVE_IMAGE_CHANGED`: Ausgelöst bei Wechsel des aktiven Bildes
 *    - Steuert Farbübergänge und Pagination-Updates
 * 
 * ## Animations-Steuerung
 * 
 * Die Animations-Koordination erfolgt über den TransitionController:
 * 
 * - `TransitionController.events.PHASE_CHANGED`: Steuerung von UI-Übergängen
 *    - Koordinierte Animation aller UI-Elemente in den Phasen FADE_OUT, BETWEEN, FADE_IN
 * 
 * - `TransitionController.events.CONTENT_UPDATE_NEEDED`: Signal für Inhalts-Updates
 *    - Löst Aktualisierung von Texten und Inhalten während der BETWEEN-Phase aus
 * 
 * ## Detaillierter Initialisierungsablauf
 * 
 * 1. app.js (DOMContentLoaded)
 *    - setupEventListeners() für grundlegende UI-Interaktionen
 *    - appInitializer.init() startet die Event-Kette
 *    - EVENT_TYPES.APP_INIT_STARTED wird ausgelöst
 * 
 * 2. appInitializer.js
 *    - Reagiert auf APP_INIT_STARTED
 *    - Initialisiert dataStore, projectLoader, footerLoader, overlayContent
 *    - dataStore.loadData() beginnt asynchronen Datenladeprozess
 * 
 * 3. dataStore.js
 *    - Lädt Projektdaten priorisiert
 *    - Löst EVENT_TYPES.PROJECT_DATA_LOADED aus
 *    - Lädt andere Daten parallel im Hintergrund
 *    - Löst am Ende EVENT_TYPES.ALL_DATA_LOADED aus
 * 
 * 4. projectLoader.js
 *    - Reagiert auf PROJECT_DATA_LOADED
 *    - createProjectElements() erstellt DOM aus Projektdaten
 *    - Löst EVENT_TYPES.DOM_STRUCTURE_READY aus
 * 
 * 5. uiInitializer.js
 *    - Reagiert auf DOM_STRUCTURE_READY
 *    - Lädt Projekte in uiState (Single Source of Truth)
 *    - Initialisiert alle UI-Komponenten:
 *      a) uiAnimationManager - Zentrale Animation aller UI-Elemente
 *      b) contentManager - Verwaltung von Titel und Beschreibungen
 *      c) projectIndicator - Anzeige und Navigation des Projektindex
 *      d) swiperInitializer - Bildergalerien
 *      e) customPagination - Indikation und Navigation innerhalb von Projekten
 *      f) imageColorHandler - Dynamische Farbübergänge basierend auf Bildern
 *    - Löst EVENT_TYPES.UI_COMPONENTS_READY aus
 * 
 * 6. interactionInitializer.js
 *    - Reagiert auf UI_COMPONENTS_READY
 *    - Initialisiert Benutzerinteraktionen:
 *      a) imageNavigation - Cursor-basierte Navigation in Bildgalerien
 *      b) projectNavigator - GSAP-basierte Projekt-Navigation mit Transitions
 *    - Löst EVENT_TYPES.APP_INIT_COMPLETE aus
 * 
 * 7. app.js
 *    - Reagiert auf APP_INIT_COMPLETE
 *    - Entfernt Loading-Anzeige
 *    - Macht Hauptinhalt sichtbar
 * 
 * Parallel:
 * 8. footerLoader.js & overlayContent.js
 *    - Reagieren auf ALL_DATA_LOADED
 *    - Laden sekundäre Inhalte wie Footer, About und Client-Liste
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
  ACTIVE_PROJECT_CHANGED: 'activeProjectChanged', // Aktives Projekt gewechselt
  ACTIVE_IMAGE_CHANGED: 'activeImageChanged',     // Aktives Bild innerhalb eines Projekts gewechselt
};

/**
 * Erzeugt und versendet ein benutzerdefiniertes Event mit optionalen Details.
 * Protokolliert alle gesendeten Events für einfachere Fehlersuche.
 * 
 * @param {string} eventName - Name des zu sendenden Events (aus EVENT_TYPES)
 * @param {Object} [detail={}] - Optionale Detaildaten für das Event
 */
export function dispatchCustomEvent(eventName, detail = {}) {
  console.log(`Event wird gesendet: ${eventName}`, detail);
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Zentrale Registrierungsfunktion für Event-Listener.
 * Bietet konsistentes Logging und zentralen Ort für zukünftige Erweiterungen.
 * 
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
 * Entfernt einen zuvor registrierten Event-Listener.
 * 
 * @param {string} eventName - Name des Events (aus EVENT_TYPES)
 * @param {Function} handler - Zu entfernender Event-Handler
 */
export function removeEventListener(eventName, handler) {
  console.log(`Event-Listener wird entfernt für: ${eventName}`);
  document.removeEventListener(eventName, handler);
}