/**
 * @module uiAnimationManager
 * @description Steuert synchronisierte Animationen für alle UI-Elemente
 */

import { EVENT_TYPES } from '../../core/events.js';
import { initialAppearAnimation } from '../../core/animationUtils.js';
import TransitionController from '../../core/transitionController.js';
import { contentElements, updateContents } from './contentManager.js';
import { getValidatedElement } from '../../core/utils.js';

// Zusätzliche UI-Elemente
const pagination = getValidatedElement('.pagination');
const projectIndicator = getValidatedElement('.project-indicator-tab');

/**
 * Liste aller animierbaren UI-Elemente
 */
const uiElements = [
  contentElements.headerTitle,
  contentElements.mobileTitle,
  contentElements.mobileDescription, 
  contentElements.desktopDescription,
  pagination,
  projectIndicator
].filter(el => el !== null);

/**
 * Initialisiert alle UI-Animationen und Event-Listener
 */
export function setupUIAnimations() {
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

  // Auf Content-Update-Event reagieren
  document.addEventListener(TransitionController.events.CONTENT_UPDATE_NEEDED, () => {
    updateContents();
  });

  // Event-Listener für Projektänderungen
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, () => {
    console.log("uiAnimationManager: Event activeProjectChanged empfangen");
    
    // Nur Transition starten, wenn nicht bereits aktiv
    if (!TransitionController.isActive()) {
      TransitionController.startTransition();
    }
  });
  
  // Footer-Events mit TransitionController synchronisieren
  document.addEventListener(EVENT_TYPES.FOOTER_ACTIVATED, () => {
    console.log("Footer-Aktivierungs-Event empfangen");
    window._isFooterActive = true;
    
    // Transition für konsistente Animation starten
    if (!TransitionController.isActive()) {
      TransitionController.startTransition();
    }
  });
  
  document.addEventListener(EVENT_TYPES.FOOTER_DEACTIVATED, () => {
    console.log("Footer-Deaktivierungs-Event empfangen");
    window._isFooterActive = false;
  });

  // Initialen Zustand anzeigen und UI-Elemente synchron animieren
  updateContents();
  initialAppearAnimation(uiElements);
}