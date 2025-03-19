/**
 * @module projectNavigation
 * @description Verwaltet die Navigation zwischen Projekten und deren Scrollverhalten.
 * Überwacht Scroll-Events, identifiziert das aktive Projekt basierend auf der
 * Scroll-Position und bietet Funktionen zum gezielten Navigieren zu bestimmten Projekten.
 * 
 * Funktionen: setupScrollHandler(), scrollToProject(), scrollToTop(), closeFooter()
 */

import uiState from "../../core/uiState.js";
import { getValidatedElement } from '../../core/utils.js';
import { getValidatedElements } from '../../core/utils.js';


export function setupScrollHandler() {

  const container = getValidatedElement(".project-container", "Fehler: Project-Container nicht gefunden");

  if (!container) {
    console.error("Fehler: Project-Container nicht gefunden");
    return; // Frühe Rückgabe
  }

  let lastScrollTime = 0;
  const throttleDelay = 100; // ms

  // Aktuellen Projektindex berechnen (Scroll-Abstand nach oben / Fensterhöhe)
  function calculateActiveProjectIndex() {
    return Math.round(container.scrollTop / window.innerHeight);
  }

  // Funktion zum Aktualisieren des aktiven Projekts
  function updateActiveProject() {
    const newIndex = calculateActiveProjectIndex();

    // Nur aktualisieren, wenn sich der Index geändert hat und gültig ist
    if (
      newIndex !== uiState.activeProjectIndex &&
      newIndex >= 0 &&
      newIndex < uiState.projects.length
    ) {
      console.log(
        `updateActiveProject: Aktives Projekt wechselt zu Index: ${newIndex}`
      );
      uiState.setActiveProject(newIndex);
    }
  }

  container.addEventListener("scroll", () => {
    const now = Date.now();
    if (now - lastScrollTime > throttleDelay) {
      lastScrollTime = now;
      requestAnimationFrame(updateActiveProject);
    }
  });

  // Initialen Status setzen (basierend auf anfänglicher Scroll-Position)
  const initialIndex = calculateActiveProjectIndex();
  if (initialIndex >= 0 && initialIndex < uiState.projects.length) {
    uiState.setActiveProject(initialIndex);
  }
}

// Neue Funktion zum Scrollen zu einem Projekt
export function scrollToProject(projectId) {
  const projects = getValidatedElements(".project:not(.footer-container)");
  const container = getValidatedElement(".project-container", "Fehler: Project-Container nicht gefunden");

  if (!container || projects.length === 0) {
    console.error("Fehler: Container oder Projekte nicht gefunden");
    return; // Frühe Rückgabe
  }

  // Das Projekt mit der passenden ID finden
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const dataId = project.getAttribute("data-project-id");

    if (dataId === projectId.toString()) {
      console.log(`Scrolle zu Projekt ID: ${projectId}, Index: ${i}`);

      // Zum Projekt scrollen
      const container = getValidatedElement(".project-container", "Fehler: Project-Container nicht gefunden");
      container.scrollTo({
        top: i * window.innerHeight,
        behavior: "smooth",
      });

      // uiState aktualisieren für Titelanzeige etc.
      uiState.setActiveProject(i);

      return;
    }
  }

  console.warn(`Projekt mit ID ${projectId} wurde nicht gefunden.`);
}

// Scrollt nach oben

export function scrollToTop() {
  const container = getValidatedElement(".project-container", "Fehler: Project-Container nicht gefunden");

  if (!container) {
    console.error("Fehler: Project-Container nicht gefunden");
    return; // Frühe Rückgabe
  }

  container.scrollTo({ top: 0, behavior: "smooth" });
}

// Footer schließen

export function closeFooter() {
  const container = getValidatedElement(".project-container", "Fehler: Project-Container nicht gefunden");

  if (!container) {
    console.error("Fehler: Project-Container nicht gefunden");
    return; // Frühe Rückgabe
  }

  const currentScrollPos = container.scrollTop;
  const viewportHeight = window.innerHeight;
  container.scrollTo({
    top: Math.max(0, currentScrollPos - viewportHeight),
    behavior: "smooth",
  });
}
