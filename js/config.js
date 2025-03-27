/**
 * @module config
 * @description Zentrale Konfigurationsdatei für die gesamte Anwendung.
 * Enthält API-URLs, Endpunkte und Fallback-Daten für eine bessere Wartbarkeit.
 */

// Bestehende Variablen weiterverwenden (nicht neu deklarieren)
export const IS_DEVELOPMENT = true; // Für Produktion auf false setzen
export const BASE_URL = IS_DEVELOPMENT ? 'https://brendabuettner.de' : '';
export const API_URL = `${BASE_URL}/api`;

// Nur neue Definitionen hinzufügen
// API-Endpunkte zentral definiert
export const API_ENDPOINTS = {
  projects: `${API_URL}/projects?populate[project_images][populate]=image&sort=rank:asc`,
  about: `${API_URL}/about`,
  clients: `${API_URL}/clients?populate=projects&sort=name:asc`,
  footer: `${API_URL}/footer`
};

// Fallback-Daten für robustere Fehlerbehandlung
export const FALLBACK_DATA = {
  projects: { 
    data: [],
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } }
  },
  about: { 
    data: {
      intro: [{ type: "paragraph", children: [{ text: "Information temporarily unavailable", type: "text" }] }],
      imprint: [{ type: "paragraph", children: [{ text: "Information temporarily unavailable", type: "text" }] }]
    } 
  },
  clients: { 
    data: [],
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } }
  },
  footer: {
    data: {
      getincontact: [
        { type: "heading", level: 1, children: [{ text: "Contact", type: "text" }] },
        { type: "paragraph", children: [{ text: "Information temporarily unavailable", type: "text" }] }
      ]
    }
  }
};