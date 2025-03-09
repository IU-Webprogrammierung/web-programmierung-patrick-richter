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
            console.log("dataStore: Test-Fetch beginnt...");
            const response = await fetch('content/projects.json');
            const data = await response.json();
            console.log("dataStore: Laden erfolgreich");
            this.projectsData = data;
            return data;
        } catch (error) {
            console.error(error);
            console.log("dataStore: Laden nicht erfolgreich")
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
            console.log("uiState: Projekt geupdated - neues Projekt:", this.activeProjectIndex, index);
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
            console.log("uiState: Bild geupdated - neues Bild:", imageIndex, this.activeImageIndex, "projekt: ", projectIndex, "TextFarbe: ", textColor);
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
  console.log("handleTouchEnd: Touch geendet bei:", endY);
  console.log("handleTouchEnd: startY", startY);
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
            
            console.log(`updateActiveProject: Aktives Projekt wechselt zu Index: ${newIndex}`);
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
    console.log("initializeWebsite: Initialize Website gestartet");    
    const projects = await dataStore.loadProjects();
        console.log("initializeWebsite: Geladene Daten:", projects);   
        if(projects) {
            console.log("initializeWebsite: Loading of projects successful!");
            createProjectElements ();
        } else {
            console.log("initializeWebsite: Loading failed - no data returned");  
        }
} 

function createProjectElements() {
    const projectsData = dataStore.getProjects();
    const container = document.querySelector(".project-container");

        // Scroll-Snap temporär deaktivieren - vielleicht mit REACT entfernen?
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
                setupImageColorHandler(); 

            }, 50);
        }, 50);
        uiState.updateProjects();
}

document.addEventListener("DOMContentLoaded", initializeWebsite);

// Dynamische Änderung der Projekttitel
function setupProjectTitle() {
    // DOM-Elemente
    const headerTitle = document.querySelector('.project-title');
    const mobileTitle = document.querySelector('.project-title-mobile');
    const mobileDescription = document.querySelector('.description-mobile');

    
    // Animationsstatus
    let isAnimating = false;
    let transitionCompleted = false;
    
    // Hilfsfunktion für konsistentes Parsing von Zeitwerten
    function parseTimeValue(timeStr, defaultValue) {
        if (!timeStr) return defaultValue;
        if (timeStr.endsWith('ms')) return parseFloat(timeStr);
        if (timeStr.endsWith('s')) return parseFloat(timeStr) * 1000;
        return parseFloat(timeStr);
    }
    
    // CSS-Variablen auslesen mit einheitlichem Parsing
    const style = getComputedStyle(document.documentElement);
    const fadeDuration = parseTimeValue(style.getPropertyValue('--title-fade-duration').trim(), 300);
    const betweenPauseMs = parseTimeValue(style.getPropertyValue('--title-between-pause').trim(), 200);
    const initialDelayMs = parseTimeValue(style.getPropertyValue('--title-initial-delay').trim(), 200);
    const initialDuration = parseTimeValue(style.getPropertyValue('--title-initial-duration').trim(), 800);
    
    // Gemeinsame Funktion zum Setzen der Titel
    function setTitles(projectName, projectDesc) {
        headerTitle.textContent = projectName;
        if (mobileTitle) mobileTitle.textContent = projectName;
        if (mobileDescription) mobileDescription.textContent = projectDesc;
    }
    
    // Titelwechsel durchführen
    function handleTitleChange() {
        // Warte eine konfigurierbare Zeit bevor der neue Titel erscheint
        setTimeout(() => {
            // Inhalte aktualisieren
            updateTitleContents();
            
            // Alle Elemente wieder einblenden
            headerTitle.classList.remove('fade-out');
            if (mobileTitle) mobileTitle.classList.remove('fade-out');
            if (mobileDescription) mobileDescription.classList.remove('fade-out');
            
            // Animation abschließen
            setTimeout(() => {
                isAnimating = false;
                transitionCompleted = false;
            }, 50);
        }, betweenPauseMs);
    }
    
    // Inhalte basierend auf dem aktuellen Status aktualisieren
    function updateTitleContents() {
        // Den Index aus dem zentralen Status abrufen
        const activeIndex = uiState.activeProjectIndex;
        
        if (activeIndex >= 0 && activeIndex < uiState.projects.length) {
            const activeProject = uiState.projects[activeIndex];
            console.log("setupProjectTitle: UpdateTitleContents hat aktives Projekt gesetzt: ",activeProject)
            const projectName = activeProject.getAttribute('data-project-name');
            const projectDesc = activeProject.querySelector('.description')?.textContent || '';
            
            console.log(`setupProjectTitle: updateTitleContents: Titel wird aktualisiert zu: ${projectName}`);
            setTitles(projectName, projectDesc);
        }
    }
    
    // Event-Listener für Transition-End
    headerTitle.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && headerTitle.classList.contains('fade-out')) {
            transitionCompleted = true;
            handleTitleChange();
        }
    });
    
    // Auf Projektänderungen reagieren (Wichtig!)
    document.addEventListener('activeProjectChanged', () => {
        console.log('setupProjectTitle: Event activeProjectChanged empfangen');
        
        if (!isAnimating) {
            isAnimating = true;
            transitionCompleted = false;
            
            // Alle Elemente ausblenden
            headerTitle.classList.add('fade-out');
            if (mobileTitle) mobileTitle.classList.add('fade-out');
            if (mobileDescription) mobileDescription.classList.add('fade-out');
            
            // Fallback-Timer für den Fall, dass transitionend nicht ausgelöst wird
            setTimeout(() => {
                if (!transitionCompleted && headerTitle.classList.contains('fade-out')) {
                    handleTitleChange();
                }
            }, fadeDuration + 50);
        }
    });
    
    // Initialen Titel mit Animation einblenden
    function setupInitialTitle() {
        // Animation anwenden
        headerTitle.classList.add('initial-appear');
        if (mobileTitle) mobileTitle.classList.add('initial-appear');
        if (mobileDescription) mobileDescription.classList.add('initial-appear');
        
        // Initiale Inhalte setzen
        updateTitleContents();
        
        // Animation nach Ablauf entfernen
        setTimeout(() => {
            headerTitle.classList.remove('initial-appear');
            if (mobileTitle) mobileTitle.classList.remove('initial-appear');
            if (mobileDescription) mobileDescription.classList.remove('initial-appear');
        }, initialDuration);
    }
    
    // Initialen Titel mit optionaler Verzögerung anzeigen
    if (initialDelayMs <= 0) {
        setupInitialTitle();
    } else {
        setTimeout(setupInitialTitle, initialDelayMs);
    }
}

