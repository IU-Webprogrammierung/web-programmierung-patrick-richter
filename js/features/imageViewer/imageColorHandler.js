/**
 * @module imageColorHandler
 * @description Überwacht sichtbare Bilder und passt die Textfarbe der UI dynamisch an.
 * Nutzt IntersectionObserver für effiziente Erkennung sichtbarer Bilder und
 * implementiert Debouncing für flüssige Farbübergänge zwischen Bildern und Projekten.
 *
 * Funktionen: setupImageColorHandler(), handleColorChange()
 */

import uiState from "../../core/uiState.js";
import { EVENT_TYPES } from "../../core/events.js";
import { validateElement } from "../../core/utils.js";
import { getValidatedElement } from "../../core/utils.js";

// Timer für Debouncing der Farbänderungen
let debounceColorTimer = null;

export function setupImageColorHandler() {
  // Speichert aktive Observer, um sie später zu trennen
  let currentObservers = [];

  // Funktion zum Einrichten der Observer für ein bestimmtes Projekt
  function setupImageObserversForProject(projectIndex) {
    // Bestehende Observer trennen
    currentObservers.forEach((obs) => obs.disconnect());
    currentObservers = [];

    // Nur für gültige Projekte fortfahren
    if (projectIndex >= 0 && projectIndex < uiState.projects.length) {
      const project = uiState.projects[projectIndex];
      const slider = project.querySelector(".slider");

      if (
        !validateElement(
          slider,
          `Slider für Projekt ${projectIndex} nicht gefunden`,
          "warn"
        )
      )
        return;

      const slides = slider.querySelectorAll(".slide");
      console.log(
        `Observer für Projekt ${projectIndex} eingerichtet, ${slides.length} Bilder gefunden`
      );

      const options = {
        root: slider,
        threshold: 0.6,
        rootMargin: "0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slide = entry.target;
            const imageId = parseInt(slide.getAttribute("data-id"));
            const textColor = slide.getAttribute("data-text-color");

            // Status aktualisieren (löst activeImageChanged aus)
            uiState.setActiveImage(projectIndex, imageId, textColor);
          }
        });
      }, options);

      // Alle Bilder im aktuellen Slider beobachten
      slides.forEach((slide) => {
        observer.observe(slide);
      });

      currentObservers.push(observer);
    }
  }

  // Bei Projektwechsel neue Observer einrichten
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
    const { projectIndex } = event.detail;
    setupImageObserversForProject(projectIndex);
  });

  // Event-Listener für Farbänderungen
  document.addEventListener(
    EVENT_TYPES.ACTIVE_IMAGE_CHANGED,
    handleColorChange
  );

  // Initial für das aktive Projekt
  setTimeout(() => {
    setupImageObserversForProject(uiState.activeProjectIndex);
  }, 100);
}

export function handleColorChange(event) {
  // Sicherstellen, dass das Event gültige Details enthält
  if (!event || !event.detail) return;

  const textColor = event.detail.textColor;
  const projectIndex = event.detail.projectIndex;

  // Prüfen, ob dies ein Farbwechsel durch Projektwechsel ist
  const isProjectChange =
    event.detail.hasOwnProperty("projectIndex") &&
    projectIndex === uiState.activeProjectIndex &&
    document.querySelector(".project-title.fade-out") !== null; 
      
  // Debouncing: Zu schnelle Farbwechsel vermeiden
  clearTimeout(debounceColorTimer);

  // Bei Projektwechsel mit längerem Delay, sonst mit kürzerem
  const delay = isProjectChange ? 350 : 50;

  debounceColorTimer = setTimeout(() => {
    // Nur hier wird die Farbe tatsächlich geändert
    document.documentElement.style.setProperty(
      "--active-text-color",
      textColor
    );
    // Container für Cursor-Stil finden
    const container = getValidatedElement(".project-container");
    if (container) {
      // Cursor basierend auf Textfarbe anpassen
      if (textColor === "white") {
        container.classList.add("white-cursor");
      } else {
        container.classList.remove("white-cursor");
      }
    }
    console.log(
      `Farbe geändert zu: ${textColor}${
        isProjectChange ? " (verzögert nach Projektwechsel)" : ""
      }`
    );
  }, delay);
}
