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
    updatePaginationForProject(event.detail.projectIndex);
  });

  // 2. Auf Bildwechsel reagieren (aktiven Bullet aktualisieren)
  document.addEventListener(EVENT_TYPES.ACTIVE_IMAGE_CHANGED, (event) => {
    if (!event || !event.detail) return;
    updateActiveBullet(event.detail.imageIndex);
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
 */
function updatePaginationForProject(projectIndex) {
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

  // Anzahl der Slides aus Swiper ermitteln (zuverlässiger als aus dem Projekt)
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
}

/**
 * Aktualisiert nur den aktiven Bullet
 * @param {number} activeIndex - Index des aktiven Bildes
 */
function updateActiveBullet(activeIndex) {
    console.log(`Aktualisiere aktive Bullet auf Index ${activeIndex}`);
    
    // Manchmal ist activeIndex undefined, dann 0 als Default
    const indexToUse = activeIndex !== undefined ? activeIndex : 0;
    
    const bullets = paginationContainer.querySelectorAll('.custom-pagination-bullet');
    if (bullets.length === 0) {
      console.warn('Keine Bullets gefunden für Aktualisierung');
      return;
    }
    
    bullets.forEach((bullet, index) => {
      // Vergleich mit String-Konvertierung für robustere Prüfung
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