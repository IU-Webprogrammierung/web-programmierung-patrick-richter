import { initializeWebsite } from './features/initialization/appInitializer.js';
import { setupEventListeners } from './setup.js';


document.addEventListener("DOMContentLoaded", () => {
  // GSAP Plugins registrieren
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  setupEventListeners();
  initializeWebsite();
});