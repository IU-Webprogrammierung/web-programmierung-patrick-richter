/**
 * @module swiperInitializer
 * @description Integriert Swiper.js für verbesserte Bildergalerien.
 * Initialisiert Swiper-Instanzen für alle Projekte, reagiert auf Projektwechsel
 * und kommuniziert mit dem zentralen uiState zur Wahrung der Datenkonsistenz.
 * Enthält Funktionen:
 * - init()
 * - setupProjectChangeHandler()
 * - navigateSlide()
 * - getInstance()
 * 
 * @listens EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Aktualisiert Swiper bei Projektwechseln
 */

import logger from '@core/logger';
import { isMobileDevice, getResponsiveValue } from '@utils';
import Swiper from 'swiper';
import uiState from '@core/state/uiState.js';
import { EVENT_TYPES, addEventListener } from '@core/state/events.js';
import TransitionController from '@core/state/transitionController.js';
import 'swiper/css';

// Speichert Swiper-Instanzen für späteren Zugriff
const swiperInstances = [];

/**
 * Initialisiert Swiper für alle Slider auf der Seite
 * @returns {Promise<Array>} Promise mit allen erstellten Swiper-Instanzen
 */
export async function init() {
  logger.log("SwiperJS: Initialisierung beginnt");
  
  // Alle Swiper-Container finden
  const swiperContainers = document.querySelectorAll('.swiper');
  logger.log(`SwiperJS: ${swiperContainers.length} Swiper-Container gefunden`);
  
  // Erstelle ein Array von Promises für jeden Swiper-Container
  const swiperPromises = Array.from(swiperContainers).map((container, index) => {
    return new Promise((resolve, reject) => {
      logger.log(`SwiperJS: Initialisiere Swiper #${index}`);
      
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
        speed: getResponsiveValue(750, 1200),
        direction: 'horizontal',
        loop: true,
        loopedSlides: 1,
        navigation: { enabled: false },
        grabCursor: false,
        simulateTouch: true,
        touchRatio: 0.5,
        resistance: true,
        resistanceRatio: 1,
        on: {
          init: function () {
            logger.log("SwiperJS: Swiper initialisiert für Container:", container);
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
      
      logger.log(`SwiperJS: Swiper #${index} für Projekt ${projectIndex} initialisiert`);
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
    logger.log(`SwiperJS: Projektwechsel zu ${projectIndex} erkannt`);
    
    // Footer oder ungültigen Index prüfen
    const isFooter = projectIndex >= 0 &&
                     projectIndex < uiState.projects.length &&
                     uiState.projects[projectIndex].id === "site-footer";
    
    if (isFooter || projectIndex < 0 || projectIndex >= uiState.projects.length) {
      logger.log("SwiperJS: Footer oder ungültiger Index erkannt, keine Aktualisierung");
      return;
    }
    
    const matchingSwiperInfo = swiperInstances.find(info => info && info.projectIndex === projectIndex);
    if (!matchingSwiperInfo) {
      logger.warn(`SwiperJS: Keine Swiper-Instanz für Projekt ${projectIndex} gefunden`);
      return;
    }
    
    const swiperInfo = matchingSwiperInfo;
    const swiper = swiperInfo.swiper;
    const activeSlide = swiper.slides[swiper.activeIndex];
    if (!activeSlide) {
      logger.warn(`SwiperJS: Kein aktiver Slide in Projekt ${projectIndex} gefunden`);
      return;
    }
    
    const imageId = parseInt(activeSlide.getAttribute('data-id'));
    const textColor = activeSlide.getAttribute('data-text-color') || 'black';
    
    logger.log(`SwiperJS: Nach Projektwechsel ist Bild ${imageId} aktiv, Farbe: ${textColor}`);
    
    if (TransitionController && TransitionController.isActive()) {
      uiState.activeImageIndex = imageId;
      uiState.activeTextColor = textColor;
      if (swiper.activeIndex >= 0) {
        uiState.activeSlideIndices[projectIndex] = swiper.activeIndex;
      }
      logger.log(`SwiperJS: Stiller Update während Transition - Farbe: ${textColor}`);
      return;
    }
    
    setTimeout(() => {
      uiState.setActiveImage(projectIndex, imageId, textColor, swiper.activeIndex);
    }, 50);
  });
}

/**
 * Navigiert zu einem bestimmten Slide
 * @param {Element} slider - Das Swiper-Container-Element
 * @param {number} clientX - X-Koordinate des Klicks für Richtungsbestimmung
 * @returns {boolean} true wenn Navigation erfolgreich
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