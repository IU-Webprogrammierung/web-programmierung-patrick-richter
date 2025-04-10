/**
 * @module CustomRouter
 * @description Verwaltet URLs und Projekt-Navigation mit der Browser History API.
 * Bietet URL-Synchronisation, Deep-Linking und Integration mit dem Overlay-System.
 * 
 * Funktionen:
 * - init() - Initialisiert den Router mit der Navigation-API
 * - setupEventListeners() - Richtet Event-Listener für die URL-Synchronisation ein
 * - initializeProjectSlugs() - Generiert eindeutige URL-Slugs für alle Projekte
 * - handleInitialURL() - Verarbeitet die initiale URL beim Laden der Seite
 * - handleURLChange() - Verarbeitet URL-Änderungen und navigiert entsprechend
 * - updateURLForProject() - Aktualisiert die URL für ein bestimmtes Projekt
 * - navigateToProject() - Navigiert zu einem bestimmten Projektindex
 * - navigateToProjectById() - Navigiert zu einem Projekt anhand seiner ID
 * - navigateToHome() - Navigiert zum ersten Projekt
 * - navigateToAbout() - Navigiert zur About-Seite
 * - navigateToImprint() - Navigiert zur Imprint-Seite
 * - handleOverlayRoute() - Behandelt About- und Imprint-Routen
 * 
 * @listens EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Aktualisiert URL basierend auf Projektwechseln
 * @listens EVENT_TYPES.APP_INIT_COMPLETE - Verarbeitet initiale URL nach vollständiger App-Initialisierung
 */

import {
  addEventListener,
  EVENT_TYPES,
  dispatchCustomEvent,
} from '@core/state/events.js';
import uiState from '@core/state/uiState.js';
import { checkFooter, normalizeSlug,
  getSlugFromPath,
  isValidProject,
  updateURL } from '@utils';
import {
  showOverlay,
  toggleAboutImprint,
} from '@overlay/overlayController.js';

class CustomRouter {
  constructor() {
    this.initialized = false;
    // Flag, um zu verhindern, dass URL-Updates während bestimmter Prozesse überschrieben werden
    this.suppressUrlUpdates = false;
    // Referenz auf die GSAP Navigation-API, die externe Navigation (Animationen etc.) übernimmt
    this.navigationAPI = null;
  }

  /**
   * Initialisiert den Router mit Zugriff auf die Navigation-API
   * @param {Object} navigationAPI - Referenz auf die Navigation-API des projectNavigator
   * @returns {CustomRouter} Instanz für Method-Chaining
   */
  init(navigationAPI) {
    console.log("CustomRouter: Initialisierung mit Navigation-API");

    if (!navigationAPI) {
      console.error("CustomRouter: Keine Navigation-API übergeben!");
      return this;
    }

    this.navigationAPI = navigationAPI;

    // Event-Listener einrichten
    this.setupEventListeners();

    // Projekt-Slugs initialisieren
    this.initializeProjectSlugs();

    // Router als initialisiert markieren
    this.initialized = true;

    // Initiale URL verarbeiten nach App-Initialisierung
    addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
      console.log(
        "CustomRouter: App vollständig initialisiert, verarbeite initiale URL"
      );

      // Kurze Verzögerung für UI-Bereitschaft
      setTimeout(() => this.handleInitialURL(), 100);
    });

    return this;
  }

  /**
   * Richtet alle Event-Listener für die URL-Synchronisation ein
   */
  setupEventListeners() {
    // Auf Projektwechsel reagieren
    addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
      if (this.suppressUrlUpdates) return;

      const { projectIndex } = event.detail;
      // Aktualisiere die URL mit neuem Projektindex
      this.updateURLForProject(projectIndex);
    });

  }

  /**
   * Generiert eindeutige URL-Slugs für alle Projekte und speichert sie im uiState
   */
  initializeProjectSlugs() {
    console.log("CustomRouter: Generiere eindeutige Slugs für alle Projekte");

    // Prüfen, ob Projekte verfügbar sind
    if (!uiState.projects || uiState.projects.length === 0) {
      console.warn("CustomRouter: Keine Projekte im uiState gefunden");
      return;
    }

    // Map zum Tracken bereits verwendeter Basis-Slugs und Anzahl
    const usedBaseSlugs = new Map();

    // Für jedes Projekt einen Slug generieren (außer Footer)
    uiState.projects.forEach((project, index) => {
      // Footer überspringen
      if (checkFooter(project, uiState.projects)) return;

      const projectId = project.getAttribute("data-project-id");
      const projectName =
        project.getAttribute("data-project-name") || `project-${index}`;

      // Basis-Slug erstellen
      let baseSlug = normalizeSlug(projectName);
      if (!baseSlug) baseSlug = `project-${index}`;

      // Eindeutigkeit sicherstellen
      let finalSlug;
      if (usedBaseSlugs.has(baseSlug)) {
        const count = usedBaseSlugs.get(baseSlug) + 1;
        usedBaseSlugs.set(baseSlug, count);
        finalSlug = `${baseSlug}-${count}`;
      } else {
        usedBaseSlugs.set(baseSlug, 1);
        finalSlug = baseSlug;
      }

      // Slug im uiState speichern
      uiState.setProjectSlug(projectId, finalSlug);
      console.log(
        `CustomRouter: Slug für "${projectName}" (ID: ${projectId}) ist "${finalSlug}"`
      );
    });
  }

  /**
   * Verarbeitet die initiale URL beim Laden der Seite (z.B. wenn Link verschickt wurde)
   */
