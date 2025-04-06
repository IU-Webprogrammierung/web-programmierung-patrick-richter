/**
 * @module swiperInitializer
 * @description Integriert Swiper.js für verbesserte Bildergalerien
 * Initialisiert Swiper-Instanzen, reagiert auf Projektwechsel und kommuniziert
 * mit dem zentralen uiState zur Wahrung der Datenkonsistenz.
 */

import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';
import uiState from '../../core/uiState.js';
import { EVENT_TYPES, addEventListener } from '../../core/events.js';
import TransitionController from '../../core/transitionController.js';

// Speichert Swiper-Instanzen für späteren Zugriff
const swiperInstances = [];

/**
 * Initialisiert Swiper für alle Slider auf der Seite
 */
export function initializeSwiperSliders() {
  console.log("SwiperJS: Initialisierung beginnt");
  
  // Alle Swiper-Container finden
  const swiperContainers = document.querySelectorAll('.swiper');
  console.log(`SwiperJS: ${swiperContainers.length} Swiper-Container gefunden`);
  
  // Für jeden Container einen Swiper initialisieren
  swiperContainers.forEach((container, index) => {
    console.log(`SwiperJS: Initialisiere Swiper #${index}`);
    
    // Projekt-Element und -Index finden
    const projectElement = container.closest('.project');
    if (!projectElement) return;
    
    const projectId = projectElement.getAttribute('data-project-id');
    const projectIndex = Array.from(uiState.projects).findIndex(
      p => p.getAttribute('data-project-id') === projectId
    );
    
    const paginationEl = document.querySelector(`.pagination[data-for-project="${projectId}"]`);

    // Swiper mit Optionen initialisieren
    const swiper = new Swiper(container, {
      // Grundlegende Parameter
      slidesPerView: 1,
      speed: 1000,
      direction: 'horizontal',
      loop: true,
      loopedSlides: 1,
      
      // Eigene Navigationslösung verwenden, keine Swiper-Controls
      navigation: {
        enabled: false
      },
      
      // Touch/Drag aktivieren, aber eigene Cursor verwenden
      grabCursor: false,
      simulateTouch: true,
      touchRatio: 1,
      
      // Events für Bildwechsel
      // In swiperInitializer.js, in der slideChange-Funktion
on: {
    slideChange: function() {
      if (projectIndex < 0) return;
      // Für Loop korrekten Index ermitteln
      const realIndex = this.realIndex; // Gibt den Index des originalen Slides zurück

      
      // Zusätzlich zum imageId auch den Slide-Index (this.activeIndex) übermitteln
      const activeSlide = this.slides[this.activeIndex];
      if (!activeSlide) return;
      
      const imageId = parseInt(activeSlide.getAttribute('data-id'));
      const textColor = activeSlide.getAttribute('data-text-color') || 'black';
      
      // Den Slide-Index als zusätzlichen Parameter übergeben
      uiState.setActiveImage(projectIndex, imageId, textColor, realIndex);
    }
  }
    });
    
    // Swiper-Instanz speichern
    swiperInstances[index] = {
      swiper: swiper,
      projectIndex: projectIndex
    };
    
    console.log(`SwiperJS: Swiper #${index} für Projekt ${projectIndex} initialisiert`);
  });
  
  // Event-Listener für Projektwechsel hinzufügen
  setupProjectChangeHandler();
  
  return swiperInstances;
}

/**
 * Richtet einen Event-Listener für Projektwechsel ein
 */
function setupProjectChangeHandler() {
  addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
    if (!event || !event.detail) return;
    
    const { projectIndex } = event.detail;
    console.log(`SwiperJS: Projektwechsel zu ${projectIndex} erkannt`);
    
    // Prüfen ob ein Footer oder ein ungültiger Index
    const isFooter = projectIndex >= 0 && 
                    projectIndex < uiState.projects.length && 
                    uiState.projects[projectIndex].id === "site-footer";
    
    if (isFooter || projectIndex < 0 || projectIndex >= uiState.projects.length) {
      console.log("SwiperJS: Footer oder ungültiger Index erkannt, keine Aktualisierung");
      return;
    }
    
    // Sichere Suche nach der Swiper-Instanz
    const matchingSwiperInfo = swiperInstances.find(info => info && info.projectIndex === projectIndex);
    
    if (!matchingSwiperInfo) {
      console.warn(`SwiperJS: Keine Swiper-Instanz für Projekt ${projectIndex} gefunden`);
      return;
    }
    
    const swiperInfo = matchingSwiperInfo; // Jetzt sicher definiert
    const swiper = swiperInfo.swiper;
    
    // Aktiven Slide identifizieren
    const activeSlide = swiper.slides[swiper.activeIndex];
    if (!activeSlide) {
      console.warn(`SwiperJS: Kein aktiver Slide in Projekt ${projectIndex} gefunden`);
      return;
    }
    
    // Attribute auslesen
    const imageId = parseInt(activeSlide.getAttribute('data-id'));
    const textColor = activeSlide.getAttribute('data-text-color') || 'black';
    
    console.log(`SwiperJS: Nach Projektwechsel ist Bild ${imageId} aktiv, Farbe: ${textColor}`);
    
    // WICHTIG: Bei aktivem Transition nur die Werte im uiState aktualisieren, ohne Event auszulösen
    if (TransitionController && TransitionController.isActive()) {
      // Zustand aktualisieren ohne Event auszulösen
      uiState.activeImageIndex = imageId;
      uiState.activeTextColor = textColor;
      if (swiper.activeIndex >= 0) {
        uiState.activeSlideIndices[projectIndex] = swiper.activeIndex;
      }
      console.log(`SwiperJS: Stiller Update während Transition - Farbe: ${textColor}`);
      return;
    }
    
    // Nur ohne aktiven Transition das Event auslösen
    setTimeout(() => {
      uiState.setActiveImage(projectIndex, imageId, textColor, swiper.activeIndex);
    }, 50);
  });
}

/**
 * Navigation zu einem Slide
 */

function navigateSlide(slider, clientX) {
    const containerIndex = Array.from(document.querySelectorAll('.swiper')).indexOf(slider);
    if (containerIndex === -1) return false;
  
    const swiperInfo = swiperInstances[containerIndex];
    if (!swiperInfo) return false;
  
    const swiper = swiperInfo.swiper;
    const screenWidth = window.innerWidth;
  
    const isLeftClick = clientX < screenWidth / 2;
  
    // TODO kann jetzt auch mit swiper.slideNext() und swiper.slidePrev() gelöst werden
    
      if (isLeftClick) {
        swiper.slidePrev();
      } else {
        swiper.slideNext();
      }
  
    return true;
  }
  

// Öffentliche API
export default {
    init: initializeSwiperSliders,
    getInstance: (index) => swiperInstances[index]?.swiper,
    navigateSlide,
  };
  