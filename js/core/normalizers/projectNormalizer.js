/**
 * @module normalizers/projectNormalizer
 * @description Normalisiert Projektdaten für konsistente Struktur
 */

import { FALLBACK_DATA } from '../../config.js';
import { ensureValue, ensureBaseStructure } from './utils.js';

/**
 * Normalisiert die Daten eines einzelnen Bildes
 * @param {Object} imgData - Rohdaten des Bildes
 * @returns {Object} - Normalisierte Bilddaten
 */
function normalizeImageData(imgData) {
  if (!imgData) return {};
  
  return {
    id: imgData.id || 0,
    name: imgData.name || '',
    alternativeText: imgData.alternativeText || imgData.name || '',
    width: imgData.width || 0,
    height: imgData.height || 0,
    formats: imgData.formats || {},
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
}

/**
 * Normalisiert die Daten eines Projektbildes mit Metainformationen
 * @param {Object} img - Rohdaten des Projektbildes
 * @returns {Object} - Normalisiertes Projektbild
 */
function normalizeProjectImage(img) {
  if (!img) return {};
  
  return {
    id: img.id || 0,
    textColor: img.textColor || 'black',
    imageTitle: img.imageTitle || '',
    createdAt: img.createdAt,
    updatedAt: img.updatedAt,
    publishedAt: img.publishedAt,
    documentId: img.documentId,
    image: img.image?.length 
      ? img.image.map(imgData => normalizeImageData(imgData)) 
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