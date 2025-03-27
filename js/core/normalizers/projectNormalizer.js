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
    
    // Formats-Objekt normalisieren
    if (imgData.formats) {
      normalized.formats = {};
      
      // Alle Formate, einschließlich WebP, normalisieren
      Object.entries(imgData.formats).forEach(([key, format]) => {
        if (!format) return;
        
        // Ist es ein WebP-Format?
        const isWebP = key === 'webp' || key.endsWith('-webp');
        
        normalized.formats[key] = {
          ext: format.ext || (isWebP ? '.webp' : '.jpg'),
          url: format.url || '',
          hash: format.hash || '',
          mime: format.mime || (isWebP ? 'image/webp' : 'image/jpeg'),
          name: format.name || '',
          path: format.path,
          size: format.size || 0,
          width: format.width || 0,
          height: format.height || 0,
          sizeInBytes: format.sizeInBytes || (format.size ? format.size * 1024 : 0)
        };
      });
    } else {
      normalized.formats = {};
    }
    
    return normalized;
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