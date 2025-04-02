/**
 * Erweiterte Projekt-Navigation mit GSAP Observer
 * Inklusive Durchblätterfunktion und richtungsabhängigem Z-Index-Handling
 */

import uiState from "../../core/uiState.js";
import { EVENT_TYPES } from "../../core/events.js";
import { registerNavigationAPI } from "../../core/navigationUtils.js";

gsap.registerPlugin(Observer);

export function setupAdvancedNavigation() {
  const CONFIG = {
    PARALLAX_AMOUNT: 15,
    ANIMATION_DURATION: 1,
    SCROLL_TOLERANCE: 15
  };

  const projects = document.querySelectorAll(".project");
  let currentIndex = 0;
  let animating = false;

  const wrap = (index) => Math.max(0, Math.min(index, projects.length - 1));

  // Initiale Styles setzen
  projects.forEach((p, i) => {
    gsap.set(p, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      autoAlpha: i === 0 ? 1 : 0,
      yPercent: i === 0 ? 0 : 100,
      zIndex: 0
    });
  });

  function directTransition(index, direction) {
    index = wrap(index);
    if (index === currentIndex || animating) return;

    animating = true;

    const tl = gsap.timeline({
      defaults: {
        duration: CONFIG.ANIMATION_DURATION,
        ease: "power1.inOut"
      },
      onComplete: () => {
        projects.forEach((p, i) => gsap.set(p, { autoAlpha: i === index ? 1 : 0 }));
        animating = false;
        currentIndex = index;
      }
    });

    gsap.set(projects[index], {
      autoAlpha: 1,
      yPercent: direction > 0 ? 100 : -CONFIG.PARALLAX_AMOUNT,
      zIndex: direction > 0 ? 5 : 0
    });

    gsap.set(projects[currentIndex], { zIndex: direction > 0 ? 0 : 5 });

    tl.to(projects[currentIndex], {
      yPercent: direction > 0 ? -CONFIG.PARALLAX_AMOUNT : 100
    }, 0);

    tl.to(projects[index], {
      yPercent: 0
    }, 0);

    tl.call(() => {
      dispatchProjectChangeEvent(index);
    }, null, ">-0.3");
  }

