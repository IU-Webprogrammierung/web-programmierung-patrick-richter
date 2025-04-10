/**
 * @module contentManager
 * @description Verwaltet Inhaltsaktualisierungen für Titel und Beschreibungen
 */

import { checkFooter } from '../utils/navigationUtils.js';
import { getValidatedElement } from '../utils/utils.js';
import uiState from '../core/state/uiState.js';
import TransitionController from '../core/state/transitionController.js';
import { addEventListener, EVENT_TYPES } from "../core/state/events.js";


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

    // Auf erstes Projekt warten und Daten dann aktualisieren

 addEventListener(EVENT_TYPES.INITIAL_PROJECT_SET, () => {   
  updateContents();
    console.log("contentManager: Inhalt initial aktualisiert");
 }); 
  // Auf Content-Update-Event reagieren
  document.addEventListener(TransitionController.events.CONTENT_UPDATE_NEEDED, () => {
    updateContents();
    console.log("contentManager: Inhalt aktualisiert");
  });



}

/**
 * Aktualisiert Titel und Beschreibungen basierend auf dem aktiven Projekt
 */
/**
 * Aktualisiert Titel und Beschreibungen basierend auf dem aktiven Projekt
 */
export function updateContents() {
  const activeIndex = uiState.activeProjectIndex;
  console.log(`Aktives Projekt: CONTENT ${activeIndex}`);
  
  // Bestimmen ob der Footer aktiv ist (ohne direkten Array-Zugriff)
  const isFooterActive = checkFooter(activeIndex);
  
  if (isFooterActive) {
    // Footer-Spezialbehandlung
    setTitles("Say Hi!", "");

    // Description-Elemente ausblenden
    if (desktopDescription) desktopDescription.style.display = 'none';
    if (mobileDescription) mobileDescription.style.display = 'none';
  }
  else if (activeIndex >= 0 && activeIndex < uiState.projects.length) {
    // Normales Projekt
    const activeElement = uiState.projects[activeIndex];
    const projectName = activeElement.getAttribute("data-project-name");
    const projectDesc = activeElement.getAttribute("data-project-description") || "";
    
    setTitles(projectName, projectDesc);
    // Description-Elemente einblenden
    if (desktopDescription) desktopDescription.style.display = '';
    if (mobileDescription) mobileDescription.style.display = '';
  }
  console.log(activeIndex, uiState.projects.length, "content manager");
}

/**
 * Setzt Titel und Beschreibungen in allen relevanten DOM-Elementen
 */
function setTitles(projectName, projectDesc) {
  if (headerTitle) headerTitle.textContent = projectName;
  console.log(`Titel gesetzt: "${projectName}"`);
  if (desktopDescription) desktopDescription.textContent = projectDesc;
  if (mobileTitle) mobileTitle.textContent = projectName;
  if (mobileDescription) mobileDescription.textContent = projectDesc;
  console.log(`Titel gesetzt: "${projectName}"`);
}


export default {
  init
};