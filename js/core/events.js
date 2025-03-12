/**
 * @module events
 * @description Zentrale Definition von Event-Typen und Hilfsfunktionen
 */

// Event-Typen als Konstanten definieren für konsistente Nutzung
export const EVENT_TYPES = {
    ACTIVE_PROJECT_CHANGED: 'activeProjectChanged',
    ACTIVE_IMAGE_CHANGED: 'activeImageChanged'
  };
  
  // Hilfsfunktionen für Event-Handling
  export function dispatchCustomEvent(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  
  export function addEventListener(eventName, handler) {
    document.addEventListener(eventName, handler);
  }
  
  export function removeEventListener(eventName, handler) {
    document.removeEventListener(eventName, handler);
  }