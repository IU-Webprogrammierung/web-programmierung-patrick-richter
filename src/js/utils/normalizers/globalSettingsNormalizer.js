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
  
  // Skills normalisieren (falls vorhanden)
  const normalizedSkills = Array.isArray(normalizedData.data.skills) 
    ? normalizedData.data.skills.map(skill => ({
        id: skill.id || 0,
        name: skill.name || ''
      }))
    : [];
    
  // Social Links normalisieren (jetzt als Array von Objekten)
  const normalizedSocialLinks = Array.isArray(normalizedData.data.social_links)
    ? normalizedData.data.social_links.map(link => ({
        id: link.id || 0,
        link: link.link || ''
      }))
    : [];
  
  return {
    ...normalizedData,
    data: {
      ...normalizedData.data,
      // Bild durch normalisierte Version ersetzen
      default_seo_image: normalizedImage,
      // Skills durch normalisierte Version ersetzen
      skills: normalizedSkills,
      // Social Links durch normalisierte Version ersetzen
      social_links: normalizedSocialLinks,
      // Kontakt / Localisierungsfelder normalisieren
      contact_email: normalizedData.data.contact_email || FALLBACK_DATA.globalSettings.data.contact_email,
      address_locality: normalizedData.data.address_locality || FALLBACK_DATA.globalSettings.data.address_locality,
      address_country: normalizedData.data.address_country || FALLBACK_DATA.globalSettings.data.address_country,
      // Sicherstellen, dass Textfelder existieren
      person_name: normalizedData.data.person_name || FALLBACK_DATA.globalSettings.data.person_name,
      person_job_title: normalizedData.data.person_job_title || FALLBACK_DATA.globalSettings.data.person_job_title
    }
  };
}