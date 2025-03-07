/* -----------------------------
   1. DOM-Selektoren und Variablen
   ----------------------------- */
const overlay = document.querySelector(".overlay");
const overlayRight = document.querySelector(".overlay-right");
const titleDescriptionContainer = document.querySelector(
  ".title-description-container"
);
let startY = 0;

/** Datenspeicher erstellen, in dem Projekte vorgehalten sind */
const dataStore = {
    projectsData: null,
    getProjects: function() {
        return this.projectsData;
    },
    loadProjects: async function () {
        try {
            console.log("Test-Fetch beginnt...");
            const response = await fetch('content/projects.json');
            const data = await response.json();
            console.log("Laden erfolgreich");
            this.projectsData = data;
            return data;
        } catch (error) {
            console.error(error);
            console.log("Laden nicht erfolgreich")
            return null;
        } 
    }
} 

/* ------------------------------------------------------------
   1.1 Zentrale Statusverwaltung der Projekte / Bilder / Farben
   ----------------------------------------------------------- */

   const uiState = {
    // Aktueller Zustand der Anwendung
    activeProjectIndex: -1,
    activeImageIndex: -1,
    activeTextColor: 'black',
    projects: [],

    // Methode zum Aktualisieren der Projekte
    updateProjects() {
        this.projects = Array.from(document.querySelectorAll('.project:not(.footer-container)'));
    },
    
    // Methode zum Setzen des aktiven Projekts
    setActiveProject(index) {
        if (index !== this.activeProjectIndex) {
            this.activeProjectIndex = index;
            document.dispatchEvent(new CustomEvent('activeProjectChanged', { 
                detail: { projectIndex: index }
            }));
        }
    },
    
    // Methode zum Setzen des aktiven Bildes
    setActiveImage(projectIndex, imageIndex, textColor) {
        const changed = projectIndex !== this.activeProjectIndex || 
                       imageIndex !== this.activeImageIndex ||
                       textColor !== this.activeTextColor;
        
        if (changed) {
            this.activeProjectIndex = projectIndex;
            this.activeImageIndex = imageIndex;
            this.activeTextColor = textColor || 'black';
            
            document.dispatchEvent(new CustomEvent('activeImageChanged', { 
                detail: { 
                    projectIndex: projectIndex,
                    imageIndex: imageIndex,
                    textColor: this.activeTextColor
                }
            }));
        }
    }
};


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

function handleKeyPress(event) {
  if (event.key === "Escape") {
    hideOverlay();
  }
}

// Überprüft touchstart

function handlePointerDown(event) {
  startY =
    event.clientY ||
    (event.touches && event.touches[0] && event.touches[0].clientY) ||
    0;
}

// Überprüft Swipe/Drag-Richtung unf öffnet ggf. Description Mobile

function handleTouchEnd(event) {
  const endY =
    event.clientY ||
    (event.changedTouches &&
      event.changedTouches[0] &&
      event.changedTouches[0].clientY) ||
    0;
  console.log("Touch geendet bei:", endY);
  console.log("startY", startY);
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
}

/* -----------------------------
   4. Funktionen
   ----------------------------- */


   /* -----------------------------
   4.1 Überwachung der Scrollposition
   ----------------------------- */


   function setupScrollHandler() {
    const container = document.querySelector('.project-container');
    
    
    // Aktuellen Projektindex berechnen (Scroll-Abstand nach oben / Fensterhöhe)
    function calculateActiveProjectIndex() {
        return Math.round(container.scrollTop / window.innerHeight);
    }
    
    // Funktion zum Aktualisieren des aktiven Projekts
    function updateActiveProject() {
        const newIndex = calculateActiveProjectIndex();
        
        // Nur aktualisieren, wenn sich der Index geändert hat und gültig ist
        if (newIndex !== uiState.activeProjectIndex && 
            newIndex >= 0 && 
            newIndex < uiState.projects.length) {
            
            console.log(`Aktives Projekt wechselt zu Index: ${newIndex}`);
            uiState.setActiveProject(newIndex);
        }
    }
    
    // ScrollEvent-Handler wenn gescrollt wird
    container.addEventListener('scroll', () => {
        // requestAnimationFrame verhindert zu häufige Updates in kurzer Zeit
        requestAnimationFrame(updateActiveProject);
    });
    
    // Initialen Status setzen (basierend auf anfänglicher Scroll-Position)
    const initialIndex = calculateActiveProjectIndex();
    if (initialIndex >= 0 && initialIndex < uiState.projects.length) {
        uiState.setActiveProject(initialIndex);
    }
}

// Scrollt nach oben

function scrollToTop () {
    const container = document.querySelector('.project-container');
    container.scrollTo({ top: 0, behavior: 'smooth' });
}

// Footer schließen

