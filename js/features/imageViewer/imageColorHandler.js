/**
 * @module imageColorHandler
 * @description Enthält alle Inhalte zur Befüllung der Projekte und des weiteren Inhalts:
 * setupImageColorHandler(),
 * handleColorChange(event)
 */

import uiState from '../../core/uiState.js';
import { EVENT_TYPES } from '../../core/events.js';

// Timer für Debouncing der Farbänderungen
let debounceColorTimer = null;

function setupImageColorHandler() {
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

      if (!slider) return;

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
  document.addEventListener(ACTIVE_PROJECT_CHANGED, (event) => {
    const { projectIndex } = event.detail;
    setupImageObserversForProject(projectIndex);
  });

  // Event-Listener für Farbänderungen
  document.addEventListener(ACTIVE_IMAGE_CHANGED, handleColorChange);

  // Initial für das aktive Projekt
  setTimeout(() => {
    setupImageObserversForProject(uiState.activeProjectIndex);
  }, 100);
}

function handleColorChange(event) {
  const textColor = event.detail.textColor;
  const projectIndex = event.detail.projectIndex;

  // Prüfen, ob dies ein Farbwechsel durch Projektwechsel ist
  const isProjectChange =
    event.detail.hasOwnProperty("projectIndex") &&
    projectIndex === uiState.activeProjectIndex &&
    document.querySelector(".project-title.fade-out");

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
    if (textColor === "white") {
      document
        .querySelector(".project-container")
        .classList.add("white-cursor");
    } else {
      document
        .querySelector(".project-container")
        .classList.remove("white-cursor");
    }
    console.log(
      `Farbe geändert zu: ${textColor}${
        isProjectChange ? " (verzögert nach Projektwechsel)" : ""
      }`
    );
  }, delay);
}
