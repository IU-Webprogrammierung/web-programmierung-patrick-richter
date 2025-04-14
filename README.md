# Portfolio-Website für eine Grafikdesignerin

Dieses Projekt ist eine Portfolio-Website, die im Rahmen des Kurses "Projekt: Web-Programmierung" (DLBUXPWP01) an der IU Internationale Hochschule entstanden ist. Basierend auf der Aufgabenstellung wurde eine responsive Website mit HTML, CSS und JavaScript entwickelt.

Die Website dient als Präsentationsplattform für eine Grafikdesignerin und wurde mit Fokus auf Bilddarstellung, Navigation und responsivem Design umgesetzt.

## Funktionen

* Scrollbare Projektübersicht mit vertikalem Projektwechsel und horizontalen Bildergalerien
* Textfarben passen sich automatisch an die Bildhintergründe an
* Interaktiver Project Indicator zur Navigation zwischen Projekten
* Overlay-System für About und Imprint-Informationen ohne Seitenwechsel
* Mobile-optimierte Ansicht mit angepasstem Layout (Breakpoints bei 800px und 1200px)
* Unterstützung für Barrierefreiheit durch semantische Struktur und ARIA-Attribute
* GSAP-basierte Animationen für flüssige Übergänge
* Swiper.js Integration für optimierte Touch-fähige Bildergalerien
* Client-side Routing mit History API für Deep-Linking und verbesserte SEO
* Dynamische Meta-Tags und strukturierte Daten für SEO

## Technischer Aufbau

Die Website nutzt folgende Technologien:

* **HTML5:** Semantische Strukturierung mit article, section und landmark-Elementen sowie ARIA-Attributen für verbesserte Zugänglichkeit (aria-hidden, aria-expanded, aria-controls)
* **CSS:** Adaptive Layouts mit Flexbox, Grid und CSS-Variablen, u.a. für dynamische Farbwechsel (--active-text-color). Besonderheiten sind benutzerdefinierte Cursor-Styles für die Bildnavigation und sanfte Übergänge durch CSS-Transitions
* **JavaScript:** Modular aufgebaute interaktive Funktionen mit ES6-Modulen, dynamische DOM-Manipulation, Event-basierte Kommunikation und Nutzung moderner Browser-APIs wie IntersectionObserver für effiziente Bildüberwachung
* **Build-System:** Vite für schnellere Entwicklung und optimierte Builds
* **Animation:** GSAP für flüssige, synchronisierte Übergänge bei Projektwechseln
* **Bildgalerien:** Swiper.js für optimierte Touch-Unterstützung
* **Daten:** Vorbereitung für Headless CMS (Strapi) mit Normalisierungsfunktionen und Fallbacks

## Architektur

Die Architektur folgt einem modularen Ansatz mit klarer Trennung der Verantwortlichkeiten:

### Core-Module:
1. **Zentraler Datenspeicher (dataStore.js)** - Lädt und verwaltet alle Inhalte
2. **UI-Zustandsverwaltung (uiState.js)** - Zentrale Verwaltung von Projekt- und Bildstatus als Single Source of Truth
3. **Event-System (events.js)** - Definiert einheitliche Event-Typen für die Modulkommunikation
4. **TransitionController** - Koordiniert synchronisierte UI-Übergänge bei Projektwechseln
5. **CustomRouter** - Implementiert Client-side Routing mit History API

### Feature-Module:
* **Projects:** Erstellt Projektelemente und verwaltet Navigation
* **ImageViewer:** Steuert Bildergalerien und passt Textfarben automatisch an
* **Overlay:** Regelt Ein-/Ausblenden und Umschalten zwischen About/Imprint
* **Mobile:** Implementiert spezielle Touch-Funktionalität für Mobilgeräte
* **SEO-Manager:** Aktualisiert Meta-Tags und strukturierte Daten basierend auf aktivem Projekt

## Responsive Breakpoints

* **Mobile:** < 800px
* **Tablet:** 800px - 1200px (mit Portrait/Landscape-Anpassung)
* **Desktop:** > 1200px

## Voraussetzungen

* Node.js (v14.0.0 oder höher)
* npm oder yarn

## Installation

1. Repository klonen:
   ```
   git clone https://github.com/IU-Webprogrammierung/web-programmierung-patrick-richter.git
   cd web-programmierung-patrick-richter
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Lokalen Entwicklungsserver starten:
   ```
   npm run dev
   ```

4. Die Anwendung läuft nun auf `http://localhost:3000`

## Projektstruktur

```
/
├── src/                      # Quellcode
│   ├── index.html            # Hauptdokument
│   ├── js/                   # JavaScript-Module
│   │   ├── app.js            # Haupteinstiegspunkt
│   │   ├── setup.js          # Event-Listener-Setup
│   │   ├── core/             # Kern-Module
│   │   │   ├── dataStore.js  # Datenverwaltung
│   │   │   ├── uiState.js    # UI-Zustandsverwaltung
│   │   │   ├── events.js     # Event-Definitionen
│   │   │   └── config.js     # Konfigurationsdatei
│   │   ├── utils/            # Hilfsfunktionen
│   │   └── features/         # Feature-Module
│   │       ├── portfolio/    # Projektbezogene Module
│   │       ├── media/        # Bild- und Medienmodule
│   │       ├── overlay/      # Overlay-Steuerung
│   │       ├── ui/           # UI-Komponenten
│   │       └── startup/      # Initialisierungsmodule
│   ├── styles/               # CSS-Dateien
│   │   ├── base/             # Reset, Variablen, Typografie
│   │   ├── components/       # Komponentenstile
│   │   ├── layout/           # Layoutstrukturen
│   │   └── utilities/        # Hilfsstile
│   └── images/               # Statische Bilder
├── public/                   # Statische Assets
├── content/                  # JSON-Datendateien
└── vite.config.js            # Vite-Konfiguration
```

## Autor

Erstellt von Patrick Richter im Rahmen des Kurses "Projekt: Web-Programmierung" (DLBUXPWP01) an der IU Internationale Hochschule.

GitHub-Repository: [web-programmierung-patrick-richter](https://github.com/IU-Webprogrammierung/web-programmierung-patrick-richter)