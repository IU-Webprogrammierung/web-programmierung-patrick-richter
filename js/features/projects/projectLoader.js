/**
 * @module projectLoader
 * @description Verantwortlich für das Erstellen und Rendern der Projektinhalte.
 * Generiert Projekt-DOM-Elemente basierend auf den JSON-Daten.
 */

import dataStore from "../../core/dataStore.js";
import uiState from "../../core/uiState.js";
import { getValidatedElement, fixImagePath } from "../../core/utils.js";
import swiperInitializer from "../imageViewer/swiperInitializer.js";
import customPagination from '../imageViewer/customPagination.js';
import { setupImageNavigation } from "../imageViewer/imageNavigation.js";
import { setupScrollHandler } from "./projectNavigation.js";
import { setupProjectTitle } from "./projectTitle.js";
import { setupProjectIndicator } from "./projectIndicator.js";
import { closeFooter } from "./projectNavigation.js";
import { setupImageColorHandler } from "../imageViewer/imageColorHandler.js";

/**
 * Erstellt HTML für ein responsives Bild mit optimierter Auswahl für verschiedene Geräte
 * @param {Object} imageData - Die Bilddaten mit allen Formaten
 * @returns {string} - HTML für das Bild mit picture/source-Tags
 */
function createResponsiveImageHTML(imageData) {
  const imageObj = imageData?.image?.[0];
  if (!imageObj) {
    console.warn(`Keine Bilddaten gefunden für: ${imageData?.imageTitle || "Unbekanntes Bild"}`);
    return `<div class="swiper-slide"><picture><img src="images/placeholder.png" alt="Bildvorschau nicht verfügbar"/></picture></div>`;
  }

  const textColor = imageData.textColor || "black";
  const imageId = imageData.id;
  const imageTitle = imageData.imageTitle || "";
  const altText = imageObj.alternativeText || imageTitle || "";
  const fullImageUrl = fixImagePath(imageObj.url);

  // Sammle srcset-Einträge nach Format
  let webpSrcset = [];
  let standardSrcset = [];

  // Optimierter Code für die Sammlung von Bildformaten
  if (imageObj.formats) {
    Object.entries(imageObj.formats).forEach(([key, format]) => {
      if (!format || !format.url) return;

      const formatUrl = fixImagePath(format.url);
      const formatWidth = format.width || 0;

      if (formatWidth > 0) {
        // Nach Typ sortieren und intelligent aufnehmen
        if (key === "webp") {
          // Original WebP aufnehmen - wird als "xlarge" Option behandelt
          webpSrcset.push(`${formatUrl} ${formatWidth}w`);
        } else if (key.endsWith("-webp")) {
          // Optimierte WebP-Versionen
          webpSrcset.push(`${formatUrl} ${formatWidth}w`);
        } else if (key !== "thumbnail") {
          // Standard-Formate (JPG, PNG, etc.) - aber keine Thumbnails in srcset
          standardSrcset.push(`${formatUrl} ${formatWidth}w`);
        }
      }
    });

    // Auch das Original in standardSrcset aufnehmen, wenn es nicht WebP ist
    if (imageObj.mime !== "image/webp") {
      standardSrcset.push(`${fullImageUrl} ${imageObj.width}w`);
    }
  }

  // Sortieren der srcsets nach Bildgröße (aufsteigend)
  webpSrcset.sort((a, b) => {
    const widthA = parseInt(a.split(" ")[1]);
    const widthB = parseInt(b.split(" ")[1]);
    return widthA - widthB;
  });

  standardSrcset.sort((a, b) => {
    const widthA = parseInt(a.split(" ")[1]);
    const widthB = parseInt(b.split(" ")[1]);
    return widthA - widthB;
  });

  // Debug-Ausgabe für Entwicklung
  if (webpSrcset.length > 0) {
    console.log(`WebP-Optionen für ${imageTitle}:`, webpSrcset.join(", "));
  }

  // Genauere Größendefinition für unterschiedliche Viewport-Größen
  // Annahme: Bilder nehmen auf allen Geräten die volle Breite ein
  const sizes = "(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 100vw";

  // Quellen mit korrekter Formatierung
  let sources = [];
  if (webpSrcset.length > 0) {
    sources.push(`<source srcset="${webpSrcset.join(", ")}" sizes="${sizes}" type="image/webp">`);
  }
  if (standardSrcset.length > 0) {
    sources.push(`<source srcset="${standardSrcset.join(", ")}" sizes="${sizes}" type="${imageObj.mime || "image/jpeg"}">`);
  }

  return `
    <div class="swiper-slide" data-id="${imageId}" data-text-color="${textColor}" data-image-title="${imageTitle}">
      <picture>
        ${sources.join("\n        ")}
        <img 
          src="${fullImageUrl}" 
          alt="${altText}" 
          onerror="this.onerror=null; this.src='images/placeholder.png';"
        />
      </picture>
    </div>
  `;

}

