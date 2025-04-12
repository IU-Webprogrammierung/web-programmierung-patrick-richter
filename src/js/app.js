/**
 * @module app/main
 * @description Initialisiert die App beim Laden des DOM.
 *
 * @listens DOMContentLoaded
 * @fires APP_INIT_STARTED
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

import logger from '@core/logger';
import gsap from "gsap";
import { Observer } from "gsap/Observer";

import {
  addEventListener,
  dispatchCustomEvent,
  EVENT_TYPES,
} from "@core/state/events.js";
import appInitializer from "@startup/appInitializer.js";

// GSAP-Plugins registrieren
gsap.registerPlugin(Observer);

document.addEventListener("DOMContentLoaded", () => {
  // Initialisierung der App
  appInitializer.init();
  logger.log("App-Initialisierung gestartet");

  // Custom Event auslösen, um die Initialisierungskette zu starten
  // Siehe events.js für den Überblick des Ablaufs
  dispatchCustomEvent(EVENT_TYPES.APP_INIT_STARTED);

  // Auf den Abschluss der Initialisierung hören
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    logger.log("App vollständig initialisiert");
  });
});