function navigateToProject(targetIndex) {
  targetIndex = wrap(targetIndex);
  if (targetIndex === currentIndex || animating) return;

  const direction = targetIndex > currentIndex ? 1 : -1;
  
  // Bei direkten Nachbarn die einfache Transition verwenden
  if (Math.abs(targetIndex - currentIndex) === 1) {
    return directTransition(targetIndex, direction);
  }

  animating = true;

  // Projekte bestimmen und zurücksetzen
  projects.forEach(p => gsap.set(p, { autoAlpha: 0, zIndex: 0 }));
  gsap.set(projects[currentIndex], { autoAlpha: 1, yPercent: 0 });
  
  const projectIndices = direction > 0
    ? Array.from({ length: targetIndex - currentIndex + 1 }, (_, i) => currentIndex + i)
    : Array.from({ length: currentIndex - targetIndex + 1 }, (_, i) => currentIndex - i);

  // Progressive Z-Indices setzen (wichtig für korrekte Überlagerung)
  projectIndices.forEach((idx, i) => {
    const zValue = direction > 0 ? 100 + i : 100 + (projectIndices.length - i);
    gsap.set(projects[idx], { zIndex: zValue });
  });
  
  // Timeline für die Animation
  const tl = gsap.timeline({
    onComplete: () => {
      // Aufräumen
      projects.forEach((p, i) => {
        if (i !== targetIndex) gsap.set(p, { autoAlpha: 0 });
      });
      animating = false;
      currentIndex = targetIndex;
    }
  });

  // Aktuelles Projekt schnell ausblenden
  tl.to(projects[currentIndex], {
    yPercent: direction > 0 ? -CONFIG.PARALLAX_AMOUNT : 100,
    duration: 0.3,
    ease: "power1.out"
  }, 0);
  
  // Alle zu blätternden Projekte vorbereiten
  const projectsToAnimate = projectIndices.slice(1).map(idx => {
    // Projekte außerhalb des Sichtfelds positionieren
    gsap.set(projects[idx], {
      autoAlpha: 1,
      yPercent: direction > 0 ? 100 : -CONFIG.PARALLAX_AMOUNT
    });
    return projects[idx];
  });

  // Die Gesamtdauer mit Verzögerung berechnen
  const stageDuration = Math.min(0.5, 0.2 * (projectsToAnimate.length - 1) + 0.3);
  
  // Einblenden mit gestaffeltem Delay
  tl.to(projectsToAnimate, {
    yPercent: 0,
    duration: 0.4,
    ease: "power2.out",
    stagger: {
      each: 0.06,                // Festes Delay zwischen Elementen
      ease: "power1.in",         // Easing für die Verzögerungsverteilung
      from: "start"              // Vom ersten Element starten
    }
  }, 0.1);
  
  // Alle außer dem letzten wieder ausblenden
  tl.to(projectsToAnimate.slice(0, -1), {
    yPercent: direction > 0 ? -CONFIG.PARALLAX_AMOUNT : 100,
    duration: 0.3,
    ease: "power1.in",
    stagger: {
      each: 0.05,
      ease: "power1.in",
      from: "start"
    }
  }, ">-0.25"); // Früher starten für flüssigeren Übergang
  
  // Event auslösen
  tl.call(() => {
    dispatchProjectChangeEvent(targetIndex);
  }, null, ">-0.3");

  return tl;
}

  function dispatchProjectChangeEvent(index) {
    const projectElement = projects[index];
    if (!projectElement) return;
    uiState.setActiveProject(index);
  }

  // Scrollsteuerung via Observer
  let isScrolling = false;
  let lastScrollTime = 0;
  const scrollDebounceTime = 800;

  Observer.create({
    type: "wheel,touch,pointer",
    wheelSpeed: -0.3,
    onDown: (self) => {
      const now = Date.now();
      if (!isScrolling && now - lastScrollTime > scrollDebounceTime && Math.abs(self.deltaY) > 5) {
        isScrolling = true;
        lastScrollTime = now;
        directTransition(currentIndex - 1, -1);
        gsap.delayedCall(CONFIG.ANIMATION_DURATION + 0.3, () => { isScrolling = false; });
      }
    },
    onUp: (self) => {
      const now = Date.now();
      if (!isScrolling && now - lastScrollTime > scrollDebounceTime && Math.abs(self.deltaY) > 5) {
        isScrolling = true;
        lastScrollTime = now;
        directTransition(currentIndex + 1, 1);
        gsap.delayedCall(CONFIG.ANIMATION_DURATION + 0.3, () => { isScrolling = false; });
      }
    },
    tolerance: CONFIG.SCROLL_TOLERANCE,
    lockAxis: true,
    preventDefault: true
  });

  // Erstes Projekt anzeigen
  gsap.set(projects[0], {
    autoAlpha: 1,
    zIndex: 10,
    yPercent: 0
  });

  setTimeout(() => {
    dispatchProjectChangeEvent(0);
  }, 300);

  // Navigation API
  const api = {
    moveToNextProject: () => {
      if (animating) return;
      directTransition(currentIndex + 1, 1);
    },
    moveToPreviousProject: () => {
      if (animating) return;
      directTransition(currentIndex - 1, -1);
    },
    navigateToIndex: (index) => {
      if (animating) return;
      navigateToProject(index);
    },
    navigateToProject: (projectId) => {
      if (animating) return;
      const index = Array.from(projects).findIndex(
        p => p.getAttribute("data-project-id") === projectId.toString()
      );
      if (index !== -1) navigateToProject(index);
    },
    navigateToTop: () => {
      if (animating || currentIndex === 0) return;
      navigateToProject(0);
    },
    getCurrentIndex: () => currentIndex
  };

  registerNavigationAPI(api);
  return api;
}
