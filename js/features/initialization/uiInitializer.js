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
import { setupImageNavigation } from '../imageViewer/imageNavigation.js';

// Auf DOM-Struktur reagieren
addEventListener(EVENT_TYPES.DOM_STRUCTURE_READY, () => {
  console.log("uiInitializer: Beginne UI-Initialisierung");
  
  // Erst den UI-State aktualisieren
  uiState.updateProjects();
  
  // Dann UI-Komponenten initialisieren
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
    // 1. Zentrale Animation für Titel, Description, etc.
    setupUIAnimations();
    
    // TODO generell die init functions harmonisieren - bestes Vorgehen: alles soll "export function init()" haben
    // 2. Swiper für Bildergalerien initialisieren und warten
    await swiperInitializer.init();
    
    // 3. Pagination erst danach einrichten (setzt Swiper-Instanzen voraus)
    customPagination.init();
  
  // 4. Weitere UI-Komponenten
  setupImageColorHandler();
  
  // Kurze Pause, um DOM-Updates zu ermöglichen
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve); // Doppeltes RAF für beste Kompatibilität
    });
  });
}