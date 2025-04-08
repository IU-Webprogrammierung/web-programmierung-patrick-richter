/**
 * @module normalizers/clientsNormalizer
 * @description Normalisiert Kundendaten für konsistente Struktur
 */

import { FALLBACK_DATA } from '@core/config.js';
import { ensureValue, ensureBaseStructure } from '@utils/normalizerUtils.js';

/**
 * Normalisiert ein einzelnes Projekt innerhalb eines Kunden
 * @param {Object} project - Rohdaten des Projekts
 * @returns {Object} - Normalisiertes Projekt
 */
function normalizeClientProject(project) {
  if (!project) return {};
  
  return {
    id: project.id || 0,
    name: project.name || 'Unnamed Project',
    description: ensureValue(project.description, []),
    rank: project.rank || 999,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    publishedAt: project.publishedAt,
    documentId: project.documentId
  };
}

/**
 * Normalisiert die Kundendaten
 * @param {Object} data - Rohdaten der Kunden
 * @returns {Object} - Normalisierte Kundendaten
 */
export function normalizeClientsData(data) {
  // Basisstruktur sicherstellen
  const normalizedData = ensureBaseStructure(data, 'clients');
  
  // Wenn keine Kunden vorhanden, Fallback zurückgeben
  if (!Array.isArray(normalizedData.data)) {
    return FALLBACK_DATA.clients;
  }
  
  return {
    ...normalizedData,
    data: normalizedData.data.map(client => ({
      id: client.id || 0,
      name: client.name || 'Unnamed Client',
      rank: client.rank || 999,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      publishedAt: client.publishedAt,
      documentId: client.documentId,
      
      // Projekte normalisieren, falls vorhanden
      projects: Array.isArray(client.projects)
        ? client.projects.map(project => normalizeClientProject(project))
        : []
    }))
  };
}