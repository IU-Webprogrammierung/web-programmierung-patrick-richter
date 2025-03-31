/**
 * @module imageColorHandler
 * @description Überwacht Farbänderungen und passt die Textfarbe der UI dynamisch an.
 */

import { EVENT_TYPES } from "../../core/events.js";
import { getValidatedElement } from "../../core/utils.js";
import uiState from "../../core/uiState.js";
import TransitionController from "../../core/transitionController.js";

// Timer für Debouncing der Farbänderungen
let debounceColorTimer = null;

/**
 * Richtet den Event-Listener für Farbänderungen ein.
 */
export function setupImageColorHandler() {
  // Original-Listener für normale Farbwechsel beibehalten
  document.addEventListener(
    EVENT_TYPES.ACTIVE_IMAGE_CHANGED,
    handleColorChange
  );
  
  // Neuer Listener für synchronisierten Farbwechsel während Transitionen
  document.addEventListener(
    TransitionController.events.PHASE_CHANGED,
    handleTransitionPhase
  );
  
  console.log("ImageColorHandler: Setup abgeschlossen, auf Events wartend");
}

/**
 * Neuer Handler für die Phasen des TransitionControllers.
 * Synchronisiert den Farbwechsel mit der BETWEEN-Phase.
 */
function handleTransitionPhase(event) {
  const { phase } = event.detail;
  
  // Nur in der BETWEEN-Phase die Farbe aktualisieren
  if (phase === TransitionController.phases.BETWEEN) {
    // Ausstehende Timer abbrechen
    clearTimeout(debounceColorTimer);
    
    // Aktuelle Farbe sofort aus dem uiState anwenden
    const textColor = uiState.activeTextColor;
    document.documentElement.style.setProperty(
      "--active-text-color",
      textColor
    );
    
    // Auch den Cursor-Stil aktualisieren
    updateCursorStyle(textColor);
    
    console.log(`Farbwechsel in BETWEEN-Phase zu: ${textColor}`);
  }
}

/**
 * Ursprüngliche Funktion für Farbwechsel bei normalen Bildwechseln.
 * Bleibt für Kompatibilität erhalten, ignoriert aber Aufrufe während Transitionen.
 */
export function handleColorChange(event) {
  // Sicherstellen, dass das Event gültige Details enthält
  if (!event || !event.detail) return;

  const textColor = event.detail.textColor;
  const projectIndex = event.detail.projectIndex;

  // WICHTIG: Bei aktivem Transition nichts tun
  if (TransitionController.isActive()) {
    console.log(`Farbwechsel während Transition aufgeschoben`);
    return; // Die Farbe wird in handleTransitionPhase in der BETWEEN-Phase gesetzt
  }

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
    // Farbe ändern
    document.documentElement.style.setProperty(
      "--active-text-color",
      textColor
    );
    
    // Cursor-Stil aktualisieren
    updateCursorStyle(textColor);
    
    console.log(`Farbe geändert zu: ${textColor}`);
  }, delay);
}

/**
 * Hilfsfunktion zum Aktualisieren des Cursor-Stils
 */
function updateCursorStyle(textColor) {
  const container = getValidatedElement(".project-container");
  if (container) {
    if (textColor === "white") {
      container.classList.add("white-cursor");
    } else {
      container.classList.remove("white-cursor");
    }
  }
}