import { dispatchCustomEvent, EVENT_TYPES } from './core/events.js';
import { setupEventListeners } from './setup.js';

document.addEventListener("DOMContentLoaded", () => {
  // GSAP Plugins registrieren
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  
  console.log("App-Initialisierung gestartet");
  
  // Event-Listener für die Grundfunktionalität
  setupEventListeners();
  
  // Initialisierungsprozess starten
  dispatchCustomEvent(EVENT_TYPES.APP_INIT_STARTED);

  
  // Auf den Abschluss der Initialisierung hören
  document.addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    console.log("App vollständig initialisiert");
    
    // Hauptinhalt sichtbar machen
    document.querySelector('main').style.visibility = 'visible';
    
    // TODO check : Lade-Anzeige entfernen (falls vorhanden)  
    document.documentElement.classList.add('loaded');
  });
});