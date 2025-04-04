/**
 * @module interactionManager
 * @description Verwaltet die Initialisierung aller Benutzerinteraktionen
 */

import { EVENT_TYPES, dispatchCustomEvent, addEventListener } from '../../core/events.js';
import { setupProjectNavigation } from '../navigation/projectNavigator.js';
import { setupImageNavigation } from '../imageViewer/imageNavigation.js';

// Auf UI-Komponenten reagieren
addEventListener(EVENT_TYPES.UI_COMPONENTS_READY, () => {
  console.log("interactionManager: UI-Komponenten bereit - initialisiere Interaktionen");
  
  // Interaktionen initialisieren
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
  console.log("interactionManager: Starte Interaktions-Initialisierung");
  
  // 1. Bildnavigation (zuvor in uiInitializer)
  setupImageNavigation();
  console.log("interactionManager: Bildnavigation initialisiert");
  
  // 2. Projekt-Navigation (ScrollTrigger, Touch-Events)
  const navigation = setupProjectNavigation();
  console.log("interactionManager: Projektnavigation initialisiert");
  
  // Kurze Pause für Animation
  return new Promise(resolve => setTimeout(resolve, 100));
}