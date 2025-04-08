/**
 * @module interactionInitializer
 * @description Verwaltet die Initialisierung aller Benutzerinteraktionen
 */

import { EVENT_TYPES, dispatchCustomEvent, addEventListener } from '../core/state/events.js';
import imageNavigation from '../media/viewer/mediaNavigation.js';
import projectNavigator from '../portfolio/navigation/projectNavigator.js';
import hoverPreview from '../portfolio/projects/hoverPreview.js';
import overlayController from '../overlay/overlayController.js';
import mobileDescription from '../ui/mobileUi/mobileDescription.js';

async function init() {
  // Auf UI-Komponenten reagieren
  addEventListener(EVENT_TYPES.UI_COMPONENTS_READY, () => {
    console.log("interactionManager: UI-Komponenten bereit - initialisiere Interaktionen");
    
    try {
      // Interaktionen initialisieren (synchron)
      initializeInteractions();
      console.log("interactionManager: Interaktionen initialisiert");
      
      // Finale Phase signalisieren: App vollständig initialisiert
      dispatchCustomEvent(EVENT_TYPES.APP_INIT_COMPLETE);
    } catch (error) {
      console.error("Fehler bei der Interaktions-Initialisierung:", error);
    }
  });
}

/**
 * Initialisiert alle Interaktionskomponenten
 */
function initializeInteractions() {
  console.log("interactionManager: Starte Interaktions-Initialisierung");
  
  // 1. Bildnavigation 
  imageNavigation.init();
  console.log("interactionManager: Bildnavigation initialisiert");
  
  // 2. Projekt-Navigation (ScrollTrigger, Touch-Events) in GSAP
  projectNavigator.init ();
  console.log("interactionManager: Projektnavigation initialisiert");
  
  // 3. HoverImage (Project Indicator & About Overlay)
  hoverPreview.init();
  console.log("interactionManager: Hover-Interaktionen initialisiert");

  // 4. Overlay-Controller
  overlayController.init();
  console.log("interactionManager: Overlay-Interaktionen initialisiert");

  // 5. Mobile-Interaktionen
  mobileDescription.init();
  console.log("interactionManager: Mobile Interaktionen initialisiert");

}


export default {
  init,
};
