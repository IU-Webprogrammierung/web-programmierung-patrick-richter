/**
 * @module animationUtils
 * @description Zentrale Hilfsfunktionen für UI-Animationen und Übergänge.
 * Bietet wiederverwendbare Funktionen für einheitliche Überblendeffekte und Timing.
 * Enthält Funktionen:
 * - parseTimeValue()
 * - getCSSTimeVariable()
 * - animateElementTransition()
 * - initialAppearAnimation()
 * 
 * @fires EVENT_TYPES.INITIAL_ANIMATION_STARTED - Bei Start der initialen Animation
 * @fires EVENT_TYPES.INITIAL_ANIMATION_COMPLETED - Bei Abschluss der initialen Animation
 */

import logger from '@core/logger';
import {EVENT_TYPES, dispatchCustomEvent} from '@core/state/events.js';
import { getValidatedElements } from '@utils';

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
  fadeClass = "fade-out",
}) {
  // CSS-Variablen für Timing aus dem Stylesheet lesen
  const fadeDuration = getCSSTimeVariable("--title-fade-duration", 300);
  const pauseDuration = getCSSTimeVariable("--title-between-pause", 200);

  // Stelle sicher, dass elements ein Array ist
  const elementsArray = Array.isArray(elements) ? elements : [elements];

  // Entferne ungültige Elemente
  const validElements = elementsArray.filter((el) => el instanceof HTMLElement);

  if (validElements.length === 0) {
    logger.warn(
      "animateElementTransition: Keine gültigen Elemente für Animation gefunden"
    );
    return Promise.resolve();
  }

  // Promise für den Abschluss der Animation
  return new Promise((resolve) => {
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
      if (typeof updateCallback === "function") {
        updateCallback();
      }

      // Einblenden nach der Pause
      setTimeout(() => {
        validElements.forEach((el) => el.classList.remove(fadeClass));

        // Animation abschließen
        setTimeout(() => {
          resolve();
        }, fadeDuration);
      }, pauseDuration);
    }

    // Ausblenden starten
    validElements.forEach((el) => el.classList.add(fadeClass));

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
 * @returns {Promise} - Promise, das erfüllt wird, wenn die Animation abgeschlossen ist
 */
export function initialAppearAnimation() {
  const uiElements = Array.from(getValidatedElements(".initial-hidden") || []);
  logger.log("initialAppearAnimation wird aufgerufen mit:", uiElements);
  
  // Prüfen, ob Elemente existieren und initial-hidden haben
  uiElements.forEach(el => {
    if (el) {
      logger.log("Element:", el, "hat initial-hidden:", el.classList.contains('initial-hidden'));
    }
  });
  
  // Event auslösen, dass Animation startet
  dispatchCustomEvent(EVENT_TYPES.INITIAL_ANIMATION_STARTED);
  logger.log("INITIAL_ANIMATION_STARTED ausgelöst");
  
  // Lese Dauer und Delay aus den CSS-Variablen
  const duration = getCSSTimeVariable("--title-initial-duration", 300);
  const delay = getCSSTimeVariable("--title-initial-delay", 6000);
  logger.log("INITIAL APPEAR: duration:", duration, "delay:", delay);
  
  // Stelle sicher, dass uiElements ein Array ist
  const elementsArray = Array.isArray(uiElements) ? uiElements : [uiElements];
  logger.log("INITIAL APPEAR: elementsArray:", elementsArray);
  const validElements = elementsArray.filter(el => el && el instanceof HTMLElement);
  logger.log("INITIAL APPEAR: validElements:", validElements);
  
  if (validElements.length === 0) return Promise.resolve();
  
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      // Initial-hidden entfernen, Animation hinzufügen
      validElements.forEach(el => {
        el.classList.remove('initial-hidden');
        el.classList.add('initial-appear');
        logger.log("initial-appear wird hinzugefügt zu:", el);
      });
  
      // Gesamtdauer (Delay + Animationsdauer + Puffer) abwarten
      const totalTime = duration + delay + 50;
      logger.log("initialAppearAnimation wird Promise auflösen nach", totalTime, "ms");
      
      setTimeout(() => {
        // Aufräumen: Entferne initial-appear-Klasse, damit der Endzustand übernommen wird
        validElements.forEach(el => el.classList.remove('initial-appear'));
        logger.log("INITIAL_ANIMATION_COMPLETED wird jetzt ausgelöst");
  
        // Event auslösen, dass Animation abgeschlossen ist
        dispatchCustomEvent(EVENT_TYPES.INITIAL_ANIMATION_COMPLETED);
        resolve();
      }, totalTime);
    });
  });
}