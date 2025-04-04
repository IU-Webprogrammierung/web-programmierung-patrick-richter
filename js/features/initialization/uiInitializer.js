/**
 * @module uiInitializer
 * @description Koordiniert die Initialisierung aller UI-Komponenten
 */

import { EVENT_TYPES, dispatchCustomEvent, addEventListener } from '../../core/events.js';
import uiState from '../../core/uiState.js';
import { setupUIAnimations } from '../ui/uiAnimationManager.js';
import swiperInitializer from '../imageViewer/swiperInitializer.js';
import customPagination from '../imageViewer/customPagination.js';
import { setupImageColorHandler } from '../imageViewer/imageColorHandler.js';
import { setupProjectIndicator } from '../projects/projectIndicator.js';

// Auf DOM-Struktur reagieren
addEventListener(EVENT_TYPES.DOM_STRUCTURE_READY, () => {
  console.log("uiInitializer: DOM-Struktur bereit - initialisiere UI-Komponenten");
  
  // UI-State mit den DOM-Elementen aktualisieren
  uiState.updateProjects();
  console.log(`uiInitializer: ${uiState.projects.length} Projekte im DOM gefunden`);
  
  // UI-Komponenten initialisieren
  initializeUIComponents()
    .then(() => {
      console.log("uiInitializer: UI-Komponenten initialisiert");
      
      // Nächste Phase signalisieren: UI-Komponenten bereit
      dispatchCustomEvent(EVENT_TYPES.UI_COMPONENTS_READY);
    })
    .catch(error => {
      console.error("Fehler bei der UI-Initialisierung:", error);
    });
});

/**
 * Initialisiert alle UI-Komponenten in der richtigen Reihenfolge
 */
async function initializeUIComponents() {
  console.log("uiInitializer: Starte sequenzielle Komponenten-Initialisierung");
  
  // 1. Zentrale Animation für Titel, Description, etc.
  setupUIAnimations();
  
  // 2. Projekt-Indikator einrichten
  setupProjectIndicator();
  
  // 3. Swiper für Bildergalerien initialisieren
  await swiperInitializer.init();
  console.log("uiInitializer: Swiper initialisiert");
  
  // 4. Pagination für die Bilder einrichten
  customPagination.init();
  console.log("uiInitializer: Pagination initialisiert");
  
  // 5. Weitere UI-Komponenten
  setupImageColorHandler();
  
  console.log("uiInitializer: Alle UI-Komponenten initialisiert");
  return true;
}