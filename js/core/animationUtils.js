/**
 * @module animationUtils
 * @description Zentrale Hilfsfunktionen für UI-Animationen und Übergänge.
 * Bietet wiederverwendbare Funktionen für einheitliche Überblendeffekte.
 */

/**
 * Extrahiert CSS-Zeitwerte mit einheitlicher Interpretation von ms/s
 * @param {string} timeStr - CSS-Zeit als String (z.B. "300ms" oder "0.3s")
 * @param {number} defaultValue - Fallback-Wert in ms
 * @returns {number} - Zeit in Millisekunden
 */
export function parseTimeValue(timeStr, defaultValue) {
    if (!timeStr) return defaultValue;
    timeStr = timeStr.trim();
    if (timeStr.endsWith("ms")) return parseFloat(timeStr);
    if (timeStr.endsWith("s")) return parseFloat(timeStr) * 1000;
    return parseFloat(timeStr);
  }
  
  /**
   * Liest eine CSS-Variable aus und konvertiert sie in Millisekunden
   * @param {string} variableName - Name der CSS-Variable (z.B. "--title-fade-duration")
   * @param {number} defaultValue - Fallback-Wert in ms
   * @returns {number} - Zeit in Millisekunden
   */
  export function getCSSTimeVariable(variableName, defaultValue) {
    const style = getComputedStyle(document.documentElement);
    const value = style.getPropertyValue(variableName);
    return parseTimeValue(value, defaultValue);
  }
  
  /**
   * Animiert einen Elementwechsel mit Überblendung und Update in der Pause
   * @param {Object} options - Konfigurationsoptionen
   * @param {HTMLElement|HTMLElement[]} options.elements - Zu animierende DOM-Elemente
   * @param {Function} options.updateCallback - Funktion, die während der Pause ausgeführt wird
   * @param {string} [options.fadeClass='fade-out'] - CSS-Klasse für den Fade-Effekt
   * @returns {Promise} - Promise, das erfüllt wird, wenn die Animation abgeschlossen ist
   */
  export function animateElementTransition({ 
    elements, 
    updateCallback, 
    fadeClass = 'fade-out'
  }) {
    // CSS-Variablen für Timing aus dem Stylesheet lesen
    const fadeDuration = getCSSTimeVariable("--title-fade-duration", 300);
    const pauseDuration = getCSSTimeVariable("--title-between-pause", 200);
    
    // Stelle sicher, dass elements ein Array ist
    const elementsArray = Array.isArray(elements) ? elements : [elements];
    
    // Entferne ungültige Elemente
    const validElements = elementsArray.filter(el => el instanceof HTMLElement);
    
    if (validElements.length === 0) {
      console.warn('animateElementTransition: Keine gültigen Elemente für Animation gefunden');
      return Promise.resolve();
    }
    
    // Promise für den Abschluss der Animation
    return new Promise(resolve => {
      let transitionCompleted = false;
      
      // Event-Listener für das Ende der Transition
      const firstElement = validElements[0];
      
      const handleTransitionEnd = (e) => {
        if (
          e.target === firstElement && 
          e.propertyName === "opacity" &&
          firstElement.classList.contains(fadeClass)
        ) {
          transitionCompleted = true;
          firstElement.removeEventListener("transitionend", handleTransitionEnd);
          
          // Updates während der Pause durchführen
          performUpdate();
        }
      };
      
      firstElement.addEventListener("transitionend", handleTransitionEnd);
      
      // Funktion für das Update in der Pause
      function performUpdate() {
        // Callback für Updates während der Pause
        if (typeof updateCallback === 'function') {
          updateCallback();
        }
        
        // Einblenden nach der Pause
        setTimeout(() => {
          validElements.forEach(el => el.classList.remove(fadeClass));
          
          // Animation abschließen
          setTimeout(() => {
            resolve();
          }, fadeDuration);
        }, pauseDuration);
      }
      
      // Ausblenden starten
      validElements.forEach(el => el.classList.add(fadeClass));
      
      // Fallback-Timer für den Fall, dass transitionend nicht ausgelöst wird
      setTimeout(() => {
        if (!transitionCompleted) {
          performUpdate();
        }
      }, fadeDuration + 50);
    });
  }
  
  /**
   * Erstellt eine initiale Erscheinungs-Animation für UI-Elemente
   * @param {HTMLElement|HTMLElement[]} elements - Zu animierende DOM-Elemente
   * @param {string} [className='initial-appear'] - CSS-Klasse für die Animation
   * @returns {Promise} - Promise, das erfüllt wird, wenn die Animation abgeschlossen ist
   */
  export function initialAppearAnimation(elements, className = 'initial-appear') {
    // CSS-Variable für die Dauer lesen
    const duration = getCSSTimeVariable("--title-initial-duration", 800);
    
    const elementsArray = Array.isArray(elements) ? elements : [elements];
    const validElements = elementsArray.filter(el => el instanceof HTMLElement);
    
    if (validElements.length === 0) {
      return Promise.resolve();
    }
    
    // Animation anwenden
    validElements.forEach(el => el.classList.add(className));
    
    // Promise für den Abschluss
    return new Promise(resolve => {
      setTimeout(() => {
        validElements.forEach(el => el.classList.remove(className));
        resolve();
      }, duration);
    });
  }