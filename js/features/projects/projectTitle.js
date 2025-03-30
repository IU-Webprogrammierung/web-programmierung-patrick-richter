/**
 * @module projectTitle
 * @description Steuert die dynamische Anzeige und Animation von Projekttiteln.
 * Reagiert auf Projektwechsel durch sanfte Überblendungen und aktualisiert Titel
 * sowohl auf Desktop- als auch auf mobilen Ansichten mit synchronisierten Animations-Timings.
 *
 * Funktionen: setupProjectTitle()
 */

import uiState from "../../core/uiState.js";
import { getValidatedElement } from "../../core/utils.js";
import { EVENT_TYPES } from "../../core/events.js";

export function setupProjectTitle() {
  // DOM-Elemente für Titel und Beschreibungen
  const headerTitle = getValidatedElement(".project-title");
  const mobileTitle = getValidatedElement(".project-title-mobile");
  const mobileDescription = getValidatedElement(".description-mobile");
  const desktopDescription = getValidatedElement(".description");

  // DOM-Elemente für Pagination
  const paginationContainer = getValidatedElement(".pagination");
  const paginationDescriptionContainer = getValidatedElement(".pagination-description-container");
  
  console.log("Projekttitel-DOM-Element:", headerTitle);
  console.log("Pagination-DOM-Element:", paginationContainer);
  
  if (!headerTitle) {
    console.error("Fehler: Projekt-Titel-Element nicht gefunden - versuche erneut in 100ms");
    // Notfall-Versuch mit Verzögerung
    setTimeout(() => {
      const retryTitle = document.querySelector(".project-title");
      console.log("Zweiter Versuch - Titel gefunden:", retryTitle !== null);
      if (retryTitle) {
        console.log("Titel-Element beim zweiten Versuch gefunden");
      }
    }, 100);
    return;
  }

  // Animationsstatus
  let isAnimating = false;
  let transitionCompleted = false;

  // Hilfsfunktion für konsistentes Parsing von Zeitwerten
  function parseTimeValue(timeStr, defaultValue) {
    if (!timeStr) return defaultValue;
    if (timeStr.endsWith("ms")) return parseFloat(timeStr);
    if (timeStr.endsWith("s")) return parseFloat(timeStr) * 1000;
    return parseFloat(timeStr);
  }

  // CSS-Variablen auslesen mit einheitlichem Parsing
  const style = getComputedStyle(document.documentElement);
  const fadeDuration = parseTimeValue(
    style.getPropertyValue("--title-fade-duration").trim(),
    300
  );
  const betweenPauseMs = parseTimeValue(
    style.getPropertyValue("--title-between-pause").trim(),
    200
  );
  const initialDelayMs = parseTimeValue(
    style.getPropertyValue("--title-initial-delay").trim(),
    200
  );
  const initialDuration = parseTimeValue(
    style.getPropertyValue("--title-initial-duration").trim(),
    800
  );

  // Gemeinsame Funktion zum Setzen der Titel
  function setTitles(projectName, projectDesc) {
    if (headerTitle) headerTitle.textContent = projectName;
    if (desktopDescription) desktopDescription.textContent = projectDesc;

    if (mobileTitle) mobileTitle.textContent = projectName;
    if (mobileDescription) mobileDescription.textContent = projectDesc;
  }

  // Gemeinsame Funktion zum Ein- und Ausblenden aller Elemente
  function fadeElements(fadeOut) {
    const method = fadeOut ? 'add' : 'remove';
    
    // Titel und Beschreibungen ein-/ausblenden
    [headerTitle, desktopDescription, mobileTitle, mobileDescription].forEach(element => {
      if (element) element.classList[method]('fade-out');
    });
    
    // Pagination ein-/ausblenden
    if (paginationContainer) paginationContainer.classList[method]('fade-out');
    if (paginationDescriptionContainer) paginationDescriptionContainer.classList[method]('fade-out');
  }

  // Titelwechsel durchführen
  function handleTitleChange() {
    // Warte eine konfigurierbare Zeit bevor der neue Titel erscheint
    setTimeout(() => {
      // Inhalte aktualisieren
      updateTitleContents();

      // Alle Elemente wieder einblenden
      fadeElements(false);

      // Animation abschließen
      setTimeout(() => {
        isAnimating = false;
        transitionCompleted = false;
      }, 50);
    }, betweenPauseMs);
  }

  // Inhalte basierend auf dem aktuellen Status aktualisieren
  function updateTitleContents() {
    // Den Index aus dem zentralen Status abrufen
    const activeIndex = uiState.activeProjectIndex;

    if (activeIndex >= 0 && activeIndex < uiState.projects.length) {
      const activeProject = uiState.projects[activeIndex];
      console.log(
        "setupProjectTitle: UpdateTitleContents hat aktives Projekt gesetzt: ",
        activeProject
      );
      const projectName = activeProject.getAttribute("data-project-name");
      const projectDesc = activeProject.getAttribute("data-project-description") || "";
      setTitles(projectName, projectDesc);
    }
  }

  // Event-Listener für Transition-End
  headerTitle.addEventListener("transitionend", (e) => {
    if (
      e.propertyName === "opacity" &&
      headerTitle.classList.contains("fade-out")
    ) {
      transitionCompleted = true;
      handleTitleChange();
    }
  });

  // Auf Projektänderungen reagieren
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, () => {
    console.log("setupProjectTitle: Event activeProjectChanged empfangen");

    if (!isAnimating) {
      isAnimating = true;
      transitionCompleted = false;

      // Alle Elemente ausblenden
      fadeElements(true);

      // Fallback-Timer für den Fall, dass transitionend nicht ausgelöst wird
      setTimeout(() => {
        if (
          !transitionCompleted &&
          headerTitle.classList.contains("fade-out")
        ) {
          handleTitleChange();
        }
      }, fadeDuration + 50);
    }
  });

  // Initialen Titel mit Animation einblenden
  function setupInitialTitle() {
    // Liste aller zu animierenden Elemente
    const initialElements = [
      headerTitle, 
      desktopDescription, 
      mobileTitle, 
      mobileDescription, 
      paginationContainer,
      paginationDescriptionContainer
    ];
    
    // Animation anwenden
    initialElements.forEach(element => {
      if (element) element.classList.add("initial-appear");
    });

    // Initiale Inhalte setzen
    updateTitleContents();

    // Animation nach Ablauf entfernen
    setTimeout(() => {
      initialElements.forEach(element => {
        if (element) element.classList.remove("initial-appear");
      });
    }, initialDuration);
  }

  // Initialen Titel mit optionaler Verzögerung anzeigen
  if (initialDelayMs <= 0) {
    setupInitialTitle();
  } else {
    setTimeout(setupInitialTitle, initialDelayMs);
  }
}