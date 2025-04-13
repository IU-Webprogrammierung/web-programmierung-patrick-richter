/**
 * @module contentManager
 * @description Verwaltet Inhaltsaktualisierungen für Titel und Beschreibungen.
 * Aktualisiert Projekt-Titel und Beschreibungen basierend auf dem aktiven Projekt
 * und handhabt Spezialfälle wie Footer-Inhalte.
 * Enthält Funktionen:
 * - init()
 * - updateContents()
 * - setTitles()
 * 
 * @listens EVENT_TYPES.INITIAL_PROJECT_SET - Initial Inhalte aktualisieren
 * @listens TransitionController.events.CONTENT_UPDATE_NEEDED - Inhalte während Transition aktualisieren
 */

import logger from '@core/logger';
import { checkFooter, getValidatedElement } from '@utils';
import uiState from '@core/state/uiState.js';
import TransitionController from '@core/state/transitionController.js';
import { addEventListener, EVENT_TYPES } from "@core/state/events.js";


// DOM-Elemente für Titel und Beschreibungen
const headerTitle = getValidatedElement(".project-title");
const mobileTitle = getValidatedElement(".project-title-mobile");
const mobileDescription = getValidatedElement(".description-mobile");
const desktopDescription = getValidatedElement(".description");
const projectIndicatorTab = getValidatedElement(".tab-text");

/**
 * Liste aller UI-Elemente, die bei Inhaltswechseln aktualisiert werden
 */
export const contentElements = {
  headerTitle,
  mobileTitle,
  mobileDescription,
  desktopDescription,
  projectIndicatorTab
};

/**
 * Initialisiert den Content-Manager
 */
function init() {

    // Auf erstes Projekt warten und Daten dann aktualisieren
 addEventListener(EVENT_TYPES.INITIAL_PROJECT_SET, () => {   
  updateContents();
    logger.log("contentManager: Inhalt initial aktualisiert");
 }); 
  // Auf Content-Update-Event reagieren
  document.addEventListener(TransitionController.events.CONTENT_UPDATE_NEEDED, () => {
    updateContents();
    logger.log("contentManager: Inhalt aktualisiert");
  });
}

/**
 * Aktualisiert Titel und Beschreibungen basierend auf dem aktiven Projekt
 */
export function updateContents() {
  const activeIndex = uiState.activeProjectIndex;
  logger.log(`Aktives Projekt: CONTENT ${activeIndex}`);
  
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
  logger.log(activeIndex, uiState.projects.length, "content manager");
}

/**
 * Setzt Titel und Beschreibungen in allen relevanten DOM-Elementen
 * @param {string} projectName - Name des Projekts
 * @param {string} projectDesc - Beschreibung des Projekts
 */
function setTitles(projectName, projectDesc) {
  if (headerTitle) headerTitle.textContent = projectName;
  logger.log(`Titel gesetzt: "${projectName}"`);
  if (desktopDescription) desktopDescription.textContent = projectDesc;
  if (mobileTitle) mobileTitle.textContent = projectName;
  if (mobileDescription) mobileDescription.textContent = projectDesc;
  logger.log(`Titel gesetzt: "${projectName}"`);
}


export default {
  init
};