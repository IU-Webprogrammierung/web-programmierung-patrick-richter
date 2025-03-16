/* -----------------------------
   1. DOM-Selektoren und Variablen
   ----------------------------- */
const overlay = document.querySelector(".overlay");
const overlayRight = document.querySelector(".overlay-right");
const titleDescriptionContainer = document.querySelector(
  ".title-description-container"
);




/* -----------------------------
   2. Event-Listener-Registrierung
   ----------------------------- */

document.querySelector("#openOverlay").addEventListener("click", showOverlay);
document.querySelector("#closeOverlay").addEventListener("click", hideOverlay);
document.querySelector("#overlayLeft").addEventListener("click", hideOverlay);
addEventListener("keydown", handleKeyPress);
document
  .querySelector("#showImprint")
  .addEventListener("click", () => toggleAboutImprint("show-imprint"));
document
  .querySelector("#showAbout")
  .addEventListener("click", () => toggleAboutImprint("show-about"));
titleDescriptionContainer.addEventListener("click", toggleDescription);
titleDescriptionContainer.addEventListener("pointerdown", handlePointerDown);
titleDescriptionContainer.addEventListener("touchend", handleTouchEnd);
document.querySelector("#scrollTop").addEventListener("click", scrollToTop);
document.querySelector("#footerTop").addEventListener("click", closeFooter);

/* -----------------------------
   3. Event-Handler
   ----------------------------- */




/* -----------------------------
   4. Funktionen
   ----------------------------- */

/* -----------------------------
   4.1 Überwachung der Scrollposition
   ----------------------------- */




// Öffnet und schließt Description Mobile


















