/**
 * @module hoverPreview
 * @description Einfache Hover-Funktionalität für Projektvorschauen
 */

import dataStore from '../../core/dataStore.js';
import { getValidatedElement, getValidatedElements, fixImagePath } from '../../core/utils.js';

// Bildpfade für Projekte
let projectImages = {};
// Cache für DOM-Elemente
let previewEl = null;

// Handler-Funktion für mousemove
function mouseMoveHandler(e) {
  previewEl.style.left = (e.clientX + 20) + 'px';
  previewEl.style.top = (e.clientY - 210) + 'px'; // Höher über dem Cursor positionieren
}

// Handler-Funktion für mouseenter
function showPreviewHandler() {
  const projectId = this.getAttribute('data-project-id');
  if (projectImages[projectId]) {
    previewEl.src = projectImages[projectId];
    document.addEventListener('mousemove', mouseMoveHandler);
    previewEl.style.display = 'block';
    setTimeout(() => previewEl.classList.add('visible'), 10);
  }
}

// Handler-Funktion für mouseleave
function hidePreviewHandler() {
  previewEl.classList.remove('visible');
  document.removeEventListener('mousemove', mouseMoveHandler);
  setTimeout(() => {
    if (!previewEl.classList.contains('visible')) {
      previewEl.style.display = 'none';
    }
  }, 300);
}

/**
 * Fügt Hover-Listener zu den übergebenen Elementen hinzu
 */
function addHoverListeners(elements) {
  if (!elements || elements.length === 0) return;
  
  let newElements = 0;
  
  elements.forEach(link => {
    // Skip, falls bereits ein Listener hinzugefügt wurde
    if (link.hasAttribute('data-hover-initialized')) return;
    
    newElements++;
    
    // MouseEnter- und MouseLeave-Listener hinzufügen
    link.addEventListener('mouseenter', showPreviewHandler);
    link.addEventListener('mouseleave', hidePreviewHandler);
    
    // Markieren, dass dieser Link initialisiert wurde
    link.setAttribute('data-hover-initialized', 'true');
  });
  
  if (newElements > 0) {
    console.log(`Hover-Preview: ${newElements} neue Links initialisiert`);
  }
}

/**
 * Entfernt alle Hover-Listener von initialisierten Elementen
 */
export function removeHoverListeners() {
  const initializedLinks = document.querySelectorAll('[data-hover-initialized="true"]');
  
  initializedLinks.forEach(link => {
    // Die tatsächlichen Listener entfernen
    link.removeEventListener('mouseenter', showPreviewHandler);
    link.removeEventListener('mouseleave', hidePreviewHandler);
    link.removeAttribute('data-hover-initialized');
  });
  
  // Sicherstellen, dass mousemove-Listener entfernt wird
  document.removeEventListener('mousemove', mouseMoveHandler);
  
  // Vorschaubild ausblenden
  if (previewEl) {
    previewEl.classList.remove('visible');
    previewEl.style.display = 'none';
  }
}

/**
 * Initialisiert die Hover-Funktion mit Projektbildern
 */
export function setupHoverPreview() {
  // Auf Mobilgeräten nicht ausführen
  if (/Mobi|Android/i.test(navigator.userAgent)) return;

  // Preview-Element einmalig abfragen und cachen
  previewEl = getValidatedElement('.project-hover-preview');
  if (!previewEl) return;

  // Projekte laden
  const projects = dataStore.getProjects();
  if (!projects || !projects.data) {
    console.error("Hover-Preview: Keine Projektdaten verfügbar");
    return;
  }

  // Bildpfade extrahieren
  projects.data.forEach(project => {
    if (project.project_images && project.project_images.length > 0) {
      const firstImage = project.project_images[0];
      if (firstImage.image && firstImage.image.length > 0) {
        projectImages[project.id] = fixImagePath(firstImage.image[0].url);
      }
    }
  });

  // Event-Listener für Project Indicator
  getValidatedElement('.project-indicator-tab')?.addEventListener('click', function() {
    const projectLinks = getValidatedElements('.project-list a[data-project-id]');
    if (projectLinks) {
      addHoverListeners(projectLinks);
    }
  });
  
  // Event-Listener für About-Overlay
  getValidatedElement('#openOverlay')?.addEventListener('click', function() {
    const clientLinks = getValidatedElements('.about-clients-project-link[data-project-id]');
    if (clientLinks) {
      addHoverListeners(clientLinks);
    }
  });
}