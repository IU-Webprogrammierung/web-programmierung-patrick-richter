/**
 * @module setup
 * @description Event-Listener und Initialisierung
 */

import { getValidatedElement } from './core/utils.js';
import { showOverlay, hideOverlay, toggleAboutImprint, handleKeyPress } from './features/overlay/overlayController.js';
import { toggleDescription, handlePointerDown, handleTouchEnd } from './features/mobile/mobileDescription.js';
import { togglePanel } from './features/projects/projectIndicator.js';
//import { navigateToTop } from './features/navigation/navigationUtils.js';

export function setupEventListeners() {
  getValidatedElement("#openOverlay")?.addEventListener("click", showOverlay);
  getValidatedElement("#closeOverlay")?.addEventListener("click", hideOverlay);
  getValidatedElement("#overlayLeft")?.addEventListener("click", hideOverlay);
  addEventListener("keydown", handleKeyPress);
  getValidatedElement("#showImprint")?.addEventListener("click", () => toggleAboutImprint("show-imprint"));
  getValidatedElement("#showAbout")?.addEventListener("click", () => toggleAboutImprint("show-about"));
  
  const titleDescriptionContainer = getValidatedElement(".title-description-container");
  titleDescriptionContainer.addEventListener("click", toggleDescription);
  titleDescriptionContainer.addEventListener("pointerdown", handlePointerDown);
  titleDescriptionContainer.addEventListener("touchend", handleTouchEnd);
  
  // ÄNDERUNG: Zentrale Navigationsfunktion verwenden
  //getValidatedElement("#scrollTop").addEventListener("click", navigateToTop);

  getValidatedElement(".project-indicator-tab").addEventListener("click", togglePanel);
}