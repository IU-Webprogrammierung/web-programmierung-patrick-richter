/**
 * @module projectIndicator
 * @description Verwaltet den Projekt-Indikator und das Navigations-Panel
 */

/**
 * @module projectIndicator
 * @description Verwaltet den Projekt-Indikator
 */

import uiState from '../../core/uiState.js';
import { EVENT_TYPES } from '../../core/events.js';

export function setupProjectIndicator() {
  // Initial den Tab-Text aktualisieren
  updateTabText();
  
  // Auf Projektänderungen reagieren
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, updateTabText);
}

/**
 * Aktualisiert den Text im Tab basierend auf dem aktuellen Projekt
 */
function updateTabText() {
  const tabText = document.querySelector('.tab-text');
  if (!tabText) return;
  
  // index auf +1 setzen (damit nicht 0)
  const activeIndex = uiState.activeProjectIndex + 1;
  // Fallback auf 0, falls keine Projekte verfügbar sind
  const totalProjects = uiState.projects.length || 0;
  
  // Aktualisiere den Text
  tabText.textContent = `${activeIndex} / ${totalProjects}`;
}