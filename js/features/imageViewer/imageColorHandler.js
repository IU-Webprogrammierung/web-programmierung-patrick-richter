/**
 * @module imageColorHandler
 * @description Überwacht Farbänderungen und passt die Textfarbe der UI dynamisch an.
 * Reagiert auf ACTIVE_IMAGE_CHANGED Events aus dem zentralen uiState.
 *
 * Funktionen: setupImageColorHandler(), handleColorChange()
 */

import { EVENT_TYPES } from "../../core/events.js";
import { getValidatedElement } from "../../core/utils.js";
import uiState from "../../core/uiState.js";

// Timer für Debouncing der Farbänderungen
let debounceColorTimer = null;

/**
 * Richtet den Event-Listener für Farbänderungen ein.
 * Deutlich einfacher, da alle Logik zur Bildermittlung entfernt wurde.
 */
export function setupImageColorHandler() {
  // Einfacher Event-Listener für Farbänderungen
  document.addEventListener(
    EVENT_TYPES.ACTIVE_IMAGE_CHANGED,
    handleColorChange
  );
  
  console.log("ImageColorHandler: Setup abgeschlossen, auf Events wartend");
}

/**
 * Zentrale Funktion zur Handhabung aller Farbänderungen.
 * Wird durch ACTIVE_IMAGE_CHANGED Events ausgelöst.
 */
export function handleColorChange(event) {
  // Sicherstellen, dass das Event gültige Details enthält
  if (!event || !event.detail) return;

  const textColor = event.detail.textColor;
  const projectIndex = event.detail.projectIndex;

  // Prüfen, ob dies ein Farbwechsel durch Projektwechsel ist
  const isProjectChange =
    event.detail.hasOwnProperty("projectIndex") &&
    projectIndex === uiState.activeProjectIndex &&
    document.querySelector(".project-title.fade-out") !== null;

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
    
    // Container für Cursor-Stil finden
    const container = getValidatedElement(".project-container");
    if (container) {
      // Cursor basierend auf Textfarbe anpassen
      if (textColor === "white") {
        container.classList.add("white-cursor");
      } else {
        container.classList.remove("white-cursor");
      }
    }
    
    console.log(
      `Farbe geändert zu: ${textColor}${
        isProjectChange ? " (verzögert nach Projektwechsel)" : ""
      }`
    );
  }, delay);
}