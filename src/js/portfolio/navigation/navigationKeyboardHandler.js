/**
 * navigationKeyboardHandler.js
 * Tastaturbasierte Navigation für Projekte
 * 
 * Dieses Modul fügt Tastatur-Steuerung hinzu, um durch Projekte zu navigieren:
 * - Pfeiltasten nach oben/unten zur Navigation
 * - PageUp/PageDown als Alternativen
 * - Home/End zum ersten/letzten Projekt
 */

import logger from '@core/logger';
import { checkFooter } from '@utils';

export function setupKeyboardNavigation(transitionToProject, projects, getAnimating) {
  logger.log('Keyboard-Navigation wird initialisiert');
  
  /**
   * Behandelt Tastendruck-Events für die Navigation
   * @param {KeyboardEvent} e - Das Tastatur-Event
   */
  function handleKeydown(e) {
    // Nicht reagieren, wenn in Textfeldern oder während Animation
    if (getAnimating() || ['input', 'textarea', 'select'].includes(
      document.activeElement.tagName.toLowerCase())
    ) {
      return;
    }

    // Navigation mit Pfeiltasten
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault(); // Wichtig: Standard-Scroll verhindern
        transitionToProject(getCurrentIndex() + 1, 1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        transitionToProject(getCurrentIndex() - 1, -1);
        break;
      case 'Home':
        e.preventDefault();
        transitionToProject(0, -1);
        break;
      case 'End':
        e.preventDefault();
        transitionToProject(projects.length - 1, 1);
        break;
    }
  }

  /**
   * Ermittelt den aktuellen Projektindex
   * @returns {number} Der aktuelle Projektindex
   */
  function getCurrentIndex() {
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].getAttribute('aria-hidden') === 'false' && 
          !checkFooter(projects[i])) {
        return i;
      }
    }
    return 0;
  }

  // Event-Listener registrieren - direkt an window für beste Kompatibilität
  window.addEventListener('keydown', handleKeydown);

  // Testausgabe für Debugging
  logger.log(`Keyboard-Navigation initialisiert für ${projects.length} Projekte`);

  // Aufräum-Funktion zurückgeben
  return function cleanup() {
    window.removeEventListener('keydown', handleKeydown);
  };
}