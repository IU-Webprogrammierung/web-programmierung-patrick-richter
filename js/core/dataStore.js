/**
 * @module dataStore
 * @description Zentraler Datenspeicher für alle Inhalte der Website.
 * Lädt Projektdaten, About/Imprint-Informationen und Client-Daten asynchron
 * und stellt sie über Getter-Methoden bereit. Fungiert als Single Source of Truth
 * für alle Content-Daten in der Anwendung.
 *
 * Funktionen: getProjects(), getAboutImprint(), getClients(), loadData()
 */

import { API_URL } from '../config.js';

const dataStore = {
  projectsData: null,
  aboutImprintData: null,
  clientsData: null,
  footerData: null,

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

  loadData: async function () {
    try {
      console.log("dataStore: Daten-Fetch beginnt...");

      // Alle vier externen Inputs laden
      const [projectsResponse, aboutResponse, clientsResponse, footerResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/projects?populate[project_images][populate]=image&sort=rank:asc`
          ),
          fetch(`${API_URL}/about`),
          fetch(`${API_URL}/clients?populate=projects&sort=name:asc`),
          fetch(`${API_URL}/footer`),
        ]);

      // Überprüfen, ob alle Responses erfolgreich waren
      if (
        !projectsResponse.ok ||
        !aboutResponse.ok ||
        !clientsResponse.ok ||
        !footerResponse.ok
      ) {
        console.error(
          "Fehler beim Laden eines oder mehrerer Dateien:",
          projectsResponse.status,
          aboutResponse.status,
          clientsResponse.status,
          footerResponse.status
        );
        return false;
      }

      // Alle JSON-Responses verarbeiten
      const projectsData = await projectsResponse.json();
      const aboutData = await aboutResponse.json();
      const clientsData = await clientsResponse.json();
      const footerData = await footerResponse.json();

      console.log("dataStore: Laden erfolgreich");

      // Daten im Store speichern
      this.projectsData = projectsData;
      this.aboutImprintData = aboutData;
      this.clientsData = clientsData;
      this.footerData = footerData;

      return true;
    } catch (error) {
      console.error(error);
      console.log("dataStore: Laden nicht erfolgreich");
      return false;
    }
  },
};

export default dataStore;
