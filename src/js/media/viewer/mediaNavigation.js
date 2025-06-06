/**
 * @module imageNavigation
 * @description Implementiert die interaktive Cursor-basierte Navigation in Bildergalerien.
 * Passt den Cursor basierend auf der Mausposition (links/rechts) an und ermöglicht
 * Navigation zwischen Bildern durch Klicks.
 * Enthält Funktionen:
 * - init()
 * 
 * @listens mousemove - Aktualisiert den Cursor je nach Position
 * @listens mouseleave - Entfernt Cursor-Klassen beim Verlassen des Containers
 * @listens scroll - Passt Cursor nach Scroll-Events an
 * @listens click - Navigiert zwischen Bildern basierend auf Klickposition
 */

import logger from '@core/logger';
import { getValidatedElement } from '@utils';
import swiperInitializer from '@media/viewer/swiperController.js';

/**
 * Initialisiert die Bildnavigation mit Cursor-Effekten und Klick-Handling
 */
function init() {
  const container = getValidatedElement(".project-container", "Fehler: Project-Container nicht gefunden");

  if (!container) {
    logger.error("Fehler: Project-Container nicht gefunden");
    return;
  }
  
  logger.log("SetupImageNavigation gestartet");
  
  // Variablen für die letzte Mausposition
  let lastX = 0;
  let lastY = 0;
  
  // Hilfsfunktion zum Entfernen der Cursor-Klassen
  function clearCursorClasses() {
    container.classList.remove("cursor-left", "cursor-right");
  }
  
  // Eine gemeinsame Funktion für Cursor-Updates
  function updateCursor(x, y) {
    const elementAtPoint = document.elementFromPoint(x, y);
    if (!elementAtPoint) return;
    
    // Über Footer?
    if (elementAtPoint.closest(".footer-container")) {
      clearCursorClasses();
      return;
    }
    
    // Über einem Slider?
    const slider = elementAtPoint.closest(".swiper");
    if (!slider) {
      clearCursorClasses();
      return;
    }
    
    // Position im Container
    const rect = container.getBoundingClientRect();
    const relativeX = (x - rect.left) / rect.width;
    
    // Cursor-Klassen aktualisieren
    container.classList.toggle("cursor-left", relativeX < 0.5);
    container.classList.toggle("cursor-right", relativeX >= 0.5);
  }
  
  // Mausbewegung
  container.addEventListener("mousemove", function (e) {
    lastX = e.clientX;
    lastY = e.clientY;
    updateCursor(e.clientX, e.clientY);
  });
  
  // Maus verlässt Container
  container.addEventListener("mouseleave", function () {
    clearCursorClasses();
  });
  
  // Scroll-Event (minimal)
  container.addEventListener("scroll", function () {
    if (lastX && lastY) {
      // Minimales Timeout für DOM-Updates
      setTimeout(() => updateCursor(lastX, lastY), 10);
    }
  });
  
  // Klick-Handler für Bildnavigation
  container.addEventListener("click", function (e) {
    // Element unter dem Klick ermitteln
    const elementAtClick = document.elementFromPoint(e.clientX, e.clientY);
    if (!elementAtClick) return;
    
    // Nicht navigieren, wenn über Footer geklickt
    if (elementAtClick.closest(".footer-container")) return;
    
    // Swiper finden (statt slider)
    const slider = elementAtClick.closest(".swiper");
    if (!slider) return;
    
    // Swiper-Navigation verwenden statt scrollTo
    swiperInitializer.navigateSlide(slider, e.clientX);
});
}

export default { init };