/**
 * @module uiState
 * @description Zentraler Zustandsspeicher für die gesamte Anwendung.
 * Verwaltet den aktiven Projektindex, aktives Bild, Textfarben und URL-Slugs.
 * 
 * @fires EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Bei Änderung des aktiven Projekts
 * @fires EVENT_TYPES.ACTIVE_IMAGE_CHANGED - Bei Änderung des aktiven Bildes
 */

import { EVENT_TYPES, dispatchCustomEvent } from '@core/state/events.js';

const uiState = {
  // Aktueller Zustand der Anwendung
  activeProjectIndex: -1,
  activeImageIndex: -1,
  activeTextColor: "black",
  activeSlideIndex: -1,
  projects: [],
  activeSlideIndices: {},
  
  /**
   * @type {Object.<string, string>} Speichert die URL-Slugs für jede Projekt-ID
   */
  projectSlugs: {},

  /**
   * Speichert den URL-Slug für eine bestimmte Projekt-ID
   * @param {string} projectId - ID des Projekts
   * @param {string} slug - Der zu speichernde URL-Slug
   */
  setProjectSlug(projectId, slug) {
    this.projectSlugs[projectId] = slug;
  },

  /**
   * Gibt den URL-Slug für eine bestimmte Projekt-ID zurück
   * @param {string} projectId - ID des Projekts
   * @returns {string|undefined} Der gespeicherte Slug oder undefined
   */
  getProjectSlug(projectId) {
    return this.projectSlugs[projectId];
  },

  // Bestandsmethoden
  updateProjects() {
    this.projects = Array.from(
      document.querySelectorAll(".project")
    );
  },

  setActiveProject(index) {
    if (index !== this.activeProjectIndex) {
      this.activeProjectIndex = index;
      dispatchCustomEvent(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, {
        projectIndex: index
      });
      console.log(
        "uiState: Projekt aktualisiert - neues Projekt:",
        this.activeProjectIndex
      );
    }
  },

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
      
      // Speichern des aktiven Slide-Index pro Projekt
      if (slideIndex >= 0) {
        this.activeSlideIndices[projectIndex] = slideIndex;
      }

      dispatchCustomEvent(EVENT_TYPES.ACTIVE_IMAGE_CHANGED, {
        projectIndex: projectIndex,
        imageIndex: imageId,
        textColor: this.activeTextColor,
        slideIndex: slideIndex 
      });
      console.log(
        "uiState: Bild aktualisiert - neues Bild:", imageId,
        "Projekt:", projectIndex,
        "TextFarbe:", textColor,
        "Slide-Index:", slideIndex
      );
    }
  },
  
  getActiveSlideIndexForProject(projectIndex) {
    return this.activeSlideIndices[projectIndex] !== undefined ? 
      this.activeSlideIndices[projectIndex] : 0;
  }
};

export default uiState;