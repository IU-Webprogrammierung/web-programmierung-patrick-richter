/**
 * @module projectTitle
 * @description Steuert die dynamische Anzeige und Animation von Projekttiteln.
 * Reagiert auf Projektwechsel durch sanfte Überblendungen und aktualisiert Titel
 * sowohl auf Desktop- als auch auf mobilen Ansichten mit synchronisierten Animations-Timings.
 *
 * Funktionen: setupProjectTitle()
 */

import uiState from "../../core/uiState.js";
import { EVENT_TYPES } from "../../core/events.js";

// Dynamische Änderung der Projekttitel
export function setupProjectTitle() {
  // DOM-Elemente
  const headerTitle = document.querySelector(".project-title");
  const mobileTitle = document.querySelector(".project-title-mobile");
  const mobileDescription = document.querySelector(".description-mobile");

  if (!headerTitle) {
    console.error("Fehler: Projekt-Titel-Element nicht gefunden");
    return; // Frühe Rückgabe, wenn Hauptelement fehlt
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
    headerTitle.textContent = projectName;
    if (mobileTitle) mobileTitle.textContent = projectName;
    if (mobileDescription) mobileDescription.textContent = projectDesc;
  }

  // Titelwechsel durchführen
  function handleTitleChange() {
    // Warte eine konfigurierbare Zeit bevor der neue Titel erscheint
    setTimeout(() => {
      // Inhalte aktualisieren
      updateTitleContents();

      // Alle Elemente wieder einblenden
      headerTitle.classList.remove("fade-out");
      if (mobileTitle) mobileTitle.classList.remove("fade-out");
      if (mobileDescription) mobileDescription.classList.remove("fade-out");

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
      const projectDesc =
        activeProject.querySelector(".description")?.textContent || "";

      console.log(
        `setupProjectTitle: updateTitleContents: Titel wird aktualisiert zu: ${projectName}`
      );
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
      headerTitle.classList.add("fade-out");
      if (mobileTitle) mobileTitle.classList.add("fade-out");
      if (mobileDescription) mobileDescription.classList.add("fade-out");

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
    // Animation anwenden
    headerTitle.classList.add("initial-appear");
    if (mobileTitle) mobileTitle.classList.add("initial-appear");
    if (mobileDescription) mobileDescription.classList.add("initial-appear");

    // Initiale Inhalte setzen
    updateTitleContents();

    // Animation nach Ablauf entfernen
    setTimeout(() => {
      headerTitle.classList.remove("initial-appear");
      if (mobileTitle) mobileTitle.classList.remove("initial-appear");
      if (mobileDescription)
        mobileDescription.classList.remove("initial-appear");
    }, initialDuration);
  }

  // Initialen Titel mit optionaler Verzögerung anzeigen
  if (initialDelayMs <= 0) {
    setupInitialTitle();
  } else {
    setTimeout(setupInitialTitle, initialDelayMs);
  }
}
