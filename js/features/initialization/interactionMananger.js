/**
 * @module interactionManager
 * @description Verwaltet die Initialisierung aller Interaktionen
 */

import { EVENT_TYPES, dispatchCustomEvent, addEventListener } from '../../core/events.js';
import { setupProjectNavigation } from '../navigation/projectNavigator.js';
import { setupProjectIndicator } from '../projects/projectIndicator.js';

// Auf UI-Komponenten reagieren
addEventListener(EVENT_TYPES.UI_COMPONENTS_READY, () => {
  console.log("interactionManager: Initialisiere Interaktionen");
  
  // UI-Interaktionen initialisieren
  initializeInteractions()
    .then(() => {
      console.log("interactionManager: Interaktionen initialisiert");
      
      // Finale Phase signalisieren: App vollständig initialisiert
      dispatchCustomEvent(EVENT_TYPES.APP_INIT_COMPLETE);
    })
    .catch(error => {
      console.error("Fehler bei der Interaktions-Initialisierung:", error);
    });
});

/**
 * Initialisiert alle Interaktionskomponenten
 */
async function initializeInteractions() {
  // Projekt-Navigation (ScrollTrigger, Touch-Events)
  setupProjectNavigation();
  
  // Projektindikator sichtbar machen
  const projectIndicatorTab = document.querySelector(".project-indicator-tab");
  if (projectIndicatorTab) {
    // Erst nach Animation-Frame sichtbar machen für sanfte Animation
    setTimeout(() => {
      projectIndicatorTab.classList.add("visible");
    }, 500);
  }
  
  // Kurze Pause für Animation
  return new Promise(resolve => setTimeout(resolve, 300));
}