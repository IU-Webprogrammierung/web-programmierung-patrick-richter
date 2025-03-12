/**
 * @module projectLoader
 * @description Verantwortlich für das Erstellen und Rendern der Projektinhalte.
 * Generiert Projekt-DOM-Elemente basierend auf den JSON-Daten und richtet weitere
 * Module ein, um die Funktionalität der Projekte zu gewährleisten.
 * 
 * Funktionen: createProjectElements()
 */

import dataStore from "../../core/dataStore.js";
import uiState from "../../core/uiState.js";
import { setupScrollHandler } from "./projectNavigation.js";
import { setupProjectTitle } from "./projectTitle.js";
import { setupImageColorHandler } from "../imageViewer/imageColorHandler.js";
import { setupImageNavigation } from "../imageViewer/imageNavigation.js";


export function createProjectElements() {
  const projectsData = dataStore.getProjects();
  const container = document.querySelector(".project-container");

  if (!container) {
    console.error("Fehler: Project-Container nicht gefunden");
    return; // Frühe Rückgabe, wenn Element fehlt
  }

  // TODO Scroll-Snap temporär deaktivieren - vielleicht mit REACT entfernen?
  const originalSnapType = container.style.scrollSnapType;
  container.style.scrollSnapType = "none";

  // Footer speichern und entfernen
  const footerElement = container.querySelector(".footer-container");
  if (footerElement) {
    footerElement.remove();
  }

  // Container komplett leeren
  container.innerHTML = "";

  if (projectsData && projectsData.data) {
    projectsData.data.forEach((project) => {
      // Bilder-HTML erstellen (falls vorhanden)
      let imagesHTML = "";
      if (project.project_images && project.project_images.length > 0) {
        imagesHTML = project.project_images
          .map(
            (img) => `
                      <img 
                          src="${img.image[0].url}" 
                          alt="${img.image[0].alt || project.name}" 
                          data-id="${img.id}"
                          data-text-color="${img.textColor}"
                          data-image-title="${img.imageTitle}"
                          class="slide"
                      />
                  `
          )
          .join("");
      }

      // Eindeutige IDs für Accessibility
      const projectTitleId = `project-title-${project.id}`;

      // Gesamtes Projekt-HTML
      const projectHTML = `
                      <article 
          class="project" 
          aria-labelledby="${projectTitleId}"
          data-project-id="${project.id}"
          data-project-name="${project.name}"
      >
                      <div class="slider">
                          ${imagesHTML}
                      </div>
                      <div class="description desktop-only" id="${projectTitleId}">
                          ${project.description[0].children[0].text}
                      </div>
                  </article>
              `;

      container.insertAdjacentHTML("beforeend", projectHTML);
    });
  }
  if (footerElement) {
    // Footer anhängen und "hidden" entfernen
    container.appendChild(footerElement);
    footerElement.classList.remove("hidden-footer");
  }
  // Am Ende: Zum ersten Projekt scrollen und dann Snap wiederherstellen
  setTimeout(() => {
    container.scrollTop = 0;
    setTimeout(() => {
      container.style.scrollSnapType = originalSnapType;
      uiState.updateProjects();

      setupScrollHandler();
      setupProjectTitle();
      setupImageColorHandler();
      setupImageNavigation();
    }, 50);
  }, 50);
  uiState.updateProjects();
}