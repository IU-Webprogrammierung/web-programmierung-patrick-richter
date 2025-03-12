import { initializeWebsite } from './features/projects/projectLoader.js';
import { setupEventListeners } from './setup.js';

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  initializeWebsite();
});