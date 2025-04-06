/**
 * @module projectIndicator
 * @description Verwaltet den Projekt-Indikator und das Navigations-Panel für den Index.
 * 
 * @listens ACTIVE_PROJECT_CHANGED - Aktualisiert den Indikator bei Projektwechseln
 * @listens DOM_STRUCTURE_READY - Erstellt die Projektliste nach DOM-Erstellung
 * @listens APP_INIT_COMPLETE - Zeigt den Tab nach vollständiger Initialisierung an
 */

import uiState from "../../core/uiState.js";
import { getValidatedElement } from "../../core/utils.js";
import { getNavigationAPI, checkFooter } from "../navigation/navigationUtils.js";
import { removeHoverListeners } from "./hoverPreview.js";
import { EVENT_TYPES, addEventListener } from "../../core/events.js";
import TransitionController from "../../core/transitionController.js";

// Speicher für DOM-Elemente
let projectList, indicator, tabElement;

/**
 * Initialisiert den Projekt-Indikator
 */
function init() {
  // DOM-Elemente referenzieren
  tabElement = getValidatedElement(".project-indicator-tab");
  indicator = getValidatedElement(".project-indicator");
  
  // Event-Listener registrieren
  // Auf CONTENT_UPDATE_NEEDED reagieren, um Tab-Text und aktive Projektmarkierung zu aktualisieren
  document.addEventListener(TransitionController.events.CONTENT_UPDATE_NEEDED, () => {
    updateTabText();
    updateActiveProjectInList();
    console.log("ProjectIndicator: Tab-Text und aktuelles Projekt aktualisiert");
  });
  
  // DOM-Struktur für die Projektliste initial erstellen
  createProjectList();
  
  // TODO in initial appear integrieren
  // Tab sichtbar machen nach vollständiger Initialisierung
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    if (tabElement) {
      updateTabText();
      tabElement.classList.add("visible");
    }
  });
}

/**
 * Aktualisiert den Tab-Text im Projekt-Indikator.
 * Berechnet den aktiven Index unter Berücksichtigung des Footers.
 */
export function updateTabText() {
  if (!tabElement) return;
  
  const tabText = tabElement.querySelector(".tab-text");
  if (!tabText) return;

  // Nur anzeigen, wenn ein gültiger Index vorhanden ist
  if (uiState.activeProjectIndex >= 0 && uiState.projects.length > 0) {
    // Filtere alle regulären Projekte (ohne Footer) mithilfe der Hilfsfunktion
    const regularProjects = Array.from(uiState.projects).filter(
      (p, index) => !checkFooter(index, uiState.projects)
    );
    
    // Prüfe, ob der aktive Index den Footer repräsentiert
    const isFooterActive = checkFooter(uiState.activeProjectIndex, uiState.projects);
    
    // Berechne den effektiven aktiven Index:
    let activeIndex;
    if (isFooterActive) {
      // Wenn der Footer aktiv ist, entspricht der aktive Index der Anzahl der regulären Projekte
      activeIndex = regularProjects.length;
    } else {
      activeIndex = Array.from(uiState.projects)
        .slice(0, uiState.activeProjectIndex + 1)
        .filter((p, index) => !checkFooter(index, uiState.projects))
        .length;
    }
    
    const totalProjects = regularProjects.length;
    tabText.textContent = `${activeIndex} / ${totalProjects}`;
  } else {
    // Keine Anzeige, wenn kein gültiger Index existiert
    tabText.textContent = "";
  }
}

/**
 * Aktualisiert die aktive Projektmarkierung in der Projektliste.
 * Verwendet die gleiche Footer-Prüfung wie in updateTabText.
 */
function updateActiveProjectInList() {
  // Direkt querySelectorAll verwenden für besseres Fehlerhandling
  const links = document.querySelectorAll(".project-list a");

  // Sicherheitsprüfung vor der forEach-Schleife
  if (!links || links.length === 0) {
    console.log("Projektliste noch nicht bereit - überspringe Update");
    return;
  }
  
  // Prüfe, ob der aktive Index den Footer repräsentiert
  const isFooterActive = checkFooter(uiState.activeProjectIndex, uiState.projects);
  
  if (isFooterActive) {
    // Wenn der Footer aktiv ist, entferne "active" von allen Links
    links.forEach(link => link.classList.remove("active"));
    return;
  }
  
  // Berechne den effektiven Index des aktiven Projekts unter Ausschluss des Footers:
  const effectiveIndex = Array.from(uiState.projects)
    .slice(0, uiState.activeProjectIndex + 1)
    .filter((p, index) => !checkFooter(index, uiState.projects))
    .length - 1;
  
  // Links aktualisieren
  links.forEach((link, index) => {
    if (index === effectiveIndex) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/**
 * Erstellt die Projektliste im Panel.
 * Fügt nur reguläre Projekte (ohne Footer) hinzu, basierend auf der Hilfsfunktion.
 */
function createProjectList() {
  projectList = getValidatedElement(".project-list");
  
  if (!projectList || !uiState.projects.length) {
    console.warn("Projektliste oder Projekte nicht verfügbar");
    return;
  }

  projectList.innerHTML = "";

  // Nur reguläre Projekte (ohne Footer) hinzufügen
  uiState.projects.forEach((project, index) => {
    // Footer nicht in der Liste anzeigen – prüfe mit Index und Array
    if (checkFooter(index, uiState.projects)) return;
    
    const li = document.createElement("li");
    const a = document.createElement("a");
    const projectId = project.getAttribute("data-project-id");

    a.textContent = project.getAttribute("data-project-name");
    a.href = "#";
    a.setAttribute("data-project-id", projectId);

    // Aktives Projekt markieren
    if (index === uiState.activeProjectIndex) {
      a.classList.add("active");
    }

    // Click-Handler mit API-Zugriff
    a.addEventListener("click", function (e) {
      e.preventDefault();
      
      const navigation = getNavigationAPI();
      if (!navigation) {
        console.error("Navigation-API nicht verfügbar");
        return;
      }

      // Panel schließen
      if (indicator && indicator.classList.contains("open")) {
        indicator.classList.remove("open");
        tabElement?.setAttribute("aria-expanded", "false");

        // Transition mit Animation synchronisieren
        requestAnimationFrame(() => {
          navigation.navigateToProject(projectId);
        });
      } else {
        // Direkt navigieren, wenn Panel nicht offen ist
        navigation.navigateToProject(projectId);
      }
    });

    li.appendChild(a);
    projectList.appendChild(li);
  });
  
  console.log("Projektliste erstellt mit", projectList.children.length, "Einträgen");
}

/**
 * Toggle-Funktion für das Panel
 */
function togglePanel() {
  if (!indicator || !tabElement) return;

  indicator.classList.toggle("open");
  
  // Prüfen, ob das Panel geschlossen wird
  if (indicator.classList.contains("open")) {
    // Hover-Listener entfernen
    removeHoverListeners();
  }
  
  const isOpen = indicator.classList.contains("open");
  tabElement.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

// Öffentliche API des Moduls
export default {
  init,
  togglePanel,
  updateTabText,
  updateActiveProjectInList
};
