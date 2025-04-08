/**
 * @module normalizers/projectNormalizer
 * @description Normalisiert Projektdaten für konsistente Struktur
 */

import { FALLBACK_DATA } from '@core/config.js';
import { ensureValue, ensureBaseStructure } from '@utils/normalizerUtils.js';

/**
 * Normalisiert die Bilddaten innerhalb eines Projektbildes
 * @param {Object} imgData - Rohdaten des Bildes
 * @returns {Object} - Normalisierte Bilddaten
 */
export function normalizeImageData(imgData) {
    if (!imgData) return {};
    
    // Basis-Informationen normalisieren
    const normalized = {
      id: imgData.id || 0,
      name: imgData.name || '',
      alternativeText: imgData.alternativeText || imgData.name || '',
      width: imgData.width || 0,
      height: imgData.height || 0,
      hash: imgData.hash || '',
      ext: imgData.ext || '',
      mime: imgData.mime || 'image/jpeg',
      size: imgData.size || 0,
      url: imgData.url || '',
      createdAt: imgData.createdAt,
      updatedAt: imgData.updatedAt,
      documentId: imgData.documentId,
      publishedAt: imgData.publishedAt
    };
    
    // Formats-Objekt normalisieren (wenn vorhanden)
    if (imgData.formats) {
      normalized.formats = {...imgData.formats};
    } else {
      normalized.formats = {};
    }
    
    return normalized;
}

/**
 * Normalisiert ein Projektbild (einschließlich seiner metadata)
 * @param {Object} imgData - Rohdaten des Projektbildes
 * @returns {Object} - Normalisiertes Projektbild
 */
function normalizeProjectImage(imgData) {
  if (!imgData) return {};
  
  return {
    id: imgData.id || 0,
    textColor: imgData.textColor || "black",
    imageTitle: imgData.imageTitle || "",
    createdAt: imgData.createdAt,
    updatedAt: imgData.updatedAt,
    publishedAt: imgData.publishedAt,
    documentId: imgData.documentId,
    // Bilder normalisieren wenn vorhanden
    image: Array.isArray(imgData.image)
      ? imgData.image.map(img => normalizeImageData(img))
      : []
  };
}

/**
 * Hauptfunktion zur Normalisierung von Projektdaten
 * @param {Object} data - Rohdaten der Projekte
 * @returns {Object} - Normalisierte Projektdaten
 */
export function normalizeProjectData(data) {
  // Basisstruktur sicherstellen
  const normalizedData = ensureBaseStructure(data, 'projects');
  
  // Wenn keine Projekte vorhanden, früh zurückkehren
  if (!Array.isArray(normalizedData.data)) {
    return FALLBACK_DATA.projects;
  }
  
  // Jeden Projekteintrag normalisieren
  return {
    ...normalizedData,
    data: normalizedData.data.map(project => ({
      id: project.id || 0,
      name: project.name || 'Unnamed Project',
      description: ensureValue(project.description, []),
      rank: project.rank || 999,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      publishedAt: project.publishedAt,
      documentId: project.documentId,
      // Projektbilder normalisieren
      project_images: Array.isArray(project.project_images)
        ? project.project_images.map(img => normalizeProjectImage(img))
        : []
    }))
  };
}