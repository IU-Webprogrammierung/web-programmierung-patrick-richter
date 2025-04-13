/**
 * @module config
 * @description Zentrale Konfigurationsdatei für die gesamte Anwendung.
 * Enthält API-URLs, Endpunkte und Fallback-Daten für eine bessere Wartbarkeit.
 *
 * Die Konfiguration ist nach Umgebungen unterteilt und enthält alle externen Abhängigkeiten
 * der Anwendung an einem zentralen Ort.
 */

// Umgebungsvariablen
export const IS_DEVELOPMENT = true; // Für Produktion auf false setzen
export const BASE_URL = IS_DEVELOPMENT ? "https://brendabuettner.de" : "";
export const API_URL = `${BASE_URL}/api`;

// API-Endpunkte zentral definiert
export const API_ENDPOINTS = {
  projects: `${API_URL}/projects?populate[project_images][populate]=image&sort=rank:asc`,
  about: `${API_URL}/about`,
  clients: `${API_URL}/clients?populate=projects&sort=name:asc`,
  footer: `${API_URL}/footer`,
  globalSettings: `${API_URL}/global-setting?populate=default_seo_image`,
};

// Fallback-Daten für robustere Fehlerbehandlung
export const FALLBACK_DATA = {
  projects: {
    data: [],
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } },
  },
  about: {
    data: {
      intro: [
        {
          type: "paragraph",
          children: [
            { text: "Information temporarily unavailable", type: "text" },
          ],
        },
      ],
      imprint: [
        {
          type: "paragraph",
          children: [
            { text: "Information temporarily unavailable", type: "text" },
          ],
        },
      ],
    },
  },
  clients: {
    data: [],
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } },
  },
  footer: {
    data: {
      getincontact: [
        {
          type: "heading",
          level: 1,
          children: [{ text: "Contact", type: "text" }],
        },
        {
          type: "paragraph",
          children: [
            { text: "Information temporarily unavailable", type: "text" },
          ],
        },
      ],
    },
  },
  globalSettings: {
    data: {
      person_name: "Brenda Büttner",
      person_job_title: "Art Directorin und Grafikdesignerin",
      social_link: "https://www.instagram.com/buettner.brenda/",
      about_description:
        "Über Brenda Büttner, Art Directorin und Grafikdesignerin aus Hamburg spezialisiert auf Editorial Design, UI / UX Design und Branding.",
      imprint_description:
        "Impressum und rechtliche Informationen - Brenda Büttner Portfolio",
      default_seo_description:
        "Brenda Büttner, Art Directorin und Grafikdesignerin aus Hamburg",
      default_seo_image: null,
    },
  },
};
