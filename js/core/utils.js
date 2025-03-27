/**
 * @module utils
 * @description Zentrale Sammlung von Hilfsfunktionen für die gesamte Anwendung.
 *
 * Funktionen: validateElement(), getValidatedElement(),
 */

import { BASE_URL } from '../config.js';

/**
 * Überprüft, ob ein DOM-Element existiert und gibt eine Fehlermeldung aus, wenn nicht.
 *
 * @param {Element|null} element - Das zu überprüfende DOM-Element
 * @param {string} errorMessage - Die Fehlermeldung, die bei nicht existierendem Element ausgegeben wird
 * @param {string} [level='error'] - Level des Logs ('log', 'warn', 'error')
 * @returns {boolean} - True, wenn das Element existiert, sonst false
 */
export function validateElement(element, errorMessage, level = "error") {
  if (!element) {
    console[level](errorMessage || "DOM-Element nicht gefunden");
    return false;
  }
  return true;
}

/**
 * Selektiert ein DOM-Element und validiert es in einem Schritt.
 *
 * @param {string} selector - CSS-Selektor für das Element
 * @param {string} [errorMessage] - Optionale Fehlermeldung
 * @param {string} [level='error'] - Level des Logs ('log', 'warn', 'error')
 * @returns {Element|null} - Das gefundene Element oder null
 */
export function getValidatedElement(selector, errorMessage, level = "error") {
  const element = document.querySelector(selector);

  if (
    !validateElement(
      element,
      errorMessage || `Fehler: Element "${selector}" nicht gefunden`,
      level
    )
  ) {
    return null;
  }

  return element;
}

/**
 * Selektiert mehrere DOM-Elemente und validiert das Ergebnis.
 *
 * @param {string} selector - CSS-Selektor für die Elemente
 * @param {string} [errorMessage] - Optionale Fehlermeldung
 * @param {string} [level='warn'] - Level des Logs ('log', 'warn', 'error')
 * @returns {NodeList|null} - Die gefundenen Elemente oder null
 */
export function getValidatedElements(selector, errorMessage, level = "warn") {
  const elements = document.querySelectorAll(selector);

  // querySelectorAll gibt eine leere Liste zurück, wenn nichts gefunden wurde
  if (elements.length === 0) {
    console[level](
      errorMessage || `Fehler: Keine Elemente für "${selector}" gefunden`
    );
    return null;
  }

  return elements;
}

/**
 * Korrigiert Bildpfade für verschiedene Umgebungen.
 * In der Entwicklung werden relative Pfade zu absoluten Pfaden mit der richtigen Domain.
 * In der Produktion bleiben die Pfade unverändert.
 *
 * @param {string} path - Der zu korrigierende Bildpfad
 * @returns {string} - Der korrigierte Bildpfad
 */
export function fixImagePath(path) {
  if (!path) return '';
  
  // Nur Pfade korrigieren, die mit /uploads/ beginnen (Strapi-Medien)
  if (path.startsWith('/uploads/')) {
    return `${BASE_URL}${path}`;
  }
  
  return path;
}

/**
 * Konvertiert einen Bildpfad in die entsprechende WebP-Version
 * @param {string} imagePath - Der ursprüngliche Bildpfad
 * @returns {string} Der Pfad zur WebP-Version
 */
export function getWebpPath(imagePath) {
  if (!imagePath) return '';
  return imagePath.substring(0, imagePath.lastIndexOf('.')) + '.webp';
}

/**
 * Prüft, ob der Browser WebP-Bilder unterstützt
 * Das Ergebnis wird im localStorage zwischengespeichert
 * @returns {boolean} True wenn WebP unterstützt wird
 */
export function detectWebpSupport() {
  // Prüfen, ob bereits getestet wurde
  if (localStorage.getItem('webp-support') !== null) {
    return localStorage.getItem('webp-support') === 'true';
  }
  
  // Test mit Canvas (funktioniert in den meisten Browsern)
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    // Prüfen, ob toDataURL mit WebP-MIME-Typ möglich ist
    const isSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    localStorage.setItem('webp-support', isSupported);
    return isSupported;
  }
  
  // Fallback: WebP nicht unterstützt
  localStorage.setItem('webp-support', false);
  return false;
}

export function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

