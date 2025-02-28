const overlay = document.querySelector(".overlay");
const overlayRight = document.querySelector(".overlay-right");
const titleDescriptionContainer = document.querySelector(
  ".title-description-container"
);
let startY = 0;

document.querySelector("#openOverlay").addEventListener("click", showOverlay);
document.querySelector("#closeOverlay").addEventListener("click", hideOverlay);
document.querySelector("#overlayLeft").addEventListener("click", hideOverlay);

// schließt Overlay mit Escape

addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideOverlay();
  }
});

document
  .querySelector("#showImprint")
  .addEventListener("click", () => toggleAboutImprint("show-imprint"));
document
  .querySelector("#showAbout")
  .addEventListener("click", () => toggleAboutImprint("show-about"));
titleDescriptionContainer.addEventListener("click", toggleDescription);

// Überprüft touchstart

titleDescriptionContainer.addEventListener("touchstart", (event) => {
  startY = event.touches[0].clientY;
});

// Überprüft Swipe-Richtung unf öffnet ggf. Description Mobile

titleDescriptionContainer.addEventListener("touchend", (event) => {
  let endY = event.changedTouches[0].clientY;
  console.log("Touch geendet bei:", endY);
  let deltaY = startY - endY;

  if (
    deltaY < -20 &&
    titleDescriptionContainer.classList.contains("show-description")
  ) {
    toggleDescription();
  } else if (
    deltaY > 20 &&
    !titleDescriptionContainer.classList.contains("show-description")
  ) {
    toggleDescription();
  }
});

// Öffnet und schließt Description Mobile

function toggleDescription() {
  titleDescriptionContainer.classList.toggle("show-description");
  titleDescriptionContainer.setAttribute("aria-expanded", titleDescriptionContainer.getAttribute("aria-expanded") === "false" ? "true" : "false");
}

// Öffnet das Overlay und entfernt die Schließen-Animation

function showOverlay() {
  overlay.classList.remove("closing");

  if (!overlay.classList.contains("show-overlay")) {
    titleDescriptionContainer.classList.contains("show-description") &&
      toggleDescription();
    overlay.classList.add("show-overlay");
    overlay.setAttribute("aria-hidden", "false");
    console.log("Overlay visible");
    document.querySelector("#closeOverlay").focus();
    console.log(document.activeElement);
  }
}

// schließt das Overlay und wartet bis Animationen abgeschlossen sind

function hideOverlay() {
  if (
    overlay.classList.contains("show-overlay") &&
    !overlay.classList.contains("hiding")
  ) {
    overlay.classList.add("closing");
    overlayRight.addEventListener(
      "transitionend",
      function () {
        overlay.classList.remove("show-overlay", "closing");
        overlay.setAttribute("aria-hidden", "true");
        document.querySelector("#openOverlay").focus();
        toggleAboutImprint("show-about");
        console.log("Overlay hidden");
        console.log(document.activeElement);
      },
      { once: true }
    );
  }
}

// wechsele zwischen About und Imprint

function toggleAboutImprint(targetClass) {
  const aboutImprintSlider = document.querySelector(".about-imprint-slider");

  if (
    targetClass === "show-about" &&
    aboutImprintSlider.classList.contains("show-imprint")
  ) {
    aboutImprintSlider.classList.replace("show-imprint", targetClass);
    document.querySelector(".about").setAttribute("aria-hidden", "false");
    document.querySelector(".imprint").setAttribute("aria-hidden", "true");
  } else if (
    targetClass === "show-imprint" &&
    aboutImprintSlider.classList.contains("show-about")
  ) {
    aboutImprintSlider.classList.replace("show-about", targetClass);
    document.querySelector(".imprint").setAttribute("aria-hidden", "false");
    document.querySelector(".about").setAttribute("aria-hidden", "true");
  }
}
