/**
 * @module uiState
 * @description Zentrale Statusverwaltung für die UI-Komponenten der Website.
 * Verwaltet den aktiven Projektindex, das aktive Bild und dessen Textfarbe.
 * Stellt sicher, dass UI-Änderungen konsistent über Custom Events kommuniziert werden
 * und verhindert redundante Updates.
 * 
 * Funktionen: updateProjects(), setActiveProject(), setActiveImage()
 */

// Event-Typen importieren
import { EVENT_TYPES } from './events.js';

const uiState = {
  // Aktueller Zustand der Anwendung
  activeProjectIndex: -1,
  activeImageIndex: -1,
  activeTextColor: "black",
  projects: [],

  // Methode zum Aktualisieren der Projekte
  updateProjects() {
    this.projects = Array.from(
      document.querySelectorAll(".project:not(.footer-container)")
    );
  },

  // Methode zum Setzen des aktiven Projekts
  setActiveProject(index) {
    if (index !== this.activeProjectIndex) {
      this.activeProjectIndex = index;
      document.dispatchEvent(
        new CustomEvent(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, {
          detail: { projectIndex: index },
        })
      );
      console.log(
        "uiState: Projekt geupdated - neues Projekt:",
        this.activeProjectIndex,
        index
      );
    }
  },

  // Methode zum Setzen des aktiven Bildes
  setActiveImage(projectIndex, imageIndex, textColor) {
    const changed =
      projectIndex !== this.activeProjectIndex ||
      imageIndex !== this.activeImageIndex ||
      textColor !== this.activeTextColor;

    if (changed) {
      this.activeProjectIndex = projectIndex;
      this.activeImageIndex = imageIndex;
      this.activeTextColor = textColor || "black";

      document.dispatchEvent(
        new CustomEvent(EVENT_TYPES.ACTIVE_IMAGE_CHANGED, {
          detail: {
            projectIndex: projectIndex,
            imageIndex: imageIndex,
            textColor: this.activeTextColor,
          },
        })
      );
      console.log(
        "uiState: Bild geupdated - neues Bild:",
        imageIndex,
        this.activeImageIndex,
        "projekt: ",
        projectIndex,
        "TextFarbe: ",
        textColor
      );
    }
  },
};

export default uiState;