/**
 * @module transitionController
 * @description Koordiniert UI-Übergänge zwischen Projekten in definierten Phasen.
 * Sorgt für synchronisierte Animationen aller UI-Elemente während Projektwechseln.
 * Enthält Funktionen:
 * - changePhase()
 * - startTransition()
 * - isActive()
 * - getCurrentPhase()
 * 
 * @fires events.PHASE_CHANGED - Bei Wechsel zwischen Transitionsphasen
 * @fires events.CONTENT_UPDATE_NEEDED - Signal zum Aktualisieren von Inhalten (BETWEEN-Phase)
 */

import { getCSSTimeVariable } from '@utils';

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
   * @param {string} newPhase - Die neue Phase (aus this.phases)
   */
  changePhase(newPhase) {
    console.log(`TransitionController: Phase wechselt zu ${newPhase}`);
    this.currentPhase = newPhase;
    
    // Event auslösen
    document.dispatchEvent(new CustomEvent(this.events.PHASE_CHANGED, {
      detail: { phase: newPhase }
    }));
    
    // Bei BETWEEN-Phase Content-Update-Event auslösen
    if (newPhase === this.phases.BETWEEN) {
      document.dispatchEvent(new CustomEvent(this.events.CONTENT_UPDATE_NEEDED));
      
      // Die Textfarbe wird in der BETWEEN-Phase durch den imageColorHandler gesetzt
    }
  },
  
  /**
   * Startet einen neuen Übergang mit definierten Phasen
   * @returns {boolean} true bei erfolgreicher Initiierung, false bei bereits laufendem Übergang
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
   * @returns {boolean} true wenn ein Übergang aktiv ist
   */
  isActive() {
    return this.isTransitioning;
  },
  
  /**
   * Gibt die aktuelle Phase zurück
   * @returns {string} Die aktuelle Phase
   */
  getCurrentPhase() {
    return this.currentPhase;
  }
};

export default TransitionController;