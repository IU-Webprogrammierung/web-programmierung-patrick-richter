/**
 * @module footerLoader
 * @description Lädt und konfiguriert den Footer-Inhalt der Website.
 * Generiert den HTML-Inhalt für den Footer dynamisch basierend auf den
 * aus dem dataStore geladenen Daten.
 * Enthält Funktionen:
 * - init()
 * - loadFooterContent()
 * 
 * @listens EVENT_TYPES.ALL_DATA_LOADED - Initialisiert Footer nach vollständigem Datenladen
 */

import logger from '@core/logger';
import { EVENT_TYPES, addEventListener } from '@core/state/events.js';
import dataStore from '@core/dataStore.js';

/**
 * Initialisiert den Footer-Loader
 */
function init () {

// Auf DOM-Struktur-Bereitschaft reagieren
addEventListener(EVENT_TYPES.ALL_DATA_LOADED, () => {
  logger.log("footerLoader: Initialisiere Footer");
  
  // Inhalte laden
  loadFooterContent();
  
});
}

/**
 * Lädt Footer-Inhalte aus dem dataStore und aktualisiert das DOM
 */
function loadFooterContent() {
  logger.log("Lade Footer-Inhalte...");
  
  const container = document.querySelector(".footer-content");
  if (!container) {
    logger.error("Footer-Container nicht gefunden - keine .footer-content im DOM");
    return;
  }
  
  const footerData = dataStore.getFooter();
  
  if (!footerData || !footerData.data || !footerData.data.getincontact) {
    logger.warn("Keine Footer-Daten gefunden - Fallback wird verwendet");
    
    // Fallback-Inhalt
    container.innerHTML = `
      <h1>Let's work together!</h1>
      <p>Contact me via <a href="mailto:test@test.de">test@test.de</a></p>
    `;
    
    return;
  }
  
  // Footer-Inhalt aus JSON generieren
  let footerContent = "";
  
  // Die getincontact-Array durchlaufen und HTML generieren
  footerData.data.getincontact.forEach((item) => {
    if (item.type === "heading" && item.level === 1) {
      // Überschrift
      const headingText = item.children[0].text;
      footerContent += `<h1>${headingText}</h1>\n`;
    } else if (item.type === "paragraph") {
      // Paragraph mit möglichen Links
      let paragraphContent = "";
      
      item.children.forEach((child) => {
        if (child.type === "text") {
          paragraphContent += child.text;
        } else if (child.type === "link" && child.url) {
          const linkText = child.children[0].text;
          paragraphContent += `<a href="${child.url}">${linkText}</a>`;
        }
      });
      
      footerContent += `<p>${paragraphContent}</p>\n`;
    }
  });
  
  // Inhalt in DOM einfügen
  container.innerHTML = footerContent;
  logger.log("Footer-Inhalte erfolgreich geladen");
}

export default {
  init
};