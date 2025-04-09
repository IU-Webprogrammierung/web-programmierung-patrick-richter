/**
 * @module projectNavigator
 * @description Hauptmodul für die Projekt-Navigation mit GSAP-Animationen.
 * Steuert Übergänge zwischen Projekten mittels Events und GSAP.
 * 
 * @fires EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Bei Projektwechsel
 * @fires EVENT_TYPES.INITIAL_PROJECT_SET - Beim Setzen des initialen Projekts
 */

import uiState from "@core/state/uiState.js";
import { checkFooter } from "@utils/navigationUtils.js";
import { EVENT_TYPES, dispatchCustomEvent } from "@core/state/events.js";
import { getValidatedElement } from "@utils/utils.js";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { setupKeyboardNavigation } from "@portfolio/navigation/navigationKeyboardHandler.js";
import { registerNavigationAPI } from "@utils/navigationUtils.js";

function init() {
  // Konfiguration
  const CONFIG = {
    PARALLAX_AMOUNT: 15,
    ANIMATION_DURATION: 0.8,
    SCROLL_TOLERANCE: 15,
  };

  // Alle navigierbaren Elemente in einer Collection
  const navigableElements = [
    ...document.querySelectorAll(".project"),
    document.getElementById("site-footer"),
  ];

  let currentIndex = 0;
  let animating = false;

  // Footer visuell initialisieren (Inhalt wird über Events geladen)
  const footerElement = document.getElementById("site-footer");
  if (footerElement) {
    // Footer-Top Click-Handler 
    const footerTop = footerElement.querySelector(".footer-top");
    if (footerTop) {
      footerTop.addEventListener("click", () => {
        if (!animating) {
          // Zum vorletzten Element (reguläres letztes Projekt)
          transitionToElement(navigableElements.length - 2, -1);
        }
      });
    }
  }

  // Sicherstellen, dass der Index im gültigen Bereich bleibt
  const wrap = (index) =>
    Math.max(0, Math.min(index, navigableElements.length - 1));

  // Initiale Styles für alle navigierbaren Elemente
  navigableElements.forEach((el, i) => {
    gsap.set(el, {
      position: "absolute", // Alle Elemente einheitlich als absolute
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      autoAlpha: i === 0 ? 1 : 0,
      yPercent: i === 0 ? 0 : 100,
      zIndex: i === 0 ? 5 : 0, // Einfache Hierarchie - aktives Element oben
    });

    // Accessibility
    el.setAttribute("aria-hidden", i !== 0 ? "true" : "false");
    if (el.getAttribute("role") !== "region") {
      el.setAttribute("role", "region");
    }
  });

  /**
   * Einheitliche Funktion für die Navigation zu einem Element
   * @param {number} index - Zielindex des Elements
   * @param {number} direction - Richtung der Animation (1: vorwärts, -1: rückwärts)
   * @returns {gsap.timeline} Die GSAP-Timeline für die Animation
   */
  function transitionToElement(index, direction) {
    index = wrap(index);
    if (index === currentIndex || animating) return;

    animating = true;
    console.log(`Navigiere zu Element ${index}, Richtung: ${direction}`);

    // Feststellen, ob wir zum/vom Footer navigieren
    const isToFooter = checkFooter(index, navigableElements);
    const isFromFooter = checkFooter(currentIndex, navigableElements);
    const lastProjectIndex = navigableElements.length - 2;

    // UI-Update mit Verzögerung
    gsap.delayedCall(CONFIG.ANIMATION_DURATION * 0.4, () => {
      dispatchElementChangeEvent(index);
    });

    const tl = gsap.timeline({
      defaults: {
        duration: CONFIG.ANIMATION_DURATION,
        ease: "power2.inOut",
      },
      onComplete: () => {
        // Aufräumen nach Animation
        navigableElements.forEach((el, i) => {
          if (i !== index) {
            // Spezialfall: Bei Footer-Aktivierung das letzte Projekt sichtbar lassen
            if (isToFooter && i === lastProjectIndex) {
              gsap.set(el, {
                autoAlpha: 1, // Vollständig sichtbar
                zIndex: 4, // Unter Footer, über anderen Projekten
              });
              // Accessibility: Trotzdem als hidden markieren
              el.setAttribute("aria-hidden", "true");
            } else {
              // Andere Projekte ausblenden
              gsap.set(el, { autoAlpha: 0, zIndex: 0 });
              el.setAttribute("aria-hidden", "true");
            }
          } else {
            // Aktives Element
            gsap.set(el, {
              zIndex: checkFooter(i, navigableElements) ? 50 : i === 0 ? 5 : 0, // Footer höheren z-index
            });
            el.setAttribute("aria-hidden", "false");
          }
        });

        animating = false;
        currentIndex = index;
        console.log(`Navigation zu Element ${index} abgeschlossen`);
      },
    });

    // Ziel vorbereiten
    gsap.set(navigableElements[index], {
      autoAlpha: 1,
      yPercent: direction > 0 ? 100 : -CONFIG.PARALLAX_AMOUNT,
      zIndex: isToFooter ? 50 : 5, // Höherer z-index für Footer
    });

    // Z-Index für Überlagerung
    gsap.set(navigableElements[currentIndex], {
      zIndex:
        currentIndex === navigableElements.length - 1
          ? 50
          : direction > 0
          ? 0
          : 5,
    });

    // Speziallogik für Footer-Übergänge
    if (isToFooter) {
      // Letztes Projekt beim Wechsel zum Footer sichtbar und mit Parallax
      gsap.to(navigableElements[lastProjectIndex], {
        yPercent: -CONFIG.PARALLAX_AMOUNT,
        autoAlpha: 1, // Vollständig sichtbar, nicht transparent
        zIndex: 4,
        duration: CONFIG.ANIMATION_DURATION,
        ease: "power2.inOut",
      });
    } else if (isFromFooter) {
      // Beim Verlassen des Footers das letzte Projekt nur ausblenden,
      // wenn wir nicht zum letzten Projekt navigieren
      if (index !== lastProjectIndex) {
        gsap.to(navigableElements[lastProjectIndex], {
          yPercent: 0,
          autoAlpha: 0,
          duration: CONFIG.ANIMATION_DURATION,
          ease: "power2.inOut",
        });
      }
    }

    // Normale Transition für aktuelle/neue Elemente
    tl.to(
      navigableElements[currentIndex],
      {
        yPercent: direction > 0 ? -CONFIG.PARALLAX_AMOUNT : 100,
        force3D: true,
        overwrite: "auto",
        // NICHT den z-index während der Animation ändern für Footer
        onStart: () => {
          // Bei Footer-Animation z-index erhalten
          if (checkFooter(currentIndex, navigableElements)) {
            gsap.set(navigableElements[currentIndex], { zIndex: 50 });
          }
        },
      },
      0
    );

    tl.to(
      navigableElements[index],
      {
        yPercent: 0,
      },
      0
    );

    return tl;
  }

  /**
   * Benachrichtigt über Elementwechsel - erkennt automatisch den Footer
   * @param {number} index - Index des neuen aktiven Elements
   */
  function dispatchElementChangeEvent(index) {
    const element = navigableElements[index];
    if (!element) return;

    // Standard-Event für alle Elemente inkl. Footer
    uiState.setActiveProject(index);
  }

  // Observer für Scroll/Touch
  Observer.create({
    target: document.body, // Target auf body für bessere Erkennung von allen Elementen
    type: "wheel,touch,pointer",
    wheelSpeed: -0.3,
    onDown: (self) => {
      if (animating || Math.abs(self.deltaY) <= CONFIG.SCROLL_TOLERANCE) return;
      transitionToElement(currentIndex - 1, -1);
    },
    onUp: (self) => {
      if (animating || Math.abs(self.deltaY) <= CONFIG.SCROLL_TOLERANCE) return;
      transitionToElement(currentIndex + 1, 1);
    },
    lockAxis: true,
    preventDefault: true,
  });

  // Module initialisieren
  setupKeyboardNavigation(
    transitionToElement,
    navigableElements,
    () => animating
  );

  // Initiales Projekt setzen
  uiState.activeProjectIndex = 0;
  dispatchCustomEvent(EVENT_TYPES.INITIAL_PROJECT_SET);
  console.log("projectNavigator: Initiales Projekt gesetzt, INITIAL_PROJECT_SET:", uiState.activeProjectIndex);

  // Navigation-API für andere Module (vor allem Router)
  const api = {
    moveToNextElement: () => {
      if (animating) return;
      transitionToElement(currentIndex + 1, 1);
    },
    moveToPreviousElement: () => {
      if (animating) return;
      transitionToElement(currentIndex - 1, -1);
    },
    navigateToIndex: (index, customDirection) => {
      if (animating) return;
      const direction = customDirection || (index > currentIndex ? 1 : -1);
      transitionToElement(index, direction);
    },
    navigateToProject: (projectId) => {
      if (animating) return;
      const index = Array.from(navigableElements).findIndex(
        (el) => el.getAttribute("data-project-id") === projectId.toString()
      );
      if (index !== -1) {
        const direction = index > currentIndex ? 1 : -1;
        transitionToElement(index, direction);
      }
    },
    navigateToTop: () => {
      if (animating || currentIndex === 0) return;
      transitionToElement(0, -1);
    },
    getCurrentIndex: () => currentIndex,
    isFooterActive: () => checkFooter(navigableElements[currentIndex]),
  };

  // API registrieren für bestehende Komponenten (Abwärtskompatibilität)
  registerNavigationAPI(api);
  
  // Scrollt-To-Top-Button-Handler
  const scrollTopButton = getValidatedElement("#scrollTop");
  if (scrollTopButton) {
    scrollTopButton.addEventListener("click", () => {
      api.navigateToTop();
    });
  }
  
  return api;
}

export default {
  init,
};