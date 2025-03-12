import { initializeWebsite } from './features/initialization/appInitializer.js';
import { setupEventListeners } from './setup.js';

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  initializeWebsite();
});