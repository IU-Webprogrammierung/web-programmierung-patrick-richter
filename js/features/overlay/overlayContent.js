/**
 * @module overlayContent
 * @description Erstellt und verwaltet die Inhalte des Overlay-Dialogs (About und Imprint).
 * Verantwortlich für die Erstellung von About-Intro, Client-Liste und Imprint-Inhalten
 * basierend auf den Daten aus dem zentralen Datenspeicher.
 */

import dataStore from "../../core/dataStore.js";
import { hideOverlay } from "./overlayController.js";
import { scrollToProject } from "../projects/projectNavigation.js";

// Erstellt die About- und Imprint-Inhalte im Overlay

export function createAboutImprintSection() {
  try {
    const aboutImprintData = dataStore.getAboutImprint();
    const clientsData = dataStore.getClients();

    const aboutIntro = document.querySelector(".about-intro");
    const clientsList = document.querySelector(".about-clients ul");
    const imprintContent = document.querySelector(".imprint-content");

    if (!aboutIntro || !clientsList || !imprintContent) {
      console.error("Fehler: About/Imprint-Elemente nicht gefunden");
      return;
    }

    // About-Intro erstellen
    createAboutIntro(aboutIntro, aboutImprintData);

    // Client-Liste erstellen
    createClientsList(clientsList, clientsData);

    // Imprint-Inhalt erstellen
    createImprintContent(imprintContent, aboutImprintData);
  } catch (error) {
    console.error("Fehler beim Erstellen der About/Imprint-Inhalte:", error);
  }
}

// Erstellt den About-Intro-Bereich

function createAboutIntro(container, aboutImprintData) {
  if (
    !aboutImprintData ||
    !aboutImprintData.data ||
    !aboutImprintData.data.intro
  ) {
    console.warn("Keine About-Intro-Daten gefunden");
    return;
  }

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

  container.innerHTML = introParagraphs;
}

// Erstellt die Client-Liste

function createClientsList(container, clientsData) {
  if (!clientsData || !clientsData.data || clientsData.data.length === 0) {
    console.warn("Keine Clients-Daten gefunden");
    return;
  }

  // Liste leeren und Titel-Element vorbereiten
  container.innerHTML = "";

  // Titel-Element erstellen
  const titleLi = document.createElement("li");
  titleLi.id = "clients-title";
  titleLi.className = "clients-label";
  titleLi.setAttribute("role", "heading");
  titleLi.setAttribute("aria-level", "2");
  titleLi.textContent = "Clients";
  container.appendChild(titleLi);

  // Alphabetisch nach Namen sortieren
  const sortedClients = [...clientsData.data].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Clients in die Liste einfügen
  sortedClients.forEach((client) => {
    const li = document.createElement("li");

    // Prüfen, ob Client Projekte hat
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
        setTimeout(() => {
          scrollToProject(project.id);
        }, 300);
      });

      li.appendChild(link);
    } else {
      // Client ohne Projekte - als normaler Text
      li.textContent = client.name;
    }

    container.appendChild(li);
  });
}

// Erstellt den Imprint-Inhalt

function createImprintContent(container, aboutImprintData) {
  if (
    !aboutImprintData ||
    !aboutImprintData.data ||
    !aboutImprintData.data.imprint
  ) {
    console.warn("Keine Imprint-Daten gefunden");
    return;
  }

  // Bestehenden Inhalt leeren
  container.innerHTML = "";

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
  container.innerHTML = imprintHtml;
}
