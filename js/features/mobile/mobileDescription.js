/**
 * @module mobileDescription
 * @description Verwaltet die mobile Ansicht der Projektbeschreibungen.
 * Implementiert ein ein- / ausklappbares Beschreibungsfeld mit Touch-Gesten-Unterstützung.
 *
 * Funktionen: toggleDescription(), handlePointerDown(), handleTouchEnd()
 */

// Mobile Description Element

import { getValidatedElement } from '../../core/utils.js';


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

export function handlePointerDown(event) {
  startY =
    event.clientY ||
    (event.touches && event.touches[0] && event.touches[0].clientY) ||
    0;
}

// Überprüft Swipe/Drag-Richtung unf öffnet ggf. Description Mobile

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
  console.log("handleTouchEnd: Touch geendet bei:", endY);
  console.log("handleTouchEnd: startY", startY);
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
