/**
 * @module contentManager
 * @description Verwaltet Inhaltsaktualisierungen für Titel und Beschreibungen
 */

import { checkFooter } from '../navigation/navigationUtils.js';
import { getValidatedElement } from '../../core/utils.js';
import uiState from '../../core/uiState.js';
import { updateTabText } from '../projects/projectIndicator.js';

// DOM-Elemente für Titel und Beschreibungen
const headerTitle = getValidatedElement(".project-title");
const mobileTitle = getValidatedElement(".project-title-mobile");
const mobileDescription = getValidatedElement(".description-mobile");
const desktopDescription = getValidatedElement(".description");
const projectIndicatorTab = getValidatedElement(".tab-text");

/**
 * Liste aller UI-Elemente, die bei Inhaltswechseln aktualisiert werden
 */
// TODO muss das export sein? soll in uiAnimationManager separat behandelt werden?
export const contentElements = {
  headerTitle,
  mobileTitle,
  mobileDescription,
  desktopDescription,
  projectIndicatorTab
};

function init() {

  // Auf Content-Update-Event reagieren
  document.addEventListener(TransitionController.events.CONTENT_UPDATE_NEEDED, () => {
    updateContents();
    console.log("contentManager: Inhalt aktualisiert");
  });

  // Initialen Zustand anzeigen und UI-Elemente synchron animieren
  updateContents();

}

/**
 * Aktualisiert Titel und Beschreibungen basierend auf dem aktiven Projekt
 */
export function updateContents() {
  const activeIndex = uiState.activeProjectIndex;
  
  // Alle navigierbaren Elemente (inkl. Footer)
  const projects = uiState.projects;
  
  if (activeIndex >= 0 && activeIndex < projects.length) {
    const activeElement = projects[activeIndex];
    
    // Footer-Spezialbehandlung
    if (checkFooter(activeElement)) {
      // Für Footer: Titel setzen, aber Description leeren
      setTitles("Say Hi!", "");
      
      // Description-Elemente ausblenden
      if (desktopDescription) desktopDescription.style.display = 'none';
      if (mobileDescription) mobileDescription.style.display = 'none';
      
      console.log("Footer-Titel gesetzt, Description ausgeblendet");
    } else {
      // Normaler Projekttitel
      const projectName = activeElement.getAttribute("data-project-name");
      const projectDesc = activeElement.getAttribute("data-project-description") || "";
      setTitles(projectName, projectDesc);
      updateTabText();
      
      // Description-Elemente wieder einblenden
      if (desktopDescription) desktopDescription.style.display = '';
      if (mobileDescription) mobileDescription.style.display = '';
    }
  }
}

/**
 * Setzt Titel und Beschreibungen in allen relevanten DOM-Elementen
 */
function setTitles(projectName, projectDesc) {
  if (headerTitle) headerTitle.textContent = projectName;
  if (desktopDescription) desktopDescription.textContent = projectDesc;
  if (mobileTitle) mobileTitle.textContent = projectName;
  if (mobileDescription) mobileDescription.textContent = projectDesc;
  console.log(`Titel gesetzt: "${projectName}"`);
}


export default init