/**
 * @module hoverPreview
 * @description Implementiert Bild-Vorschau bei Hover über Projektlinks.
 * Zeigt ein kleines Vorschaubild, wenn der Nutzer mit der Maus über einen
 * Projektlink fährt, und positioniert es dynamisch neben dem Cursor.
 * Enthält Funktionen:
 * - init()
 * - removeHoverListeners()
 * 
 * @listens mouseenter - Für Project-Links, zeigt Preview an
 * @listens mouseleave - Für Project-Links, blendet Preview aus
 * @listens mousemove - Aktualisiert Position des Vorschaubilds
 */

import logger from '@core/logger';
import dataStore from '@core/dataStore.js';
import { getValidatedElement, fixImagePath } from '@utils';

// Speicher für Vorschaubilder und DOM-Cache
let projectImages = {};
let previewEl = null;

/**
 * Wählt ein passendes Bild für die Hover-Vorschau
 * @param {Object} imageObj - Das Bild-Objekt
 * @returns {string} URL des Vorschaubildes
 */
function getPreviewImageUrl(imageObj) {
  if (!imageObj) return 'images/placeholder.png';
  
  // WebP unterstützt?
  const webpSupported = localStorage.getItem('webp-support') === 'true';
  
  // 1. Priorität: Small Format (WebP wenn unterstützt)
  if (imageObj.formats) {
    if (webpSupported && imageObj.formats['small-webp']) {
      return fixImagePath(imageObj.formats['small-webp'].url);
    }
    if (imageObj.formats.small) {
      return fixImagePath(imageObj.formats.small.url);
    }
  }
  
  // 2. Fallback: Originalbild
  return fixImagePath(imageObj.url);
}

/**
 * Handler für Mausbewegung
 * @param {MouseEvent} e - Das Mausevent
 */
function mouseMoveHandler(e) {
  if (previewEl) {
    previewEl.style.left = e.clientX + 20 + "px";
    previewEl.style.top = e.clientY - 210 + "px";
  }
}

/**
 * Handler zum Anzeigen des Vorschaubildes
 */
function showPreviewHandler() {
  if (!previewEl) return;

  const projectId = this.getAttribute("data-project-id");
  if (projectImages[projectId]) {
    previewEl.src = projectImages[projectId];
    document.addEventListener("mousemove", mouseMoveHandler);
    previewEl.style.display = "block";
    setTimeout(() => previewEl.classList.add("visible"), 10);
  }
}

/**
 * Handler zum Ausblenden des Vorschaubildes
 */
function hidePreviewHandler() {
  if (!previewEl) return;

  previewEl.classList.remove("visible");
  document.removeEventListener("mousemove", mouseMoveHandler);
  setTimeout(() => {
    if (!previewEl.classList.contains("visible")) {
      previewEl.style.display = "none";
    }
  }, 300);
}

/**
 * Fügt Hover-Listener zu Links hinzu
 * @param {NodeList} elements - Die Link-Elemente
 */
function addHoverListeners(elements) {
  if (!elements || elements.length === 0) return;

  elements.forEach((link) => {
    if (!link.hasAttribute("data-hover-initialized")) {
      link.addEventListener("mouseenter", showPreviewHandler);
      link.addEventListener("mouseleave", hidePreviewHandler);
      link.setAttribute("data-hover-initialized", "true");
    }
  });
}

/**
 * Entfernt alle Hover-Listener
 */
export function removeHoverListeners() {
  const initializedLinks = document.querySelectorAll('[data-hover-initialized="true"]');

  initializedLinks.forEach((link) => {
    link.removeEventListener("mouseenter", showPreviewHandler);
    link.removeEventListener("mouseleave", hidePreviewHandler);
    link.removeAttribute("data-hover-initialized");
  });

  document.removeEventListener("mousemove", mouseMoveHandler);

  if (previewEl) {
    previewEl.classList.remove("visible");
    previewEl.style.display = "none";
  }
}

/**
 * Initialisiert die Hover-Vorschau
 */
function init() {
  // Auf Mobilgeräten nicht ausführen
  if (/Mobi|Android/i.test(navigator.userAgent)) return;

  previewEl = getValidatedElement(".project-hover-preview");
  if (!previewEl) return;

  // Vorschaubilder für alle Projekte vorbereiten
  const projects = dataStore.getProjects();
  if (projects?.data) {
    projects.data.forEach((project) => {
      const firstImage = project?.project_images?.[0];
      if (firstImage?.image?.[0]) {
        projectImages[project.id] = getPreviewImageUrl(firstImage.image[0]);
      }
    });
  }

  // Event-Listener für Project Indicator
  const projectIndicatorTab = getValidatedElement(".project-indicator-tab");

  if (projectIndicatorTab) {
    logger.log("HoverPreview initialisiert");

    projectIndicatorTab.addEventListener("click", () => {
      logger.log("HoverPreview initialisiert LISTENER AUSGELÖST");
      const projectLinks = document.querySelectorAll(".project-list a[data-project-id]");
      addHoverListeners(projectLinks);
    });
  } else {
    logger.warn("projectIndicatorTab nicht gefunden");
  }

  // Event-Listener für About-Overlay
  const openOverlayBtn = getValidatedElement("#openOverlay");
  if (openOverlayBtn) {
    openOverlayBtn.addEventListener("click", () => {
      setTimeout(() => {
        addHoverListeners(document.querySelectorAll(".about-clients-project-link[data-project-id]"));
      }, 300);
    });
  }
}

export default {
  init
};