function closeFooter () {
    const container = document.querySelector('.project-container');
    const currentScrollPos = container.scrollTop;
    const viewportHeight = window.innerHeight;
    container.scrollTo({ 
        top: Math.max(0, currentScrollPos - viewportHeight),
        behavior: 'smooth'
    });
}

   // Öffnet und schließt Description Mobile

function toggleDescription() {
  titleDescriptionContainer.classList.toggle("show-description");
  titleDescriptionContainer.setAttribute(
    "aria-expanded",
    titleDescriptionContainer.getAttribute("aria-expanded") === "false"
      ? "true"
      : "false"
  );
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


/** Projekte Laden */


async function initializeWebsite () {
    console.log("Initialize Website gestartet");    
    const projects = await dataStore.loadProjects();
        console.log("Geladene Daten:", projects);   
        if(projects) {
            console.log("Loading of projects successful!");
            createProjectElements ();
        } else {
            console.log("Loading failed - no data returned");  
        }
} 

function createProjectElements() {
    const projectsData = dataStore.getProjects();
    const container = document.querySelector(".project-container");

        // Scroll-Snap temporär deaktivieren
        const originalSnapType = container.style.scrollSnapType;
        container.style.scrollSnapType = 'none';
    
    // Footer speichern und entfernen
    const footerElement = container.querySelector(".footer-container");
    if (footerElement) {
        footerElement.remove();
    }
    
    // Container komplett leeren
    container.innerHTML = '';

    if (projectsData && projectsData.data) {
        projectsData.data.forEach((project) => {
            // Bilder-HTML erstellen (falls vorhanden)
            let imagesHTML = '';
            if (project.project_images && project.project_images.length > 0) {
                imagesHTML = project.project_images.map(img => `
                    <img 
                        src="${img.image[0].url}" 
                        alt="${img.image[0].alt || project.name}" 
                        data-id="${img.id}"
                        data-text-color="${img.textColor}"
                        data-image-title="${img.imageTitle}"
                        class="slide"
                    />
                `).join('');
            }
            
            // Eindeutige IDs für Accessibility
            const projectTitleId = `project-title-${project.id}`;
            
            // Gesamtes Projekt-HTML
            const projectHTML = `
                    <article 
        class="project" 
        aria-labelledby="${projectTitleId}"
        data-project-id="${project.id}"
        data-project-name="${project.name}"
    >
                    <div class="slider">
                        ${imagesHTML}
                    </div>
                    <div class="description desktop-only" id="${projectTitleId}">
                        ${project.description[0].children[0].text}
                    </div>
                </article>
            `;
            
            container.insertAdjacentHTML('beforeend', projectHTML);

        });
    }
    if (footerElement) {
        // Footer anhängen und "hidden" entfernen
        container.appendChild(footerElement);
        footerElement.classList.remove('hidden-footer');
    }
        // Am Ende: Zum ersten Projekt scrollen und dann Snap wiederherstellen
        setTimeout(() => {
            container.scrollTop = 0;
            setTimeout(() => {
                container.style.scrollSnapType = originalSnapType;
                uiState.updateProjects();

                setupScrollHandler();
                setupProjectTitle();
            }, 50);
        }, 50);
        uiState.updateProjects();
}

document.addEventListener("DOMContentLoaded", initializeWebsite);

// Dynamische Änderung der Projekttitel
function setupProjectTitle() {
    // DOM-Elemente
    const projectTitle = document.querySelector('.project-title');
    const mobileTitle = document.querySelector('.project-title-mobile');
    const mobileDescription = document.querySelector('.description-mobile');
    
    // Funktion zum Aktualisieren der Titel
    function updateTitles() {
        // Index aus dem zentralen State holen
        const index = uiState.activeProjectIndex;
        
        // Wenn ein gültiges Projekt gefunden wurde
        if (index >= 0 && index < uiState.projects.length) {
            const project = uiState.projects[index];
            const name = project.getAttribute('data-project-name');
            const description = project.querySelector('.description')?.textContent || '';
            
            // Titel aktualisieren
            if (projectTitle) projectTitle.textContent = name;
            if (mobileTitle) mobileTitle.textContent = name;
            if (mobileDescription) mobileDescription.textContent = description;
        }
    }
    
    // Initial ausführen
    setTimeout(updateTitles, 100); // Kurze Verzögerung für die Initialisierung
    
    // Auf Änderungen des aktiven Projekts reagieren
    document.addEventListener('activeProjectChanged', function() {
        if (projectTitle) projectTitle.classList.add('fade-out');
        if (mobileTitle) mobileTitle.classList.add('fade-out');
        if (mobileDescription) mobileDescription.classList.add('fade-out');
        
        setTimeout(function() {
            updateTitles();
            
            if (projectTitle) projectTitle.classList.remove('fade-out');
            if (mobileTitle) mobileTitle.classList.remove('fade-out');
            if (mobileDescription) mobileDescription.classList.remove('fade-out');
        }, 300);
    });
}