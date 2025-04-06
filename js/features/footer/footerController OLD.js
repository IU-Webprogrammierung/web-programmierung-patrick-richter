/**
 * @module footerController
 * @description Steuert die Interaktion mit dem Footer.
 * Verwaltet Animation, Ein-/Ausblenden und Event-Handling für den Footer.
 */

import { EVENT_TYPES, dispatchCustomEvent } from "../../core/events.js";
import { getNavigationAPI } from "../navigation/navigationUtils.js";
import { getValidatedElement } from "../../core/utils.js";

// Zustandsvariablen
let footerElement = null;
let isFooterActive = false;

/**
 * Richtet Controller für Footer-Interaktionen ein
 * @param {Element} footer - Das Footer-DOM-Element
 */
export function setupFooterController(footer) {
  footerElement = footer;
  
  if (!footerElement) {
    console.error("Footer-Element nicht gefunden");
    return;
  }
  
  // Event-Listener für Footer-Top-Bereich
  const footerTop = getValidatedElement("#footerTop", "Footer-Top-Element nicht gefunden");
  
  if (footerTop) {
    footerTop.addEventListener("click", () => {
      console.log("Footer-Top geklickt - Navigation zum vorherigen Projekt");
      
      // Navigation zum letzten regulären Projekt
      const navigation = getNavigationAPI();
      if (navigation) {
        const currentIndex = navigation.getCurrentIndex();
        navigation.navigateToIndex(currentIndex - 1);
      } else {
        console.warn("Navigation-API nicht verfügbar");
      }
    });
  }
  
  // Footer als spezielles Element markieren
  footerElement.dataset.specialElement = "footer";
  
  console.log("Footer-Controller eingerichtet");
}

/**
 * Zeigt den Footer an mit Animation
 */
// In footerController.js - Event-Dispatching verbessern

export function showFooter() {
    if (!footerElement || isFooterActive) return;
    
    console.log("Footer wird angezeigt");
    isFooterActive = true;
    
    // ARIA-Status aktualisieren
    footerElement.setAttribute("aria-hidden", "false");
    
    // Vor der Animation das Event auslösen!
    dispatchCustomEvent(EVENT_TYPES.FOOTER_ACTIVATED, { active: true });
    
    // Mit GSAP animieren
    gsap.to(footerElement, {
      y: 0,
      zIndex: 50, // Stark erhöhter z-index

      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        console.log("Footer-Animation abgeschlossen");
      }
    });
  }

  /**
 * Blendet den Footer aus mit Animation
 */
export function hideFooter() {
    if (!footerElement || !isFooterActive) return;
    
    console.log("Footer wird ausgeblendet");
    
    // Mit GSAP animieren
    gsap.to(footerElement, {
      y: "100%",
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        isFooterActive = false;
        // ARIA-Status aktualisieren
        footerElement.setAttribute("aria-hidden", "true");
        console.log("Footer ausgeblendet");
        
        // Footer-Deaktivierungs-Event auslösen
        dispatchCustomEvent(EVENT_TYPES.FOOTER_DEACTIVATED, { active: false });
      }
    });
  }


/**
 * Gibt zurück, ob der Footer aktiv ist
 * @returns {boolean} - true wenn der Footer sichtbar ist
 */
export function isFooterVisible() {
  return isFooterActive;
}