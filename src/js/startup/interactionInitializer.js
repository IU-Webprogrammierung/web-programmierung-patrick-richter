/**
 * @module interactionInitializer
 * @description Verwaltet die Initialisierung aller Benutzerinteraktionen.
 * Startet nach der UI-Komponenten-Initialisierung und richtet alle Interaktionen
 * wie Navigation, Hover-Effekte und Touch-Events ein.
 * Enthält Funktionen:
 * - init()
 * - initializeInteraktionen()
 * 
 * @listens EVENT_TYPES.UI_COMPONENTS_READY - Startet die Initialisierung der Interaktionskomponenten
 * @fires EVENT_TYPES.APP_INIT_COMPLETE - Signalisiert die vollständige Initialisierung der App
 */

import { EVENT_TYPES, dispatchCustomEvent, addEventListener } from '@core/state/events.js';
import imageNavigation from '@media/viewer/mediaNavigation.js';
import projectNavigator from '@portfolio/navigation/projectNavigator.js';
import hoverPreview from '@portfolio/projects/hoverPreview.js';
import overlayController from '@overlay/overlayController.js';
import mobileDescription from '@ui/mobileUi/mobileDescription.js';
import CustomRouter from '@core/CustomRouter.js';

/**
 * Initialisiert den Interaction-Initializer
 */
async function init() {
  // Auf UI-Komponenten reagieren
  addEventListener(EVENT_TYPES.UI_COMPONENTS_READY, () => {
    console.log("interactionManager: UI-Komponenten bereit - initialisiere Interaktionen");
    
    try {
      // Interaktionen initialisieren (synchron)
      initializeInteraktionen();
      console.log("interactionManager: Interaktionen initialisiert");
      
      // Finale Phase signalisieren: App vollständig initialisiert
      dispatchCustomEvent(EVENT_TYPES.APP_INIT_COMPLETE);
    } catch (error) {
      console.error("Fehler bei der Interaktions-Initialisierung:", error);
    }
  });
}

/**
 * Initialisiert alle Interaktionskomponenten in der richtigen Reihenfolge
 */
function initializeInteraktionen() {
  console.log("interactionManager: Starte Interaktions-Initialisierung");
  
  // 1. Bildnavigation 
  imageNavigation.init();
  console.log("interactionManager: Bildnavigation initialisiert");
  
  // 2. Projekt-Navigation (GSAP-Animationen)
  const navigatorAPI = projectNavigator.init();
  console.log("interactionManager: Projektnavigation initialisiert");
  
  // 3. Router initialisieren (mit Zugriff auf Projekt-Navigation)
  CustomRouter.init(navigatorAPI);
  console.log("interactionManager: Router initialisiert");
  
  // 4. HoverImage (Project Indicator & About Overlay)
  hoverPreview.init();
  console.log("interactionManager: Hover-Interaktionen initialisiert");

  // 5. Overlay-Controller
  overlayController.init();
  console.log("interactionManager: Overlay-Interaktionen initialisiert");

  // 6. Mobile-Interaktionen
  mobileDescription.init();
  console.log("interactionManager: Mobile Interaktionen initialisiert");
}

export default {
  init,
};