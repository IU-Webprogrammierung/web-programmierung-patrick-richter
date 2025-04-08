import {
  dispatchCustomEvent,
  addEventListener,
  EVENT_TYPES,
} from "@core/state/events.js";
import appInitializer from "@startup/appInitializer.js";
import gsap from "gsap";
import { Observer } from "gsap/Observer";

// GSAP Plugins registrieren
gsap.registerPlugin(Observer);

document.addEventListener("DOMContentLoaded", () => {
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
