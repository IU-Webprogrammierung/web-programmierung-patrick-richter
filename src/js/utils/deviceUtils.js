/**
 * @module deviceUtils
 * @description Hilfsfunktionen zur Geräteerkennung und Optimierung.
 * Ermöglicht responsive Anpassungen der Funktionalität basierend auf Gerätetyp.
 */

// Cached-Ergebnisse, um Performance zu verbessern
const cache = {
    isMobile: null,
    isTouch: null
  };
  
  /**
   * Prüft, ob das aktuelle Gerät ein Mobilgerät ist (basierend auf Viewport und UA)
   * @param {boolean} [forceRecalculate=false] - Erzwingt Neuberechnung (ignoriert Cache)
   * @returns {boolean} true für Mobilgeräte, false für Desktop
   */
  export function isMobileDevice(forceRecalculate = false) {
    // Cache nutzen, falls verfügbar und nicht überschrieben
    if (cache.isMobile !== null && !forceRecalculate) {
      return cache.isMobile;
    }
    
    // Viewport-basierte Erkennung (primär)
    const viewportIsMobile = window.innerWidth <= 800 || 
      (window.innerWidth <= 1200 && window.innerHeight > window.innerWidth);
      
    // User-Agent-basierte Erkennung (sekundär)
    const uaIsMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    
    // Touch-basierte Erkennung (tertiär)
    const touchIsMobile = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      navigator.msMaxTouchPoints > 0;
    
    // Kombinierte Entscheidung: Viewport ist primäres Kriterium
    cache.isMobile = viewportIsMobile || (uaIsMobile && touchIsMobile);
    
    return cache.isMobile;
  }
  
  /**
   * Prüft, ob das aktuelle Gerät Touch-fähig ist
   * @returns {boolean} true für Touch-Geräte
   */
  export function isTouchDevice() {
    if (cache.isTouch !== null) {
      return cache.isTouch;
    }
    
    cache.isTouch = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      navigator.msMaxTouchPoints > 0;
      
    return cache.isTouch;
  }
  
  /**
   * Event-Listener für Resize, der den Cache zurücksetzt
   */
  window.addEventListener('resize', () => {
    // Bei Größenänderung Cache zurücksetzen
    cache.isMobile = null;
  });
  
  /**
   * Ruft den passenden Wert basierend auf Gerätetyp ab
   * @param {*} mobileValue - Wert für Mobilgeräte
   * @param {*} desktopValue - Wert für Desktop-Geräte
   * @returns {*} Der passende Wert je nach Gerätetyp
   */
  export function getResponsiveValue(mobileValue, desktopValue) {
    return isMobileDevice() ? mobileValue : desktopValue;
  }