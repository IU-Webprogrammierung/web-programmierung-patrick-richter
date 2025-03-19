/**
 * @module hoverPreview
 * @description Einfache Hover-Funktionalität für Projektvorschauen
 */

import dataStore from '../core/dataStore.js';

// Bildpfade für Projekte
let projectImages = {};

/**
 * Initialisiert die Hover-Funktion mit Projektbildern
 */
export function setupHoverPreview() {
  // Vorschaubilder aus Projekten extrahieren
  const projects = dataStore.getProjects();
  if (!projects || !projects.data) return;
  
  // Bildpfade für jedes Projekt speichern
  projects.data.forEach(project => {
    if (project.project_images && project.project_images.length > 0) {
      const firstImage = project.project_images[0];
      if (firstImage.image && firstImage.image.length > 0) {
        // Verwenden des small-Formats, falls verfügbar
        const imageUrl = firstImage.image[0].formats?.small?.url || firstImage.image[0].url;
        projectImages[project.id] = imageUrl;
      }
    }
  });
  
}

