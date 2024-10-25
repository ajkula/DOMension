import { describe, it, expect, beforeEach } from '@jest/globals';
import { DOMAnalyzer } from './domAnalyzer';

describe('DOMAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new DOMAnalyzer();
  });

  describe('configuration', () => {
    it('should initialize with default options', () => {
      expect(analyzer.options.ignoredElements).toEqual(['script', 'style', 'noscript', 'br', 'hr']);
      expect(analyzer.options.relevantStyles).toContain('backgroundColor');
    });

    it('should accept custom options', () => {
      const customAnalyzer = new DOMAnalyzer({
        ignoredElements: ['custom'],
        relevantStyles: ['customStyle']
      });
      expect(customAnalyzer.options.ignoredElements).toEqual(['custom']);
      expect(customAnalyzer.options.relevantStyles).toEqual(['customStyle']);
    });
  });

  describe('element analysis', () => {
    it('should extract basic element metrics', () => {
      const mockElement = document.createElement('div');
      Object.defineProperties(mockElement, {
        getBoundingClientRect: {
          value: () => ({ width: 100, height: 50, left: 10, top: 20 })
        },
        offsetParent: {
          value: document.createElement('div')
        }
      });
      
      mockElement.offsetParent.getBoundingClientRect = () => ({ width: 800, height: 600, left: 0, top: 0 });
      document.body.appendChild(mockElement);
      mockElement.style.backgroundColor = 'red';

      const metrics = analyzer.computeElementMetrics(mockElement);
      expect(metrics.position.x).toBe(10); // left relative to parent
      expect(metrics.position.y).toBe(20);
      expect(metrics.dimensions.width).toBe(100);
      expect(metrics.dimensions.height).toBe(50);
      
      document.body.removeChild(mockElement);
    });

    it('should calculate hierarchy correctly', () => {
      const divElement = document.createElement('div');
      const pElement = document.createElement('p');
      const spanElement = document.createElement('span');
      
      pElement.appendChild(spanElement);
      divElement.appendChild(pElement);
      document.body.appendChild(divElement);
      
      // Set up getBoundingClientRect for each element
      [divElement, pElement, spanElement].forEach(el => {
        el.getBoundingClientRect = () => ({ width: 100, height: 50, left: 0, top: 0 });
      });

      const result = analyzer.analyze(divElement);

      expect(result.depth).toBe(0);
      expect(result.children[0].depth).toBe(1);
      expect(result.children[0].children[0].depth).toBe(2);
      
      document.body.removeChild(divElement);
    });

    it('should handle ignored elements', () => {
      const scriptElement = document.createElement('script');
      const validElement = document.createElement('div');
      validElement.getBoundingClientRect = () => ({ width: 100, height: 50, left: 0, top: 0 });
      
      document.body.appendChild(scriptElement);
      document.body.appendChild(validElement);
      
      expect(analyzer.shouldIgnoreElement(scriptElement)).toBe(true);
      expect(analyzer.shouldIgnoreElement(validElement)).toBe(false);
      
      document.body.removeChild(scriptElement);
      document.body.removeChild(validElement);
    });
  });

  describe('ID management', () => {
    it('should use existing ID when available', () => {
      const element = document.createElement('div');
      element.id = 'test-id';
      expect(analyzer.generateElementId(element)).toBe('test-id');
    });

    it('should generate unique ID when none exists', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      
      const id1 = analyzer.generateElementId(element1);
      const id2 = analyzer.generateElementId(element2);

      expect(id1).toMatch(/element-\d+/);
      expect(id2).toMatch(/element-\d+/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('style extraction', () => {
    it('should extract specified styles', () => {
      // Create an actual element to get real computed styles
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      element.style.backgroundColor = 'red';
      element.style.color = 'blue';
      element.style.opacity = '1';
      
      const computedStyle = window.getComputedStyle(element);
      const styles = analyzer.extractRelevantStyles(computedStyle);
      
      expect(styles.backgroundColor).toBe('red');
      expect(styles.color).toBe('blue');
      expect(styles.opacity).toBe('1');
      
      document.body.removeChild(element);
    });
  });

  describe('DOM observation', () => {
    it('should detect DOM modifications', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const mockCallback = jest.fn();
      const observer = analyzer.observeChanges(element, mockCallback);
      
      // Trigger a DOM modification
      const child = document.createElement('span');
      element.appendChild(child);

      // Wait for mutation observer to fire
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalled();
        observer.disconnect();
        document.body.removeChild(element);
        done();
      });
    });
  });
});