/**
 * @module normalizers/aboutNormalizer
 * @description Normalisiert About/Imprint-Daten für konsistente Struktur
 */

import { FALLBACK_DATA } from '../../config.js';
import { ensureValue, ensureBaseStructure } from './utils.js';

/**
 * Normalisiert einen einzelnen Textabschnitt (Paragraph)
 * @param {Object} paragraph - Rohdaten des Paragraphen
 * @returns {Object} - Normalisierter Paragraph
 */
function normalizeParagraph(paragraph) {
  if (!paragraph) return { type: "paragraph", children: [{ text: "", type: "text" }] };
  
  return {
    type: paragraph.type || "paragraph",
    children: Array.isArray(paragraph.children) 
      ? paragraph.children.map(child => ({
          text: child.text || "",
          type: child.type || "text",
          ...(child.url ? { url: child.url } : {}),
          ...(child.bold ? { bold: true } : {})
        }))
      : [{ text: "", type: "text" }]
  };
}

/**
 * Normalisiert About/Imprint-Daten
 * @param {Object} data - Rohdaten
 * @returns {Object} - Normalisierte Daten
 */
export function normalizeAboutData(data) {
  // Basisstruktur sicherstellen
  const normalizedData = ensureBaseStructure(data, 'about');
  
  // Wenn keine Daten vorhanden, Fallback zurückgeben
  if (!normalizedData.data) {
    return FALLBACK_DATA.about;
  }
  
  return {
    ...normalizedData,
    data: {
      ...normalizedData.data,
      // Intro-Texte normalisieren
      intro: Array.isArray(normalizedData.data.intro)
        ? normalizedData.data.intro.map(p => normalizeParagraph(p))
        : FALLBACK_DATA.about.data.intro,
      
      // Imprint-Texte normalisieren  
      imprint: Array.isArray(normalizedData.data.imprint)
        ? normalizedData.data.imprint.map(p => normalizeParagraph(p))
        : FALLBACK_DATA.about.data.imprint,
        
      // Weitere Felder übernehmen
      createdAt: normalizedData.data.createdAt,
      updatedAt: normalizedData.data.updatedAt,
      publishedAt: normalizedData.data.publishedAt,
      documentId: normalizedData.data.documentId
    }
  };
}