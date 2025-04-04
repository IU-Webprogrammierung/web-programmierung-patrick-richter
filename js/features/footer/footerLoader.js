/**
 * @module footerLoader
 * @description Lädt und konfiguriert den Footer-Inhalt
 */

import { EVENT_TYPES, addEventListener } from '../../core/events.js';
import dataStore from "../../core/dataStore.js";

// Auf DOM-Struktur-Bereitschaft reagieren
addEventListener(EVENT_TYPES.DOM_STRUCTURE_READY, () => {
  console.log("footerLoader: Initialisiere Footer");
  
  // Footer initial unsichtbar machen (wird von APP_INIT_COMPLETE sichtbar gemacht)
  const footerElement = document.getElementById("site-footer");
  if (footerElement) {
    footerElement.style.visibility = 'hidden';
  }
  
  // Inhalte laden
  loadFooterContent();
  
  // Nach APP_INIT_COMPLETE Footer sichtbar machen
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    if (footerElement) {
      footerElement.style.visibility = 'visible';
    }
  });
});

/**
 * Lädt Footer-Inhalte aus dem dataStore und aktualisiert das DOM
 */
export function loadFooterContent() {
  console.log("Lade Footer-Inhalte...");
  
  const container = document.querySelector(".footer-content");
  if (!container) {
    console.error("Footer-Container nicht gefunden - keine .footer-content im DOM");
    return;
  }
  
  const footerData = dataStore.getFooter();
  
  if (!footerData || !footerData.data || !footerData.data.getincontact) {
    console.warn("Keine Footer-Daten gefunden - Fallback wird verwendet");
    
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
  console.log("Footer-Inhalte erfolgreich geladen");
}