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

// Browser-Support für WebP prüfen (einmalig)
const supportsWebP = (function() {
  let result = null;
  
  return function() {
    if (result !== null) return result;
    
    try {
      // Aus localStorage laden, falls bereits geprüft
      if (localStorage && localStorage.getItem('webp-support') !== null) {
        result = localStorage.getItem('webp-support') === 'true';
        return result;
      }
      
      // Canvas-Test für WebP-Unterstützung
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        result = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        // Ergebnis im localStorage speichern
        if (localStorage) {
          localStorage.setItem('webp-support', result);
        }
      } else {
        result = false;
      }
      
      return result;
    } catch (e) {
      console.warn('WebP-Erkennung fehlgeschlagen:', e);
      result = false;
      return false;
    }
  };
})();

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
  
  /**
   * Prüft, ob ein bestimmtes Format für ein Bild verfügbar ist
   * @param {Object} imageObj - Das Bildobjekt mit formats-Eigenschaft
   * @param {string} formatKey - Der zu prüfende Format-Schlüssel (z.B. 'webp', 'large-webp')
   * @returns {boolean} Ob das Format verfügbar ist
   */
  hasFormat: function(imageObj, formatKey) {
    if (!imageObj || !imageObj.formats) return false;
    return !!imageObj.formats[formatKey];
  },
  
  /**
   * Prüft, ob ein Bild WebP-Formate hat
   * @param {Object} imageObj - Das Bildobjekt mit formats-Eigenschaft
   * @returns {boolean} Ob WebP-Formate verfügbar sind
   */
  hasWebP: function(imageObj) {
    if (!imageObj || !imageObj.formats) return false;
    
    // Suche nach 'webp' oder Format-Namen, die auf '-webp' enden
    return Object.keys(imageObj.formats).some(
      key => key === 'webp' || key.endsWith('-webp')
    );
  },
  
  /**
   * Erzeugt eine WebP-Statistik für die aktuelle Datenquelle
   * @returns {Object} Statistiken zur WebP-Nutzung
   */
  getWebpStats: function() {
    if (!this.projectsData || !this.projectsData.data) {
      return { total: 0, withWebP: 0, percent: 0 };
    }
    
    let totalImages = 0;
    let withWebP = 0;
    
    // Analysiere alle Projekte
    this.projectsData.data.forEach(project => {
      if (project.project_images) {
        project.project_images.forEach(imgData => {
          if (imgData.image && imgData.image.length > 0) {
            const img = imgData.image[0];
            totalImages++;
            
            // Prüfe, ob WebP-Formate vorhanden sind
            if (this.hasWebP(img)) {
              withWebP++;
            }
          }
        });
      }
    });
    
    return {
      total: totalImages,
      withWebP: withWebP,
      withoutWebP: totalImages - withWebP,
      percent: totalImages > 0 ? Math.round((withWebP / totalImages) * 100) : 0
    };
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
    
    // Nach dem Laden WebP-Statistik ausgeben
    if (projectsLoaded) {
      const stats = this.getWebpStats();
      console.log("WebP-Statistik:", 
        `${stats.withWebP}/${stats.total} Bilder haben WebP-Formate (${stats.percent}%)`);
    }
    
    return projectsLoaded;
  }
};

// Exportiere dataStore als default
export default dataStore;

// Exportiere die Hilfsfunktionen für den Browser-Support
export { supportsWebP };