function setupImageColorHandler() {
    // Speichert aktive Observer, um sie später zu trennen
    let currentObservers = [];
    
    // Funktion zum Einrichten der Observer für ein bestimmtes Projekt
    function setupImageObserversForProject(projectIndex) {
        // Bestehende Observer trennen
        currentObservers.forEach(obs => obs.disconnect());
        currentObservers = [];
        
        // Nur für gültige Projekte fortfahren
        if (projectIndex >= 0 && projectIndex < uiState.projects.length) {
            const project = uiState.projects[projectIndex];
            const slider = project.querySelector('.slider');
            
            if (!slider) return;
            
            const slides = slider.querySelectorAll('.slide');
            console.log(`Observer für Projekt ${projectIndex} eingerichtet, ${slides.length} Bilder gefunden`);
                        
            const options = {
                root: slider,
                threshold: 0.6,
                rootMargin: "0px"
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const slide = entry.target;
                        const imageId = parseInt(slide.getAttribute('data-id'));
                        const textColor = slide.getAttribute('data-text-color');
                        
                        // Status aktualisieren (löst activeImageChanged aus)
                        uiState.setActiveImage(projectIndex, imageId, textColor);
                    }
                });
            }, options);
            
            // Alle Bilder im aktuellen Slider beobachten
            slides.forEach(slide => {
                observer.observe(slide);
            });
            
            currentObservers.push(observer);
        }
    }
    
    // Bei Projektwechsel neue Observer einrichten
    document.addEventListener('activeProjectChanged', (event) => {
        const { projectIndex } = event.detail;
        setupImageObserversForProject(projectIndex);
    });
    
    // Event-Listener für Farbänderungen
    document.addEventListener('activeImageChanged', handleColorChange);
    
    // Initial für das aktive Projekt
    setTimeout(() => {
        setupImageObserversForProject(uiState.activeProjectIndex);
    }, 100);
}

let debounceColorTimer = null;

function handleColorChange(event) {
    const textColor = event.detail.textColor;
    const projectIndex = event.detail.projectIndex;
        
    // Prüfen, ob dies ein Farbwechsel durch Projektwechsel ist
    const isProjectChange = event.detail.hasOwnProperty('projectIndex') && 
                          projectIndex === uiState.activeProjectIndex &&
                          document.querySelector('.project-title.fade-out');
    
    // Debouncing: Zu schnelle Farbwechsel vermeiden
    clearTimeout(debounceColorTimer);
    
    // Bei Projektwechsel mit längerem Delay, sonst mit kürzerem
    const delay = isProjectChange ? 350 : 50;
    
    debounceColorTimer = setTimeout(() => {
        // Nur hier wird die Farbe tatsächlich geändert
        document.documentElement.style.setProperty('--active-text-color', textColor);
        console.log(`Farbe geändert zu: ${textColor}${isProjectChange ? ' (verzögert nach Projektwechsel)' : ''}`);
    }, delay);
}