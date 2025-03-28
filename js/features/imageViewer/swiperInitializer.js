/**
 * @module swiperInitializer
 * @description Integriert Swiper.js für verbesserte Bildergalerien
 * Initialisiert Swiper-Instanzen, reagiert auf Projektwechsel und kommuniziert
 * mit dem zentralen uiState zur Wahrung der Datenkonsistenz.
 */

import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';
import uiState from '../../core/uiState.js';
import { EVENT_TYPES } from '../../core/events.js';

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
    
    // Swiper mit Optionen initialisieren
    const swiper = new Swiper(container, {
      // Grundlegende Parameter
      slidesPerView: 1,
      speed: 1000,
      direction: 'horizontal',


      
      // Eigene Navigationslösung verwenden, keine Swiper-Controls
      navigation: {
        enabled: false
      },
      
      // Touch/Drag aktivieren, aber eigene Cursor verwenden
      grabCursor: false,
      simulateTouch: true,
      touchRatio: 1,
      
      // Events für Bildwechsel
      on: {
        slideChange: function() {
          if (projectIndex < 0) return;
          
          // Aktiven Slide ermitteln
          const activeSlide = this.slides[this.activeIndex];
          if (!activeSlide) return;
          
          // Daten aus Attributen auslesen
          const imageId = parseInt(activeSlide.getAttribute('data-id'));
          const textColor = activeSlide.getAttribute('data-text-color') || 'black';
          
          // Zentralen Status aktualisieren (löst ACTIVE_IMAGE_CHANGED aus)
          uiState.setActiveImage(projectIndex, imageId, textColor);
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
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
    if (!event || !event.detail) return;
    
    const { projectIndex } = event.detail;
    console.log(`SwiperJS: Projektwechsel zu ${projectIndex} erkannt`);
    
    // Kurze Verzögerung für DOM-Updates
    setTimeout(() => {
      // Finde die zum Projekt gehörende Swiper-Instanz
      const swiperInfo = swiperInstances.find(info => info.projectIndex === projectIndex);
      if (!swiperInfo) {
        console.warn(`SwiperJS: Keine Swiper-Instanz für Projekt ${projectIndex} gefunden`);
        return;
      }
      
      const swiper = swiperInfo.swiper;
      
      // Aktiven Slide identifizieren und Daten an uiState weitergeben
      const activeSlide = swiper.slides[swiper.activeIndex];
      if (!activeSlide) {
        console.warn(`SwiperJS: Kein aktiver Slide in Projekt ${projectIndex} gefunden`);
        return;
      }
      
      const imageId = parseInt(activeSlide.getAttribute('data-id'));
      const textColor = activeSlide.getAttribute('data-text-color') || 'black';
      
      console.log(`SwiperJS: Nach Projektwechsel ist Bild ${imageId} aktiv, Farbe: ${textColor}`);
      
      // uiState aktualisieren, löst ACTIVE_IMAGE_CHANGED aus
      uiState.setActiveImage(projectIndex, imageId, textColor);
    }, 50);
  });
}

/**
 * Navigation zu einem Slide
 */
function navigateSlide(slider, direction) {
  // Finde die entsprechende Swiper-Instanz
  const containerIndex = Array.from(document.querySelectorAll('.swiper')).indexOf(slider);
  if (containerIndex === -1) return false;
  
  const swiperInfo = swiperInstances[containerIndex];
  if (!swiperInfo) return false;
  
  const swiper = swiperInfo.swiper;
  
  // Navigation durchführen
  if (direction < 0) {
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
  navigateSlide: navigateSlide
};