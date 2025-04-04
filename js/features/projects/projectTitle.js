/**
 * @module projectTitle
 * @description Verwaltet die Anzeige und Animation der Projekttitel.
 * Reagiert auf Projektwechsel und aktualisiert den Titel entsprechend.
 */

import uiState from "../../core/uiState.js";
import { getValidatedElement } from "../../core/utils.js";
import { EVENT_TYPES } from "../../core/events.js";
import { initialAppearAnimation } from "../../core/animationUtils.js";
import TransitionController from "../../core/transitionController.js";

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
    console.log(`Titel gesetzt: "${projectName}"`);
  }

  // Inhalte aktualisieren
  function updateTitleContents() {
    const activeIndex = uiState.activeProjectIndex;
    
    // Alle navigierbaren Elemente (inkl. Footer)
    const navigableElements = [
      ...document.querySelectorAll(".project"), 
      document.getElementById("site-footer")
    ];
    
    if (activeIndex >= 0 && activeIndex < navigableElements.length) {
      const activeElement = navigableElements[activeIndex];
      
      // Footer erkennen - einfach per ID
      if (activeElement.id === "site-footer") {
        setTitles("Say Hi!", "Get in touch to discuss your project");
        console.log("Footer-Titel gesetzt");
      } else {
        // Normaler Projekttitel
        const projectName = activeElement.getAttribute("data-project-name");
        const projectDesc = activeElement.getAttribute("data-project-description") || "";
        setTitles(projectName, projectDesc);
      }
    }
  }

  // Auf Phasenänderungen im Transition-Controller reagieren
  document.addEventListener(TransitionController.events.PHASE_CHANGED, (event) => {
    const { phase } = event.detail;
    
    // CSS-Klassen basierend auf Phase setzen
    allElements.forEach(element => {
      if (!element) return;
      
      if (phase === TransitionController.phases.FADE_OUT || 
          phase === TransitionController.phases.BETWEEN) {
        console.log("setupProjectTitle: fade-out wird gesetzt");
        element.classList.add('fade-out');
      } else if (phase === TransitionController.phases.FADE_IN) {
        console.log("setupProjectTitle: fade-out wird entfernt");
        element.classList.remove('fade-out');
      }
    });
  });

  // Auf Content-Update-Event reagieren
  document.addEventListener(TransitionController.events.CONTENT_UPDATE_NEEDED, () => {
    updateTitleContents();
  });

  // Event-Listener für Projektänderungen
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, () => {
    console.log("setupProjectTitle: Event activeProjectChanged empfangen");
    
    // Nur Transition starten, wenn nicht bereits aktiv
    if (!TransitionController.isActive()) {
      TransitionController.startTransition();
    }
  });
  
  // Footer-Events mit TransitionController synchronisieren
  document.addEventListener(EVENT_TYPES.FOOTER_ACTIVATED, () => {
    console.log("Footer-Aktivierungs-Event empfangen");
    window._isFooterActive = true;
    
    // Transition für konsistente Animation starten
    if (!TransitionController.isActive()) {
      TransitionController.startTransition();
    }
  });
  
  document.addEventListener(EVENT_TYPES.FOOTER_DEACTIVATED, () => {
    console.log("Footer-Deaktivierungs-Event empfangen");
    window._isFooterActive = false;
    
    // Keine explizite Transition hier notwendig, da sie von ACTIVE_PROJECT_CHANGED ausgelöst wird
  });

  // Initialen Zustand mit Animation anzeigen
  updateTitleContents();
  initialAppearAnimation(allElements);
}