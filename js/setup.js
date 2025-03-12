import { showOverlay, hideOverlay, toggleAboutImprint, handleKeyPress } from './features/overlay/overlayController.js';
import { toggleDescription, handlePointerDown, handleTouchEnd } from './features/mobile/mobileDescription.js';
import { scrollToTop, closeFooter } from './features/projects/projectNavigation.js';

export function setupEventListeners() {
  document.querySelector("#openOverlay")?.addEventListener("click", showOverlay);
  document.querySelector("#closeOverlay")?.addEventListener("click", hideOverlay);
  document.querySelector("#overlayLeft")?.addEventListener("click", hideOverlay);
  addEventListener("keydown", handleKeyPress);
  document.querySelector("#showImprint")?.addEventListener("click", () => toggleAboutImprint("show-imprint"));
  document.querySelector("#showAbout")?.addEventListener("click", () => toggleAboutImprint("show-about"));
  
  const titleDescriptionContainer = document.querySelector(".title-description-container");
  titleDescriptionContainer.addEventListener("click", toggleDescription);
  titleDescriptionContainer.addEventListener("pointerdown", handlePointerDown);
  titleDescriptionContainer.addEventListener("touchend", handleTouchEnd);
  
  document.querySelector("#scrollTop").addEventListener("click", scrollToTop);
  document.querySelector("#footerTop").addEventListener("click", closeFooter);
}