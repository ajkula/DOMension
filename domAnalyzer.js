/**
 * @typedef {Object} ElementMetrics
 * @property {string} id - ID unique de l'élément
 * @property {string} tagName - Type d'élément HTML
 * @property {string[]} classes - Classes CSS
 * @property {Object} position - Position relative au parent
 * @property {number} position.x
 * @property {number} position.y
 * @property {Object} dimensions - Dimensions de l'élément
 * @property {number} dimensions.width
 * @property {number} dimensions.height
 * @property {Object} computedStyle - Styles pertinents calculés
 * @property {string} computedStyle.backgroundColor
 * @property {string} computedStyle.color
 * @property {number} computedStyle.zIndex
 * @property {number} depth - Niveau de profondeur dans le DOM
 * @property {ElementMetrics[]} children - Éléments enfants
 */

class DOMAnalyzer {
  constructor(options = {}) {
    this.options = {
      ignoredElements: ['script', 'style', 'noscript', 'br', 'hr'],
      relevantStyles: ['backgroundColor', 'color', 'opacity', 'visibility', 'display'],
      ...options
    };

    this.metricsCache = new WeakMap();
    this.idCounter = 0;
  }

  /**
   * Main entry point
   * @param {HTMLElement} rootElement - the root element to analyze
   * @returns {ElementMetrics}
   */
  analyze(rootElement) {
    this.metricsCache = new WeakMap();
    return this.analyzeElement(rootElement, 0);
  }

  /**
   * Recursively analyzes an element and its children
   * @param {HTMLElement} element
   * @param {number} depth
   * @returns {ElementMetrics}
   */
  analyzeElement(element, depth = 0) {
    // check the cache
    if (this.metricsCache.has(element)) {
      return this.metricsCache.get(element);
    }

    if (this.shouldIgnoreElement(element)) {
      return null;
    }

    const metrics = {
      id: this.generateElementId(element),
      tagName: element.tagName.toLowerCase(),
      classes: Array.from(element.classList),
      ...this.computeElementMetrics(element),
      depth,
      children: this.analyzeChildren(element, depth + 1)
    };

    //Cache the results
    this.metricsCache.set(element, metrics);
    return metrics;
  }

  /**
   * Calculate element metrics
   * @param {HTMLElement} element
   * @returns {Object}
   */
  computeElementMetrics(element) {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    // Parent relative position
    const parentRect = element.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
    
    return {
      position: {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top
      },
      dimensions: {
        width: rect.width,
        height: rect.height
      },
      computedStyle: this.extractRelevantStyles(computedStyle),
      visibility: {
        isVisible: computedStyle.display !== 'none' && 
                  computedStyle.visibility !== 'hidden' &&
                  rect.width > 0 && rect.height > 0
      }
    };
  }

  /**
   * Child elements analysis
   * @param {HTMLElement} element
   * @param {number} depth
   * @returns {ElementMetrics[]}
   */
  analyzeChildren(element, depth) {
    return Array.from(element.children)
      .map(child => this.analyzeElement(child, depth))
      .filter(Boolean); // Filtrer les éléments null/undefined
  }

  /**
   * Pertinent styles extraction
   * @param {CSSStyleDeclaration} computedStyle
   * @returns {Object}
   */
  extractRelevantStyles(computedStyle) {
    return this.options.relevantStyles.reduce((styles, property) => {
      styles[property] = computedStyle[property];
      return styles;
    }, {});
  }

  /**
   * Check if an element should be ignored
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  shouldIgnoreElement(element) {
    return this.options.ignoredElements.includes(element.tagName.toLowerCase()) ||
           !element.parentNode ||
           element.hidden ||
           !element.getBoundingClientRect().width;
  }

  /**
   * Unique ID generation
   * @param {HTMLElement} element
   * @returns {string}
   */
  generateElementId(element) {
    return element.id || `element-${++this.idCounter}`;
  }

  /**
   * DOM changes observer
   * @param {HTMLElement} rootElement
   * @param {Function} callback
   */
  observeChanges(rootElement, callback) {
    const observer = new MutationObserver(() => {
      callback(this.analyze(rootElement));
    });

    observer.observe(rootElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    return observer;
  }
}

export { DOMAnalyzer };