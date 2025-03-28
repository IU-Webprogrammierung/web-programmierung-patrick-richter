/**
 * @module swiperInitializer
 * @description Minimale Swiper-Integration ohne Eingriff in bestehende Funktionalitäten
 */

import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

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
    
    // Swiper mit minimalen Optionen initialisieren
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
      touchRatio: 1
    });
    
    // Swiper-Instanz speichern
    swiperInstances[index] = swiper;
    console.log(`SwiperJS: Swiper #${index} initialisiert`);
  });
  
  return swiperInstances;
}

// Öffentliche API
export default {
  init: initializeSwiperSliders,
  getInstance: (index) => swiperInstances[index],
  
  // Hilfsmethode für imageNavigation.js
  navigateSlide: function(slider, direction) {
    // Finde den zugehörigen Swiper für diesen Slider
    const index = Array.from(document.querySelectorAll('.swiper')).indexOf(slider);
    const swiper = swiperInstances[index];
    
    if (swiper) {
      if (direction < 0) {
        swiper.slidePrev();
      } else {
        swiper.slideNext();
      }
      return true;
    }
    return false;
  }
};