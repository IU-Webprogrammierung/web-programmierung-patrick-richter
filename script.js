let overlayStatus = false;

document.querySelector("#openOverlay").addEventListener("click", showOverlay);
document.querySelector("#closeOverlay").addEventListener("click", hideOverlay);
document.querySelector("#overlayLeft").addEventListener("click", hideOverlay);


// Öffnet das Overlay und entfernt die Schließen-Animation


function showOverlay() {
  let overlay = document.querySelector(".overlay");

  overlay.classList.remove("closing");

  if (!overlay.classList.contains("show-overlay")) {
    overlay.classList.add("show-overlay");
    overlayStatus = true;
    console.log("Overlay wird angezeigt");
  }     
}

// schließt das Overlay und wartet bis Animationen abgeschlossen sind
// TODO: Escape Taste zum Schließen und Schließen bei Klick ins linke Fenster

function hideOverlay() {
    let overlay = document.querySelector(".overlay");
    let overlayRight = document.querySelector(".overlay-right");

  if (overlay.classList.contains("show-overlay") && !overlay.classList.contains("hiding")) {
    overlay.classList.add("closing");
    overlayRight.addEventListener("transitionend", function() {
        overlay.classList.remove("show-overlay");
        overlay.classList.remove("closing");
        }, {once:true})
    overlayStatus = false;
    console.log("Overlay wird nicht angezeigt");
  }
}


