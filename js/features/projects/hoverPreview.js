/**
 * @module hoverPreview
 * @description Einfache Hover-Funktionalität für Projektvorschauen
 */

import dataStore from "../../core/dataStore.js";
import {
  getValidatedElement,
  getWebpPath,
  detectWebpSupport,
  fixImagePath,
} from "../../core/utils.js";

// Bildpfade für Projekte
let projectImages = {};
// Bildgrößen für Performance-Optimierung
let projectImageSizes = {};
// Cache für DOM-Elemente
let previewEl = null;

// Handler-Funktion für mousemove
function mouseMoveHandler(e) {
  if (!previewEl) return;

  // Positionierung des Vorschaubilds relativ zum Cursor
  previewEl.style.left = e.clientX + 20 + "px";
  previewEl.style.top = e.clientY - 210 + "px"; // Höher über dem Cursor positionieren
}

// Handler-Funktion für mouseenter
function showPreviewHandler() {
  if (!previewEl) return;

  const projectId = this.getAttribute("data-project-id");
  if (projectImages[projectId]) {
    previewEl.src = projectImages[projectId];
    document.addEventListener("mousemove", mouseMoveHandler);
    previewEl.style.display = "block";

    // Verzögerung für sanften Übergang
    setTimeout(() => previewEl.classList.add("visible"), 10);
  }
}

// Handler-Funktion für mouseleave
function hidePreviewHandler() {
  if (!previewEl) return;

  previewEl.classList.remove("visible");
  document.removeEventListener("mousemove", mouseMoveHandler);

  // Verzögerung für sanften Übergang
  setTimeout(() => {
    if (!previewEl.classList.contains("visible")) {
      previewEl.style.display = "none";
    }
  }, 300);
}

/**
 * Fügt Hover-Listener zu den übergebenen Elementen hinzu
 */
function addHoverListeners(elements) {
  if (!elements || elements.length === 0) return;

  let newElements = 0;

  elements.forEach((link) => {
    // Skip, falls bereits ein Listener hinzugefügt wurde
    if (link.hasAttribute("data-hover-initialized")) return;

    newElements++;

    // MouseEnter- und MouseLeave-Listener hinzufügen
    link.addEventListener("mouseenter", showPreviewHandler);
    link.addEventListener("mouseleave", hidePreviewHandler);

    // Markieren, dass dieser Link initialisiert wurde
    link.setAttribute("data-hover-initialized", "true");
  });

  if (newElements > 0) {
    console.log(`Hover-Preview: ${newElements} neue Links initialisiert`);
  }
}

/**
 * Entfernt alle Hover-Listener von initialisierten Elementen
 */
export function removeHoverListeners() {
  const initializedLinks = document.querySelectorAll(
    '[data-hover-initialized="true"]'
  );

  initializedLinks.forEach((link) => {
    // Die tatsächlichen Listener entfernen
    link.removeEventListener("mouseenter", showPreviewHandler);
    link.removeEventListener("mouseleave", hidePreviewHandler);
    link.removeAttribute("data-hover-initialized");
  });

  // Sicherstellen, dass mousemove-Listener entfernt wird
  document.removeEventListener("mousemove", mouseMoveHandler);

  // Vorschaubild ausblenden
  if (previewEl) {
    previewEl.classList.remove("visible");
    previewEl.style.display = "none";
  }
}

/**
 * Initialisiert die Hover-Funktion mit Projektbildern
 */
export function setupHoverPreview() {
  // Auf Mobilgeräten nicht ausführen
  if (/Mobi|Android/i.test(navigator.userAgent)) return;

  // WebP-Unterstützung prüfen
  const supportsWebP = detectWebpSupport();
  console.log("Browser unterstützt WebP:", supportsWebP);

  // Preview-Element einmalig abfragen und cachen
  previewEl = getValidatedElement(".project-hover-preview");
  if (!previewEl) return;

  // Projekte laden
  const projects = dataStore.getProjects();
  if (!projects?.data) {
    // Optional chaining
    console.error("Hover-Preview: Keine Projektdaten verfügbar");
    return;
  }

  // Bildpfade extrahieren - angepasst für Strapi
  projects.data.forEach((project) => {
    // Verbesserte Fehlerbehandlung mit optional chaining
    const firstImage = project?.project_images?.[0];
    const imageObj = firstImage?.image?.[0];

    if (imageObj) {
      let imageSrc = imageObj.url;
      let imageWidth = imageObj.width || 0;

      // Bevorzuge Small-Format für Hover-Vorschau
      if (imageObj.formats) {
        if (imageObj.formats.small) {
          imageSrc = imageObj.formats.small.url;
          imageWidth = imageObj.formats.small.width;
        } else if (imageObj.formats.thumbnail) {
          // Fallback auf Thumbnail, falls Small nicht verfügbar
          imageSrc = imageObj.formats.thumbnail.url;
          imageWidth = imageObj.formats.thumbnail.width;
        }
      }

      // Bildpfad korrigieren
      const fixedPath = fixImagePath(imageSrc);

      // Entweder WebP oder Original basierend auf Browser-Unterstützung
      projectImages[project.id] = supportsWebP
        ? getWebpPath(fixedPath)
        : fixedPath;

      // Größe setzen, falls verfügbar (für Performance-Optimierung)
      if (imageWidth > 0) {
        projectImageSizes[project.id] = imageWidth;
      }
    }
  });

  // Event-Listener für Project Indicator
  const projectIndicatorTab = getValidatedElement(".project-indicator-tab");
  if (projectIndicatorTab) {
    projectIndicatorTab.addEventListener("click", function () {
      const projectLinks = document.querySelectorAll(
        ".project-list a[data-project-id]"
      );
      if (projectLinks && projectLinks.length > 0) {
        addHoverListeners(projectLinks);
      }
    });
  }

  // Event-Listener für About-Overlay
  const openOverlayBtn = getValidatedElement("#openOverlay");
  if (openOverlayBtn) {
    openOverlayBtn.addEventListener("click", function () {
      setTimeout(() => {
        const clientLinks = document.querySelectorAll(
          ".about-clients-project-link[data-project-id]"
        );
        if (clientLinks && clientLinks.length > 0) {
          addHoverListeners(clientLinks);
        }
      }, 300); // Warten bis Overlay geöffnet ist
    });
  }
}
