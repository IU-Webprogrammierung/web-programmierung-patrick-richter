document.querySelector("#openOverlay").addEventListener("click", showOverlay);
document.querySelector("#closeOverlay").addEventListener("click", hideOverlay);
document.querySelector("#overlayLeft").addEventListener("click", hideOverlay);
addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideOverlay();
  }
});

document.querySelector("#showImprint").addEventListener("click", ()=> toggleAboutImprint("show-imprint"));
document.querySelector("#showAbout").addEventListener("click", ()=> toggleAboutImprint("show-about"));

// Öffnet das Overlay und entfernt die Schließen-Animation

function showOverlay() {
  let overlay = document.querySelector(".overlay");

  overlay.classList.remove("closing");

  if (!overlay.classList.contains("show-overlay")) {
    overlay.classList.add("show-overlay");
    overlay.setAttribute("aria-hidden", "false");
    console.log("Overlay visible");
    document.querySelector("#closeOverlay").focus();
    console.log(document.activeElement);
  }
}

// schließt das Overlay und wartet bis Animationen abgeschlossen sind

function hideOverlay() {
  let overlay = document.querySelector(".overlay");

  if (
    overlay.classList.contains("show-overlay") &&
    !overlay.classList.contains("hiding")
  ) {
    let overlayRight = document.querySelector(".overlay-right");

    overlay.classList.add("closing");
    overlayRight.addEventListener(
      "transitionend",
      function () {
        overlay.classList.remove("show-overlay");
        overlay.classList.remove("closing");
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
    let aboutImprintSlider = document.querySelector(".about-imprint-slider");

    if (targetClass === "show-about" && aboutImprintSlider.classList.contains("show-imprint")) {
        aboutImprintSlider.classList.replace("show-imprint", targetClass);
        document.querySelector(".about").setAttribute("aria-hidden", "false");
        document.querySelector(".imprint").setAttribute("aria-hidden", "true");
    }
    else if (targetClass === "show-imprint" && aboutImprintSlider.classList.contains("show-about")) {
        aboutImprintSlider.classList.replace("show-about", targetClass);
        document.querySelector(".imprint").setAttribute("aria-hidden", "false");
        document.querySelector(".about").setAttribute("aria-hidden", "true");
    }
}