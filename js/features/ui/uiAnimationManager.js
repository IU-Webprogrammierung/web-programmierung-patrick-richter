/**
 * @module uiAnimationManager
 * @description Steuert synchronisierte Animationen für alle UI-Elemente
 */

import { addEventListener, EVENT_TYPES } from '../../core/events.js'
;import { initialAppearAnimation } from '../../core/animationUtils.js';
import TransitionController from '../../core/transitionController.js';
import { getValidatedElement } from '../../core/utils.js';

// Alle zu animierenden UI-Elemente
const headerTitle = getValidatedElement(".project-title");
const mobileTitle = getValidatedElement(".project-title-mobile");
const mobileDescription = getValidatedElement(".description-mobile");
const desktopDescription = getValidatedElement(".description");
const pagination = getValidatedElement('.pagination');
const projectIndicator = getValidatedElement('.tab-text');
const titleDescriptionContainer = getValidatedElement('.title-description-container');
const projectIndicatorTab = getValidatedElement('.project-indicator-tab');
const paginationDescriptionContainer = getValidatedElement('.pagination-description-container');

/**
 * Liste aller animierbaren UI-Elemente
 */
const uiElements = [
  headerTitle,
  mobileTitle,
  mobileDescription, 
  desktopDescription,
  pagination,
  projectIndicator
].filter(el => el !== null);

/**
 * Initialisiert alle UI-Animationen und Event-Listener
 */
/**
 * Initialisiert alle UI-Animationen und Event-Listener
 */
function init() {
  // Einen Zustand für die Initialisierung speichern
  let isInitialized = false;
  
  // Phasenänderungen im TransitionController abfangen
  document.addEventListener(TransitionController.events.PHASE_CHANGED, (event) => {
    const { phase } = event.detail;
    
    // CSS-Klassen für Fade-Effekte basierend auf Phase setzen
    uiElements.forEach(element => {
      if (!element) return;
      
      if (phase === TransitionController.phases.FADE_OUT || 
          phase === TransitionController.phases.BETWEEN) {
        console.log("uiAnimationManager: fade-out wird gesetzt");
        element.classList.add('fade-out');
      } else if (phase === TransitionController.phases.FADE_IN) {
        console.log("uiAnimationManager: fade-out wird entfernt");
        element.classList.remove('fade-out');
      }
    });
  });

  // Event-Listener für Projektänderungen
  addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, () => {
    console.log("uiAnimationManager: Event activeProjectChanged empfangen");
    
    // Nur Transition starten, wenn die Initialisierungsphase abgeschlossen ist
    if (isInitialized && !TransitionController.isActive()) {
      TransitionController.startTransition();
    }
  });
  
  // Finale Initialisierung nach App-Bereitschaft
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, async () => {
    console.log("UI-Animation wird gestartet nach App-Initialisierung");

    try {
      // Animation starten und auf Abschluss warten
      await initialAppearAnimation();
      console.log("Initial-Animation abgeschlossen");
      
      // Erst jetzt Initialisierung als abgeschlossen markieren
      isInitialized = true;
    } catch (error) {
      console.error("Fehler bei Initial-Animation:", error);
      // Sicherheits-Fallback: trotzdem als initialisiert markieren
      isInitialized = true;
    }
  });
}

export default {
  init
};