/**
 * projectNavigator.js
 * Hauptmodul für die Projekt-Navigation mit GSAP
 */

import { setupKeyboardNavigation } from './navigationKeyboardHandler.js';
import { setupHistoryRouting } from './navigationRouting.js';
import uiState from "../../core/uiState.js";
import { registerNavigationAPI, isFooter } from "./navigationUtils.js";

export function setupProjectNavigation() {
  // Konfiguration
  const CONFIG = {
    PARALLAX_AMOUNT: 15,
    ANIMATION_DURATION: 0.8,
    SCROLL_TOLERANCE: 15
  };

  // DOM-Elemente und Zustandsverwaltung
  const wrapper = document.querySelector(".project-scroll-wrapper") || document;
  const projects = document.querySelectorAll(".project");
  let currentIndex = 0;
  let animating = false;

  // Sicherstellen, dass der Index im gültigen Bereich bleibt
  const wrap = (index) => Math.max(0, Math.min(index, projects.length - 1));

  // Initiale Styles für alle Projekte setzen
  projects.forEach((p, i) => {
    gsap.set(p, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      autoAlpha: i === 0 ? 1 : 0,
      yPercent: i === 0 ? 0 : 100,
      zIndex: i === 0 ? 5 : 0 
    });
    
    // Accessibility: ARIA-Attribute
    p.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
    if (p.getAttribute('role') !== 'region') {
      p.setAttribute('role', 'region');
    }
  });

  /**
   * Transition-Funktion für Projektwechsel
   * @param {number} index - Ziel-Projektindex
   * @param {number} direction - Richtung (1 = nach unten, -1 = nach oben)
   * @returns {gsap.core.Timeline} - Die erstellte GSAP-Timeline
   */
  function transitionToProject(index, direction) {
    index = wrap(index);
    if (index === currentIndex || animating) return;

    animating = true;
    console.log(`Navigiere zu Projekt ${index}, Richtung: ${direction}`);

    // UI-Update etwas früher auslösen für besseres Nutzergefühl
    gsap.delayedCall(CONFIG.ANIMATION_DURATION * 0.4, () => {
      dispatchProjectChangeEvent(index);
    });

    const tl = gsap.timeline({
      defaults: {
        duration: CONFIG.ANIMATION_DURATION,
        ease: "power2.inOut"
      },
      onComplete: () => {
        // Aufräumen nach der Animation
        projects.forEach((p, i) => {
          const projectIsFooter = isFooter(p);
          const isLastRegularProject = i === projects.length - 2; // Vorletztes Element = letztes reguläres Projekt
          const isFooterActive = index === projects.length - 1;
          
          if (i !== index) {
            if (projectIsFooter) {
              // Footer immer sichtbar
              gsap.set(p, { autoAlpha: 1, zIndex: 1 });
              p.setAttribute('aria-hidden', 'false');
            } else if (isLastRegularProject && isFooterActive) {
              // Letztes Projekt sichtbar lassen, wenn Footer aktiv ist
              gsap.set(p, { autoAlpha: 1, zIndex: 2 }); // Zwischen Footer und aktivem Projekt
              p.setAttribute('aria-hidden', 'false');
            } else {
              // Andere Projekte ausblenden
              gsap.set(p, { autoAlpha: 0, zIndex: 0 });
              p.setAttribute('aria-hidden', 'true');
            }
          } else {
            // Aktives Projekt
            gsap.set(p, { zIndex: 5 }); // Höchster z-index für aktives Projekt
            p.setAttribute('aria-hidden', 'false');
          }
        });
        
        animating = false;
        currentIndex = index;
        console.log(`Navigation zu Projekt ${index} abgeschlossen`);
      }
    });

    // Zielprojekt vorbereiten
    gsap.set(projects[index], {
      autoAlpha: 1,
      yPercent: direction > 0 ? 100 : -CONFIG.PARALLAX_AMOUNT,
      zIndex: direction > 0 ? 5 : 0
    });

    // Z-Index für Überlagerungsverhalten setzen
    gsap.set(projects[currentIndex], { 
      zIndex: direction > 0 ? 0 : 5 
    });

    // Gleichzeitige Animation beider Projekte
    tl.to(projects[currentIndex], {
      yPercent: direction > 0 ? -CONFIG.PARALLAX_AMOUNT : 100
    }, 0);

    tl.to(projects[index], {
      yPercent: 0
    }, 0);

    return tl;
  }

  /**
   * Benachrichtigt uiState über Projektwechsel
   * @param {number} index - Index des neuen aktiven Projekts
   */
  function dispatchProjectChangeEvent(index) {
    const projectElement = projects[index];
    if (!projectElement) return;
    
    // Prüfen, ob es sich um den Footer handelt
    const projectIsFooter = isFooter(projectElement);
    
    // uiState aktualisieren mit zusätzlichen Informationen für den Footer
    if (projectIsFooter) {
      uiState.setActiveProject(index);
      // Eigenes Event für Footer-Aktivierung dispatchen
      dispatchCustomEvent('footerActivated', { index });
    } else {
      uiState.setActiveProject(index);
    }
  }

  // Scroll/Touch-Handler mit Observer
  Observer.create({
    target: wrapper,
    type: "wheel,touch,pointer",
    wheelSpeed: -0.3,
    onDown: (self) => {
      if (animating || Math.abs(self.deltaY) <= CONFIG.SCROLL_TOLERANCE) return;
      transitionToProject(currentIndex - 1, -1);
    },
    onUp: (self) => {
      if (animating || Math.abs(self.deltaY) <= CONFIG.SCROLL_TOLERANCE) return;
      transitionToProject(currentIndex + 1, 1);
    },
    lockAxis: true,
    preventDefault: true
  });

  // Klick auf oberen Footer-Bereich zum vorherigen Projekt
  const footerTop = document.querySelector('.footer-top');
  if (footerTop) {
    footerTop.addEventListener('click', () => {
      if (!animating) {
        // Zum letzten regulären Projekt scrollen
        const lastRegularProjectIndex = projects.length - 2;
        transitionToProject(lastRegularProjectIndex, -1);
      }
    });
  }

  // Erstes Projekt anzeigen
  gsap.set(projects[0], {
    autoAlpha: 1,
    zIndex: 5,
    yPercent: 0
  });

  // Module initialisieren
  setupKeyboardNavigation(transitionToProject, projects, () => animating);
  
  setupHistoryRouting({
    projects,
    transitionToProject,
    getCurrentIndex: () => currentIndex,
    dispatchProjectChangeEvent,
    isFooter
  });

  // Initialer Event-Dispatch
  setTimeout(() => {
    dispatchProjectChangeEvent(0);
  }, 300);

  // Navigation-API für externe Nutzung
  const api = {
    moveToNextProject: () => {
      if (animating) return;
      transitionToProject(currentIndex + 1, 1);
    },
    moveToPreviousProject: () => {
      if (animating) return;
      transitionToProject(currentIndex - 1, -1);
    },
    navigateToIndex: (index) => {
      if (animating) return;
      const direction = index > currentIndex ? 1 : -1;
      transitionToProject(index, direction);
    },
    navigateToProject: (projectId) => {
      if (animating) return;
      const index = Array.from(projects).findIndex(
        p => p.getAttribute("data-project-id") === projectId.toString()
      );
      if (index !== -1) {
        const direction = index > currentIndex ? 1 : -1;
        transitionToProject(index, direction);
      }
    },
    navigateToTop: () => {
      if (animating || currentIndex === 0) return;
      transitionToProject(0, -1);
    },
    getCurrentIndex: () => currentIndex
  };

  // API registrieren und zurückgeben
  registerNavigationAPI(api);
  return api;
}