/**
 * Verarbeitet die initiale URL beim Laden der Seite (z.B. wenn Link verschickt wurde)
 */
handleInitialURL() {
  const path = window.location.pathname;
  console.log("CustomRouter: Verarbeite initiale URL", path);

  // About/Imprint Routen mit Farbinitialisierung
  if (path === "/about" || path === "/imprint") {
    // Textfarbe vom ersten Projekt übernehmen
    const project = uiState.projects[0];
    const firstSlide = project.querySelector(".swiper-slide");
    if (firstSlide) {
      const textColor = firstSlide.getAttribute("data-text-color") || "black";
      uiState.setActiveImage(0, 0, textColor, 0);
    }

    // About-Route
    if (path === "/about") {
      this.handleOverlayRoute("about");
      return;
    }

    // Imprint-Route
    if (path === "/imprint") {
      this.handleOverlayRoute("imprint");
      return;
    }
  }

  // Projektspezifische URL
  const slug = getSlugFromPath(path);

  // Leere URL (Home-Route)
  if (!slug) return;

  // Projektindex aus Slug ermitteln
  const projectIndex = this.getProjectIndexFromSlug(slug);

  if (projectIndex >= 0) {
    console.log(
      `CustomRouter: Initial Projekt-Route für "${slug}" - Index ${projectIndex}`
    );

    // Textfarbe vom ersten Bild des Projekts übernehmen
    const project = uiState.projects[projectIndex];
    const firstSlide = project.querySelector(".swiper-slide");
    if (firstSlide) {
      const textColor = firstSlide.getAttribute("data-text-color") || "black";
      uiState.setActiveImage(projectIndex, 0, textColor, 0);
    }

    // Zum Projekt navigieren
    if (this.navigationAPI) {
      this.navigationAPI.navigateToIndex(projectIndex, 1);

      // INITIAL_PROJECT_SET auslösen (um content zu updaten)
      setTimeout(() => {
        uiState.activeProjectIndex = projectIndex;
        dispatchCustomEvent(EVENT_TYPES.INITIAL_PROJECT_SET);
      }, 100);
    }
  } else {
    // Slug nicht gefunden - zur Startseite
    console.warn(`CustomRouter: Kein Projekt für Slug "${slug}" gefunden`);
    updateURL("/");
  }
}

  /**
   * Verarbeitet eine URL-Änderung und navigiert entsprechend
   * @param {string} path - Der zu verarbeitende URL-Pfad
   */
  handleURLChange(path) {
    console.log(`CustomRouter: Verarbeite URL-Änderung "${path}"`);

    // About/Imprint Routen
    if (path === "/about") {
      this.handleOverlayRoute("about");
      return;
    }

    if (path === "/imprint") {
      this.handleOverlayRoute("imprint");
      return;
    }

    // Projektspezifische URL
    const slug = getSlugFromPath(path);

    // Leere URL (Home-Route)
    if (!slug) {
      if (uiState.activeProjectIndex !== 0) {
        this.navigateToProject(0);
      }
      return;
    }

    // Projektindex aus Slug ermitteln
    const projectIndex = this.getProjectIndexFromSlug(slug);

    if (projectIndex >= 0) {
      if (projectIndex !== uiState.activeProjectIndex) {
        this.navigateToProject(projectIndex);
      }
    } else {
      // Slug nicht gefunden - zur Home-Route
      console.warn(`CustomRouter: Kein Projekt für Slug "${slug}" gefunden`);

      this.suppressUrlUpdates = true;
      this.navigateToHome();
      this.suppressUrlUpdates = false;
    }
  }

  /**
   * Aktualisiert die URL für ein bestimmtes Projekt
   * @param {number} projectIndex - Der Index des aktiven Projekts
   */
  updateURLForProject(projectIndex) {
    // Ungültigen Index oder Footer überspringen
    if (
      !isValidProject(projectIndex, uiState.projects) ||
      checkFooter(uiState.projects[projectIndex])
    ) {
      return;
    }

    // Projekt-ID und Slug ermitteln
    const project = uiState.projects[projectIndex];
    const projectId = project.getAttribute("data-project-id");
    const slug = uiState.getProjectSlug(projectId);

    if (slug) {
      updateURL(`/${slug}`);
    }
  }

  /**
   * Navigiert zu einem bestimmten Projektindex mit Animation
   * @param {number} projectIndex - Der Ziel-Projektindex
   */
  navigateToProject(projectIndex) {
    if (!this.navigationAPI) {
      console.error("CustomRouter: Keine Navigation-API verfügbar");
      return;
    }

    // Richtung für Animation bestimmen
    const direction = projectIndex > uiState.activeProjectIndex ? 1 : -1;

    console.log(
      `CustomRouter: Navigiere zu Projekt ${projectIndex} mit Richtung ${direction}`
    );
    this.navigationAPI.navigateToIndex(projectIndex, direction);
  }

  /**
   * Navigiert zu einem Projekt anhand seiner ID mit Animation
   * @param {string} projectId - Die Projekt-ID
   */
  navigateToProjectById(projectId) {
    const projectIndex = uiState.projects.findIndex(
      (project) =>
        project.getAttribute("data-project-id") === projectId.toString()
    );

    if (projectIndex >= 0) {
      this.navigateToProject(projectIndex);
    } else {
      console.warn(`CustomRouter: Projekt mit ID ${projectId} nicht gefunden`);
    }
  }

  /**
   * Navigiert zum ersten Projekt (Home)
   */
  navigateToHome() {
    updateURL("/");
    this.navigateToProject(0);
  }

  /**
   * Navigiert zur About-Seite und öffnet das Overlay
   */
  navigateToAbout() {
    updateURL("/about", { overlay: "about" });
    this.handleOverlayRoute("about");
  }

  /**
   * Navigiert zur Imprint-Seite und öffnet das Overlay
   */
  navigateToImprint() {
    updateURL("/imprint", { overlay: "imprint" });
    this.handleOverlayRoute("imprint");
  }

  /**
   * Behandelt About und Imprint Routen einheitlich
   * @param {string} type - Der Typ (about oder imprint)
   */
  handleOverlayRoute(type) {
    console.log(`CustomRouter: ${type}-Route erkannt`);
    this.suppressUrlUpdates = true;
    showOverlay();
    toggleAboutImprint(`show-${type}`);
    this.suppressUrlUpdates = false;
  }

  /**
   * Ermittelt den Projektindex anhand eines URL-Slugs
   * @param {string} slug - Der zu suchende URL-Slug
   * @returns {number} Der Projektindex oder -1, wenn nicht gefunden
   */
  getProjectIndexFromSlug(slug) {
    // Projekt-ID anhand des Slugs in uiState suchen
    const projectId = Object.keys(uiState.projectSlugs).find(
      (id) => uiState.projectSlugs[id] === slug
    );

    if (!projectId) return -1;

    // Projektindex anhand der ID suchen
    return uiState.projects.findIndex(
      (project) => project.getAttribute("data-project-id") === projectId
    );
  }
}

// Singleton-Instanz exportieren
export default new CustomRouter();