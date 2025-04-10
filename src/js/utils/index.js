/**
 * @module utils
 * @description Zentrale Exportdatei für alle Hilfsfunktionen der Anwendung.
 * Ermöglicht den einheitlichen Import aller Utility-Funktionen aus verschiedenen Bereichen.
 * 
 * Diese Datei bündelt folgende Utility-Module:
 * - animationUtils - Animationen und Übergänge
 * - domUtils - DOM-Manipulationen und -Validierung
 * - mediaUtils - Bild- und Medienfunktionen
 * - normalizerUtils - Daten-Normalisierung
 * - routerUtils - Routing- und URL-Hilfsfunktionen
 * - navigationUtils - Navigation zwischen Projekten
 * - normalizeUtils - Datennormalisierung
 */

// DOM-Utilities
export * from './domUtils.js';

// Media-Utilities
export * from './mediaUtils.js';

// Routing-Utilities
export * from './routerUtils.js';

// Navigations-Utilities
export * from './navigationUtils.js';

// Animations-Utilities
export * from './animationUtils.js';

// Normalisierungs-Utilities
export * from './normalizerUtils.js';

