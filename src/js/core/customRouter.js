/**
 * @module CustomRouter
 * @description Verwaltet URLs und Projekt-Navigation mit der Browser History API.
 * Bietet URL-Synchronisation, Deep-Linking und Integration mit dem Overlay-System.
 *
 * @listens EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Aktualisiert URL basierend auf Projektwechseln
 * @listens EVENT_TYPES.APP_INIT_COMPLETE - Verarbeitet initiale URL nach vollständiger App-Initialisierung
 */

import {
  addEventListener,
  EVENT_TYPES,
  dispatchCustomEvent,
} from "@core/state/events.js";
import uiState from "@core/state/uiState.js";
import { checkFooter } from "@utils/navigationUtils.js";
import {
  showOverlay,
  toggleAboutImprint,
} from "@overlay/overlayController.js";

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
      // TODO könnte gleich checkfooter nutzen
      if (this.isFooter(project, index)) return;

      // TODO schauen, ob ich da nicht lieber über id im array gehe
      const projectId = project.getAttribute("data-project-id");
      const projectName =
        project.getAttribute("data-project-name") || `project-${index}`;

      // Basis-Slug erstellen
      let baseSlug = this.normalizeSlug(projectName);
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
  handleInitialURL() {
    const path = window.location.pathname;
    console.log("CustomRouter: Verarbeite initiale URL", path);

    if (path === "/about" || path === "/imprint") {
      const project = uiState.projects[0];
      const firstSlide = project.querySelector(".swiper-slide");
      if (firstSlide) {
        const textColor = firstSlide.getAttribute("data-text-color") || "black";
        uiState.setActiveImage(0, 0, textColor, 0);
      }

      // About/Imprint Routen
      if (path === "/about") {
        this.handleOverlayRoute("about");
        return;
      }

      if (path === "/imprint") {
        this.handleOverlayRoute("imprint");
        return;
      }
    }

    // Projektspezifische URL
    const slug = this.getSlugFromPath(path);

    // Leere URL (Home-Route)
    if (!slug) return;

    // Projektindex aus Slug ermitteln
    const projectIndex = this.getProjectIndexFromSlug(slug);

    if (projectIndex >= 0) {
      console.log(
        `CustomRouter: Initial Projekt-Route für "${slug}" - Index ${projectIndex}`
      );

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
      this.updateURL("/");
    }
  }

  /**
   * Verarbeitet eine URL-Änderung und navigiert entsprechend
   * @param {string} path - Der zu verarbeitende URL-Pfad
   * @param {boolean} isFromPopState - Ob die Änderung durch Browser-Navigation ausgelöst wurde
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
    const slug = this.getSlugFromPath(path);

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
      !this.isValidProject(projectIndex) ||
      this.isFooter(uiState.projects[projectIndex])
    ) {
      return;
    }

    // Projekt-ID und Slug ermitteln
    const project = uiState.projects[projectIndex];
    const projectId = project.getAttribute("data-project-id");
    const slug = uiState.getProjectSlug(projectId);

    if (slug) {
      this.updateURL(`/${slug}`);
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
    this.updateURL("/");
    this.navigateToProject(0);
  }

  /**
   * Navigiert zur About-Seite und öffnet das Overlay
   */
  navigateToAbout() {
    this.updateURL("/about", { overlay: "about" });
    this.handleOverlayRoute("about");
  }

  /**
   * Navigiert zur Imprint-Seite und öffnet das Overlay
   */
  navigateToImprint() {
    this.updateURL("/imprint", { overlay: "imprint" });
    this.handleOverlayRoute("imprint");
  }

  /* ---- Hilfsmethoden ---- */

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
   * Aktualisiert die Browser-URL
   * @param {string} path - Der neue Pfad
   * @param {Object} state - Optionales State-Objekt
   */
  updateURL(path, state = {}) {
    if (window.location.pathname !== path) {
      console.log(`CustomRouter: Aktualisiere URL auf "${path}"`);
      window.history.replaceState(state, "", path);
    }
  }

  /**
   * Konvertiert einen String in einen URL-freundlichen Slug
   * @param {string} str - Der zu konvertierende String
   * @returns {string} Der normalisierte URL-Slug
   */
  normalizeSlug(str) {
    if (!str) return "";

    return str
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Extrahiert den Slug aus einem URL-Pfad
   * @param {string} path - Der URL-Pfad
   * @returns {string} Der extrahierte Slug
   */
  getSlugFromPath(path) {
    return path.replace(/^\/|\/$/g, "");
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

  /**
   * Prüft, ob ein Element oder Index den Footer repräsentiert
   * @param {Element|number} elementOrIndex - Das zu prüfende Element oder der Index
   * @param {Array} [elemArray] - Optional: Das Array für Indexpüfung
   * @returns {boolean} True, wenn es sich um den Footer handelt
   */
  isFooter(elementOrIndex, elemArray) {
    return checkFooter(elementOrIndex, elemArray);
  }

  /**
   * Prüft, ob ein Projektindex gültig ist
   * @param {number} index - Der zu prüfende Index
   * @returns {boolean} True, wenn der Index gültig ist
   */
  isValidProject(index) {
    return index >= 0 && index < uiState.projects.length;
  }
}

// Singleton-Instanz exportieren
export default new CustomRouter();
