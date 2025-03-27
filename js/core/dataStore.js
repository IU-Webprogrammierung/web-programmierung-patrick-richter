/**
 * @module dataStore
 * @description Zentraler Datenspeicher für alle Inhalte der Website.
 * Lädt Daten asynchron und stellt sie über Getter-Methoden bereit.
 */

import { API_ENDPOINTS, FALLBACK_DATA } from '../config.js';
import { 
  normalizeProjectData, 
  normalizeAboutData, 
  normalizeClientsData, 
  normalizeFooterData 
} from './normalizers/index.js';

const dataStore = {
  projectsData: null,
  aboutImprintData: null,
  clientsData: null,
  footerData: null,
  
  // Standard-Getter für Daten
  getProjects: function() {
    return this.projectsData;
  },
  
  getAboutImprint: function() {
    return this.aboutImprintData;
  },
  
  getClients: function() {
    return this.clientsData;
  },
  
  getFooter: function() {
    return this.footerData;
  },
  
  // Hilfsfunktion zum Laden eines einzelnen Datentyps
  fetchDataWithFallback: async function(url, dataType, normalizeFn, fallbackData) {
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
  
  // Hauptmethode zum Laden aller Daten
  loadData: async function() {
    console.log("dataStore: Daten-Fetch beginnt...");
    
    // Kritische Daten (Projekte) zuerst laden
    this.projectsData = await this.fetchDataWithFallback(
      API_ENDPOINTS.projects,
      "Projekte",
      normalizeProjectData,
      FALLBACK_DATA.projects
    );
    
    // Erfolgsprüfung
    const projectsLoaded = this.projectsData?.data?.length > 0;
    
    // Paralleles Laden der weniger kritischen Daten
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
      )
    ]);
    
    // Ergebnisse verarbeiten
    this.aboutImprintData = aboutData.status === 'fulfilled' ? aboutData.value : normalizeAboutData(FALLBACK_DATA.about);
    this.clientsData = clientsData.status === 'fulfilled' ? clientsData.value : normalizeClientsData(FALLBACK_DATA.clients);
    this.footerData = footerData.status === 'fulfilled' ? footerData.value : normalizeFooterData(FALLBACK_DATA.footer);
    
    // Status-Übersicht ausgeben
    console.log("Daten-Laden Status:", {
      projects: projectsLoaded ? "OK" : "FEHLER",
      about: this.aboutImprintData?.data ? "OK" : "FEHLER",
      clients: this.clientsData?.data?.length > 0 ? "OK" : "FEHLER",
      footer: this.footerData?.data ? "OK" : "FEHLER"
    });
    
    return projectsLoaded;
  }
};

// Exportiere dataStore als default
export default dataStore;