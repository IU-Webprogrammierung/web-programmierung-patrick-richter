/**
 * @module dataStore
 * @description Zentraler Datenspeicher für alle Inhalte der Website.
 * Lädt Projektdaten, About/Imprint-Informationen und Client-Daten asynchron
 * und stellt sie über Getter-Methoden bereit. Fungiert als Single Source of Truth
 * für alle Content-Daten in der Anwendung.
 *
 * Funktionen: getProjects(), getAboutImprint(), getClients(), loadData()
 */

const dataStore = {
  projectsData: null,
  aboutImprintData: null,
  clientsData: null,

  getProjects: function () {
    return this.projectsData;
  },

  getAboutImprint: function () {
    return this.aboutImprintData;
  },

  getClients: function () {
    return this.clientsData;
  },

  loadData: async function () {
    try {
      console.log("dataStore: Daten-Fetch beginnt...");

      // Alle drei externen Inputs laden
      const [projectsResponse, aboutResponse, clientsResponse] =
        await Promise.all([
          fetch("content/projects.json"),
          fetch("content/aboutImprint.json"),
          fetch("content/clients.json"),
        ]);

      // Überprüfen, ob alle Responses erfolgreich waren
      if (!projectsResponse.ok || !aboutResponse.ok || !clientsResponse.ok) {
        console.error(
          "Fehler beim Laden eines oder mehrerer Dateien:",
          projectsResponse.status,
          aboutResponse.status,
          clientsResponse.status
        );
        return false;
      }

      // Alle JSON-Responses verarbeiten
      const projectsData = await projectsResponse.json();
      const aboutData = await aboutResponse.json();
      const clientsData = await clientsResponse.json();

      console.log("dataStore: Laden erfolgreich");

      // Daten im Store speichern
      this.projectsData = projectsData;
      this.aboutImprintData = aboutData;
      this.clientsData = clientsData;

      return true;
    } catch (error) {
      console.error(error);
      console.log("dataStore: Laden nicht erfolgreich");
      return false;
    }
  },
};

export default dataStore;
