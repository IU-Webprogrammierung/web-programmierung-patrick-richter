/**
 * navigationRouting.js
 * Implementiert URL-Routing für die Projekt-Navigation
 */

import { EVENT_TYPES } from "../../core/events.js";

export function setupHistoryRouting(options) {
  const { 
    projects, 
    transitionToProject, 
    getCurrentIndex, 
    dispatchProjectChangeEvent,
    isFooter
  } = options;

  console.log('History-Routing wird initialisiert');

  /**
   * Erzeugt einen URL-freundlichen Slug aus dem Projektnamen
   * @param {Element} project - Das Projekt-Element
   * @returns {string} Der generierte URL-Slug
   */
  function getSlugFromProject(project) {
    // Footer ausschließen
    if (isFooter(project)) return "";
    
    const name = project.getAttribute("data-project-name");
    if (!name) return "";
    
    // Umlaute und Sonderzeichen ersetzen, lowercase, spaces durch Bindestriche
    return name.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-') // Mehrfach-Bindestriche zu einem reduzieren
      .replace(/^-|-$/g, ''); // Führende/Nachfolgende Bindestriche entfernen
  }
  
  /**
   * Findet den Projektindex basierend auf dem URL-Slug
   * @param {string} slug - Der URL-Slug
   * @returns {number} Der Index des Projekts -2 für nicht gefunden
   */
  function getProjectIndexFromSlug(slug) {

    
    return Array.from(projects).findIndex(project => {
      // Footer nicht als normales Projekt behandeln bei der URL-Generierung
      if (isFooter(project)) return false;
      
      return getSlugFromProject(project) === slug;
    });
  }
  
  /**
   * Aktualisiert die URL ohne Seiten-Neuladen
   * @param {string} slug - Der neue URL-Slug
   */
  function updateUrlSilently(slug) {
    try {
      console.log(`URL-Update: /${slug}`);
      
      const currentPath = window.location.pathname.substring(1);
      if (slug !== currentPath) {
        window.history.pushState(
          { slug: slug }, 
          "", 
          "/" + slug
        );
      }
    } catch (error) {
      console.warn('Fehler beim URL-Update:', error);
    }
  }
  

  
  // Beim Seitenstart: URL prüfen und ggf. navigieren
  window.addEventListener('load', () => {
    // URL extrahieren
    const path = window.location.pathname.substring(1);
    if (path) {
      
        const index = getProjectIndexFromSlug(path);
        if (index >= 0) {
          // Verzögertes Navigieren nach Seitenaufbau
          setTimeout(() => {
            const direction = index > 0 ? 1 : -1;
            transitionToProject(index, direction);
          }, 300);
        } else {
          // Fallback: Zur Startseite, falls URL ungültig
          updateUrlSilently('');
        }
      }
    }
  );
  
  // Event-Listener für Projektwechsel
  document.addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
    const index = event.detail.projectIndex;
    const project = projects[index];
    
    // Keine URL-Änderung für den Footer
    if (project && !isFooter(project)) {
      const slug = getSlugFromProject(project);
      if (slug) {
        updateUrlSilently(slug);
      }
    }
  });
  
  
  // Bei Browser-Navigationstasten: Entsprechend navigieren
  window.addEventListener('popstate', (event) => {
    const path = window.location.pathname.substring(1);
    
    
    // Projekt anhand URL finden
    if (path) {
      const index = getProjectIndexFromSlug(path);
      if (index >= 0) {
        const currentIndex = getCurrentIndex();
        const direction = index > currentIndex ? 1 : -1;
        transitionToProject(index, direction);
      } else {
        // Ungültige URL - zum Startprojekt
        transitionToProject(0, -1);
        updateUrlSilently('');
      }
    } else {
      // Root-URL: Zum ersten Projekt
      transitionToProject(0, -1);
    }
  });
  
  // Initiale URL setzen wenn keine vorhanden
  if (!window.location.pathname || window.location.pathname === '/') {
    // Startprojekt URL setzen
    const project = projects[0];
    if (project && !isFooter(project)) {
      const slug = getSlugFromProject(project);
      if (slug) updateUrlSilently(slug);
    }
  }
}