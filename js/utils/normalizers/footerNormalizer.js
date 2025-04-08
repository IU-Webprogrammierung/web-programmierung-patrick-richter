/**
 * @module normalizers/footerNormalizer
 * @description Normalisiert Footer-Daten für konsistente Struktur
 */

import { FALLBACK_DATA } from '../../core/config.js';
import { ensureValue, ensureBaseStructure } from './utils.js';

/**
 * Normalisiert ein einzelnes Kind-Element im Footer
 * @param {Object} child - Rohdaten des Kindes
 * @returns {Object} - Normalisiertes Kind-Element
 */
function normalizeChild(child) {
    if (!child) return { text: "", type: "text" };
    
    // Basis-Objekt erstellen
    const normalized = {
      text: child.text || "",
      type: child.type || "text"
    };
    
    // URL hinzufügen, wenn vorhanden
    if (child.url) {
      normalized.url = child.url;
    }
    
    // Die children-Eigenschaft für Links beibehalten
    if (child.type === 'link' && Array.isArray(child.children)) {
      normalized.children = child.children.map(childElement => ({
        text: childElement.text || "",
        type: childElement.type || "text"
      }));
    }
    
    return normalized;
  }

/**
 * Normalisiert einen einzelnen Eintrag im Footer
 * @param {Object} entry - Rohdaten des Eintrags
 * @returns {Object} - Normalisierter Eintrag
 */
function normalizeFooterEntry(entry) {
  if (!entry) return { 
    type: "paragraph", 
    children: [{ text: "", type: "text" }] 
  };
  
  return {
    type: entry.type || "paragraph",
    ...(entry.level ? { level: entry.level } : {}),
    children: Array.isArray(entry.children)
      ? entry.children.map(child => normalizeChild(child))
      : [{ text: "", type: "text" }]
  };
}

/**
 * Normalisiert die Footer-Daten
 * @param {Object} data - Rohdaten des Footers
 * @returns {Object} - Normalisierte Footer-Daten
 */
export function normalizeFooterData(data) {
  // Basisstruktur sicherstellen
  const normalizedData = ensureBaseStructure(data, 'footer');
  
  // Wenn keine Daten vorhanden, Fallback zurückgeben
  if (!normalizedData.data) {
    return FALLBACK_DATA.footer;
  }
  
  return {
    ...normalizedData,
    data: {
      ...normalizedData.data,
      // getincontact normalisieren
      getincontact: Array.isArray(normalizedData.data.getincontact)
        ? normalizedData.data.getincontact.map(entry => normalizeFooterEntry(entry))
        : FALLBACK_DATA.footer.data.getincontact,
      
      // Weitere Felder übernehmen  
      createdAt: normalizedData.data.createdAt,
      updatedAt: normalizedData.data.updatedAt,
      publishedAt: normalizedData.data.publishedAt,
      documentId: normalizedData.data.documentId
    }
  };
}