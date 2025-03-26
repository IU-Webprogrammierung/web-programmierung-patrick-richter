/**
 * @module config
 * @description Zentrale Konfigurationsdatei für umgebungsspezifische Einstellungen.
 * Ermöglicht einfachen Wechsel zwischen Entwicklungs- und Produktionsumgebung.
 */

export const IS_DEVELOPMENT = true; // TODO: Für Produktion auf false ändern

// Basis-URL je nach Umgebung
export const BASE_URL = IS_DEVELOPMENT ? 'https://brendabuettner.de' : '';

// API-URL basierend auf der Basis-URL
export const API_URL = `${BASE_URL}/api`;