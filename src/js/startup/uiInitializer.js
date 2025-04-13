/**
 * @module uiInitializer
 * @description Koordiniert die Initialisierung aller UI-Komponenten.
 * Wird nach der DOM-Struktur-Erstellung ausgeführt und initialisiert
 * UI-Komponenten in der korrekten Reihenfolge.
 * Enthält Funktionen:
 * - init()
 * - initializeUIComponents()
 * 
 * @listens EVENT_TYPES.DOM_STRUCTURE_READY - Startet UI-Initialisierung nach DOM-Erstellung
 * @fires EVENT_TYPES.UI_COMPONENTS_READY - Signalisiert abgeschlossene UI-Initialisierung
 */

import logger from '@core/logger';
import {
  EVENT_TYPES,
  dispatchCustomEvent,
  addEventListener,
} from '@core/state/events.js';
import uiState from '@core/state/uiState.js';
import uiAnimationManager from '@ui/uiAnimationManager.js';
import swiperInitializer from '@media/viewer/swiperController.js';
import customPagination from '@media/viewer/mediaPagination.js';
import imageColorHandler from '@media/color/mediaColorHandler.js';
import projectIndicator from '@portfolio/projects/projectIndicator.js';
import contentManager from '@ui/contentManager.js';
import interactionInitializer from '@startup/interactionInitializer.js';

/**
 * Initialisiert den UI-Initializer
 */
function init() {
  // Auf DOM-Struktur reagieren
  addEventListener(EVENT_TYPES.DOM_STRUCTURE_READY, async () => {
    logger.log(
      "uiInitializer: DOM-Struktur bereit - initialisiere UI-Komponenten"
    );

    // UI-State mit den DOM-Elementen aktualisieren
    uiState.updateProjects();
    logger.log(
      `uiInitializer: ${uiState.projects.length} Projekte im DOM gefunden`
    );

    // Interaction Initialisierung starten
    interactionInitializer.init();
    logger.log("uiInitializer: Interaktionen initialisiert");

    try {
      // UI-Komponenten initialisieren
      await initializeUIComponents();
      logger.log("uiInitializer: UI-Komponenten initialisiert");

      // Nächste Phase signalisieren: UI-Komponenten bereit
      dispatchCustomEvent(EVENT_TYPES.UI_COMPONENTS_READY);
    } catch (error) {
      logger.error("uiInitializer: Fehler bei der Initialisierung:", error);
    }
  });
}

/**
 * Initialisiert alle UI-Komponenten in der richtigen Reihenfolge
 * @returns {Promise<boolean>} Promise, das nach erfolgreicher Initialisierung erfüllt wird
 */
async function initializeUIComponents() {
  logger.log("uiInitializer: Starte sequenzielle Komponenten-Initialisierung");

  // 1. Zentrale Animation für Titel, Description, etc.
  uiAnimationManager.init();
  logger.log("uiInitializer: UI-Animation initialisiert");

  // 2. Content-Manager für Texte etc. in Titel, Description, etc.
  contentManager.init();
  logger.log("uiInitializer: Content-Manager initialisiert");

  // 2. Projekt-Indikator einrichten
  projectIndicator.init();
  logger.log("uiInitializer: Projekt-Indikator initialisiert");

  // 3. Swiper für Bildergalerien initialisieren
  await swiperInitializer.init();
  logger.log("uiInitializer: Swiper initialisiert");

  // 4. Pagination für die Bilder einrichten
  customPagination.init();
  logger.log("uiInitializer: Pagination initialisiert");

  // 5. Weitere UI-Komponenten
  imageColorHandler.init();
  logger.log("uiInitializer: Alle UI-Komponenten initialisiert");

  return true;
}

export default {
  init
};