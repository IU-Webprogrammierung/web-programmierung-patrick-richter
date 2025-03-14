/**
 * @module appInitializer
 * @description Zentraler Initialisierungspunkt der Anwendung
 */

import dataStore from '../../core/dataStore.js';
import { createProjectElements } from '../projects/projectLoader.js';
import { createAboutImprintSection } from '../overlay/overlayContent.js';
import { setupProjectIndicator } from '../projects/projectIndicator.js';

/**
 * Initialisiert die gesamte Website
 */
export async function initializeWebsite() {
  console.log("initializeWebsite: Initialize Website gestartet");
  
  try {
    const success = await dataStore.loadData();
    
    if (success) {
      console.log("initializeWebsite: Loading of projects and about successful!");
      createProjectElements();
      createAboutImprintSection();
      setupProjectIndicator();
    } else {
      console.error("initializeWebsite: Loading failed - no data returned");
      // Zeige Fehlermeldung für Benutzer an
      showLoadingError();
    }
  } catch (error) {
    console.error("Initialization error:", error);
    showLoadingError();
  }
}

/**
 * Zeigt eine benutzerfreundliche Fehlermeldung an
 */
function showLoadingError() {
  const container = document.querySelector(".project-container");
  if (container) {
    container.innerHTML = `
      <div class="loading-error">
        <p>Leider konnten die Inhalte nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
      </div>
    `;
  }
}