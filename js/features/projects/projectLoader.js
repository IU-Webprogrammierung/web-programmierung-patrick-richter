/**
 * @module projectLoader
 * @description Verantwortlich für das Erstellen und Rendern der Projektinhalte.
 * Generiert Projekt-DOM-Elemente basierend auf den JSON-Daten und richtet weitere
 * Module ein, um die Funktionalität der Projekte zu gewährleisten.
 * 
 * Funktionen: createProjectElements(), createResponsiveImageHTML()
 */

import dataStore from "../../core/dataStore.js";
import uiState from "../../core/uiState.js";
import { setupScrollHandler } from "./projectNavigation.js";
import { setupProjectTitle } from "./projectTitle.js";
import { setupImageColorHandler } from "../imageViewer/imageColorHandler.js";
import { setupImageNavigation } from "../imageViewer/imageNavigation.js";

/**
 * Erstellt das HTML für ein responsives Bild mit WebP-Support
 * @param {Object} imageData - Die Bilddaten aus der JSON
 * @returns {string} HTML-String mit picture, source und img-Tags
 */
function createResponsiveImageHTML(imageData) {
  // Das erste Element des image-Arrays verwenden
  const imageObj = imageData.image[0];
  const textColor = imageData.textColor || "black";
  const imageId = imageData.id;
  const imageTitle = imageData.imageTitle || "";
  const altText = imageObj.alternativeText || imageTitle || "";
  
  // Basis-URL für Fallback
  const baseUrl = imageObj.url;
  
  // Gruppieren der Formate nach Typ (WebP vs. Original) und Größe
  const formats = {
    webp: {}, // WebP-Formate nach Größe
    original: {} // Original-Formate nach Größe
  };
  
  // Formate strukturieren
  if (imageObj.formats) {
    Object.entries(imageObj.formats).forEach(([formatKey, formatData]) => {
      // Ist es ein WebP-Format?
      const isWebP = formatKey.endsWith('-webp') || formatData.mime === 'image/webp';
      
      // Größenname bestimmen (z.B. "large" aus "large-webp")
      const sizeName = isWebP ? formatKey.replace('-webp', '') : formatKey;
      
      // Format in die richtige Kategorie einsortieren
      if (isWebP) {
        formats.webp[sizeName] = formatData;
      } else {
        formats.original[sizeName] = formatData;
      }
    });
  }
  
  // Erzeugt srcset für einen Formattyp (WebP oder Original)
  function createSrcset(formatType) {
    const sizeOrder = { large: 3, medium: 2, small: 1 };
    
    return Object.entries(formats[formatType])
      .filter(([size]) => size !== 'thumbnail') // Thumbnails ausschließen
      .sort(([sizeA], [sizeB]) => {
        // Nach Größe sortieren (large vor medium vor small)
        return (sizeOrder[sizeB] || 0) - (sizeOrder[sizeA] || 0);
      })
      .map(([_, data]) => `${data.url} ${data.width}w`)
      .join(", ");
  }
  
  // srcset-Strings für beide Formattypen erstellen
  const webpSrcset = Object.keys(formats.webp).length > 0 ? createSrcset('webp') : '';
  const originalSrcset = Object.keys(formats.original).length > 0 ? createSrcset('original') : '';
  
  // Sizes-Attribut - für verschiedene Viewports anpassen
  const sizes = "(max-width: 768px) 100vw, 100vw";
  
  // Picture-Element mit WebP-Support erstellen
  return `
    <picture>
      ${webpSrcset ? `<source srcset="${webpSrcset}" sizes="${sizes}" type="image/webp">` : ''}
      ${originalSrcset ? `<source srcset="${originalSrcset}" sizes="${sizes}" type="${imageObj.mime || 'image/jpeg'}">` : ''}
      <img 
        src="${baseUrl}" 
        alt="${altText}" 
        data-id="${imageId}"
        data-text-color="${textColor}"
        data-image-title="${imageTitle}"
        class="slide"
        loading="lazy" 
      />
    </picture>
  `;
}

/**
 * Erstellt die DOM-Elemente für alle Projekte
 */
export function createProjectElements() {
  const projectsData = dataStore.getProjects();
  const container = document.querySelector(".project-container");

  if (!container) {
    console.error("Fehler: Project-Container nicht gefunden");
    return; // Frühe Rückgabe, wenn Element fehlt
  }

  // Scroll-Snap temporär deaktivieren
  const originalSnapType = container.style.scrollSnapType;
  container.style.scrollSnapType = "none";

  // Footer speichern und entfernen
  const footerElement = container.querySelector(".footer-container");
  if (footerElement) {
    footerElement.remove();
  }

  // Container komplett leeren
  container.innerHTML = "";

  if (projectsData && projectsData.data) {
    projectsData.data.forEach((project) => {
      // Bilder-HTML mit der integrierten Funktion erstellen
      let imagesHTML = "";
      if (project.project_images && project.project_images.length > 0) {
        imagesHTML = project.project_images
          .map(img => createResponsiveImageHTML(img))
          .join("");
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
            ${project.description[0].children[0].text}
          </div>
        </article>
      `;

      container.insertAdjacentHTML("beforeend", projectHTML);
    });
  }
  
  if (footerElement) {
    // Footer anhängen und "hidden" entfernen
    container.appendChild(footerElement);
    footerElement.classList.remove("hidden-footer");
  }
  
  // Am Ende: Zum ersten Projekt scrollen und dann Snap wiederherstellen
  setTimeout(() => {
    container.scrollTop = 0;
    setTimeout(() => {
      container.style.scrollSnapType = originalSnapType;
      uiState.updateProjects();

      setupScrollHandler();
      setupProjectTitle();
      setupImageColorHandler();
      setupImageNavigation();
    }, 50);
  }, 50);
  
  uiState.updateProjects();
}