import { getValidatedElement } from './core/utils.js';
import { showOverlay, hideOverlay, toggleAboutImprint, handleKeyPress } from './features/overlay/overlayController.js';
import { toggleDescription, handlePointerDown, handleTouchEnd } from './features/mobile/mobileDescription.js';
import { scrollToTop, closeFooter } from './features/projects/projectNavigation.js';
import { togglePanel } from './features/projects/projectIndicator.js';


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
  
  getValidatedElement("#scrollTop").addEventListener("click", scrollToTop);
  getValidatedElement("#footerTop").addEventListener("click", closeFooter);

  getValidatedElement(".project-indicator-tab").addEventListener("click", togglePanel);

}