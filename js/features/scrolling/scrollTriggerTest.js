/**
 * Erweiterte Projekt-Navigation mit GSAP
 * Mit vereinfachtem, robustem Observer
 */

import uiState from "../../core/uiState.js";
import { registerNavigationAPI } from "../../core/navigationUtils.js";

gsap.registerPlugin(Observer);

export function setupAdvancedNavigation() {
  const CONFIG = {
    PARALLAX_AMOUNT: 15,        // Wie weit Projekte rausgeschoben werden
    ANIMATION_DURATION: 0.8,    // Dauer der Animation
    SCROLL_TOLERANCE: 15        // Toleranz für Scroll-Events
  };

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
  });

  // Einheitliche Transition-Funktion für alle Projektwechsel
  function transitionToProject(index, direction) {
    index = wrap(index);
    if (index === currentIndex || animating) return;

    animating = true;

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
          if (i !== index) {
            gsap.set(p, { autoAlpha: 0, zIndex: 0 });
          }
        });
        animating = false;
        currentIndex = index;
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

  // Event-Dispatch an uiState
  function dispatchProjectChangeEvent(index) {
    const projectElement = projects[index];
    if (!projectElement) return;
    uiState.setActiveProject(index);
  }

  // VERBESSERT: Vereinfachter Observer ohne Zeit-basiertes Debouncing
  Observer.create({
    target: wrapper,
    type: "wheel,touch,pointer",
    wheelSpeed: -0.3,  // Angepasste Empfindlichkeit
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

  // Erstes Projekt anzeigen
  gsap.set(projects[0], {
    autoAlpha: 1,
    zIndex: 5,
    yPercent: 0
  });

  // Initialer Event-Dispatch
  setTimeout(() => {
    dispatchProjectChangeEvent(0);
  }, 300);

  // Navigation API für externe Verwendung
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