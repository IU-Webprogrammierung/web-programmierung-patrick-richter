/**
 * @module projectIndicator
 * @description Verwaltet den Projekt-Indikator und das Navigations-Panel für den Index.
 * Stellt einen interaktiven Tab bereit, der den aktuellen Projektindex anzeigt und
 * beim Klick ein Panel mit einem Index aller Projekte öffnet. Ermöglicht die direkte
 * Navigation zwischen Projekten.
 *
 * Funktionen: setupProjectIndicator(), togglePanel(), updateTabText(), handleProjectChange(),
 * updateActiveProjectInList(), setupProjectList()
 */

import uiState from "../../core/uiState.js";
import { getValidatedElement, getValidatedElements } from "../../core/utils.js";
import { getNavigationAPI } from "../navigation/navigationUtils.js";
import { removeHoverListeners } from "./hoverPreview.js";
import { EVENT_TYPES } from "../../core/events.js";

export function setupProjectIndicator() {
  // Projektliste im Panel erstellen
  setupProjectList();

  // Initial den Tab-Text aktualisieren
  setTimeout(() => {
    updateTabText();
    getValidatedElement(".project-indicator-tab")?.classList.add("visible");
  }, 300);

  // Auf Projektänderungen reagieren
  document.addEventListener(
    EVENT_TYPES.ACTIVE_PROJECT_CHANGED,
    handleProjectChange
  );
}

function updateTabText() {
  const tabText = getValidatedElement(".tab-text");
  if (!tabText) return;

  // Nur anzeigen, wenn ein gültiger Index vorhanden ist
  if (uiState.activeProjectIndex >= 0 && uiState.projects.length > 0) {
    const activeIndex = uiState.activeProjectIndex + 1;
    const totalProjects = uiState.projects.length;
    tabText.textContent = `${activeIndex} / ${totalProjects}`;
  } else {
    // Keine Anzeige, wenn kein gültiger Index existiert
    tabText.textContent = "";
  }
}

// Verzögerte Aktualisierung für Events (damit synchron mit Farbwechsel)
// TODO Ggf. hier Variable aus CSS auslesen
function delayedUpdateTabText() {
  setTimeout(() => {
    updateTabText();
  }, 400);
}

// Behandelt Projektänderungen (aktualisiert Tab und aktives Projekt in der Liste)
function handleProjectChange() {
  delayedUpdateTabText();
  updateActiveProjectInList();
}

function updateActiveProjectInList() {
  // Direkt querySelectorAll verwenden für besseres Fehlerhandling
  const links = document.querySelectorAll(".project-list a");

  // Sicherheitsprüfung vor der forEach-Schleife
  if (!links || links.length === 0) {
    console.log("Projektliste noch nicht bereit - überspringe Update");
    return;
  }

  links.forEach((link, index) => {
    if (index === uiState.activeProjectIndex) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Erstellt die Projektliste im Panel

function setupProjectList() {
  setTimeout(() => {
    const projectList = getValidatedElement(".project-list");
    const indicator = getValidatedElement(".project-indicator");
    const tab = getValidatedElement(".project-indicator-tab");

    if (!projectList || !uiState.projects.length) return;

    projectList.innerHTML = "";

    uiState.projects.forEach((project, index) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const projectId = project.getAttribute("data-project-id");
      const nav = getNavigationAPI();

      a.textContent = project.getAttribute("data-project-name");
      a.href = "#";
      a.setAttribute("data-project-id", projectId);

      // Aktives Projekt markieren
      if (index === uiState.activeProjectIndex) {
        a.classList.add("active");
      }

      // Click-Handler mit zentraler Navigation
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
          tab?.setAttribute("aria-expanded", "false");

          // Auf Animation warten, bevor navigiert wird
          setTimeout(function () {
            navigation.navigateToProject(projectId);
          }, 300);
        } else {
          // Direkt navigieren, wenn Panel nicht offen ist
          navigation.navigateToProject(projectId);
        }
      });

      li.appendChild(a);
      projectList.appendChild(li);
    });
  }, 500);
}

// Toggle-Funktion für das Panel (exportiert für setup.js)
export function togglePanel() {
  const indicator = getValidatedElement(".project-indicator");
  const tab = getValidatedElement(".project-indicator-tab");

  if (!indicator || !tab) return;

  indicator.classList.toggle("open");
  // Prüfen, ob das Panel geschlossen wird
  if (indicator.classList.contains("open")) {
    // Hover-Listener entfernen
    removeHoverListeners();
  }
  const isOpen = indicator.classList.contains("open");
  tab.setAttribute("aria-expanded", isOpen ? "true" : "false");
}
