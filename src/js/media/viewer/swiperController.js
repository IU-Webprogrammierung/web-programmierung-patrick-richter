/**
 * @module swiperInitializer
 * @description Integriert Swiper.js für verbesserte Bildergalerien.
 * Initialisiert Swiper-Instanzen, reagiert auf Projektwechsel und kommuniziert
 * mit dem zentralen uiState zur Wahrung der Datenkonsistenz.
 */

import Swiper from 'swiper';
import uiState from '@core/state/uiState.js';
import { EVENT_TYPES, addEventListener } from '@core/state/events.js';
import TransitionController from '@core/state/transitionController.js';
import 'swiper/css';

// Speichert Swiper-Instanzen für späteren Zugriff
const swiperInstances = [];

/**
 * Initialisiert Swiper für alle Slider auf der Seite.
 * Gibt ein Promise zurück, das aufgelöst wird, wenn alle Swiper initialisiert sind.
 */
export async function init() {
  console.log("SwiperJS: Initialisierung beginnt");
  
  // Alle Swiper-Container finden
  const swiperContainers = document.querySelectorAll('.swiper');
  console.log(`SwiperJS: ${swiperContainers.length} Swiper-Container gefunden`);
  
  // Erstelle ein Array von Promises für jeden Swiper-Container
  const swiperPromises = Array.from(swiperContainers).map((container, index) => {
    return new Promise((resolve, reject) => {
      console.log(`SwiperJS: Initialisiere Swiper #${index}`);
      
      // Projekt-Element und -Index finden
      const projectElement = container.closest('.project');
      if (!projectElement) {
        resolve();
        return;
      }
      
      const projectId = projectElement.getAttribute('data-project-id');
      const projectIndex = Array.from(uiState.projects).findIndex(
        p => p.getAttribute('data-project-id') === projectId
      );
      
      const paginationEl = document.querySelector(`.pagination[data-for-project="${projectId}"]`);

      // Swiper mit gewünschten Optionen initialisieren
      const swiper = new Swiper(container, {
        slidesPerView: 1,
        speed: 1000,
        direction: 'horizontal',
        loop: true,
        loopedSlides: 1,
        navigation: { enabled: false },
        grabCursor: false,
        simulateTouch: true,
        touchRatio: 1,
        on: {
          init: function () {
            console.log("SwiperJS: Swiper initialisiert für Container:", container);
            resolve(this);
          },
          slideChange: function () {
            if (projectIndex < 0) return;
            const realIndex = this.realIndex;
            const activeSlide = this.slides[this.activeIndex];
            if (!activeSlide) return;
            const imageId = parseInt(activeSlide.getAttribute('data-id'));
            const textColor = activeSlide.getAttribute('data-text-color') || 'black';
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
  });
  
  // Auflösen aller Swiper-Initialisierungen abwarten
  await Promise.all(swiperPromises);
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
    
    // Footer oder ungültigen Index prüfen
    const isFooter = projectIndex >= 0 &&
                     projectIndex < uiState.projects.length &&
                     uiState.projects[projectIndex].id === "site-footer";
    
    if (isFooter || projectIndex < 0 || projectIndex >= uiState.projects.length) {
      console.log("SwiperJS: Footer oder ungültiger Index erkannt, keine Aktualisierung");
      return;
    }
    
    const matchingSwiperInfo = swiperInstances.find(info => info && info.projectIndex === projectIndex);
    if (!matchingSwiperInfo) {
      console.warn(`SwiperJS: Keine Swiper-Instanz für Projekt ${projectIndex} gefunden`);
      return;
    }
    
    const swiperInfo = matchingSwiperInfo;
    const swiper = swiperInfo.swiper;
    const activeSlide = swiper.slides[swiper.activeIndex];
    if (!activeSlide) {
      console.warn(`SwiperJS: Kein aktiver Slide in Projekt ${projectIndex} gefunden`);
      return;
    }
    
    const imageId = parseInt(activeSlide.getAttribute('data-id'));
    const textColor = activeSlide.getAttribute('data-text-color') || 'black';
    
    console.log(`SwiperJS: Nach Projektwechsel ist Bild ${imageId} aktiv, Farbe: ${textColor}`);
    
    if (TransitionController && TransitionController.isActive()) {
      uiState.activeImageIndex = imageId;
      uiState.activeTextColor = textColor;
      if (swiper.activeIndex >= 0) {
        uiState.activeSlideIndices[projectIndex] = swiper.activeIndex;
      }
      console.log(`SwiperJS: Stiller Update während Transition - Farbe: ${textColor}`);
      return;
    }
    
    setTimeout(() => {
      uiState.setActiveImage(projectIndex, imageId, textColor, swiper.activeIndex);
    }, 50);
  });
}

/**
 * Navigiert zu einem bestimmten Slide
 */
function navigateSlide(slider, clientX) {
  const containerIndex = Array.from(document.querySelectorAll('.swiper')).indexOf(slider);
  if (containerIndex === -1) return false;
  
  const swiperInfo = swiperInstances[containerIndex];
  if (!swiperInfo) return false;
  
  const swiper = swiperInfo.swiper;
  const screenWidth = window.innerWidth;
  const isLeftClick = clientX < screenWidth / 2;
  
  if (isLeftClick) {
    swiper.slidePrev();
  } else {
    swiper.slideNext();
  }
  
  return true;
}

export default {
  init,
  getInstance: (index) => swiperInstances[index]?.swiper,
  navigateSlide,
};
