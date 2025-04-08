/**
 * @module normalizers/utils
 * @description Gemeinsame Hilfsfunktionen für die Datennormalisierung
 */

import { FALLBACK_DATA } from '@core/config.js';

/**
 * Prüft, ob ein Wert vorhanden und gültig ist
 * @param {*} value - Zu prüfender Wert
 * @param {*} defaultValue - Fallback-Wert, falls value ungültig
 * @returns {*} - Ursprünglicher Wert oder Fallback
 */
export function ensureValue(value, defaultValue) {
  // Prüfung auf null, undefined und andere ungültige Werte
  if (value === null || value === undefined) return defaultValue;
  
  // Arrays sollten mindestens ein Element haben oder leeres Array zurückgeben
  if (Array.isArray(value) && value.length === 0) {
    return Array.isArray(defaultValue) ? defaultValue : [];
  }
  
  return value;
}

/**
 * Stellt sicher, dass ein Objekt eine bestimmte Struktur hat
 * @param {Object} data - Das zu prüfende Objekt
 * @param {string} type - Typ der Daten (projects, about, clients, footer)
 * @returns {Object} - Normalisiertes Objekt mit Fallback-Werten
 */
export function ensureBaseStructure(data, type) {
  if (!data) return FALLBACK_DATA[type];
  
  // Sicherstellen, dass ein data-Feld vorhanden ist
  if (!data.data) {
    data = {
      ...data,
      data: FALLBACK_DATA[type].data
    };
  }
  
  return data;
}