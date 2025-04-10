/**
 * @module mediaUtils
 * @description Hilfsfunktionen für die Verarbeitung und Optimierung von Medien-Assets.
 * Bietet Funktionen zur Pfadkorrektur, WebP-Unterstützungserkennung und Bildprüfung.
 * 
 * Funktionen:
 * - fixImagePath() - Korrigiert Bildpfade für verschiedene Umgebungen
 * - getWebpPath() - Konvertiert einen Bildpfad in die entsprechende WebP-Version
 * - detectWebpSupport() - Prüft Browser-Unterstützung für WebP-Bilder
 * - checkImageExists() - Überprüft, ob ein Bild geladen werden kann
 */

import { BASE_URL } from '@core/config.js';

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

/**
 * Überprüft, ob ein Bild existiert (kann geladen werden)
 * @param {string} url - Die URL des zu prüfenden Bildes
 * @returns {Promise<boolean>} Promise, das zu true aufgelöst wird, wenn das Bild geladen werden kann
 */
export function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}