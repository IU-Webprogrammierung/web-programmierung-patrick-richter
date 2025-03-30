/**
 * @module customPagination
 * @description Benutzerdefinierte Pagination für Swiper mit konsistenter uiState-Integration
 * Verwendet uiState als zentrale Wahrheitsquelle und reagiert auf die etablierten Events.
 */

import uiState from '../../core/uiState.js';
import { EVENT_TYPES } from '../../core/events.js';
import { getValidatedElement } from '../../core/utils.js';
import swiperInitializer from './swiperInitializer.js';

// Pagination-Container
let paginationContainer;

// Pausendauer zwischen Ausblenden und Einblenden (muss mit projectTitle.js übereinstimmen)
const style = getComputedStyle(document.documentElement);
const betweenPauseMs = parseInt(style.getPropertyValue("--title-between-pause").trim()) || 200;

// Flag für laufende Projektanimation
let isAnimatingProject = false;

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

  // 1. Auf Projektwechsel reagieren (Anzahl der Bullets ändern)
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
    if (!event || !event.detail) return;
    
    // Markieren, dass gerade ein Projektwechsel stattfindet
    isAnimatingProject = true;
    
    // Verzögert die Aktualisierung der Pagination um die Pausenzeit
    setTimeout(() => {
      // Pagination aktualisieren (ohne aktiven Bullet zu markieren)
      updatePaginationForProject(event.detail.projectIndex, false);
      
      // Aktiven Bullet separat aktualisieren, BEVOR die Pagination wieder eingeblendet wird
      const projectIndex = event.detail.projectIndex;
      const project = uiState.projects[projectIndex];
      if (project) {
        const swiperElement = project.querySelector('.swiper');
        if (swiperElement) {
          const swiperIndex = Array.from(document.querySelectorAll('.swiper')).indexOf(swiperElement);
          const swiper = swiperInitializer.getInstance(swiperIndex);
          if (swiper) {
            updateActiveBullet(-1, swiper.activeIndex);
          }
        }
      }
      
      // Reset des Animation-Flags nach der Aktualisierung
      setTimeout(() => {
        isAnimatingProject = false;
      }, 50);
    }, betweenPauseMs); // Gleiche Pausenzeit wie in projectTitle.js
  });

  // 2. Auf Bildwechsel reagieren (aktiven Bullet aktualisieren), nur wenn kein Projektwechsel stattfindet
  document.addEventListener(EVENT_TYPES.ACTIVE_IMAGE_CHANGED, (event) => {
    if (!event || !event.detail || isAnimatingProject) return;
    
    // Verwende den Slide-Index, wenn verfügbar, sonst fallback auf den Image-Index
    const slideIndex = event.detail.slideIndex !== undefined ? event.detail.slideIndex : -1;
    updateActiveBullet(event.detail.imageIndex, slideIndex);
  });

  // 3. Initial für das aktuell aktive Projekt einrichten
  if (uiState.activeProjectIndex >= 0) {
    updatePaginationForProject(uiState.activeProjectIndex);
    // Initial das aktive Bild markieren
    updateActiveBullet(uiState.activeImageIndex);
  }

  console.log('Custom Pagination eingerichtet');
}

/**
 * Aktualisiert die Pagination für ein bestimmtes Projekt
 * @param {number} projectIndex - Index des Projekts
 * @param {boolean} updateActiveBulletFlag - Ob der aktive Bullet aktualisiert werden soll
 */
function updatePaginationForProject(projectIndex, updateActiveBulletFlag = true) {
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

  // Anzahl der Slides aus Swiper ermitteln
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
  
  console.log(`Pagination aktualisiert für Projekt ${projectIndex}: ${slideCount} Bullets`);
  
  // Aktives Bild markieren - nur wenn updateActiveBulletFlag = true
  if (updateActiveBulletFlag && swiper) {
    updateActiveBullet(-1, swiper.activeIndex);
  }
}

/**
 * Aktualisiert nur den aktiven Bullet
 * @param {number} imageIndex - Index des aktiven Bildes (Bild-ID)
 * @param {number} slideIndex - Index des Slides im aktuellen Swiper (bevorzugt)
 */
function updateActiveBullet(imageIndex, slideIndex = -1) {
  // Verwende slideIndex, wenn verfügbar, sonst fallback auf imageIndex
  const indexToUse = slideIndex !== -1 ? slideIndex : 0;
  
  console.log(`Aktualisiere aktive Bullet auf Index ${indexToUse} (Slide-Index: ${slideIndex}, Bild-ID: ${imageIndex})`);
  
  const bullets = paginationContainer.querySelectorAll('.custom-pagination-bullet');
  if (bullets.length === 0) {
    console.warn('Keine Bullets gefunden für Aktualisierung');
    return;
  }
  
  bullets.forEach((bullet, index) => {
    if (index === indexToUse) {
      console.log(`Bullet ${index} wird aktiviert`);
      bullet.classList.add('active');
      bullet.setAttribute('aria-selected', 'true');
    } else {
      bullet.classList.remove('active');
      bullet.setAttribute('aria-selected', 'false');
    }
  });
}

/**
 * Navigiert zu einem bestimmten Slide
 * @param {number} swiperIndex - Index des Swipers
 * @param {number} slideIndex - Index des Slides
 */
function navigateToSlide(swiperIndex, slideIndex) {
  const swiper = swiperInitializer.getInstance(swiperIndex);
  if (swiper) {
    swiper.slideTo(slideIndex);
  }
}

export default {
  init: setupCustomPagination,
  update: updatePaginationForProject
};