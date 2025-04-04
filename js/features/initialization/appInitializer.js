/**
 * @module appInitializer
 * @description Zentraler Initialisierungspunkt der Anwendung
 */

import dataStore from '../../core/dataStore.js';
import { getValidatedElement } from '../../core/utils.js';
import { createProjectElements } from '../projects/projectLoader.js';
import { setupHoverPreview } from '../projects/hoverPreview.js';
import { createAboutImprintSection } from '../overlay/overlayContent.js';
import { setupProjectIndicator } from '../projects/projectIndicator.js';
import { loadFooterContent } from '../footer/footerLoader.js';


/**
 * Initialisiert die gesamte Website
 */


export async function initializeWebsite() {
  console.log("initializeWebsite: Initialize Website gestartet");
  
  try {
    const success = await dataStore.loadData();
    
    if (success) {
      console.log("initializeWebsite: Loading of projects and about successful!");
      await createProjectElements(); // Projektelemente erstellen
      createAboutImprintSection();
      setupProjectIndicator();
      setupHoverPreview();
      
      // Footer nach den Projekten initialisieren
      loadFooterContent();
    } else {
      console.error("initializeWebsite: Loading failed - no data returned");
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
  const container = getValidatedElement(".project-container");
  if (container) {
    container.innerHTML = `
      <div class="loading-error">
        <p>Leider konnten die Inhalte nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
      </div>
    `;
  }
  
  
}