// Erzeugt den Footer-HTML-Code aus den JSON-Daten
function createFooterHTML() {
  const footerData = dataStore.getFooter();

  if (!footerData || !footerData.data || !footerData.data.getincontact) {
    console.warn("Keine Footer-Daten gefunden!");
    // Fallback für den Fall, dass keine Daten vorhanden sind
    return `
      <div class="footer-top" id="footerTop"></div>
      <div class="footer">
        <h1>Let's work together!</h1>
        <p>Contact me via <a href="mailto:test@test.de">test@test.de</a></p>
      </div>
    `;
  }

  // Content aus der JSON-Datei verarbeiten
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

  return `
    <div class="footer-top" id="footerTop"></div>
    <div class="footer">
      ${footerContent}
    </div>
  `;
}

// Erstellt die DOM-Elemente für alle Projekte
export async function createProjectElements() {
  const projectsData = dataStore.getProjects();
  const container = document.querySelector(".project-container");

  if (!container) {
    console.error("Fehler: Project-Container nicht gefunden");
    return;
  }

  // Scroll-Snap temporär deaktivieren
  const originalSnapType = container.style.scrollSnapType;
  container.style.scrollSnapType = "none";

  // Container komplett leeren
  container.innerHTML = "";

  if (projectsData && projectsData.data) {
    // HTML für alle Projekte erstellen
    for (const project of projectsData.data) {
      // Bilder-HTML mit der integrierten Funktion erstellen
      let imagesHTML = "";
      if (project.project_images && project.project_images.length > 0) {
        // Für jedes Bild des Projekts asynchron HTML erzeugen
        const imagePromises = project.project_images.map((img) =>
          createResponsiveImageHTML(img)
        );
        const imageHTMLs = await Promise.all(imagePromises);
        imagesHTML = imageHTMLs.join("");
      }

      // Eindeutige IDs für Accessibility
      const projectTitleId = `project-title-${project.id}`;

      // Gesamtes Projekt-HTML
      const projectHTML = `
        <article 
          class="project" 
          aria-labelledby="${projectTitleId}"
          data-project-id="${project.id}"
          data-project-name="${project.name}"
          data-project-description="${project.description[0]?.children[0]?.text || ""}"
        >  <div class="swiper">
    <div class="swiper-wrapper">
      ${imagesHTML}
    </div>
  </div>
</article>
      `;

      container.insertAdjacentHTML("beforeend", projectHTML);
    }
  }

  // Neuen dynamischen Footer erstellen und einfügen
  const footerInnerHTML = createFooterHTML();
  const footerHTML = `
  <footer class="project footer-container" aria-label="Footer with Email Link">
    ${footerInnerHTML}
  </footer>
`;
  container.insertAdjacentHTML("beforeend", footerHTML);

  // Event-Listener für den Footer-Top-Bereich neu hinzufügen
  const footerTopElement = getValidatedElement("#footerTop");
  if (footerTopElement) {
    footerTopElement.addEventListener("click", closeFooter);
  }

  // TODO hier Logging für erweitere Bildanalyse einfügen

  // Am Ende: Zum ersten Projekt scrollen und dann Snap wiederherstellen
  setTimeout(() => {
    // Scrolle zum Anfang
    container.scrollTop = 0;

    // Warte kurz für DOM-Updates
    setTimeout(() => {
      // Scroll-Snap wiederherstellen
      container.style.scrollSnapType = originalSnapType;

      // UI-Status aktualisieren
      uiState.updateProjects();

      // UI-Komponenten initialisieren
      setupProjectTitle();
      setupProjectIndicator();
      setupImageColorHandler();
      setupImageNavigation();
      setupScrollHandler();
      swiperInitializer.init();
      customPagination.init();
    }, 50);
  }, 50);
}
