/**
 * @module transitionController
 * @description Koordiniert UI-Übergänge zwischen Projekten
 */

import { getCSSTimeVariable } from '../../utils/animationUtils.js';
import uiState from './uiState.js';

const TransitionController = {
  // Definierte Phasen eines Übergangs
  phases: {
    IDLE: 'idle',
    FADE_OUT: 'fade-out',
    BETWEEN: 'between',
    FADE_IN: 'fade-in'
  },
  
  // Aktueller Status
  currentPhase: 'idle',
  isTransitioning: false,
  
  // Event-Namen für Transition-Events
  events: {
    PHASE_CHANGED: 'transition-phase-changed',
    CONTENT_UPDATE_NEEDED: 'transition-content-update'
  },
  
  /**
   * Wechselt in eine neue Phase und benachrichtigt alle Listener
   */
  changePhase(newPhase) {
    console.log(`TransitionController: Phase wechselt zu ${newPhase}`);
    this.currentPhase = newPhase;
    
    // Event auslösen
    document.dispatchEvent(new CustomEvent(this.events.PHASE_CHANGED, {
      detail: { phase: newPhase }
    }));
    
    // Wenn wir in die BETWEEN-Phase wechseln, Content-Update-Event auslösen
    if (newPhase === this.phases.BETWEEN) {
      document.dispatchEvent(new CustomEvent(this.events.CONTENT_UPDATE_NEEDED));
      
      // Die aktuelle Textfarbe aus dem uiState wird in der BETWEEN-Phase
      // durch den imageColorHandler gesetzt, der auf das PHASE_CHANGED-Event reagiert
      // Dies gewährleistet Synchronisation aller UI-Updates in dieser Phase
    }
  },
  
  /**
   * Startet einen neuen Übergang
   */
  startTransition() {
    if (this.isTransitioning) {
      console.warn('TransitionController: Übergang bereits aktiv');
      return false;
    }
    
    // Prüfen, ob initial Animation noch läuft
    if (this._initialAnimationRunning) {
      console.log('TransitionController: Warte auf Abschluss der initialAnimation');
      
      // Transition merken und später ausführen
      this._deferredTransition = true;
      return false;
    }
    
    this.isTransitioning = true;
  
    // CSS-Zeiten auslesen
    const fadeDuration = getCSSTimeVariable('--title-fade-duration', 300);
    const betweenPause = getCSSTimeVariable('--title-between-pause', 200);
    
    // Phase 1: Ausblenden
    this.changePhase(this.phases.FADE_OUT);
    
    // Phase 2: Zwischen-Pause mit Content-Update
    setTimeout(() => {
      this.changePhase(this.phases.BETWEEN);
      
      // Phase 3: Einblenden
      setTimeout(() => {
        this.changePhase(this.phases.FADE_IN);
        
        // Phase 4: Zurück zu Idle
        setTimeout(() => {
          this.changePhase(this.phases.IDLE);
          this.isTransitioning = false;
        }, fadeDuration);
      }, betweenPause);
    }, fadeDuration);
    
    return true;
  },
  
  /**
   * Prüft, ob gerade ein Übergang läuft
   */
  isActive() {
    return this.isTransitioning;
  },
  
  /**
   * Gibt die aktuelle Phase zurück
   */
  getCurrentPhase() {
    return this.currentPhase;
  }
};

export default TransitionController;