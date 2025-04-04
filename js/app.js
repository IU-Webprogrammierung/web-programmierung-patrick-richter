import { dispatchCustomEvent, EVENT_TYPES } from './core/events.js';
import { setupEventListeners } from './setup.js';

// Frühzeitiges Importieren aller Module für Event-Listener-Registrierung
// Diese Importe müssen vor der Verwendung der Events erfolgen!
import './features/initialization/appInitializer.js';
import './features/projects/projectLoader.js';
import './features/initialization/uiInitializer.js';
import './features/initialization/interactionManager.js';
import './features/footer/footerLoader.js';

document.addEventListener("DOMContentLoaded", () => {
  // GSAP Plugins registrieren
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  
  console.log("App-Initialisierung gestartet");
  
  // Event-Listener für die Grundfunktionalität
  setupEventListeners();
  
  // Initialisierungsprozess starten - jetzt sind alle Event-Listener registriert!
  dispatchCustomEvent(EVENT_TYPES.APP_INIT_STARTED);
  
  // Auf den Abschluss der Initialisierung hören
  document.addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    console.log("App vollständig initialisiert");
    
    // Hauptinhalt sichtbar machen
    document.querySelector('main').style.visibility = 'visible';
    
    // Lade-Anzeige entfernen
    document.documentElement.classList.add('loaded');
  });
});