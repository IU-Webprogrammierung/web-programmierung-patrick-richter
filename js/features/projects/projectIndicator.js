/**
 * @module projectIndicator
 * @description Verwaltet den Projekt-Indikator und das Navigations-Panel für den Index.
 * Stellt einen interaktiven Tab bereit, der den aktuellen Projektindex anzeigt und
 * beim Klick ein Panel mit einer Liste aller Projekte öffnet. Ermöglicht die direkte
 * Navigation zwischen Projekten.
 * 
 * Funktionen: setupProjectIndicator(), togglePanel(), updateTabText(), handleProjectChange(), 
 * updateActiveProjectInList(), setupProjectList()
 */

import uiState from '../../core/uiState.js';
import { scrollToProject } from './projectNavigation.js';
import { EVENT_TYPES } from '../../core/events.js';

export function setupProjectIndicator() {
    // Initial den Tab-Text aktualisieren
    setTimeout(() => {
        updateTabText();
        document.querySelector('.project-indicator-tab')?.classList.add('visible');
      }, 300); 

    // Auf Projektänderungen reagieren
    document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, handleProjectChange);
    
    // Projektliste im Panel erstellen
    setupProjectList();
  }
  
  function updateTabText() {
    const tabText = document.querySelector('.tab-text');
    if (!tabText) return;
    
    // Nur anzeigen, wenn ein gültiger Index vorhanden ist
    if (uiState.activeProjectIndex >= 0 && uiState.projects.length > 0) {
      const activeIndex = uiState.activeProjectIndex + 1;
      const totalProjects = uiState.projects.length;
      tabText.textContent = `${activeIndex} / ${totalProjects}`;
    } else {
      // Keine Anzeige, wenn kein gültiger Index existiert
      tabText.textContent = "";
    }
  }
  
  // Verzögerte Aktualisierung für Events (damit synchron mit Farbwechsel)
  // TODO Ggf. hier Variable aus CSS auslesen
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
        const indicator = document.querySelector('.project-indicator');
        const tab = document.querySelector('.project-indicator-tab'); 

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
  
        
        // Click-Handler
        a.addEventListener('click', function(e) {
          e.preventDefault();
                    
          // Panel schließen
          if (indicator && indicator.classList.contains('open')) {
            indicator.classList.remove('open');
            tab?.setAttribute('aria-expanded', 'false');
                        
            // Auf Animation warten, bevor gescrollt wird
            // TODO eventuell über transitionend lösen?
            setTimeout(function() {
              scrollToProject(projectId);
            }, 300);
          } else {
            // Direkt scrollen, wenn Panel nicht offen ist
            scrollToProject(projectId);
          }
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