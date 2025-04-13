/**
 * @module seoManager
 * @description Zentraler Manager für alle SEO-relevanten Aspekte der Website.
 * Aktualisiert dynamisch Meta-Tags, Canonical URLs und strukturierte Daten.
 * 
 * @listens EVENT_TYPES.ACTIVE_PROJECT_CHANGED - Aktualisiert Meta-Tags bei Projektwechsel
 * @listens EVENT_TYPES.ALL_DATA_LOADED - Lädt Globale Einstellungen aus dataStore
 */

import logger from '@core/logger';
import { EVENT_TYPES, addEventListener } from '@core/state/events.js';
import uiState from '@core/state/uiState.js';
import { checkFooter, fixImagePath } from '@utils';
import dataStore from '@core/dataStore.js';

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
    twitterImage: null,
    canonical: null
};

// Zwischenspeicher für Globale Einstellungen
let globalSettings = null;

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
    metaElements.twitterImage = document.querySelector('meta[name="twitter:image"]');
    
    // Canonical Link erstellen, falls nicht vorhanden
    metaElements.canonical = document.querySelector('link[rel="canonical"]');
    if (!metaElements.canonical) {
        metaElements.canonical = document.createElement('link');
        metaElements.canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(metaElements.canonical);
    }
    
    // Globale Einstellungen laden, sobald alle Daten verfügbar sind
    addEventListener(EVENT_TYPES.ALL_DATA_LOADED, () => {
        // Globale Einstellungen aus dem dataStore laden
        globalSettings = dataStore.getGlobalSettings()?.data;
        
        if (globalSettings) {
            logger.log("SEO-Manager: Globale Einstellungen geladen");
        } else {
            logger.warn("SEO-Manager: Keine globalen Einstellungen gefunden");
        }
        
        // Initiale Aktualisierung basierend auf URL
        handleInitialURL();
    });
    
    // Event-Listener für Projektwechsel
    addEventListener(EVENT_TYPES.ACTIVE_PROJECT_CHANGED, (event) => {
        const { projectIndex } = event.detail;
        updateMetaForProject(projectIndex);
    });
    
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
        } else {
            // Fallback: Default-SEO für Startseite
            updateDefaultMeta();
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
    
    // SEO-spezifische Beschreibung verwenden, falls vorhanden
    const seoDesc = project.getAttribute('data-seo-description');
    const shortDesc = seoDesc || projectDesc.substring(0, 160) + (projectDesc.length > 160 ? '...' : '');
    
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
    
    // OG-Bild aus Projekt verwenden oder fallback auf globales Bild
    const projectImage = getFirstProjectImage(projectIndex);
    if (metaElements.ogImage) {
        metaElements.ogImage.setAttribute('content', 
            projectImage || getDefaultSeoImage());
    }
    
    // Twitter-Karten aktualisieren
    if (metaElements.twitterTitle) metaElements.twitterTitle.setAttribute('content', `${projectName} - Brenda Büttner Portfolio`);
    if (metaElements.twitterDescription) metaElements.twitterDescription.setAttribute('content', shortDesc);
    if (metaElements.twitterImage) {
        metaElements.twitterImage.setAttribute('content', 
            projectImage || getDefaultSeoImage());
    }
    
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
    
    // Dynamische Beschreibungen aus globalSettings
    const title = isAbout ? 'About - Brenda Büttner Portfolio' : 'Impressum - Brenda Büttner Portfolio';
    const desc = isAbout 
        ? (globalSettings?.about_description || 'Über Brenda Büttner, Art Directorin und Grafikdesignerin aus Hamburg.')
        : (globalSettings?.imprint_description || 'Impressum und rechtliche Informationen - Brenda Büttner Portfolio');
    const fullUrl = `https://brendabuettner.de/${section}`;
    
    // META TAGS AKTUALISIEREN
    if (metaElements.title) metaElements.title.textContent = title;
    if (metaElements.description) metaElements.description.setAttribute('content', desc);
    if (metaElements.ogTitle) metaElements.ogTitle.setAttribute('content', title);
    if (metaElements.ogDescription) metaElements.ogDescription.setAttribute('content', desc);
    if (metaElements.ogUrl) metaElements.ogUrl.setAttribute('content', fullUrl);
    if (metaElements.ogImage) metaElements.ogImage.setAttribute('content', getDefaultSeoImage());
    if (metaElements.twitterTitle) metaElements.twitterTitle.setAttribute('content', title);
    if (metaElements.twitterDescription) metaElements.twitterDescription.setAttribute('content', desc);
    if (metaElements.twitterImage) metaElements.twitterImage.setAttribute('content', getDefaultSeoImage());
    if (metaElements.canonical) metaElements.canonical.setAttribute('href', fullUrl);
    
    // Strukturierte Daten für About/Imprint
    updateStructuredData(null, null, fullUrl);
    
    logger.log(`SEO-Manager: Meta-Tags aktualisiert für Sektion "${section}"`);
}

/**
 * Aktualisiert Standard-Meta-Tags für die Startseite
 */
