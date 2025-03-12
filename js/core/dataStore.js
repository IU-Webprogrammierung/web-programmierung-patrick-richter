/**
 * @module dataStore
 * @description Zentraler Datenspeicher für Projekte und Inhalte
 */

const dataStore = {
    projectsData: null,
    aboutImprintData: null,
    clientsData: null,
  
    getProjects: function() {
      return this.projectsData;
    },
  
    getAboutImprint: function() {
      return this.aboutImprintData;
    },
  
    getClients: function() {
      return this.clientsData;
    },
  
    loadData: async function() {
      try {
        console.log("dataStore: Daten-Fetch beginnt...");
  
        // Alle drei externen Inputs laden
        const [projectsResponse, aboutResponse, clientsResponse] =
          await Promise.all([
            fetch("content/projects.json"),
            fetch("content/aboutImprint.json"),
            fetch("content/clients.json"),
          ]);
  
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