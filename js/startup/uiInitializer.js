/**
 * @module uiInitializer
 * @description Koordiniert die Initialisierung aller UI-Komponenten
 */

import {
  EVENT_TYPES,
  dispatchCustomEvent,
  addEventListener,
} from "../core/state/events.js";
import uiState from "../core/state/uiState.js";
import uiAnimationManager from "../ui/uiAnimationManager.js";
import swiperInitializer from "../media/viewer/swiperController.js";
import customPagination from "../media/viewer/mediaPagination.js";
import imageColorHandler from "../media/color/mediaColorHandler.js";
import projectIndicator from "../portfolio/projects/projectIndicator.js";
import contentManager from "../ui/contentManager.js";
import interactionInitializer from "./interactionInitializer.js";

function init() {
  // Auf DOM-Struktur reagieren
  addEventListener(EVENT_TYPES.DOM_STRUCTURE_READY, async () => {
    console.log(
      "uiInitializer: DOM-Struktur bereit - initialisiere UI-Komponenten"
    );

    // UI-State mit den DOM-Elementen aktualisieren
    uiState.updateProjects();
    console.log(
      `uiInitializer: ${uiState.projects.length} Projekte im DOM gefunden`
    );

    // Interaction Initialisierung starten
    interactionInitializer.init();
    console.log("uiInitializer: Interaktionen initialisiert");

    try {
      // UI-Komponenten initialisieren
      await initializeUIComponents();
      console.log("uiInitializer: UI-Komponenten initialisiert");

      // Nächste Phase signalisieren: UI-Komponenten bereit
      dispatchCustomEvent(EVENT_TYPES.UI_COMPONENTS_READY);
    } catch (error) {
      console.error("uiInitializer: Fehler bei der Initialisierung:", error);
    }
  });
}

/**
 * Initialisiert alle UI-Komponenten in der richtigen Reihenfolge
 */
async function initializeUIComponents() {
  console.log("uiInitializer: Starte sequenzielle Komponenten-Initialisierung");

  // 1. Zentrale Animation für Titel, Description, etc.
  uiAnimationManager.init();
  console.log("uiInitializer: UI-Animation initialisiert");

  // 2. Content-Manager für Texte etc. in Titel, Description, etc.
  contentManager.init();
  console.log("uiInitializer: Content-Manager initialisiert");

  // 2. Projekt-Indikator einrichten
  projectIndicator.init();
  console.log("uiInitializer: Projekt-Indikator initialisiert");

  // 3. Swiper für Bildergalerien initialisieren
  await swiperInitializer.init();
  console.log("uiInitializer: Swiper initialisiert");

  // 4. Pagination für die Bilder einrichten
  customPagination.init();
  console.log("uiInitializer: Pagination initialisiert");

  // 5. Weitere UI-Komponenten
  imageColorHandler.init();
  console.log("uiInitializer: Alle UI-Komponenten initialisiert");

  return true;
}

export default {
  init
};