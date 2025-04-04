import { checkFooter } from '../navigation/navigationUtils.js';
import uiState from '../../core/uiState.js';
import { EVENT_TYPES } from '../../core/events.js';
import { getValidatedElement } from '../../core/utils.js';
import swiperInitializer from './swiperInitializer.js';
import TransitionController from '../../core/transitionController.js';

// Pagination-Container
let paginationContainer;

/**
 * Initialisiert die benutzerdefinierte Pagination
 */
export function setupCustomPagination() {
  // Container für die Pagination finden
  paginationContainer = getValidatedElement('.pagination');
  if (!paginationContainer) {
    console.error('Pagination-Container nicht gefunden');
    return;
  }

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

  // Initial für das aktuell aktive Projekt einrichten
  if (uiState.activeProjectIndex >= 0) {
    // Prüfen, ob der Footer aktiv ist
    if (checkFooter(uiState.activeProjectIndex, uiState.projects)) {
      paginationContainer.style.display = 'none';
    } else {
      console.log(`Pagination: Initiale Erstellung für Projekt ${uiState.activeProjectIndex}`);
      updatePaginationForProject(uiState.activeProjectIndex);
      
      // Initial das aktive Bild markieren
      if (uiState.activeSlideIndex !== undefined && uiState.activeSlideIndex >= 0) {
        updateActiveBullet(uiState.activeSlideIndex);
      } else {
        updateActiveBullet(0);
      }
    }
  }
}


/**
 * Aktualisiert die Pagination für ein bestimmtes Projekt
 */
function updatePaginationForProject(projectIndex) {
  console.log(`updatePaginationForProject: Erstelle Pagination für Projekt ${projectIndex}`);
  
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
    console.warn(`Projekt mit Index ${projectIndex} nicht gefunden`);
    return;
  }

  // Swiper-Element für dieses Projekt finden
  const swiperElement = project.querySelector('.swiper');
  if (!swiperElement) {
    console.warn(`Kein Swiper für Projekt ${projectIndex} gefunden`);
    return;
  }

  // Swiper-Instanz ermitteln
  const swiperIndex = Array.from(document.querySelectorAll('.swiper')).indexOf(swiperElement);
  const swiper = swiperInitializer.getInstance(swiperIndex);
  if (!swiper) {
    console.warn(`Keine Swiper-Instanz für Index ${swiperIndex}`);
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
  bulletList.setAttribute('role', 'tablist');
  bulletList.setAttribute('aria-label', 'Bildauswahl');
  
  // Bullet-Elemente erstellen
  for (let i = 0; i < slideCount; i++) {
    const bulletItem = document.createElement('li');
    bulletItem.className = 'custom-pagination-item';
    
    const bullet = document.createElement('button');
    bullet.className = 'custom-pagination-bullet';
    bullet.setAttribute('type', 'button');
    bullet.setAttribute('role', 'tab');
    bullet.setAttribute('aria-label', `Bild ${i+1} von ${slideCount}`);
    bullet.setAttribute('data-index', i);
    
    // Klick-Handler für Navigation
    bullet.addEventListener('click', () => {
      navigateToSlide(swiperIndex, i);
    });
    
    bulletItem.appendChild(bullet);
    bulletList.appendChild(bulletItem);
  }
  
  paginationContainer.appendChild(bulletList);
  
  console.log(`Pagination erstellt: ${slideCount} Bullets für Projekt ${projectIndex}`);
}

/**
 * Aktualisiert den aktiven Bullet in der Pagination
 * Exportiert für Verwendung in der synchronisierten Update-Funktion
 */
export function updateActiveBullet(slideIndex) {
  console.log(`updateActiveBullet: Aktiviere Slide ${slideIndex}`);

  // Für Loop Modus den Index anpassen (kann negativ sein)
  if (slideIndex < 0) {
    slideIndex = 0; // Standardwert setzen
  }
  
  if (!paginationContainer) {
    console.warn('Pagination-Container nicht gefunden');
    return;
  }
  
  // Bullets finden
  const bullets = paginationContainer.querySelectorAll('.custom-pagination-bullet');
  if (bullets.length === 0) {
    console.warn('Keine Bullets gefunden');
    return;
  }
  
  // Index validieren
  const validIndex = (slideIndex >= 0 && slideIndex < bullets.length) ? slideIndex : 0;
  
  // Alle Bullets durchgehen und den aktiven markieren
  bullets.forEach((bullet, index) => {
    const isActive = index === validIndex;
    bullet.classList.toggle('active', isActive);
    bullet.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  
  console.log(`Bullet ${validIndex} von ${bullets.length} aktiviert`);
}

/**
 * Navigiert zu einem bestimmten Slide
 */
function navigateToSlide(swiperIndex, slideIndex) {
  console.log(`navigateToSlide: Swiper ${swiperIndex}, Slide ${slideIndex}`);
  
  const swiper = swiperInitializer.getInstance(swiperIndex);
  if (swiper) {
    swiper.slideTo(slideIndex);
  }
}

export default {
  init: setupCustomPagination,
  update: updatePaginationForProject
};