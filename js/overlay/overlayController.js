/**
 * @module overlayController
 * @description Steuert das Overlay-System für About und Imprint-Inhalte.
 * Verwaltet das Öffnen und Schließen des Overlays mit Animationen, sowie den
 * Wechsel zwischen About und Imprint.
 *
 * Funktionen: showOverlay(), hideOverlay(), toggleAboutImprint(), handleKeyPress()
 */

import { validateElement } from '../utils/utils.js';
import { getValidatedElement } from '../utils/utils.js';
import { toggleDescription } from "../ui/mobileUi/mobileDescription.js";
import { removeHoverListeners } from "../portfolio/projects/hoverPreview.js";


// Overlay-DOM-Elemente
const overlay = getValidatedElement(".overlay");
const overlayRight = getValidatedElement(".overlay-right");
const titleDescriptionContainer = getValidatedElement(
  ".title-description-container"
);

function init() {
    getValidatedElement("#openOverlay")?.addEventListener("click", showOverlay);
    getValidatedElement("#closeOverlay")?.addEventListener("click", hideOverlay);
    getValidatedElement("#overlayLeft")?.addEventListener("click", hideOverlay);
    addEventListener("keydown", handleKeyPress);
    getValidatedElement("#showImprint")?.addEventListener("click", () => toggleAboutImprint("show-imprint"));
    getValidatedElement("#showAbout")?.addEventListener("click", () => toggleAboutImprint("show-about"));
}

// Öffnet das Overlay und entfernt die Schließen-Animation

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
    console.log("Overlay visible");
    getValidatedElement("#closeOverlay").focus();
    console.log(document.activeElement);
  }
}

// schließt das Overlay und wartet bis Animationen abgeschlossen sind

export function hideOverlay() {
  if (!overlay || !overlayRight) {
    console.error("Fehler: Overlay-Elemente nicht gefunden");
    return; // Frühe Rückgabe
  }

  if (
    overlay.classList.contains("show-overlay") &&
    !overlay.classList.contains("hiding")
  ) {
    removeHoverListeners();
    overlay.classList.add("closing");
    overlayRight.addEventListener(
      "transitionend",
      function () {
        overlay.classList.remove("show-overlay", "closing");
        overlay.setAttribute("aria-hidden", "true");
        getValidatedElement("#openOverlay").focus();
        toggleAboutImprint("show-about");
        console.log("Overlay hidden");
        console.log(document.activeElement);
      },
      { once: true }
    );
  }
}

// wechsele zwischen About und Imprint

export function toggleAboutImprint(targetClass) {
  const aboutImprintSlider = getValidatedElement(".about-imprint-slider");

  if (!aboutImprintSlider) {
    console.error("Fehler: About-Imprint-Slider nicht gefunden");
    return; // Frühe Rückgabe
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

export function handleKeyPress(event) {
  if (event.key === "Escape") {
    hideOverlay();
  }
}

export default {
  init
};