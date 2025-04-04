/**
 * @module projectTitle
 * @description Verwaltet die Anzeige und Animation der Projekttitel.
 * Reagiert auf Projektwechsel und aktualisiert den Titel entsprechend.
 */

import uiState from "../../core/uiState.js";
import { getValidatedElement } from "../../core/utils.js";
import { EVENT_TYPES } from "../../core/events.js";
import { isFooter } from "../navigation/navigationUtils.js";

export function setupProjectTitle() {
  // DOM-Elemente für Titel und Beschreibungen
  const headerTitle = getValidatedElement(".project-title");
  const mobileTitle = getValidatedElement(".project-title-mobile");
  const mobileDescription = getValidatedElement(".description-mobile");
  const desktopDescription = getValidatedElement(".description");

  // Alle zu animierenden Elemente
  const allElements = [
    headerTitle, 
    mobileTitle, 
    mobileDescription, 
    desktopDescription
  ].filter(el => el !== null);

  // Gemeinsame Funktion zum Setzen der Titel
  function setTitles(projectName, projectDesc) {
    if (headerTitle) headerTitle.textContent = projectName;
    if (desktopDescription) desktopDescription.textContent = projectDesc;
    if (mobileTitle) mobileTitle.textContent = projectName;
    if (mobileDescription) mobileDescription.textContent = projectDesc;
  }

  // Inhalte aktualisieren
  function updateTitleContents() {
    const activeIndex = uiState.activeProjectIndex;
    
    if (activeIndex >= 0 && activeIndex < uiState.projects.length) {
      const activeProject = uiState.projects[activeIndex];
      
      // Prüfen, ob der Footer aktiv ist
      if (isFooter(activeProject)) {
        // Speziellen Titel für den Footer setzen
        setTitles("Say Hi!", "Get in touch to discuss your project");
        console.log("Footer TITLE aktiv");
      } else {
        // Normalen Projekttitel setzen
        const projectName = activeProject.getAttribute("data-project-name");
        const projectDesc = activeProject.getAttribute("data-project-description") || "";
        setTitles(projectName, projectDesc);
      }
    }
  }

  // Auf Footer-Aktivierung reagieren
// Auf Footer-Aktivierung reagieren - direkter und mit Priorität
document.addEventListener(EVENT_TYPES.FOOTER_ACTIVATED, function(event) {
  console.log('Footer-Event empfangen mit Index:', event.detail.index);
  
  // Sofort Titel setzen, ohne setTimeout
  setTitles("Say Hi!", "Get in touch to discuss your project");
  console.log('Footer-Titel direkt gesetzt');
});

  // Event-Listener für Projektänderungen
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, function() {
    // Titel mit Animation aktualisieren
    fadeOut();
    
    // Nach der Ausblendung: Inhalte aktualisieren
    setTimeout(() => {
      updateTitleContents();
      
      // Nach kurzer Pause wieder einblenden
      setTimeout(() => {
        fadeIn();
      }, 200);
    }, 300);
  });

  // Hilfsfunktionen für die Animation
  function fadeOut() {
    allElements.forEach(element => {
      if (element) element.classList.add('fade-out');
    });
  }
  
  function fadeIn() {
    allElements.forEach(element => {
      if (element) element.classList.remove('fade-out');
    });
  }

  // Initialen Zustand anzeigen
  updateTitleContents();
}