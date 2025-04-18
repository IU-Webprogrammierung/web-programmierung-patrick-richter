/**
 * @module uiAnimationManager
 * @description Steuert synchronisierte Animationen für alle UI-Elemente.
 * Koordiniert Fade-Effekte beim Projektwechsel und die initiale Erscheinungsanimation.
 * Enthält Funktionen:
 * - init()
 * 
 * @listens TransitionController.events.PHASE_CHANGED - Reagiert auf Phasen-Änderungen
 * @listens EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Startet Transition bei Projektwechsel
 * @listens EVENT_TYPES.APP_INIT_COMPLETE - Startet initiale Animation
 */

import logger from '@core/logger';
import { addEventListener, EVENT_TYPES } from '@core/state/events.js';
import { getValidatedElement, initialAppearAnimation } from '@utils';
import TransitionController from '@core/state/transitionController.js';

// Alle zu animierenden UI-Elemente
const headerTitle = getValidatedElement(".project-title");
const mobileTitle = getValidatedElement(".project-title-mobile");
const mobileDescription = getValidatedElement(".description-mobile");
const desktopDescription = getValidatedElement(".description");
const pagination = getValidatedElement('.pagination');
const projectIndicator = getValidatedElement('.tab-text');

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
        logger.log("uiAnimationManager: fade-out wird gesetzt");
        element.classList.add('fade-out');
      } else if (phase === TransitionController.phases.FADE_IN) {
        logger.log("uiAnimationManager: fade-out wird entfernt");
        element.classList.remove('fade-out');
      }
    });
  });

  // Event-Listener für Projektänderungen
  addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, () => {
    logger.log("uiAnimationManager: Event activeProjectChanged empfangen");
    
    // Nur Transition starten, wenn die Initialisierungsphase abgeschlossen ist
    if (isInitialized && !TransitionController.isActive()) {
      TransitionController.startTransition();
    }
  });
  
  // Finale Initialisierung nach App-Bereitschaft
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, async () => {
    logger.log("UI-Animation wird gestartet nach App-Initialisierung");

    try {
      // Animation starten und auf Abschluss warten
      await initialAppearAnimation();
      logger.log("Initial-Animation abgeschlossen");
      
      // Erst jetzt Initialisierung als abgeschlossen markieren
      isInitialized = true;
    } catch (error) {
      logger.error("Fehler bei Initial-Animation:", error);
      // Sicherheits-Fallback: trotzdem als initialisiert markieren
      isInitialized = true;
    }
  });
}

export default {
  init
};