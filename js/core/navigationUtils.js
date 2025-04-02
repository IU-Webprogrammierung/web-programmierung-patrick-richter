// navigationUtils.js
let navigationAPI = null;

export function registerNavigationAPI(api) {
  navigationAPI = api;
  console.log("Navigation API registriert mit Methoden:", Object.keys(api).join(", "));
}

export function navigateToProject(projectId) {
  if (navigationAPI && navigationAPI.navigateToProject) {
    console.log(`Navigiere zu Projekt: ${projectId}`);
    navigationAPI.navigateToProject(projectId);
  } else {
    console.warn("Navigation API nicht verfügbar oder keine navigateToProject-Methode");
  }
}

export function navigateToTop() {
  if (navigationAPI && navigationAPI.scrollToTop) {
    console.log("Navigiere zum ersten Projekt");
    navigationAPI.scrollToTop();
  } else {
    console.warn("Navigation API nicht verfügbar oder keine scrollToTop-Methode");
  }
}