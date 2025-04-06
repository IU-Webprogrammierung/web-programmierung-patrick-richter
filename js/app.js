import { dispatchCustomEvent, addEventListener, EVENT_TYPES } from './core/events.js';
import appInitializer from './features/initialization/appInitializer.js';
import { setupEventListeners } from './setup.js';

// Frühzeitiges Importieren aller Module für Event-Listener-Registrierung
// Diese Importe müssen vor der Verwendung der Events erfolgen!


document.addEventListener("DOMContentLoaded", () => {
  // GSAP Plugins registrieren
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  appInitializer.init();
  
  console.log("App-Initialisierung gestartet");
  
  // Event-Listener für die Grundfunktionalität
  setupEventListeners();
  
  // Initialisierungsprozess starten - jetzt sind alle Event-Listener registriert!
  dispatchCustomEvent(EVENT_TYPES.APP_INIT_STARTED);
  
  // Auf den Abschluss der Initialisierung hören
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    console.log("App vollständig initialisiert");
    
    // Hauptinhalt sichtbar machen
    document.querySelector('main').style.visibility = 'visible';
    
    // Lade-Anzeige entfernen
    document.documentElement.classList.add('loaded');
  });
});