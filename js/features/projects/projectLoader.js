/**
 * @module projectLoader
 * @description Verantwortlich für das Erstellen und Rendern der Projektinhalte.
 * 
 * @listens DATA_LOADED - Registriert mit init()
 * @fires DOM_STRUCTURE_READY - Signalisiert fertige DOM-Struktur
 */

import { EVENT_TYPES, addEventListener, dispatchCustomEvent } from '../../core/events.js';
import dataStore from '../../core/dataStore.js';
import { fixImagePath } from '../../core/utils.js';

/**
 * Initialisiert den projectLoader
 * Registriert Event-Listener für PROEJCT_DATA_LOADED
 */
function init() {
  console.log("projectLoader: Initialisierung");
  
  // Auf Datenladung reagieren
  addEventListener(EVENT_TYPES.PROJECT_DATA_LOADED, async (event) => {
    console.log("projectLoader: EVENT PROJECT_DATA_LOADED empfangen", event);
    
    try {
      // DOM-Struktur erstellen
      await createProjectElements();
      
      // Explizit loggen
      console.log("projectLoader: DOM-Struktur erstellt, sende DOM_STRUCTURE_READY");
      
      // Nächste Phase signalisieren: DOM-Struktur bereit
      dispatchCustomEvent(EVENT_TYPES.DOM_STRUCTURE_READY);
    } catch (error) {
      console.error("Fehler beim Erstellen der DOM-Struktur:", error);
    }
  });
}

/**
 * Erstellt die DOM-Elemente für alle Projekte
 */
async function createProjectElements() {
  const projectsData = dataStore.getProjects();
  const container = document.querySelector(".project-container");

  if (!container) {
    console.error("Fehler: Project-Container nicht gefunden");
    return false;
  }

  // Container komplett leeren
  container.innerHTML = "";

  // Projekte erstellen
  if (projectsData && projectsData.data) {
    // HTML für alle Projekte erstellen
    for (const project of projectsData.data) {
      // Bilder-HTML erstellen
      let imagesHTML = "";
      if (project.project_images && project.project_images.length > 0) {
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
        >  
          <div class="swiper">
            <div class="swiper-wrapper">
              ${imagesHTML}
            </div>
          </div>
        </article>
      `;

      container.insertAdjacentHTML("beforeend", projectHTML);
    }
  }
  
  return true;
}

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
          loading="lazy"
        />
      </picture>
    </div>
  `;

}

// Öffentliche API des Moduls
export default {
  init
};