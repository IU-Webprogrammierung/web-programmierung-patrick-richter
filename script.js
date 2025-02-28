document.querySelector("#openOverlay").addEventListener("click", showOverlay);
document.querySelector("#closeOverlay").addEventListener("click", hideOverlay);
document.querySelector("#overlayLeft").addEventListener("click", hideOverlay);
addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideOverlay();
  }
});

// Öffnet das Overlay und entfernt die Schließen-Animation

function showOverlay() {
  let overlay = document.querySelector(".overlay");

  overlay.classList.remove("closing");

  if (!overlay.classList.contains("show-overlay")) {
    overlay.classList.add("show-overlay");
    overlay.setAttribute("aria-hidden", "false");
    console.log("Overlay visible");
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
        console.log("Overlay hidden");
        console.log(document.activeElement);
      },
      { once: true }
    );
  }
}
