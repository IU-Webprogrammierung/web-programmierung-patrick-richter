/**
 * @module normalizers/globalSettingsNormalizer
 * @description Normalisiert die globalen Einstellungsdaten für konsistente Struktur
 */

import { FALLBACK_DATA } from '@core/config.js';
import { ensureBaseStructure } from '@utils/normalizerUtils.js';
import { normalizeImageData } from './projectNormalizer.js';

/**
 * Normalisiert die globalen Einstellungsdaten
 * @param {Object} data - Rohdaten der globalen Einstellungen
 * @returns {Object} - Normalisierte Daten
 */
export function normalizeGlobalSettingsData(data) {
  // Basisstruktur sicherstellen
  const normalizedData = ensureBaseStructure(data, 'globalSettings');
  
  // Wenn keine Daten vorhanden, Fallback zurückgeben
  if (!normalizedData.data) {
    return FALLBACK_DATA.globalSettings;
  }
  
  // Bild normalisieren, falls vorhanden
  let normalizedImage = null;
  if (normalizedData.data.default_seo_image) {
    normalizedImage = normalizeImageData(normalizedData.data.default_seo_image);
  }
  
  return {
    ...normalizedData,
    data: {
      ...normalizedData.data,
      // Bild durch normalisierte Version ersetzen
      default_seo_image: normalizedImage,
      // Sicherstellen, dass Textfelder existieren
      person_name: normalizedData.data.person_name || FALLBACK_DATA.globalSettings.data.person_name,
      person_job_title: normalizedData.data.person_job_title || FALLBACK_DATA.globalSettings.data.person_job_title,
      social_link: normalizedData.data.social_link || FALLBACK_DATA.globalSettings.data.social_link,
      about_description: normalizedData.data.about_description || FALLBACK_DATA.globalSettings.data.about_description,
      imprint_description: normalizedData.data.imprint_description || FALLBACK_DATA.globalSettings.data.imprint_description,
      default_seo_description: normalizedData.data.default_seo_description || FALLBACK_DATA.globalSettings.data.default_seo_description
    }
  };
}