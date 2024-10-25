const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
import { DOMTooltip, ElementMeshWithTooltip } from './tooltipsManager';
import * as THREE from 'three';

jest.mock('three');

describe('DOMTooltip', () => {
  let container;
  let tooltip;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    tooltip = new DOMTooltip(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  describe('création', () => {
    it('should create a tooltip element in the container', () => {
      expect(container.querySelector('.dom-visualizer-tooltip')).toBeTruthy();
    });

    it('should initialize tooltip with default styles', () => {
      const tooltipElement = container.querySelector('.dom-visualizer-tooltip');
      expect(tooltipElement.style.position).toBe('absolute');
      expect(tooltipElement.style.visibility).toBe('hidden');
    });
  });

  describe('contenu', () => {
    it('should update tooltip content', () => {
      const elementData = global.tooltipTestData;
      tooltip.updateContent(elementData);
      expect(tooltip.tooltip.innerHTML).toContain('div');
      expect(tooltip.tooltip.innerHTML).toContain('test-class');
    });
  });

  describe('positionnement', () => {
    it('should handle screen bounds', () => {
      const position = { x: 0, y: 0 };
      tooltip.handleScreenBounds(position);
      expect(tooltip.tooltip.style.transform).toBeDefined();
    });
  });

  describe('visibilité', () => {
    it('should show and hide tooltip', () => {
      const position = new THREE.Vector3();
      position.project = jest.fn();

      tooltip.show(global.tooltipTestData, position, new THREE.Camera());
      expect(tooltip.visible).toBe(true);
      expect(tooltip.tooltip.style.visibility).toBe('visible');

      tooltip.hide();
      expect(tooltip.visible).toBe(false);
      expect(tooltip.tooltip.style.visibility).toBe('hidden');
    });
  });
});

describe('ElementMeshWithTooltip', () => {
  let container;
  let meshWithTooltip;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    meshWithTooltip = new ElementMeshWithTooltip(global.tooltipTestData);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  describe('tooltip integration', () => {
    it('should create a tooltip when setupTooltip is called', () => {
      const camera = new THREE.Camera();
      meshWithTooltip.setupTooltip(container, camera);
      expect(meshWithTooltip.tooltip).toBeDefined();
    });
  });

  describe('events', () => {
    it('should handle mouseover event and show tooltip', () => {
      const camera = new THREE.Camera();
      meshWithTooltip.setupTooltip(container, camera);
      meshWithTooltip.tooltip.show = jest.fn();
  
      const mockVector3 = {
        clone: jest.fn().mockReturnThis(),
        add: jest.fn().mockReturnThis()
      };
      THREE.Vector3 = jest.fn(() => mockVector3);
      
      meshWithTooltip.mesh.position = mockVector3;
      meshWithTooltip.mesh.scale = { y: 1 };
      meshWithTooltip.mesh.addEventListener.mock.calls[0][1]();
      
      expect(meshWithTooltip.tooltip.show).toHaveBeenCalled();
    });
  });
});