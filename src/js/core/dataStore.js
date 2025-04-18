/**
 * @module dataStore
 * @description Zentraler Datenspeicher für alle Inhalte der Website.
 * Lädt Daten asynchron und stellt sie über einheitliche Getter-Methoden bereit.
 * Enthält Funktionen:
 * - init()
 * - getProjects()
 * - getAboutImprint()
 * - getClients()
 * - getFooter()
 * - fetchDataWithFallback()
 * - loadData()
 *
 * @fires EVENT_TYPES.PROJECT_DATA_LOADED - Nach erfolgreicher Projektdatenladung
 * @fires EVENT_TYPES.ALL_DATA_LOADED - Nach vollständiger Ladung aller Daten
 */

import { API_ENDPOINTS, FALLBACK_DATA } from "@core/config.js";
import logger from "@core/logger";
import {
  normalizeProjectData,
  normalizeAboutData,
  normalizeClientsData,
  normalizeFooterData,
  normalizeGlobalSettingsData,
} from "@utils/normalizers/normalizerIndex.js";
import { EVENT_TYPES, dispatchCustomEvent } from "@core/state/events.js";

const dataStore = {
  projectsData: null,
  aboutImprintData: null,
  clientsData: null,
  footerData: null,
  globalSettingsData: null,

  /**
   * Initialisiert den Datenspeicher und startet den Ladevorgang
   */
  init() {
    logger.log("dataStore: Initialisierung und Start des Datenladevorgang");
    this.loadData();
  },

  /**
   * Gibt die aktuellen Projektdaten zurück
   * @returns {Object|null} Die Projektdaten oder null wenn nicht geladen
   */
  getProjects: function () {
    return this.projectsData;
  },

  /**
   * Gibt die About/Imprint-Daten zurück
   * @returns {Object|null} Die About/Imprint-Daten oder null wenn nicht geladen
   */
  getAboutImprint: function () {
    return this.aboutImprintData;
  },

  /**
   * Gibt die Client-Daten zurück
   * @returns {Object|null} Die Client-Daten oder null wenn nicht geladen
   */
  getClients: function () {
    return this.clientsData;
  },

  /**
   * Gibt die Footer-Daten zurück
   * @returns {Object|null} Die Footer-Daten oder null wenn nicht geladen
   */
  getFooter: function () {
    return this.footerData;
  },

  /**
   * Gibt die Global-Settings-Daten zurück
   * @returns {Object|null} Die Global-Settings-Daten oder null wenn nicht geladen
   */
  getGlobalSettings: function () {
    return this.globalSettingsData;
  },

  /**
   * Lädt einen Datentyp mit Fehlerbehandlung und Normalisierung
   * @param {string} url - Die URL für den API-Aufruf
   * @param {string} dataType - Beschreibender Name des Datentyps für Logging
   * @param {Function} normalizeFn - Die Normalisierungsfunktion für die Daten
   * @param {Object} fallbackData - Fallback-Daten, falls der Aufruf fehlschlägt
   * @returns {Object} Die normalisierten Daten
   */
  fetchDataWithFallback: async function (
    url,
    dataType,
    normalizeFn,
    fallbackData
  ) {
    try {
      logger.log(`Lade ${dataType} von ${url}...`);
      const response = await fetch(url);

      if (!response.ok) {
        logger.warn(`Fehler beim Laden von ${dataType}: ${response.status}`);
        return normalizeFn(fallbackData);
      }

      const data = await response.json();
      logger.log(`${dataType} erfolgreich geladen`);
      return normalizeFn(data);
    } catch (error) {
      logger.error(`Fehler beim Laden von ${dataType}:`, error);
      return normalizeFn(fallbackData);
    }
  },

  /**
   * Hauptmethode zum Laden aller Daten mit priorisierter Projektdatenladung
   * @returns {boolean} true wenn die Projekte erfolgreich geladen wurden
   */
  loadData: async function () {
    logger.log("dataStore: Daten-Fetch beginnt...");

    try {
      // Kritische Daten (Projekte) zuerst laden
      this.projectsData = await this.fetchDataWithFallback(
        API_ENDPOINTS.projects,
        "Projekte",
        normalizeProjectData,
        FALLBACK_DATA.projects
      );

      // Erfolgsprüfung für Projektdaten
      const projectsLoaded = this.projectsData?.data?.length > 0;

      if (projectsLoaded) {
        logger.log(
          "dataStore: Projektdaten erfolgreich geladen, sende PROJECT_DATA_LOADED Event"
        );

        // Event sofort nach dem Laden der Projektdaten auslösen
        dispatchCustomEvent(EVENT_TYPES.PROJECT_DATA_LOADED, {
          projectsCount: this.projectsData?.data?.length || 0,
        });
      } else {
        logger.error("dataStore: Fehler beim Laden der Projektdaten");
        return false;
      }

      // Paralleles Laden der weniger kritischen Daten NACH dem Event
      logger.log(
        "dataStore: Lade zusätzliche Daten (About, Clients, Footer, Globale Einstellungen) im Hintergrund..."
      );
      const [aboutData, clientsData, footerData, globalSettingsData] =
        await Promise.allSettled([
          this.fetchDataWithFallback(
            API_ENDPOINTS.about,
            "About",
            normalizeAboutData,
            FALLBACK_DATA.about
          ),
          this.fetchDataWithFallback(
            API_ENDPOINTS.clients,
            "Clients",
            normalizeClientsData,
            FALLBACK_DATA.clients
          ),
          this.fetchDataWithFallback(
            API_ENDPOINTS.footer,
            "Footer",
            normalizeFooterData,
            FALLBACK_DATA.footer
          ),
          this.fetchDataWithFallback(
            API_ENDPOINTS.globalSettings,
            "Globale Einstellungen",
            normalizeGlobalSettingsData,
            FALLBACK_DATA.globalSettings
          ),
        ]);

      // Ergebnisse verarbeiten
      this.aboutImprintData =
        aboutData.status === "fulfilled"
          ? aboutData.value
          : normalizeAboutData(FALLBACK_DATA.about);
      this.clientsData =
        clientsData.status === "fulfilled"
          ? clientsData.value
          : normalizeClientsData(FALLBACK_DATA.clients);
      this.footerData =
        footerData.status === "fulfilled"
          ? footerData.value
          : normalizeFooterData(FALLBACK_DATA.footer);
      this.globalSettingsData =
        globalSettingsData.status === "fulfilled"
          ? globalSettingsData.value
          : normalizeGlobalSettingsData(FALLBACK_DATA.globalSettings);

      // Status-Übersicht ausgeben
      logger.log("dataStore: Hintergrundladung abgeschlossen mit Status:", {
        about: this.aboutImprintData?.data ? "OK" : "FEHLER",
        clients: this.clientsData?.data?.length > 0 ? "OK" : "FEHLER",
        footer: this.footerData?.data ? "OK" : "FEHLER",
      });

      // Event auslösen, wenn ALLE Daten geladen sind
      dispatchCustomEvent(EVENT_TYPES.ALL_DATA_LOADED, {
        projectsCount: this.projectsData?.data?.length || 0,
        aboutStatus: this.aboutImprintData?.data ? "OK" : "FEHLER",
        clientsStatus: this.clientsData?.data?.length > 0 ? "OK" : "FEHLER",
        footerStatus: this.footerData?.data ? "OK" : "FEHLER",
      });

      return true;
    } catch (error) {
      logger.error("dataStore: Fehler beim Laden der Daten:", error);
      return false;
    }
  },
};

// Exportiere dataStore als default
export default dataStore;
