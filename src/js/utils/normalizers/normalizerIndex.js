/**
 * @module normalizers/index
 * @description Zentrale Exportdatei für alle Datennormalisierer.
 * Ermöglicht einfachen Import aller Normalizer über einen Pfad.
 * 
 * Jeder Normalizer transformiert spezifische Datentypen in ein standardisiertes
 * Format, das von der Anwendung erwartet wird.
 */

// Exportiere alle Normalisierer für einheitlichen Zugriff
export { normalizeProjectData } from './projectNormalizer.js';
export { normalizeAboutData } from './aboutNormalizer.js';
export { normalizeClientsData } from './clientsNormalizer.js';
export { normalizeFooterData } from './footerNormalizer.js';
export { normalizeGlobalSettingsData } from './globalSettingsNormalizer.js';