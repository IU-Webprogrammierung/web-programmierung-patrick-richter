/**
 * @module appInitializer
 * @description Verantwortlich für die initiale Datenladung der Anwendung
 */

import { EVENT_TYPES, dispatchCustomEvent, addEventListener } from '../../core/events.js';
import dataStore from '../../core/dataStore.js';

// Auf App-Initialisierung reagieren
addEventListener(EVENT_TYPES.APP_INIT_STARTED, async () => {
  console.log("appInitializer: Starte Datenladung");
  
  try {
    // Daten laden
    const success = await dataStore.loadData();
    
    if (success) {
      console.log("appInitializer: Daten erfolgreich geladen");
      
      // Nächste Phase signalisieren: Daten geladen
      dispatchCustomEvent(EVENT_TYPES.DATA_LOADED, { 
        projectsCount: dataStore.getProjects()?.data?.length || 0 
      });
    } else {
      console.error("appInitializer: Datenladung fehlgeschlagen");
      showLoadingError();
    }
  } catch (error) {
    console.error("Initialization error:", error);
    showLoadingError();
  }
});

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
    
    // Hauptinhalt trotzdem sichtbar machen
    document.querySelector('main').style.visibility = 'visible';
  }
}

// Alte Export-Funktion für Rückwärtskompatibilität
export async function initializeWebsite() {
  console.log("appInitializer: Direkter Aufruf von initializeWebsite");
  dispatchCustomEvent(EVENT_TYPES.APP_INIT_STARTED);
}