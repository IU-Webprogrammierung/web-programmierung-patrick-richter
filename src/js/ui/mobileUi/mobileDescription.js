/**
 * @module mobileDescription
 * @description Verwaltet die mobile Ansicht der Projektbeschreibungen.
 * Implementiert ein ein-/ausklappbares Beschreibungsfeld mit
 * Touch-Gesten-Unterstützung für mobile Geräte.
 * Enthält Funktionen:
 * - init()
 * - toggleDescription()
 * - handlePointerDown()
 * - handleTouchEnd()
 * 
 * @listens click - Toggles die Beschreibungsanzeige bei Klick
 * @listens pointerdown - Erfasst Start-Position für Swipe-Erkennung
 * @listens touchend - Erkennt Swipe-Gesten und reagiert entsprechend
 */

// Mobile Description Element

import logger from '@core/logger';
import { getValidatedElement } from '@utils';

/**
 * Initialisiert die mobile Beschreibungskomponente
 */
function init() {

  const titleDescriptionContainer = getValidatedElement(".title-description-container");
  titleDescriptionContainer.addEventListener("click", toggleDescription);
  titleDescriptionContainer.addEventListener("pointerdown", handlePointerDown);
  titleDescriptionContainer.addEventListener("touchend", handleTouchEnd);

}

/**
 * Schaltet die Beschreibungsanzeige ein/aus
 */
export function toggleDescription() {
  const titleDescriptionContainer = getValidatedElement(
    ".title-description-container",
    "Fehler: Title-Description-Container nicht gefunden"
  );

  titleDescriptionContainer.classList.toggle("show-description");
  titleDescriptionContainer.setAttribute(
    "aria-expanded",
    titleDescriptionContainer.getAttribute("aria-expanded") === "false"
      ? "true"
      : "false"
  );
}

// Überprüft touchstart
let startY = 0;

/**
 * Speichert die Start-Y-Position beim Touch/Pointer-Down
 * @param {PointerEvent|TouchEvent} event - Das Pointer/Touch-Event
 */
export function handlePointerDown(event) {
  startY =
    event.clientY ||
    (event.touches && event.touches[0] && event.touches[0].clientY) ||
    0;
}

/**
 * Überprüft Swipe/Drag-Richtung und öffnet ggf. Description Mobile
 * @param {TouchEvent} event - Das Touch-End-Event
 */
export function handleTouchEnd(event) {
  const titleDescriptionContainer = getValidatedElement(
    ".title-description-container"
  );

  const endY =
    event.clientY ||
    (event.changedTouches &&
      event.changedTouches[0] &&
      event.changedTouches[0].clientY) ||
    0;
  logger.log("handleTouchEnd: Touch geendet bei:", endY);
  logger.log("handleTouchEnd: startY", startY);
  let deltaY = startY - endY;

  if (
    deltaY < -20 &&
    titleDescriptionContainer.classList.contains("show-description")
  ) {
    toggleDescription();
  } else if (
    deltaY > 20 &&
    !titleDescriptionContainer.classList.contains("show-description")
  ) {
    toggleDescription();
  }
}

export default {
  init
};