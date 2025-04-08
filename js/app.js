import {
  dispatchCustomEvent,
  addEventListener,
  EVENT_TYPES,
} from "./core/state/events.js";
import appInitializer from "./startup/appInitializer.js";

document.addEventListener("DOMContentLoaded", () => {
  // GSAP Plugins registrieren
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Initialisierung der App
  appInitializer.init();
  console.log("App-Initialisierung gestartet");

  // Custom Event auslösen, um die Initialisierungskette zu starten
  // Siehe events.js für den Überblick des Ablaufs
  dispatchCustomEvent(EVENT_TYPES.APP_INIT_STARTED);

  // Auf den Abschluss der Initialisierung hören
  addEventListener(EVENT_TYPES.APP_INIT_COMPLETE, () => {
    console.log("App vollständig initialisiert");
  });
});
