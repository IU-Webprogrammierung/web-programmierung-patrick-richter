/**
 * @module appInitializer
 * @description Verantwortlich für die initiale Datenladung der Anwendung
 * 
 * @listens APP_INIT_STARTED - Startet die Initialisierungskette
 */

import { EVENT_TYPES, addEventListener } from '../../core/events.js';
import dataStore from '../../core/dataStore.js';
import projectLoader from '../projects/projectLoader.js';
import uiInitializer from './uiInitializer.js';
import footerLoader from '../footer/footerLoader.js';
import overlayContent from '../overlay/overlayContent.js';

/**
 * Initialisiert die App
 * Registriert den Event-Listener für APP_INIT_STARTED
 */
function init() {
  console.log("appInitializer: Initialisierung");
  
  // Event-Listener für App-Start registrieren
  addEventListener(EVENT_TYPES.APP_INIT_STARTED, async () => {
    console.log("appInitializer: Start des Initialisierungsprozesses");
    
    try {
      // ProjectLoader initialisieren
      // Dies registriert den Listener für DATA_LOADED
      projectLoader.init();
      footerLoader.init();
      overlayContent.init();
      console.log("appInitializer: ProjectLoader initialisiert");
      
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