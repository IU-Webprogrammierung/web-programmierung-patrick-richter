/**
 * @module overlayController
 * @description Steuert das Overlay-System für About und Imprint-Inhalte.
 * Verwaltet das Öffnen und Schließen des Overlays mit Animationen sowie den 
 * Wechsel zwischen About und Imprint. Synchronisiert den Overlay-Status mit der URL.
 * Enthält Funktionen:
 * - init()
 * - showOverlay()
 * - hideOverlay()
 * - toggleAboutImprint()
 * - handleKeyPress()
 * 
 * @listens keydown - Für ESC-Taste zum Schließen
 * @listens click - Auf Open/Close-Buttons und Overlay-Left
 */

import logger from '@core/logger';
import { checkFooter, getValidatedElement, validateElement } from '@utils';
import { toggleDescription } from '@ui/mobileUi/mobileDescription.js';
import { removeHoverListeners } from '@portfolio/projects/hoverPreview.js';
import CustomRouter from '@core/CustomRouter.js';
import uiState from '@core/state/uiState.js';

// Overlay-DOM-Elemente
const overlay = getValidatedElement(".overlay");
const overlayRight = getValidatedElement(".overlay-right");
const titleDescriptionContainer = getValidatedElement(
  ".title-description-container"
);

// Flag, um zu erkennen, ob URL-Updates unterdrückt werden sollen
let suppressRouteUpdate = false;

/**
 * Initialisiert den Overlay-Controller und registriert Event-Listener
 */
function init() {
    // Event-Listener für direktes Öffnen/Schließen
    getValidatedElement("#openOverlay")?.addEventListener("click", () => {
        // Overlay öffnen und About anzeigen
        showOverlay();
        toggleAboutImprint("show-about");
        
        // URL aktualisieren (wenn nicht unterdrückt)
        if (!suppressRouteUpdate && CustomRouter.initialized) {
            CustomRouter.navigateToAbout();
        }
    });
    
    getValidatedElement("#closeOverlay")?.addEventListener("click", hideOverlay);
    getValidatedElement("#overlayLeft")?.addEventListener("click", hideOverlay);
    addEventListener("keydown", handleKeyPress);
    
    // About/Imprint-Umschaltung mit URL-Synchronisation
    getValidatedElement("#showImprint")?.addEventListener("click", () => {
        toggleAboutImprint("show-imprint");
        
        // URL aktualisieren (wenn nicht unterdrückt)
        if (!suppressRouteUpdate && CustomRouter.initialized) {
            CustomRouter.navigateToImprint();
        }
    });
    
    getValidatedElement("#showAbout")?.addEventListener("click", () => {
        toggleAboutImprint("show-about");
        
        // URL aktualisieren (wenn nicht unterdrückt)
        if (!suppressRouteUpdate && CustomRouter.initialized) {
            CustomRouter.navigateToAbout();
        }
    });
}

/**
 * Öffnet das Overlay und entfernt die Schließen-Animation
 */
export function showOverlay() {
    if (!validateElement(overlay, "Fehler: Overlay-Element nicht gefunden") || 
        !validateElement(overlayRight, "Fehler: Overlay-Right-Element nicht gefunden")) {
      return;
    }

    overlay.classList.remove("closing");

    getValidatedElement(".project-indicator").classList.remove("open");
    getValidatedElement(".project-indicator-tab")
      ?.setAttribute("aria-expanded", "false");

    if (!overlay.classList.contains("show-overlay")) {
      titleDescriptionContainer.classList.contains("show-description") &&
        toggleDescription();
      overlay.classList.add("show-overlay");
      overlay.setAttribute("aria-hidden", "false");
      logger.log("Overlay visible");
      getValidatedElement("#closeOverlay").focus();
    }
}

/**
 * Schließt das Overlay und wartet bis Animationen abgeschlossen sind
 */
export function hideOverlay() {
  if (!overlay || !overlayRight) {
      logger.error("Fehler: Overlay-Elemente nicht gefunden");
      return;
  }

  if (!overlay.classList.contains("show-overlay")) return;

  // 1. URL aktualisieren, falls nötig
  if (window.location.pathname === "/about" || window.location.pathname === "/imprint") {
      const currentIndex = uiState.activeProjectIndex;
      if (currentIndex >= 0 && currentIndex < uiState.projects.length) {
          const project = uiState.projects[currentIndex];
          
          if (!checkFooter(project)) {
              const projectId = project.getAttribute("data-project-id");
              const slug = uiState.getProjectSlug(projectId);
              
              if (slug) {
                  window.history.replaceState({}, '', `/${slug}`);
              } else {
                  window.history.replaceState({}, '', '/');
              }
          } else {
              window.history.replaceState({}, '', '/');
          }
      } else {
          window.history.replaceState({}, '', '/');
      }
  }

  // 2. Hover-Listener entfernen
  removeHoverListeners();
  
  // 3. Closing-Klasse hinzufügen für Animation
  overlay.classList.add("closing");
  
  // 4. Nach fester Zeit (länger als die Animation) aufräumen
  setTimeout(() => {
      overlay.classList.remove("show-overlay", "closing");
      overlay.setAttribute("aria-hidden", "true");
      getValidatedElement("#openOverlay")?.focus();
      toggleAboutImprint("show-about");
  }, 700); // Großzügiger Timeout, der garantiert länger als die Animation ist
}

/**
 * Wechselt zwischen About und Imprint
 * @param {string} targetClass - Die Ziel-Klasse ('show-about' oder 'show-imprint')
 */
export function toggleAboutImprint(targetClass) {
    const aboutImprintSlider = getValidatedElement(".about-imprint-slider");

    if (!aboutImprintSlider) {
        logger.error("Fehler: About-Imprint-Slider nicht gefunden");
        return;
    }

    if (
        targetClass === "show-about" &&
        aboutImprintSlider.classList.contains("show-imprint")
    ) {
        aboutImprintSlider.classList.replace("show-imprint", targetClass);
        getValidatedElement(".about").setAttribute("aria-hidden", "false");
        getValidatedElement(".imprint").setAttribute("aria-hidden", "true");
    } else if (
        targetClass === "show-imprint" &&
        aboutImprintSlider.classList.contains("show-about")
    ) {
        aboutImprintSlider.classList.replace("show-about", targetClass);
        getValidatedElement(".imprint").setAttribute("aria-hidden", "false");
        getValidatedElement(".about").setAttribute("aria-hidden", "true");
    }
}

/**
 * Behandelt Tastatureingaben für das Overlay
 * @param {KeyboardEvent} event - Das Keyboard-Event
 */
export function handleKeyPress(event) {
    if (event.key === "Escape") {
        hideOverlay();
    }
}

export default {
    init,
    showOverlay,
    hideOverlay,
    toggleAboutImprint
};