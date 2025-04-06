/**
 * @module uiAnimationManager
 * @description Steuert synchronisierte Animationen für alle UI-Elemente
 */

import { addEventListener, EVENT_TYPES } from '../../core/events.js';import { initialAppearAnimation } from '../../core/animationUtils.js';
import TransitionController from '../../core/transitionController.js';
import { getValidatedElement } from '../../core/utils.js';

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
    
    // Nur Transition starten, wenn nicht bereits aktiv
    if (!TransitionController.isActive()) {
      TransitionController.startTransition();
    }
  });
  
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    console.log("UI-Animation wird gestartet nach App-Initialisierung");
    
    // Alle UI-Elemente gemeinsam animieren
    initialAppearAnimation(uiElements);

  });
}

export default {
  init
};