function updateDefaultMeta() {
    // Standard-SEO-Einstellungen aus globalSettings
    const defaultDesc = globalSettings?.default_seo_description || 
        'Brenda Büttner, Art Directorin und Grafikdesignerin aus Hamburg spezialisiert auf Editorial Design, UI/UX Design und Branding.';
    const fullUrl = 'https://brendabuettner.de/';
    
    // META TAGS AKTUALISIEREN
    if (metaElements.title) metaElements.title.textContent = 'Brenda Büttner - Portfolio';
    if (metaElements.description) metaElements.description.setAttribute('content', defaultDesc);
    if (metaElements.ogTitle) metaElements.ogTitle.setAttribute('content', 'Brenda Büttner - Portfolio');
    if (metaElements.ogDescription) metaElements.ogDescription.setAttribute('content', defaultDesc);
    if (metaElements.ogUrl) metaElements.ogUrl.setAttribute('content', fullUrl);
    if (metaElements.ogImage) metaElements.ogImage.setAttribute('content', getDefaultSeoImage());
    if (metaElements.twitterTitle) metaElements.twitterTitle.setAttribute('content', 'Brenda Büttner - Portfolio');
    if (metaElements.twitterDescription) metaElements.twitterDescription.setAttribute('content', defaultDesc);
    if (metaElements.twitterImage) metaElements.twitterImage.setAttribute('content', getDefaultSeoImage());
    if (metaElements.canonical) metaElements.canonical.setAttribute('href', fullUrl);
    
    // Standard strukturierte Daten
    updateStructuredData(null, null, fullUrl);
    
    logger.log("SEO-Manager: Standard-Meta-Tags aktualisiert");
}

/**
 * Aktualisiert strukturierte Daten (Schema.org)
 * @param {string|null} projectName - Der Projektname (oder null für About/Imprint/Startseite)
 * @param {string|null} projectDesc - Die Projektbeschreibung (oder null für About/Imprint/Startseite)
 * @param {string} projectUrl - Die URL der aktuellen Seite
 */
function updateStructuredData(projectName, projectDesc, projectUrl) {
    // Bestehende Schema-Daten entfernen
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(schema => schema.remove());
    
    // Daten aus globalSettings verwenden
    const personName = globalSettings?.person_name || "Brenda Büttner";
    const jobTitle = globalSettings?.person_job_title || "Art Directorin und Grafikdesignerin";
    
    // Social Links aus dem Array extrahieren
    const socialLinks = Array.isArray(globalSettings?.social_links) && globalSettings.social_links.length > 0
        ? globalSettings.social_links.map(item => item.link)
        : ["https://www.instagram.com/buettner.brenda/"];
    
    // Skills aus globalSettings extrahieren oder Fallback verwenden
    const skills = Array.isArray(globalSettings?.skills) && globalSettings.skills.length > 0
        ? globalSettings.skills.map(skill => skill.name)
        : ["Art Direction", "Editorial Design", "Grafikdesign", "Branding", "Typographie", "UI Design", "UX Design"];
    
    // Person-Schema (immer vorhanden)
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": personName,
        "url": "https://brendabuettner.de",
        "jobTitle": jobTitle,
        "knowsAbout": skills,
        "image": getDefaultSeoImage(),
        "sameAs": socialLinks
    };
    
    // E-Mail-Adresse hinzufügen, falls vorhanden
    if (globalSettings?.contact_email) {
        personSchema.email = `mailto:${globalSettings.contact_email}`;
    }
    
    // Adresse hinzufügen, falls Stadt vorhanden
    if (globalSettings?.address_locality) {
        personSchema.address = {
            "@type": "PostalAddress",
            "addressLocality": globalSettings.address_locality,
            "addressCountry": globalSettings?.address_country || "DE"
        };
    }
    
    // Projekt-Schema (nur wenn ein Projekt aktiv ist)
    const projectSchema = projectName ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": projectName,
        "description": projectDesc,
        "url": projectUrl,
        "creator": {
            "@type": "Person",
            "name": personName
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

/**
 * Hilfsfunktion: Ermittelt ein Bild aus dem aktuellen Projekt
 * @param {number} projectIndex - Der Index des Projekts
 * @returns {string|null} URL zum ersten Projektbild oder null
 */
function getFirstProjectImage(projectIndex) {
    try {
        if (projectIndex < 0 || projectIndex >= uiState.projects.length) return null;
        
        const project = uiState.projects[projectIndex];
        const firstSlide = project.querySelector('.swiper-slide');
        if (!firstSlide) return null;
        
        // Bild-Element im Slide finden
        const imgElement = firstSlide.querySelector('img');
        if (!imgElement || !imgElement.src) return null;
        
        return imgElement.src;
    } catch (error) {
        logger.error("Fehler beim Ermitteln des Projektbildes:", error);
        return null;
    }
}

/**
 * Hilfsfunktion: Ermittelt das Standard-SEO-Bild aus globalen Einstellungen
 * @returns {string} URL zum Standard-SEO-Bild
 */
function getDefaultSeoImage() {
    // Bild-URL aus globalen Einstellungen
    if (globalSettings?.default_seo_image?.url) {
        const imageUrl = globalSettings.default_seo_image.url;
        // Prüfen, ob es eine absolute oder relative URL ist
        return imageUrl.startsWith('http') 
            ? imageUrl 
            : fixImagePath(imageUrl);
    }
    
    // Fallback-Bild
    return 'https://brendabuettner.de/uploads/brenda_buettner_9866744c8b.jpg';
}

export default {
    init
};