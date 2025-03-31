// In uiState.js
import { EVENT_TYPES } from './events.js';

const uiState = {
  // Aktueller Zustand der Anwendung
  activeProjectIndex: -1,
  activeImageIndex: -1,
  activeTextColor: "black",
  activeSlideIndex: -1, // Existierender globaler Slide-Index
  projects: [],
  activeSlideIndices: {}, // NEU: Speicherung der aktiven Slide-Indices pro Projekt

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

  // Erweiterte Methode zum Setzen des aktiven Bildes
  setActiveImage(projectIndex, imageId, textColor, slideIndex = -1) {
    const changed =
      projectIndex !== this.activeProjectIndex ||
      imageId !== this.activeImageIndex ||
      textColor !== this.activeTextColor ||
      slideIndex !== this.activeSlideIndex;

    if (changed) {
      this.activeProjectIndex = projectIndex;
      this.activeImageIndex = imageId;
      this.activeTextColor = textColor || "black";
      this.activeSlideIndex = slideIndex;
      
      // NEU: Speichern des aktiven Slide-Index pro Projekt
      if (slideIndex >= 0) {
        this.activeSlideIndices[projectIndex] = slideIndex;
        console.log(`Slide-Index ${slideIndex} für Projekt ${projectIndex} gespeichert`);
      }

      document.dispatchEvent(
        new CustomEvent(EVENT_TYPES.ACTIVE_IMAGE_CHANGED, {
          detail: {
            projectIndex: projectIndex,
            imageIndex: imageId,
            textColor: this.activeTextColor,
            slideIndex: slideIndex 
          },
        })
      );
      console.log(
        "uiState: Bild geupdated - neues Bild:",
        imageId, this.activeImageIndex,
        "projekt: ", projectIndex,
        "TextFarbe: ", textColor,
        "Slide-Index: ", slideIndex
      );
    }
  },
  
  // Methode zum Abrufen des gespeicherten Slide-Index für ein Projekt
  getActiveSlideIndexForProject(projectIndex) {
    return this.activeSlideIndices[projectIndex] !== undefined ? 
      this.activeSlideIndices[projectIndex] : 0;
  }
};

export default uiState;