/**
 * @module overlayController
 * @description Steuert das Overlay-System für About und Imprint-Inhalte.
 * Verwaltet das Öffnen und Schließen des Overlays mit Animationen, sowie den
 * Wechsel zwischen About- und Imprint-Ansichten. Berücksichtigt Barrierefreiheit
 * durch ARIA-Attribute und Fokus-Management.
 * 
 * Funktionen: showOverlay(), hideOverlay(), toggleAboutImprint(), handleKeyPress()
 */

import { toggleDescription } from "../mobile/mobileDescription.js";

// Overlay-DOM-Elemente
const overlay = document.querySelector(".overlay");
const overlayRight = document.querySelector(".overlay-right");

// Öffnet das Overlay und entfernt die Schließen-Animation

export function showOverlay() {
  if (!overlay || !overlayRight) {
    console.error("Fehler: Overlay-Elemente nicht gefunden");
    return; // Frühe Rückgabe
  }

  overlay.classList.remove("closing");
  const titleDescriptionContainer = document.querySelector(
    ".title-description-container"
  );

  if (!overlay.classList.contains("show-overlay")) {
    titleDescriptionContainer.classList.contains("show-description") &&
      toggleDescription();
    overlay.classList.add("show-overlay");
    overlay.setAttribute("aria-hidden", "false");
    console.log("Overlay visible");
    document.querySelector("#closeOverlay").focus();
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
    overlay.classList.add("closing");
    overlayRight.addEventListener(
      "transitionend",
      function () {
        overlay.classList.remove("show-overlay", "closing");
        overlay.setAttribute("aria-hidden", "true");
        document.querySelector("#openOverlay").focus();
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
  const aboutImprintSlider = document.querySelector(".about-imprint-slider");

  if (!aboutImprintSlider) {
    console.error("Fehler: About-Imprint-Slider nicht gefunden");
    return; // Frühe Rückgabe
  }

  if (
    targetClass === "show-about" &&
    aboutImprintSlider.classList.contains("show-imprint")
  ) {
    aboutImprintSlider.classList.replace("show-imprint", targetClass);
    document.querySelector(".about").setAttribute("aria-hidden", "false");
    document.querySelector(".imprint").setAttribute("aria-hidden", "true");
  } else if (
    targetClass === "show-imprint" &&
    aboutImprintSlider.classList.contains("show-about")
  ) {
    aboutImprintSlider.classList.replace("show-about", targetClass);
    document.querySelector(".imprint").setAttribute("aria-hidden", "false");
    document.querySelector(".about").setAttribute("aria-hidden", "true");
  }
}

export function handleKeyPress(event) {
  if (event.key === "Escape") {
    hideOverlay();
  }
}
