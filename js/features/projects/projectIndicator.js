/**
 * @module projectIndicator
 * @description Verwaltet den Projekt-Indikator und das Navigations-Panel des Index
 */

import uiState from '../../core/uiState.js';
import { scrollToProject } from './projectNavigation.js';
import { EVENT_TYPES } from '../../core/events.js';

export function setupProjectIndicator() {
    // Initial den Tab-Text aktualisieren
    updateTabText();
    
    // Auf Projektänderungen reagieren
    document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, handleProjectChange);
    
    // Projektliste im Panel erstellen
    setupProjectList();
  }
  
  // Tab-Text-Aktualisierung
  function updateTabText() {
    const tabText = document.querySelector('.tab-text');
    if (!tabText) return;
    
    const activeIndex = uiState.activeProjectIndex + 1;
    const totalProjects = uiState.projects.length || 0;
    
    tabText.textContent = `${activeIndex} / ${totalProjects}`;
  }
  
  // Verzögerte Aktualisierung für Events
  function delayedUpdateTabText() {
    setTimeout(() => {
      updateTabText();
    }, 400);
  }
  
  // Behandelt Projektänderungen (aktualisiert Tab und aktives Projekt in der Liste)
  function handleProjectChange() {
    delayedUpdateTabText();
    updateActiveProjectInList();
  }
  
  // Aktualisiert die aktive Markierung in der Projektliste
  function updateActiveProjectInList() {
    const links = document.querySelectorAll('.project-list a');
    links.forEach((link, index) => {
      if (index === uiState.activeProjectIndex) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Erstellt die Projektliste im Panel
  function setupProjectList() {
    setTimeout(() => {
      const projectList = document.querySelector('.project-list');
      if (!projectList || !uiState.projects.length) return;
      
      projectList.innerHTML = '';
      
      uiState.projects.forEach((project, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const projectId = project.getAttribute('data-project-id');
        
        a.textContent = project.getAttribute('data-project-name');
        a.href = '#';
        
        // Aktives Projekt markieren
        if (index === uiState.activeProjectIndex) {
          a.classList.add('active');
        }
        
        a.addEventListener('click', (e) => {
          e.preventDefault();
          // Panel schließen
          const indicator = document.querySelector('.project-indicator');
          const tab = document.querySelector('.project-indicator-tab');
          
          if (indicator) indicator.classList.remove('open');
          if (tab) tab.setAttribute('aria-expanded', 'false');
          
          // Zum Projekt scrollen
          scrollToProject(projectId);
        });
        
        li.appendChild(a);
        projectList.appendChild(li);
      });
    }, 500);
  }
  
  // Toggle-Funktion für das Panel (exportiert für setup.js)
  export function togglePanel() {
    const indicator = document.querySelector('.project-indicator');
    const tab = document.querySelector('.project-indicator-tab');
    
    if (!indicator || !tab) return;
    
    indicator.classList.toggle('open');
    const isOpen = indicator.classList.contains('open');
    tab.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }