/**
 * @module projectLoader
 * @description Enthält alle Inhalte zur Befüllung der Projekte und des weiteren Inhalts:
 * initializeWebsite(),
 * createProjectElements(),
 * createAboutImprintSection
 */

import dataStore from "../../core/dataStore.js";
import uiState from "../../core/uiState.js";
import { setupScrollHandler } from "./projectNavigation.js";
import { setupProjectTitle } from "./projectTitle.js";
import { setupImageColorHandler } from "../imageViewer/imageColorHandler.js";
import { setupImageNavigation } from "../imageViewer/imageNavigation.js";
import { scrollToProject } from "./projectNavigation.js";
import { hideOverlay } from "../overlay/overlayController.js";

export async function initializeWebsite() {
  console.log("initializeWebsite: Initialize Website gestartet");
  const success = await dataStore.loadData();
  console.log("initializeWebsite: Geladene Daten:", success);
  if (success) {
    console.log("initializeWebsite: Loading of projects and about successful!");
    createProjectElements();
    createAboutImprintSection();
  } else {
    console.log("initializeWebsite: Loading failed - no data returned");
  }
}

export function createProjectElements() {
  const projectsData = dataStore.getProjects();
  const container = document.querySelector(".project-container");

  // TODO Scroll-Snap temporär deaktivieren - vielleicht mit REACT entfernen?
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
      // Bilder-HTML erstellen (falls vorhanden)
      let imagesHTML = "";
      if (project.project_images && project.project_images.length > 0) {
        imagesHTML = project.project_images
          .map(
            (img) => `
                      <img 
                          src="${img.image[0].url}" 
                          alt="${img.image[0].alt || project.name}" 
                          data-id="${img.id}"
                          data-text-color="${img.textColor}"
                          data-image-title="${img.imageTitle}"
                          class="slide"
                      />
                  `
          )
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

export function createAboutImprintSection() {
  const aboutImprintData = dataStore.getAboutImprint();
  const clientsData = dataStore.getClients();

  const aboutIntro = document.querySelector(".about-intro");
  const clientsList = document.querySelector(".about-clients ul");
  const imprintContent = document.querySelector(".imprint-content");

  // About-Intro füllen
  if (
    aboutImprintData &&
    aboutImprintData.data &&
    aboutImprintData.data.intro
  ) {
    const introParagraphs = aboutImprintData.data.intro
      .map((paragraph) => {
        const content = paragraph.children
          .map((child) => {
            if (child.type === "link") {
              return `<a href="${child.url}">${child.children[0].text}</a>`;
            }
            return child.text;
          })
          .join("");

        return `<p>${content}</p>`;
      })
      .join("");

    aboutIntro.innerHTML = introParagraphs;
  }

  // Clients-Liste füllen
  if (!clientsData || !clientsData.data || clientsData.data.length === 0) {
    console.warn("Keine Clients-Daten gefunden oder leere Liste");
    return; // Beende die Funktion, um weitere Fehler zu vermeiden
  }

  if (clientsData && clientsData.data) {
    console.log("Clients-Daten gefunden:", clientsData.data);

    // Liste leeren und Titel-Element vorbereiten
    clientsList.innerHTML = "";

    // Titel-Element erstellen
    const titleLi = document.createElement("li");
    titleLi.id = "clients-title";
    titleLi.className = "clients-label";
    titleLi.setAttribute("role", "heading");
    titleLi.setAttribute("aria-level", "2");
    titleLi.textContent = "Clients";
    clientsList.appendChild(titleLi);

    // Alphabetisch nach Namen sortieren
    const sortedClients = [...clientsData.data].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Clients in die Liste einfügen
    sortedClients.forEach((client) => {
      const li = document.createElement("li");

      // Prüfen, ob Client Projekte hat
      // TODO Hover images einfügen
      if (client.projects && client.projects.length > 0) {
        // Client mit Projekt(en) - als Link darstellen
        const project = client.projects[0]; // Erstes Projekt nehmen

        // Link-Element erstellen mit einfachem ARIA-Label
        const link = document.createElement("a");
        link.href = "#";
        link.className = "about-clients-project-link";
        link.setAttribute("data-project-id", project.id);
        link.textContent = client.name;
        link.setAttribute("aria-label", `${client.name} Projekt anzeigen`);

        // Event-Listener für Klick hinzufügen
        link.addEventListener("click", function (e) {
          e.preventDefault();
          hideOverlay(); // Overlay schließen

          // Zum Projekt scrollen (mit kurzer Verzögerung für Animation)
          // TODO ggf zentrale Funktion scrollToTop umwandeln (brauche ich später noch für Index)
          setTimeout(() => {
            scrollToProject(project.id);
          }, 300);
        });

        li.appendChild(link);
      } else {
        // Client ohne Projekte - als normaler Text
        li.textContent = client.name;
      }

      clientsList.appendChild(li);
    });

    console.log("Clients-Liste mit Links gefüllt");
  } else {
    console.warn("Keine Clients-Daten gefunden");
  }

  // Imprint-Inhalt füllen
  if (
    aboutImprintData &&
    aboutImprintData.data &&
    aboutImprintData.data.imprint
  ) {
    // Bestehenden Inhalt leeren
    imprintContent.innerHTML = "";

    // Imprint-Daten verarbeiten
    const imprintHtml = aboutImprintData.data.imprint
      .map((paragraph) => {
        // Inhalte des Paragraphen verarbeiten
        const children = paragraph.children || [];
        const content = children
          .map((child) => {
            // Wenn es ein Link ist
            if (child.type === "link") {
              return `<a href="${child.url}">${child.children[0].text}</a>`;
            }

            // Normaler Text (mit oder ohne bold)
            return child.text;
          })
          .join("");

        // Wenn einer der Children bold ist, als h2 darstellen
        const isBold = children.some((child) => child.bold === true);

        if (isBold) {
          return `<h2>${content}</h2>`;
        } else {
          return `<p>${content}</p>`;
        }
      })
      .join("");

    // HTML einfügen
    imprintContent.innerHTML = imprintHtml;
    console.log("Imprint-Inhalt gesetzt");
  } else {
    console.warn("Keine Imprint-Daten gefunden");
  }
}
