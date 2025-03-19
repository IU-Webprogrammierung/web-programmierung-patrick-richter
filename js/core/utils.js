/**
 * @module utils
 * @description Zentrale Sammlung von Hilfsfunktionen für die gesamte Anwendung.
 *
 * Funktionen: validateElement(), getValidatedElement(),
 */

/**
 * Überprüft, ob ein DOM-Element existiert und gibt eine Fehlermeldung aus, wenn nicht.
 *
 * @param {Element|null} element - Das zu überprüfende DOM-Element
 * @param {string} errorMessage - Die Fehlermeldung, die bei nicht existierendem Element ausgegeben wird
 * @param {string} [level='error'] - Level des Logs ('log', 'warn', 'error')
 * @returns {boolean} - True, wenn das Element existiert, sonst false
 */
export function validateElement(element, errorMessage, level = "error") {
  if (!element) {
    console[level](errorMessage || "DOM-Element nicht gefunden");
    return false;
  }
  return true;
}

/**
 * Selektiert ein DOM-Element und validiert es in einem Schritt.
 *
 * @param {string} selector - CSS-Selektor für das Element
 * @param {string} [errorMessage] - Optionale Fehlermeldung
 * @param {string} [level='error'] - Level des Logs ('log', 'warn', 'error')
 * @returns {Element|null} - Das gefundene Element oder null
 */
export function getValidatedElement(selector, errorMessage, level = "error") {
  const element = document.querySelector(selector);

  if (
    !validateElement(
      element,
      errorMessage || `Fehler: Element "${selector}" nicht gefunden`,
      level
    )
  ) {
    return null;
  }

  return element;
}

/**
 * Selektiert mehrere DOM-Elemente und validiert das Ergebnis.
 *
 * @param {string} selector - CSS-Selektor für die Elemente
 * @param {string} [errorMessage] - Optionale Fehlermeldung
 * @param {string} [level='warn'] - Level des Logs ('log', 'warn', 'error')
 * @returns {NodeList|null} - Die gefundenen Elemente oder null
 */
export function getValidatedElements(selector, errorMessage, level = "warn") {
  const elements = document.querySelectorAll(selector);

  // querySelectorAll gibt eine leere Liste zurück, wenn nichts gefunden wurde
  if (elements.length === 0) {
    console[level](
      errorMessage || `Fehler: Keine Elemente für "${selector}" gefunden`
    );
    return null;
  }

  return elements;
}
