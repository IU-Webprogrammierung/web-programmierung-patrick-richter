// js/core/overlayUtils.js
/**
 * @module overlayUtils
 * @description Zentrale Utilities für Overlay-Management und Animationen
 */

/**
 * Öffnet ein Overlay mit korrekter Animation und Event-Handling
 * @param {Element} element - Das zu öffnende Element
 * @param {Object} options - Konfigurationsoptionen
 * @param {string} options.openClass - CSS-Klasse für geöffneten Zustand (default: 'open')
 * @param {string} options.closingClass - CSS-Klasse für Schließanimation (default: 'closing')
 * @param {Function} options.onBeforeOpen - Callback vor dem Öffnen
 * @param {Function} options.onAfterOpen - Callback nach dem Öffnen
 */
export function openOverlay(element, options = {}) {
    const {
      openClass = 'open',
      closingClass = 'closing',
      onBeforeOpen = () => {},
      onAfterOpen = () => {}
    } = options;
    
    // Event-Handler entfernen, falls vorhanden
    element.classList.remove(closingClass);
    
    // Vor dem Öffnen aufrufen
    onBeforeOpen();
    
    // Overlay öffnen
    element.classList.add(openClass);
    
    // ARIA-Attribute setzen
    element.setAttribute('aria-hidden', 'false');
    if (element.hasAttribute('aria-expanded')) {
      element.setAttribute('aria-expanded', 'true');
    }
    
    // Animation abwarten, dann Callback ausführen
    waitForTransition(element, () => onAfterOpen());
  }
  
  /**
   * Schließt ein Overlay mit korrekter Animation und Event-Handling
   * @param {Element} element - Das zu schließende Element
   * @param {Object} options - Konfigurationsoptionen
   * @param {string} options.openClass - CSS-Klasse für geöffneten Zustand (default: 'open')
   * @param {string} options.closingClass - CSS-Klasse für Schließanimation (default: 'closing')
   * @param {Function} options.onBeforeClose - Callback vor dem Schließen
   * @param {Function} options.onAfterClose - Callback nach dem Schließen
   */
  export function closeOverlay(element, options = {}) {
    const {
      openClass = 'open',
      closingClass = 'closing',
      onBeforeClose = () => {},
      onAfterClose = () => {}
    } = options;
    
    // Vor dem Schließen aufrufen
    onBeforeClose();
    
    // Closing-Klasse für Animation hinzufügen
    element.classList.add(closingClass);
    
    // Nach Animation alles entfernen und Callback ausführen
    waitForTransition(element, () => {
      element.classList.remove(openClass);
      element.classList.remove(closingClass);
      
      // ARIA-Attribute aktualisieren
      element.setAttribute('aria-hidden', 'true');
      if (element.hasAttribute('aria-expanded')) {
        element.setAttribute('aria-expanded', 'false');
      }
      
      // Nach dem Schließen aufrufen
      onAfterClose();
    });
  }
  
  /**
   * Wartet auf das Ende einer CSS-Transition
   * @param {Element} element - Element mit Transition
   * @param {Function} callback - Auszuführende Funktion nach Transitionsende
   */
  export function waitForTransition(element, callback) {
    // Transition-Zeit aus CSS auslesen
    const computedStyle = window.getComputedStyle(element);
    const transitionDuration = parseFloat(computedStyle.transitionDuration) * 1000;
    
    // Event-Listener für Transitionsende
    function handleTransitionEnd(e) {
      if (e.target === element) {
        element.removeEventListener('transitionend', handleTransitionEnd);
        callback();
      }
    }
    
    // Event-Listener hinzufügen
    element.addEventListener('transitionend', handleTransitionEnd);
    
    // Fallback, falls keine Transition stattfindet
    setTimeout(() => {
      if (element.ontransitionend) {
        console.log("Transition-Fallback ausgelöst");
        element.removeEventListener('transitionend', handleTransitionEnd);
        callback();
      }
    }, transitionDuration + 50);
  }
  
  /**
   * Wechselt den Zustand eines Overlays (öffnen/schließen)
   * @param {Element} element - Das zu wechselnde Element
   * @param {Object} options - Alle Optionen für open/closeOverlay
   * @returns {boolean} - True wenn geöffnet, false wenn geschlossen
   */
  export function toggleOverlay(element, options = {}) {
    const { openClass = 'open' } = options;
    
    if (element.classList.contains(openClass)) {
      closeOverlay(element, options);
      return false;
    } else {
      openOverlay(element, options);
      return true;
    }
  }