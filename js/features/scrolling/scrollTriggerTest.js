import uiState from "../../core/uiState.js";
import { EVENT_TYPES } from "../../core/events.js";

export function setupAdvancedNavigation() {
  // GSAP Observer Plugin registrieren für Scroll-Erkennung
  gsap.registerPlugin(Observer);

  // 1. Grundlegende Variablen und Elemente initialisieren
  // ====================================================
  
  // Konfigurierbare Parameter für die Animation
  const CONFIG = {
    // Parallax-Effekt: Wie weit sich Projekte beim Übergang bewegen (in Prozent)
    PARALLAX_AMOUNT: 15,
    
    // Animationsdauer in Sekunden
    ANIMATION_DURATION: 1,
    
    // Beschleunigungskurve der Animation
    EASE: "power1.inOut",
    
    // Toleranz für kleine Bewegungen (verhindert versehentliches Scrollen)
    SCROLL_TOLERANCE: 15
  };
  
  // Alle Projekte aus dem DOM auswählen
  const projects = document.querySelectorAll(".project");
  
  // Aktueller Index (0 = erstes Projekt ist aktiv)
  let currentIndex = 0;
  
  // Flag, ob gerade eine Animation läuft (verhindert mehrfache Auslösungen)
  let animating = false;
  
  // Hilfsfunktion: Stellt sicher, dass der Index im gültigen Bereich bleibt
  const wrap = index => Math.max(0, Math.min(index, projects.length - 1));

  // 2. Anfangsstile für alle Projekte setzen
  // =======================================
  projects.forEach((project, i) => {
    gsap.set(project, { 
      position: "absolute", 
      top: 0,               
      left: 0,              
      width: "100%",        
      height: "100%",       
      autoAlpha: i === 0 ? 1 : 0, 
      yPercent: i === 0 ? 0 : 100 
    });
  });

  // 3. Hauptfunktion für Projektwechsel mit Animationen
  // =================================================
  function gotoProject(index, direction) {
    // Index überprüfen und ggf. korrigieren
    index = wrap(index);
    
    // Keine Animation, wenn wir bereits auf dem Zielprojekt sind
    if (index === currentIndex) return;
    
    // Animation beginnt - Sperren, um mehrfache Auslösungen zu verhindern
    animating = true;
    
    // Frühes Auslösen des Events, damit der Text sich schon aktualisiert
    // während die Animation noch läuft (25% der Animationszeit)
    setTimeout(() => {
      dispatchProjectChangeEvent(index);
    }, CONFIG.ANIMATION_DURATION * 250); 
    
    // Timeline für die Animation erstellen
    const tl = gsap.timeline({
      defaults: { 
        duration: CONFIG.ANIMATION_DURATION, 
        ease: CONFIG.EASE 
      },
      onComplete: () => {
        animating = false;
      }
    });
    
    if (direction === 1) { // Nach unten scrollen (nächstes Projekt anzeigen)
      if (currentIndex >= 0) {
        // WICHTIG: Bei Abwärtsbewegung kommt das neue Projekt ÜBER das aktuelle
        // Z-Index muss entsprechend gesetzt werden
        gsap.set(projects[currentIndex], { zIndex: 0 });
        gsap.set(projects[index], { zIndex: 1 });
        
        // Animation: Aktuelles Projekt sanft nach oben bewegen
        tl.to(projects[currentIndex], { 
          yPercent: -CONFIG.PARALLAX_AMOUNT
        }, 0);
      }
      
      // Nächstes Projekt vorbereiten
      gsap.set(projects[index], { 
        autoAlpha: 1,
        yPercent: 100 
      });
      
      // Animation: Nächstes Projekt von unten nach oben einschieben
      tl.to(projects[index], { 
        yPercent: 0 
      }, 0);
    } 
    else { // Nach oben scrollen (vorheriges Projekt anzeigen)
      if (currentIndex >= 0) {
        // WICHTIG: Bei Aufwärtsbewegung muss das weggehende Projekt ÜBER dem neuen sein
        // damit es nach unten aus dem Bild gleiten kann
        gsap.set(projects[currentIndex], { zIndex: 1 });
        gsap.set(projects[index], { zIndex: 0 });
        
        // Animation: Aktuelles Projekt nach unten aus dem Bild schieben
        tl.to(projects[currentIndex], { 
          yPercent: 100
        }, 0);
      }
      
      // Vorheriges Projekt vorbereiten
      gsap.set(projects[index], { 
        autoAlpha: 1,
        yPercent: -CONFIG.PARALLAX_AMOUNT
      });
      
      // Animation: Vorheriges Projekt in die Endposition bewegen
      tl.to(projects[index], { 
        yPercent: 0 
      }, 0);
    }

    // Aktuellen Index aktualisieren
    currentIndex = index;
    
    console.log(`Wechsel zu Projekt ${index}, ID: ${projects[index]?.getAttribute("data-project-id") || "unbekannt"}`);
  }

  // 4. Observer für Scroll-Events einrichten
  // ======================================
  
  // Scroll-Kontrollvariablen
  let isScrolling = false;
  let lastScrollTime = 0;
  const scrollDebounceTime = 800; // Erhöht für bessere Stabilität

  Observer.create({
    type: "wheel,touch,pointer",
    wheelSpeed: -0.3, // Reduzierte Empfindlichkeit
    onDown: (self) => {
      const now = Date.now();
      
      // Überprüfe Scroll-Geschwindigkeit und vermeide zu kleine Bewegungen
      if (!isScrolling && now - lastScrollTime > scrollDebounceTime && Math.abs(self.deltaY) > 5) {
        isScrolling = true;
        lastScrollTime = now;
        
        gotoProject(currentIndex - 1, -1);
        
        // Scroll-Sperre erst nach vollständiger Animation aufheben
        gsap.delayedCall(CONFIG.ANIMATION_DURATION + 0.3, () => {
          isScrolling = false;
        });
      }
    },
    onUp: (self) => {
      const now = Date.now();
      
      if (!isScrolling && now - lastScrollTime > scrollDebounceTime && Math.abs(self.deltaY) > 5) {
        isScrolling = true;
        lastScrollTime = now;
        
        gotoProject(currentIndex + 1, 1);
        
        gsap.delayedCall(CONFIG.ANIMATION_DURATION + 0.3, () => {
          isScrolling = false;
        });
      }
    },
    tolerance: CONFIG.SCROLL_TOLERANCE,
    lockAxis: true,
    preventDefault: true
  });
  
  // 5. Event-Weiterleitung an andere Module der Anwendung
  // ===================================================
  function dispatchProjectChangeEvent(index) {
    const projectElement = projects[index];
    
    if (!projectElement) {
      console.error(`Projekt mit Index ${index} nicht gefunden`);
      return;
    }
    
    console.log(`Projektwechsel: DOM-Index=${index}`);
    
    // WICHTIG: Konsistent den DOM-INDEX verwenden, nicht die Projekt-ID
    uiState.setActiveProject(index);
  }

  // 6. Erste Initialisierung
  // =====================
  // Erstes Projekt sichtbar machen
  gsap.set(projects[0], { 
    autoAlpha: 1,
    zIndex: 1,
    yPercent: 0
  });
  
  // Erstes Event auslösen - mit VERZÖGERUNG, damit der Rest der Anwendung bereit ist
  setTimeout(() => {
    console.log("Initiales Projekt-Event wird ausgelöst");
    dispatchProjectChangeEvent(0);
  }, 300);
  
  // 7. API für andere Module bereitstellen
  // ===================================
  return {
    // Zu einem bestimmten Projekt scrollen (anhand des DOM-Index)
    // KORRIGIERT: Nutzt jetzt DOM-Index statt Projekt-ID
    scrollToProjectByIndex: (index) => {
      index = wrap(index);
      const direction = index > currentIndex ? 1 : -1;
      gotoProject(index, direction);
    },
    
    // BEACHTE: Diese Funktion konvertiert Projekt-IDs zu DOM-Indizes
    // Dies ist eine Übergangslösung, bis alle Teile deines Projekts auf DOM-Indizes umgestellt sind
    scrollToProject: (projectId) => {
      // Suche den DOM-Index für die gegebene Projekt-ID
      const index = Array.from(projects).findIndex(
        project => project.getAttribute("data-project-id") === projectId.toString()
      );
      
      if (index !== -1) {
        const direction = index > currentIndex ? 1 : -1;
        gotoProject(index, direction);
      }
    },
    
    // Zum ersten Projekt scrollen
    scrollToTop: () => {
      if (currentIndex === 0) return;
      gotoProject(0, -1);
    },
    
    // Zum nächsten Projekt scrollen
    gotoNext: () => gotoProject(currentIndex + 1, 1),
    
    // Zum vorherigen Projekt scrollen
    gotoPrevious: () => gotoProject(currentIndex - 1, -1),
    
    // Aktuellen Index zurückgeben
    getCurrentIndex: () => currentIndex
  };
}