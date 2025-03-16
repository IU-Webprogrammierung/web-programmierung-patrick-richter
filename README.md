# Portfolio-Website für eine Grafikdesignerin

## Übersicht

Dieses Projekt ist eine Portfolio-Website, die im Rahmen des Kurses "Projekt: Web-Programmierung" (DLBUXPWP01) an der IU Internationale Hochschule entstanden ist. Basierend auf der Aufgabenstellung wurde eine responsive Website mit HTML, CSS und JavaScript entwickelt.

Die Website dient als Präsentationsplattform für eine Grafikdesignerin und wurde mit Fokus auf Bilddarstellung, Navigation und responsivem Design umgesetzt.

## Funktionen

- Scrollbare Projektübersicht mit Scroll-Snap-Funktion
- Horizontale Bildergalerien für jedes Projekt
- Textfarben passen sich automatisch an die Bildhintergründe an
- Interaktiver Project Indicator zur Navigation zwischen Projekten
- Overlay-System für About und Imprint-Informationen
- Mobile-optimierte Ansicht mit angepasstem Layout
- Unterstützung für Barrierefreiheit durch semantische Struktur

## Technischer Aufbau

Die Website basiert auf folgenden Technologien:

Die Website nutzt folgende Technologien:

- **HTML5:** Semantische Strukturierung mit article, section und landmark-Elementen sowie ARIA-Attributen für verbesserte Zugänglichkeit (aria-hidden, aria-expanded, aria-controls)
- **CSS:** Adaptive Layouts mit Flexbox und CSS-Variablen, u.a. für dynamische Farbwechsel (--active-text-color). Besonderheiten sind benutzerdefinierte Cursor-Styles für die Bildnavigation, Scroll-Snap für präzises Positionieren und sanfte Übergänge durch CSS-Transitions
- **JavaScript:** Modular aufgebaute interaktive Funktionen mit ES6-Modulen, dynamische DOM-Manipulation, Event-basierte Kommunikation und Nutzung moderner Browser-APIs wie IntersectionObserver für effiziente Bildüberwachung
  - Modularisierung durch ES6-Module
  - Datenintegration über JSON-Dateien
  - Event-basierte Kommunikation zwischen Modulen

Die Architektur folgt einem modularen Ansatz mit klarer Trennung der Verantwortlichkeiten:

**Core-Module:**
1. Zentraler Datenspeicher (dataStore.js) - Lädt und verwaltet alle Inhalte
2. UI-Zustandsverwaltung (uiState.js) - Zentrale Verwaltung von Projekt- und Bildstatus
3. Event-System (events.js) - Definiert einheitliche Event-Typen für die Modulkommunikation

**Feature-Module:**
- Projects: Erstellt Projektelemente und verwaltet Navigation
- ImageViewer: Steuert Bildergalerien und passt Textfarben automatisch an
- Overlay: Regelt Ein-/Ausblenden und Umschalten zwischen About/Imprint
- Mobile: Implementiert spezielle Touch-Funktionalität für Mobilgeräte

## Projektstruktur
```
/
├── index.html              # Hauptdokument
├── styles/                 # CSS-Dateien
│   └── styles.css          # Hauptstilvorlage
├── js/                     # JavaScript-Module
│   ├── app.js              # Haupteinstiegspunkt
│   ├── setup.js            # Event-Listener-Setup
│   ├── core/               # Kern-Module
│   │   ├── dataStore.js    # Datenverwaltung
│   │   ├── uiState.js      # UI-Zustandsverwaltung
│   │   └── events.js       # Event-Definitionen
│   └── features/           # Feature-Module
│       ├── projects/       # Projektbezogene Module
│       ├── imageViewer/    # Bildnavigations-Module
│       ├── overlay/        # Overlay-Steuerung
│       └── mobile/         # Mobile-spezifische Module
├── content/                # Inhalte in JSON-Format
│   ├── projects.json       # Projektdaten
│   ├── aboutImprint.json   # About & Imprint Texte
│   └── clients.json        # Kundenliste
├── images/                 # Bildmaterial
└── fonts/                  # Schriftarten
```
