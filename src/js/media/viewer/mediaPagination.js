/**
 * @module mediaPagination
 * @description Verwaltet die benutzerdefinierte Pagination für Bildergalerien.
 * Erstellt und aktualisiert Pagination-Bullets für die Navigation zwischen Bildern
 * in einem Projekt, synchronisiert mit Swiper-Instanzen.
 * Enthält Funktionen:
 * - init()
 * - updatePaginationForProject()
 * - updateActiveBullet()
 * 
 * @listens EVENT_TYPES.INITIAL_PROJECT_SET - Initial Pagination erstellen
 * @listens TransitionController.events.PHASE_CHANGED - Pagination bei Projektwechsel aktualisieren
 */

import logger from '@core/logger';
import { checkFooter, getValidatedElement } from '@utils';
import uiState from '@core/state/uiState.js';
import { EVENT_TYPES, addEventListener } from '@core/state/events.js';
import swiperInitializer from '@media/viewer/swiperController.js';
import TransitionController from '@core/state/transitionController.js';

// Pagination-Container
let paginationContainer;

/**
 * Initialisiert die benutzerdefinierte Pagination
 */
export function init() {
  // Container für die Pagination finden
  paginationContainer = getValidatedElement('.pagination');
  if (!paginationContainer) {
    logger.error('Pagination-Container nicht gefunden');
    return;
  }

  logger.log("CHECK OB INITIAL_PROJECT_SET schon versendet wurde");
   addEventListener(EVENT_TYPES.INITIAL_PROJECT_SET, () => { 
    logger.log("customPagination: Pagination initial aktualisiert");  
    updatePaginationForProject(uiState.activeProjectIndex);
    updateActiveBullet(0);
   }); 
  

  // Event-Handler für Projektwechsel-Synchronisierung
  document.addEventListener(TransitionController.events.PHASE_CHANGED, (event) => {
    const { phase } = event.detail;
    
    // BETWEEN-Phase nutzen, um die Pagination zu aktualisieren
    if (phase === TransitionController.phases.BETWEEN) {
      const projectIndex = uiState.activeProjectIndex;
      
      // Prüfen, ob der Footer aktiv ist
      if (checkFooter(projectIndex, uiState.projects)) {
        // Pagination für Footer ausblenden
        paginationContainer.style.display = 'none';
        return;
      } else {
        // Pagination für normale Projekte einblenden
        paginationContainer.style.display = '';
      }
      
      // Pagination aktualisieren und dann in separatem Rendering-Zyklus den Bullet
      updatePaginationForProject(projectIndex, false);
      
      requestAnimationFrame(() => {
        const savedIndex = uiState.getActiveSlideIndexForProject ? 
          uiState.getActiveSlideIndexForProject(projectIndex) : 0;
        
        updateActiveBullet(savedIndex);
      });
    }
  });
}


/**
 * Aktualisiert die Pagination für ein bestimmtes Projekt
 * @param {number} projectIndex - Index des Projekts
 */
function updatePaginationForProject(projectIndex) {
  logger.log(`updatePaginationForProject: Erstelle Pagination für Projekt ${projectIndex}`);
  
  // Prüfen, ob der Footer aktiv ist
  if (checkFooter(projectIndex, uiState.projects)) {
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      paginationContainer.style.display = 'none';
    }
    return;
  }
  
  // Projekt im DOM finden
  const project = uiState.projects[projectIndex];
  if (!project) {
    logger.warn(`Projekt mit Index ${projectIndex} nicht gefunden`);
    return;
  }

  // Swiper-Element für dieses Projekt finden
  const swiperElement = project.querySelector('.swiper');
  if (!swiperElement) {
    logger.warn(`Kein Swiper für Projekt ${projectIndex} gefunden`);
    return;
  }

  // Swiper-Instanz ermitteln
  const swiperIndex = Array.from(document.querySelectorAll('.swiper')).indexOf(swiperElement);
  const swiper = swiperInitializer.getInstance(swiperIndex);
  if (!swiper) {
    logger.warn(`Keine Swiper-Instanz für Index ${swiperIndex}`);
    return;
  }

  // Anzahl der Slides ermitteln
  const slideCount = swiper.slides ? swiper.slides.length : 0;
  if (slideCount === 0) {
    paginationContainer.innerHTML = '';
    return;
  }

  // Pagination-Container leeren und neu aufbauen
  paginationContainer.innerHTML = '';
  
  // Semantisch korrekte Liste für Accessibility
  const bulletList = document.createElement('ul');
  bulletList.className = 'custom-pagination-list';
  bulletList.classList.add('animate-on-transition');
  bulletList.setAttribute('aria-label', 'Bildanzeiger');
  
  // Bullet-Elemente erstellen
  for (let i = 0; i < slideCount; i++) {
    const bulletItem = document.createElement('li');
    bulletItem.className = 'custom-pagination-item';
    
    // ÄNDERUNG: button durch span ersetzen
    const bullet = document.createElement('span');
    bullet.className = 'custom-pagination-bullet';
    bullet.classList.add('animate-on-transition');
    
    // data-index beibehalten für Kompatibilität mit updateActiveBullet
    bullet.setAttribute('data-index', i);
    
    bulletItem.appendChild(bullet);
    bulletList.appendChild(bulletItem);
  }
  
  paginationContainer.appendChild(bulletList);
  
  logger.log(`Pagination erstellt: ${slideCount} Bullets für Projekt ${projectIndex}`);
}

/**
 * Aktualisiert den aktiven Bullet in der Pagination
 * @param {number} slideIndex - Index des aktiven Slides
 */
export function updateActiveBullet(slideIndex) {
  logger.log(`updateActiveBullet: Aktiviere Slide ${slideIndex}`);

  // Für Loop Modus den Index anpassen (kann negativ sein)
  if (slideIndex < 0) {
    slideIndex = 0; // Standardwert setzen
  }
  
  if (!paginationContainer) {
    logger.warn('Pagination-Container nicht gefunden');
    return;
  }
  
  // Bullets finden - jetzt mit span statt button
  const bullets = paginationContainer.querySelectorAll('.custom-pagination-bullet');
  if (bullets.length === 0) {
    logger.warn('Keine Bullets gefunden');
    return;
  }
  
  // Index validieren
  const validIndex = (slideIndex >= 0 && slideIndex < bullets.length) ? slideIndex : 0;
  
  // Alle Bullets durchgehen und den aktiven markieren
  bullets.forEach((bullet, index) => {
    const isActive = index === validIndex;
    bullet.classList.toggle('active', isActive);
    // Kein aria-selected mehr nötig, da keine Tab-Rolle mehr
  });
  
  logger.log(`Bullet ${validIndex} von ${bullets.length} aktiviert`);
}

export default {
  init
};