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
  const paginationContainer = getValidatedElement(".pagination"); // Pagination hinzufügen


  // Alle zu animierenden Elemente
  const allElements = [
    headerTitle, 
    mobileTitle, 
    mobileDescription, 
    desktopDescription,
    paginationContainer
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
      const projectName = activeProject.getAttribute("data-project-name");
      const projectDesc = activeProject.getAttribute("data-project-description") || "";
      setTitles(projectName, projectDesc);
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
    TransitionController.startTransition();
  });

  // Initialen Zustand mit Animation anzeigen
  updateTitleContents();
  initialAppearAnimation(allElements);
}