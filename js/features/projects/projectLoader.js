/**
 * @module projectLoader
 * @description Verantwortlich für das Erstellen und Rendern der Projektinhalte.
 * Generiert Projekt-DOM-Elemente basierend auf den JSON-Daten.
 *
 * Funktionen: createProjectElements(), createResponsiveImageHTML()
 */

import dataStore from "../../core/dataStore.js";
import uiState from "../../core/uiState.js";
import {
  getValidatedElement,
  fixImagePath,
} from "../../core/utils.js";
import { setupScrollHandler } from "./projectNavigation.js";
import { setupProjectTitle } from "./projectTitle.js";
import { setupProjectIndicator } from "./projectIndicator.js";
import { closeFooter } from "./projectNavigation.js";
import { setupImageColorHandler } from "../imageViewer/imageColorHandler.js";
import { setupImageNavigation } from "../imageViewer/imageNavigation.js";

function createResponsiveImageHTML(imageData) {
  // Das erste Element des image-Arrays verwenden, mit Fehlerbehandlung
  const imageObj = imageData?.image?.[0];
  if (!imageObj) {
    console.warn(`Keine Bilddaten gefunden für: ${imageData?.imageTitle || 'Unbekanntes Bild'}`);
    return `
      <picture>
        <img 
          src="images/placeholder.png" 
          alt="Bildvorschau nicht verfügbar" 
          class="slide"
        />
      </picture>
    `; 
  }
  
  const textColor = imageData.textColor || "black";
  const imageId = imageData.id;
  const imageTitle = imageData.imageTitle || "";
  const altText = imageObj.alternativeText || imageTitle || "";

  // Basis-URL für das Originalbild
  const fullImageUrl = fixImagePath(imageObj.url);
  
  // Gruppiere Formate nach Typ (Standard vs. WebP)
  const standardFormats = {};
  const webpFormats = {};
  
  if (imageObj.formats) {
    // Formate nach Typ gruppieren
    Object.entries(imageObj.formats).forEach(([key, format]) => {
      if (key === 'webp' || key.endsWith('-webp')) {
        webpFormats[key] = format;
      } else {
        standardFormats[key] = format;
      }
    });
  }
  
  // Prüfe, ob der Browser WebP unterstützt
  const supportsWebP = (function() {
    // In einer realen Implementierung würde hier die Browser-Erkennung stehen
    // Für dieses Beispiel nehmen wir an, dass WebP unterstützt wird
    return true;
  })();
  
  // Erstelle srcset für Standard-Formate (JPEG/PNG)
  const srcsetEntries = Object.values(standardFormats)
    .filter(format => format && format.url)
    .map(format => {
      const url = fixImagePath(format.url);
      return `${url} ${format.width}w`;
    });
  
  // Füge das Original zum srcset hinzu
  if (imageObj.url) {
    srcsetEntries.push(`${fullImageUrl} ${imageObj.width}w`);
  }
  
  // Erstelle srcset für WebP-Formate, wenn unterstützt
  let webpSrcsetEntries = [];
  if (supportsWebP) {
    webpSrcsetEntries = Object.values(webpFormats)
      .filter(format => format && format.url)
      .map(format => {
        const url = fixImagePath(format.url);
        return `${url} ${format.width}w`;
      });
  }
  
  // Erstelle sizes-Attribut für responsive Bilder
  const sizes = `
    (max-width: 700px) 100vw, 
    (max-width: 1200px) 100vw, 
    100vw
  `.replace(/\s+/g, ' ').trim();
  
  // Erstelle das picture-Element mit WebP-Unterstützung
  return `
    <picture>
      ${webpSrcsetEntries.length ? `<source srcset="${webpSrcsetEntries.join(', ')}" sizes="${sizes}" type="image/webp">` : ''}
      ${srcsetEntries.length ? `<source srcset="${srcsetEntries.join(', ')}" sizes="${sizes}" type="${imageObj.mime || 'image/jpeg'}">` : ''}
      <img 
        src="${fullImageUrl}" 
        alt="${altText}" 
        data-id="${imageId}"
        data-text-color="${textColor}"
        data-image-title="${imageTitle}"
        class="slide"
        loading="lazy"
        onerror="this.onerror=null; this.src='images/placeholder.png';"
      />
    </picture>
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
        >
          <div class="slider">
            ${imagesHTML}
          </div>
          <div class="description desktop-only" id="${projectTitleId}">
            ${project.description[0]?.children[0]?.text || ""}
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
      setupProjectIndicator();
      setupProjectTitle();
      setupImageColorHandler();
      setupImageNavigation();
      setupScrollHandler();

      // WebP-Zusammenfassung aus dataStore importieren und ausgeben
      import("../../core/dataStore.js").then((module) => {
        console.log(module.getWebpSummary());
      });
    }, 50);
  }, 50);
}
