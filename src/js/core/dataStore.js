/**
 * @module dataStore
 * @description Zentraler Datenspeicher für alle Inhalte der Website.
 * Lädt Daten asynchron und stellt sie über Getter-Methoden bereit.
 *
 * @fires DATA_LOADED - Signalisiert abgeschlossene Projektdatenladung (vor dem Laden anderer Daten)
 */

import { API_ENDPOINTS, FALLBACK_DATA } from "@core/config.js";
import {
  normalizeProjectData,
  normalizeAboutData,
  normalizeClientsData,
  normalizeFooterData,
} from "@utils/normalizers/normalizerIndex.js";
import { EVENT_TYPES, dispatchCustomEvent } from "@core/state/events.js";

const dataStore = {
  projectsData: null,
  aboutImprintData: null,
  clientsData: null,
  footerData: null,

  /**
   * Initialisiert den Datenspeicher und startet sofort den Ladevorgang
   */
  init() {
    console.log("dataStore: Initialisierung und Start des Datenladevorgang");
    this.loadData();
  },

  // Standard-Getter für Daten
  getProjects: function () {
    return this.projectsData;
  },

  getAboutImprint: function () {
    return this.aboutImprintData;
  },

  getClients: function () {
    return this.clientsData;
  },

  getFooter: function () {
    return this.footerData;
  },

  // Hilfsfunktion zum Laden eines einzelnen Datentyps
  fetchDataWithFallback: async function (
    url,
    dataType,
    normalizeFn,
    fallbackData
  ) {
    try {
      console.log(`Lade ${dataType} von ${url}...`);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Fehler beim Laden von ${dataType}: ${response.status}`);
        return normalizeFn(fallbackData);
      }

      const data = await response.json();
      console.log(`${dataType} erfolgreich geladen`);
      return normalizeFn(data);
    } catch (error) {
      console.error(`Fehler beim Laden von ${dataType}:`, error);
      return normalizeFn(fallbackData);
    }
  },

  /**
   * Hauptmethode zum Laden aller Daten
   * Lädt zuerst die Projektdaten und sendet dann das DATA_LOADED Event
   * Danach werden die restlichen Daten im Hintergrund geladen
   * @returns {boolean} true wenn die Projekte erfolgreich geladen wurden
   */
  loadData: async function () {
    console.log("dataStore: Daten-Fetch beginnt...");

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
        console.log(
          "dataStore: Projektdaten erfolgreich geladen, sende PROJECT_DATA_LOADED Event"
        );

        // WICHTIG: Event sofort nach dem Laden der Projektdaten auslösen
        dispatchCustomEvent(EVENT_TYPES.PROJECT_DATA_LOADED, {
          projectsCount: this.projectsData?.data?.length || 0,
        });
      } else {
        console.error("dataStore: Fehler beim Laden der Projektdaten");
        return false;
      }

      // Paralleles Laden der weniger kritischen Daten NACH dem Event
      console.log(
        "dataStore: Lade zusätzliche Daten (About, Clients, Footer) im Hintergrund..."
      );
      const [aboutData, clientsData, footerData] = await Promise.allSettled([
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

      // Status-Übersicht ausgeben
      console.log("dataStore: Hintergrundladung abgeschlossen mit Status:", {
        about: this.aboutImprintData?.data ? "OK" : "FEHLER",
        clients: this.clientsData?.data?.length > 0 ? "OK" : "FEHLER",
        footer: this.footerData?.data ? "OK" : "FEHLER",
      });

      // Neues Event auslösen, wenn ALLE Daten geladen sind
      dispatchCustomEvent(EVENT_TYPES.ALL_DATA_LOADED, {
        projectsCount: this.projectsData?.data?.length || 0,
        aboutStatus: this.aboutImprintData?.data ? "OK" : "FEHLER",
        clientsStatus: this.clientsData?.data?.length > 0 ? "OK" : "FEHLER",
        footerStatus: this.footerData?.data ? "OK" : "FEHLER",
      });

      return true;
    } catch (error) {
      console.error("dataStore: Fehler beim Laden der Daten:", error);
      return false;
    }
  },
};

// Exportiere dataStore als default
export default dataStore;
