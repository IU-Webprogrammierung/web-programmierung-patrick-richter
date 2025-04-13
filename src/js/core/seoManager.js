/**
 * @module seoManager
 * @description Zentraler Manager für alle SEO-relevanten Aspekte der Website.
 * Aktualisiert dynamisch Meta-Tags, Canonical URLs und strukturierte Daten.
 * 
 * @listens EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Aktualisiert Meta-Tags bei Projektwechsel
 */

import logger from '@core/logger';
import { EVENT_TYPES, addEventListener } from '@core/state/events.js';
import uiState from '@core/state/uiState.js';
import { checkFooter } from '@utils';

// Cache für DOM-Elemente
const metaElements = {
    title: null,
    description: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    ogUrl: null,
    twitterTitle: null,
    twitterDescription: null,
    canonical: null
};

/**
 * Initialisiert den SEO-Manager
 */
function init() {
    logger.log("SEO-Manager: Initialisierung");
    
    // DOM-Elemente cachen
    metaElements.title = document.querySelector('title');
    metaElements.description = document.querySelector('meta[name="description"]');
    metaElements.ogTitle = document.querySelector('meta[property="og:title"]');
    metaElements.ogDescription = document.querySelector('meta[property="og:description"]');
    metaElements.ogImage = document.querySelector('meta[property="og:image"]');
    metaElements.ogUrl = document.querySelector('meta[property="og:url"]');
    metaElements.twitterTitle = document.querySelector('meta[name="twitter:title"]');
    metaElements.twitterDescription = document.querySelector('meta[name="twitter:description"]');
    
    // Canonical Link erstellen, falls nicht vorhanden
    metaElements.canonical = document.querySelector('link[rel="canonical"]');
    if (!metaElements.canonical) {
        metaElements.canonical = document.createElement('link');
        metaElements.canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(metaElements.canonical);
    }
    
    // Event-Listener für Projektwechsel
    addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
        const { projectIndex } = event.detail;
        updateMetaForProject(projectIndex);
    });
    
    // Initiale Aktualisierung basierend auf URL
    handleInitialURL();
    
    logger.log("SEO-Manager: Initialisierung abgeschlossen");
}

/**
 * Verarbeitet die initiale URL
 */
function handleInitialURL() {
    const path = window.location.pathname;
    
    if (path === '/about') {
        updateMetaForSection('about');
    } else if (path === '/imprint') {
        updateMetaForSection('imprint');
    } else {
        // Standard oder projektspezifisch
        if (uiState.activeProjectIndex >= 0) {
            updateMetaForProject(uiState.activeProjectIndex);
        }
    }
}

/**
 * Aktualisiert Meta-Tags für ein spezifisches Projekt
 * @param {number} projectIndex - Der Index des Projekts
 */
function updateMetaForProject(projectIndex) {
    if (projectIndex < 0 || projectIndex >= uiState.projects.length) return;
    
    // Wenn Footer, nicht ändern
    if (checkFooter(projectIndex, uiState.projects)) return;
    
    const project = uiState.projects[projectIndex];
    const projectName = project.getAttribute('data-project-name') || '';
    const projectDesc = project.getAttribute('data-project-description') || '';
    
    // Begrenzte Beschreibung für Meta-Tags
    const shortDesc = projectDesc.substring(0, 150) + (projectDesc.length > 150 ? '...' : '');
    
    // URL und Kanonischer Link
    const projectId = project.getAttribute('data-project-id');
    const slug = uiState.getProjectSlug(projectId);
    const fullUrl = `https://brendabuettner.de${slug ? `/${slug}` : ''}`;
    
    // META TAGS AKTUALISIEREN - HIER PASSIEREN DIE SICHTBAREN ÄNDERUNGEN
    if (metaElements.title) metaElements.title.textContent = `${projectName} - Brenda Büttner Portfolio`;
    if (metaElements.description) metaElements.description.setAttribute('content', shortDesc);
    if (metaElements.ogTitle) metaElements.ogTitle.setAttribute('content', `${projectName} - Brenda Büttner Portfolio`);
    if (metaElements.ogDescription) metaElements.ogDescription.setAttribute('content', shortDesc);
    if (metaElements.ogUrl) metaElements.ogUrl.setAttribute('content', fullUrl);
    if (metaElements.twitterTitle) metaElements.twitterTitle.setAttribute('content', `${projectName} - Brenda Büttner Portfolio`);
    if (metaElements.twitterDescription) metaElements.twitterDescription.setAttribute('content', shortDesc);
    if (metaElements.canonical) metaElements.canonical.setAttribute('href', fullUrl);
    
    // Strukturierte Daten aktualisieren
    updateStructuredData(projectName, projectDesc, fullUrl);
    
    logger.log(`SEO-Manager: Meta-Tags aktualisiert für Projekt "${projectName}"`);
}

/**
 * Aktualisiert Meta-Tags für spezielle Sektionen (About/Imprint)
 * @param {string} section - Die Sektion ('about' oder 'imprint')
 */
function updateMetaForSection(section) {
    const isAbout = section === 'about';
    const title = isAbout ? 'About - Brenda Büttner Portfolio' : 'Impressum - Brenda Büttner Portfolio';
    const desc = isAbout 
        ? 'Über Brenda Büttner, Art Directorin und Grafikdesignerin aus Hamburg spezialisiert auf Editorial Design und Branding.'
        : 'Impressum und rechtliche Informationen - Brenda Büttner Portfolio';
    const fullUrl = `https://brendabuettner.de/${section}`;
    
    // META TAGS AKTUALISIEREN
    if (metaElements.title) metaElements.title.textContent = title;
    if (metaElements.description) metaElements.description.setAttribute('content', desc);
    if (metaElements.ogTitle) metaElements.ogTitle.setAttribute('content', title);
    if (metaElements.ogDescription) metaElements.ogDescription.setAttribute('content', desc);
    if (metaElements.ogUrl) metaElements.ogUrl.setAttribute('content', fullUrl);
    if (metaElements.twitterTitle) metaElements.twitterTitle.setAttribute('content', title);
    if (metaElements.twitterDescription) metaElements.twitterDescription.setAttribute('content', desc);
    if (metaElements.canonical) metaElements.canonical.setAttribute('href', fullUrl);
    
    logger.log(`SEO-Manager: Meta-Tags aktualisiert für Sektion "${section}"`);
}

/**
 * Aktualisiert strukturierte Daten (Schema.org)
 */
function updateStructuredData(projectName, projectDesc, projectUrl) {
    // Bestehende Schema-Daten entfernen
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(schema => schema.remove());
    
    // Person-Schema (immer vorhanden)
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Brenda Büttner",
        "url": "https://brendabuettner.de",
        "jobTitle": "Art Directorin Grafikdesign",
        "knowsAbout": ["Art Direction", "Editorial Design", "Grafikdesign", "Branding", "Typographie", "UI Design", "UX Design"],
        "image": "https://brendabuettner.de/images/brenda-buettner.jpg",
        "sameAs": ["https://www.instagram.com/buettner.brenda/"]
    };
    
    // Projekt-Schema (nur wenn ein Projekt aktiv ist)
    const projectSchema = projectName ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": projectName,
        "description": projectDesc,
        "url": projectUrl,
        "creator": {
            "@type": "Person",
            "name": "Brenda Büttner"
        }
    } : null;
    
    // Schemas ins DOM einfügen
    [personSchema, projectSchema].filter(Boolean).forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    });
    
    logger.log("SEO-Manager: Strukturierte Daten aktualisiert");
}

export default {
    init
};