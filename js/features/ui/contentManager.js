/**
 * @module contentManager
 * @description Verwaltet Inhaltsaktualisierungen für Titel und Beschreibungen
 */

import { checkFooter } from '../navigation/navigationUtils.js';
import { getValidatedElement } from '../../core/utils.js';
import uiState from '../../core/uiState.js';

// DOM-Elemente für Titel und Beschreibungen
const headerTitle = getValidatedElement(".project-title");
const mobileTitle = getValidatedElement(".project-title-mobile");
const mobileDescription = getValidatedElement(".description-mobile");
const desktopDescription = getValidatedElement(".description");

/**
 * Liste aller UI-Elemente, die bei Inhaltswechseln aktualisiert werden
 */
export const contentElements = {
  headerTitle,
  mobileTitle,
  mobileDescription,
  desktopDescription
};

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