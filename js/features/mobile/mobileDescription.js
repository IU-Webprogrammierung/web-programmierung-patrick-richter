/**
 * @module mobileDescription
 * @description Enthält alle Mobile-spezifischen Inhalte :
 * toggleDescription(),
 * handlePointerDown(event),
 * handleTouchEnd(event)
 */

// Mobile Description Element
const titleDescriptionContainer = document.querySelector(".title-description-container");

export function toggleDescription() {
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
