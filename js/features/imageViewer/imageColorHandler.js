/**
 * Verwaltet die Textfarben in der UI basierend auf den aktiven Bildern
 * Steuert die synchronisierte Aktualisierung der UI-Elemente bei Bildwechseln
 */

import { EVENT_TYPES, addEventListener } from '../../core/events.js';
import { getValidatedElement } from "../../core/utils.js";
import uiState from "../../core/uiState.js";
import TransitionController from "../../core/transitionController.js";

// Import für Pagination-Updates
import { updateActiveBullet } from "../imageViewer/customPagination.js";

// Timer für Debouncing der Farbänderungen
let debounceColorTimer = null;

/**
 * Richtet Event-Listener für Farbänderungen ein
 */
function init() {
  // Registriere den Haupt-Event-Handler für koordinierte Updates
  addEventListener(
    EVENT_TYPES.ACTIVE_IMAGE_CHANGED,
    coordinateVisualUpdates
  );
  
  // Neuer Listener für synchronisierten Farbwechsel während Transitionen
addEventListener(
    // TODO Warum aus transitionController und nicht EVENT_TYPES?
    TransitionController.events.PHASE_CHANGED,
    handleTransitionPhase
  );
  
  console.log("ImageColorHandler: Setup abgeschlossen, auf Events wartend");
}

/**
 * Zentrale Funktion für Farbwechsel - Single Source of Truth
 * Diese Funktion ist die einzige, die tatsächlich Farbänderungen vornimmt
 */
export function handleColorChange(textColor) {
  // Farbe ändern
  document.documentElement.style.setProperty(
    "--active-text-color",
    textColor
  );
  
  // Cursor-Stil aktualisieren
  updateCursorStyle(textColor);
  
  console.log(`Farbe geändert zu: ${textColor}`);
}

/**
 * Koordiniert synchronisierte visuelle Updates bei Bildwechseln
 * Fasst Farbwechsel und Pagination-Updates in einem einzigen Animation Frame zusammen
 */
export function coordinateVisualUpdates(event) {
  if (!event || !event.detail) return;

  const textColor = event.detail.textColor;
  const projectIndex = event.detail.projectIndex;
  const slideIndex = event.detail.slideIndex;

  // Bei aktivem Transition keine Updates durchführen
  if (TransitionController.isActive()) {
    console.log(`Visuelle Updates während Transition aufgeschoben`);
    return; // Updates werden in handleTransitionPhase in der BETWEEN-Phase durchgeführt
  }

  // Prüfen, ob dies ein Update durch Projektwechsel ist
  const isProjectChange =
    event.detail.hasOwnProperty("projectIndex") &&
    projectIndex === uiState.activeProjectIndex &&
    document.querySelector(".project-title.fade-out") !== null;

  // Debouncing für flüssigere Updates
  clearTimeout(debounceColorTimer);

  // Verzögerung anpassen: längere Verzögerung bei Projektwechseln, kürzere bei normalen Bildwechseln
  const delay = isProjectChange ? 350 : 50;

  debounceColorTimer = setTimeout(() => {
    // Alle visuellen Updates in einem gemeinsamen Animation Frame bündeln
    requestAnimationFrame(() => {
      // 1. Farbänderungen über die zentrale Funktion anwenden
      handleColorChange(textColor);
      
      // 2. Pagination aktualisieren, falls ein gültiger Slide-Index vorhanden ist
      if (slideIndex !== undefined && slideIndex >= 0) {
        updateActiveBullet(slideIndex);
      }
    });
  }, delay);
}

/**
 * Handler für die Phasen des TransitionControllers
 * Synchronisiert den Farbwechsel mit der BETWEEN-Phase
 */
function handleTransitionPhase(event) {
  const { phase } = event.detail;
  
  // Nur in der BETWEEN-Phase die Farbe aktualisieren
  if (phase === TransitionController.phases.BETWEEN) {
    // Ausstehende Timer abbrechen
    clearTimeout(debounceColorTimer);
    
    // Aktuelle Farbe aus dem uiState über die zentrale Funktion anwenden
    handleColorChange(uiState.activeTextColor);
    
    console.log(`Farbwechsel in BETWEEN-Phase zu: ${uiState.activeTextColor}`);
  }
}

/**
 * Aktualisiert den Cursor-Stil basierend auf der Textfarbe
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

export default {init};