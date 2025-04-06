/**
 * @module appInitializer
 * @description Verantwortlich für die initiale Datenladung der Anwendung
 * 
 * @listens APP_INIT_STARTED - Startet die Initialisierungskette
 */

import { EVENT_TYPES } from '../../core/events.js';
import dataStore from '../../core/dataStore.js';
import projectLoader from '../projects/projectLoader.js';
import uiInitializer from './uiInitializer.js';

/**
 * Initialisiert die App
 * Registriert den Event-Listener für APP_INIT_STARTED
 */
function init() {
  console.log("appInitializer: Initialisierung");
  
  // Event-Listener für App-Start registrieren
  document.addEventListener(EVENT_TYPES.APP_INIT_STARTED, async () => {
    console.log("appInitializer: Start des Initialisierungsprozesses");
    
    try {
      // ProjectLoader initialisieren
      // Dies registriert den Listener für DATA_LOADED
      projectLoader.init();
      
      // Datenspeicher initialisieren
      // Dies löst automatisch loadData() aus, das wiederum
      // das DATA_LOADED Event auslöst, sobald die Projektdaten geladen sind
      dataStore.init();
      uiInitializer.init();
    } catch (error) {
      console.error("appInitializer: Fehler bei der Initialisierung:", error);
      showLoadingError();
    }
  });
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
    
    // Hauptinhalt trotzdem sichtbar machen
    document.querySelector('main').style.visibility = 'visible';
  }
}

// Öffentliche API des Moduls
export default {
  init
};