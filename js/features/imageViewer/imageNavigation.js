/**
 * @module imageNavigation
 * @description Implementiert die interaktive Cursor-basierte Navigation in Bildergalerien.
 * Passt den Cursor basierend auf der Mausposition (links / rechts) an, ermöglicht Navigation zwischen
 * Bildern durch Klicks und unterstützt unendliches Scrollen durch Bilder.
 * 
 * Funktionen: setupImageNavigation()
 */

export function setupImageNavigation() {
    const container = document.querySelector(".project-container");

    if (!container) {
      console.error("Fehler: Project-Container nicht gefunden");
      return; // Frühe Rückgabe
    }
  
    console.log("SetupImageNavigation gestartet");
  
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
      const slider = elementAtPoint.closest(".slider");
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
  
      // Slider finden
      const slider = elementAtClick.closest(".slider");
      if (!slider) return;
  
      // Position im Container
      const rect = container.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
  
      // Navigation basierend auf Klickposition
      navigateImage(slider, relativeX < 0.5 ? -1 : 1);
    });
  
    // Navigationsfunktion mit Richtungsparameter
    function navigateImage(slider, direction) {
      // Parameter: direction = -1 für links, +1 für rechts
      const slideWidth = slider.clientWidth;
      const currentPosition = slider.scrollLeft;
  
      // Aktueller Index (gerundet zum nächsten Bild)
      let currentIndex = Math.round(currentPosition / slideWidth);
  
      // Neuer Index basierend auf Richtung
      let newIndex = currentIndex + direction;
  
      // Infinite Scroll-Logik
      const totalSlides = Math.round(slider.scrollWidth / slideWidth);
  
      if (newIndex < 0) {
        newIndex = totalSlides - 1; // Zum letzten Bild
      } else if (newIndex >= totalSlides) {
        newIndex = 0; // Zum ersten Bild
      }
  
      // Zum neuen Bild scrollen
      slider.scrollTo({
        left: newIndex * slideWidth,
        behavior: "smooth",
      });
    }
  
    // TODO: Mobile Touch-Navigation
    // Für eine vollständige mobile Implementation wird in der nächsten Phase eine spezialisierte
    // Bibliothek wie SwiperJS integriert.
  }
