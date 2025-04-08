/**
 * @module projectIndicator
 * @description Verwaltet den Projekt-Indikator und das Navigations-Panel für den Index.
 */

import uiState from "@core/state/uiState.js";
import { getValidatedElement } from "@utils/utils.js";
import {
  getNavigationAPI,
  checkFooter,
} from "@utils/navigationUtils.js";
import { removeHoverListeners } from "@portfolio/projects/hoverPreview.js";
import { EVENT_TYPES, addEventListener } from "@core/state/events.js";
import TransitionController from "@core/state/transitionController.js";

// Speicher für DOM-Elemente
let projectList, indicator, tabElement;

/**
 * Initialisiert den Projekt-Indikator
 */
function init() {
  // DOM-Elemente referenzieren
  tabElement = getValidatedElement(".project-indicator-tab");
  indicator = getValidatedElement(".project-indicator");

  tabElement.addEventListener("click", togglePanel);

  // Auf CONTENT_UPDATE_NEEDED reagieren, um Tab-Text und aktive Projektmarkierung zu aktualisieren
  document.addEventListener(
    TransitionController.events.CONTENT_UPDATE_NEEDED,
    () => {
      updateTabText();
      updateActiveProjectInList();
      console.log(
        "ProjectIndicator: Tab-Text und aktuelles Projekt aktualisiert"
      );
    }
  );

  // DOM-Struktur für die Projektliste initial erstellen
  createProjectList();

  addEventListener(EVENT_TYPES.INITIAL_PROJECT_SET, () => {
    updateTabText();
    updateActiveProjectInList();
    console.log("projectIndicator: Tab-Text initial aktualisiert");
  });
}

/**
 * Aktualisiert den Tab-Text im Projekt-Indikator.
 * Verwendet checkFooter für einheitliche Footer-Erkennung.
 */
export function updateTabText() {
  if (!tabElement) return;

  const tabText = tabElement.querySelector(".tab-text");
  if (!tabText) return;

  // Nur anzeigen, wenn ein gültiger Index vorhanden ist
  if (uiState.activeProjectIndex >= 0 && uiState.projects.length > 0) {
    // Filtere alle regulären Projekte (ohne Footer)
    const regularProjects = uiState.projects.filter(
      (project, index) => !checkFooter(index, uiState.projects)
    );

    // Prüfe, ob der aktive Index den Footer repräsentiert
    const isFooterActive = checkFooter(
      uiState.activeProjectIndex,
      uiState.projects
    );

    // Berechne den effektiven aktiven Index
    let activeIndex;
    if (isFooterActive) {
      // Wenn der Footer aktiv ist, entspricht der aktive Index der Anzahl der regulären Projekte
      activeIndex = regularProjects.length;
    } else {
      // Berechne den regulären Projektindex (ohne Footer-Projekte zu zählen)
      let countBeforeActive = 0;
      for (let i = 0; i <= uiState.activeProjectIndex; i++) {
        if (!checkFooter(i, uiState.projects)) {
          countBeforeActive++;
        }
      }
      activeIndex = countBeforeActive;
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
 * Verwendet ebenfalls checkFooter für Footer-Erkennung.
 */
function updateActiveProjectInList() {
  const links = document.querySelectorAll(".project-list a");
  if (!links || links.length === 0) return;

  // Prüfe, ob der aktive Index den Footer repräsentiert
  const isFooterActive = checkFooter(
    uiState.activeProjectIndex,
    uiState.projects
  );

  if (isFooterActive) {
    // Bei Footer alle Markierungen entfernen
    links.forEach((link) => link.classList.remove("active"));
    return;
  }

  // Berechne den effektiven Index des aktiven Projekts unter Ausschluss des Footers
  let effectiveIndex = -1;
  let regularCounter = -1;

  for (let i = 0; i <= uiState.activeProjectIndex; i++) {
    if (!checkFooter(i, uiState.projects)) {
      regularCounter++;
    }
  }
  effectiveIndex = regularCounter;

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
 * Filtert den Footer aus der Liste.
 */
function createProjectList() {
  projectList = getValidatedElement(".project-list");

  if (!projectList || !uiState.projects.length) {
    console.warn("Projektliste oder Projekte nicht verfügbar");
    return;
  }

  projectList.innerHTML = "";

  // Nur reguläre Projekte hinzufügen
  uiState.projects.forEach((project, index) => {
    // Footer nicht in der Liste anzeigen
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
      // Projekt-ID für spätere Verwendung speichern
      const projectId = this.getAttribute("data-project-id");

      // Panel schließen
      if (indicator && indicator.classList.contains("open")) {
        indicator.classList.remove("open");
        tabElement?.setAttribute("aria-expanded", "false");

        const onTransitionEnd = () => {
          // Erst nach Abschluss der Animation navigieren
          navigation.navigateToProject(projectId);
          indicator.removeEventListener("transitionend", onTransitionEnd);
        };

        indicator.addEventListener("transitionend", onTransitionEnd, {
          once: true,
        });

        // Sicherheits-Fallback, falls Animation nicht beendet wird
        setTimeout(() => {
          if (indicator.classList.contains("open") === false) {
            navigation.navigateToProject(projectId);
          }
        }, 400); // Etwas länger als CSS-Transition
      } else {
        // Direkt navigieren, wenn Panel nicht offen ist
        navigation.navigateToProject(projectId);
      }
    });

    li.appendChild(a);
    projectList.appendChild(li);
  });

  console.log(
    "Projektliste erstellt mit",
    projectList.children.length,
    "Einträgen"
  );
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
  updateActiveProjectInList,
};
