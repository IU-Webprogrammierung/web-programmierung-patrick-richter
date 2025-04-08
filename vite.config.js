// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Basis-URL für die Produktion - kann später angepasst werden
  base: './',
  
  // Konfiguration des Entwicklungsservers
  server: {
    // Automatisches Öffnen im Browser
    open: true,
    // Port für den Entwicklungsserver
    port: 3000
  },
  
  // Root-Verzeichnis auf src gesetzt
  root: 'src',
  
  // Pfad zu public-Verzeichnis
  publicDir: '../public',
  
  // Konfiguration für den Build-Prozess
  build: {
    // Ausgabeverzeichnis für den Build (relativ zum Projektroot, nicht src)
    outDir: '../dist',
    // Assets mit Hash versehen für Cache-Busting
    assetsDir: 'assets',
    // Quellcode-Maps für die Produktion
    sourcemap: true,
    // Sicherstellen, dass CSS extrahiert wird
    cssCodeSplit: true,
  },
  
  // Löse Pfade auf
  resolve: {
    alias: {
      // Aliase für häufig verwendete Pfade
      '@core': resolve(__dirname, './src/js/core'),
      '@utils': resolve(__dirname, './src/js/utils'),
      '@media': resolve(__dirname, './src/js/media'),
      '@overlay': resolve(__dirname, './src/js/overlay'),
      '@portfolio': resolve(__dirname, './src/js/portfolio'),
      '@startup': resolve(__dirname, './src/js/startup'),
      '@ui': resolve(__dirname, './src/js/ui')
    }
  }
});