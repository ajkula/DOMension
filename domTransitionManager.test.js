import gsap from 'gsap';

jest.mock('gsap');

import { describe, it, expect, beforeEach }from '@jest/globals';
import { DOMTransitionManager, SceneManagerWithTransitions } from'./domTransitionManager';
import * as THREE from 'three';

describe('DOMTransitionManager', () => {
  let transitionManager;
  let mockSceneManager;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSceneManager = {
      remove: jest.fn(),
      add: jest.fn()
    };

    transitionManager = new DOMTransitionManager(mockSceneManager);
  });

  describe('diffDOM', () => {
    it('should detect added and modified elements', () => {
      const oldData = [
        {
          id: '1',
          dimensions: { width: 100, height: 50 },
          position: { x: 0, y: 0 },
          computedStyle: { backgroundColor: 'red' }
        }
      ];

      const newData = [
        {
          id: '1',
          dimensions: { width: 200, height: 50 },
          position: { x: 0, y: 0 },
          computedStyle: { backgroundColor: 'red' }
        }
      ];

      const changes = transitionManager.diffDOM(oldData, newData);
      expect(changes.modified[0].old.dimensions.width).toBe(100);
      expect(changes.modified[0].new.dimensions.width).toBe(200);
    });

    it('should detect removed elements', () => {
      const oldData = [
        { id: '1', dimensions: { width: 100, height: 50 }, position: { x: 0, y: 0 }, computedStyle: { backgroundColor: 'red' } },
        { id: '2', dimensions: { width: 100, height: 50 }, position: { x: 0, y: 0 }, computedStyle: { backgroundColor: 'blue' } }
      ];
      const newData = [
        { id: '1', dimensions: { width: 100, height: 50 }, position: { x: 0, y: 0 }, computedStyle: { backgroundColor: 'red' } }
      ];

      const changes = transitionManager.diffDOM(oldData, newData);
      expect(changes.removed).toHaveLength(1);
      expect(changes.removed[0].id).toBe('2');
    });
  });

  describe('animations', () => {
    let mockMesh;
    let mockTimelineInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      mockTimelineInstance = {
        to: jest.fn().mockReturnThis()
      };

      gsap.timeline = jest.fn(() => mockTimelineInstance);

      mockMesh = {
        mesh: {
          scale: {
            set: jest.fn(),
            x: 1, y: 1, z: 1
          },
          material: [{
            opacity: 1,
            color: { r: 0, g: 0, b: 0 },
            transparent: true
          }]
        },
        group: {},
        data: { id: '1' },
        dispose: jest.fn()
      };
    });

    it('should configure removal animation', () => {
      transitionManager.meshMap.set('1', mockMesh);
      transitionManager.animateRemoval(mockMesh);

      // const calls = global.analyzeMockCalls(gsap);
      // console.log('GSAP calls before assertions:', calls);

      expect(gsap.timeline).toHaveBeenCalled();
      expect(mockTimelineInstance.to).toHaveBeenCalled();
    });

    it('should configure addition animation', () => {
      transitionManager.animateAddition(mockMesh);

      expect(mockMesh.mesh.scale.set).toHaveBeenCalledWith(0.01, 0.01, 0.01);
      expect(mockMesh.mesh.material[0].opacity).toBe(0);
      expect(gsap.timeline).toHaveBeenCalled();
      expect(gsap.timeline().to).toHaveBeenCalled();
    });

    it('should configure modification animation', () => {
      const oldData = {
        dimensions: { width: 100, height: 100 },
        position: { x: 0, y: 0 },
        computedStyle: { backgroundColor: 'red' }
      };

      const newData = {
        dimensions: { width: 200, height: 150 },
        position: { x: 50, y: 50 },
        computedStyle: { backgroundColor: 'blue' }
      };

      transitionManager.animateModification(mockMesh, oldData, newData);

      expect(gsap.timeline).toHaveBeenCalled();
      expect(gsap.timeline().to).toHaveBeenCalled();
    });
  });

  describe('DOM observation', () => {
    let mockElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
      transitionManager.analyzeDOMStructure = jest.fn();
      transitionManager.sync = jest.fn();
    });

    it('should create and return a MutationObserver', () => {
      const observer = transitionManager.observeDOM(mockElement);
      expect(observer).toBeInstanceOf(MutationObserver);
    });

    it('should react to DOM changes', (done) => {
      const mockObserverCallback = jest.fn();
      class MockMutationObserver {
        constructor(callback) {
          mockObserverCallback.mockImplementation(callback);
          this.observe = jest.fn();
          this.disconnect = jest.fn();
        }
      }

      const OriginalMutationObserver = window.MutationObserver;
      window.MutationObserver = MockMutationObserver;

      const observer = transitionManager.observeDOM(mockElement);
      mockElement.innerHTML = '<span>New content</span>';

      mockObserverCallback([{
        type: 'childList',
        target: mockElement,
        addedNodes: [mockElement.firstChild],
        removedNodes: []
      }]);

      setTimeout(() => {
        try {
          expect(transitionManager.analyzeDOMStructure).toHaveBeenCalled();
          window.MutationObserver = OriginalMutationObserver;
          done();
        } catch (error) {
          done(error);
        }
      }, 0);
    });
  });

  describe('SceneManagerWithTransitions', () => {
    let sceneManager;
    let mockContainer;

    beforeEach(() => {
      mockContainer = document.createElement('div');
      mockContainer.style.width = '800px';
      mockContainer.style.height = '600px';

      const mockCanvas = document.createElement('canvas');
      const mockRenderer = {
        domElement: mockCanvas,
        setSize: jest.fn(),
        shadowMap: {},
        setPixelRatio: jest.fn(),
        render: jest.fn(),
        dispose: jest.fn()
      };

      THREE.WebGLRenderer.mockImplementation(() => mockRenderer);
      sceneManager = new SceneManagerWithTransitions(mockContainer);

      sceneManager.analyzer = { analyze: jest.fn() };
      sceneManager.transitionManager = {
        sync: jest.fn(),
        observeDOM: jest.fn(() => ({ disconnect: jest.fn() })),
        dispose: jest.fn()
      };
    });

    it('should initialize the transition manager', () => {
      expect(sceneManager.transitionManager).toBeDefined();
    });

    it('should initialize from DOM', () => {
      const mockElement = document.createElement('div');
      const mockData = { some: 'data' };
      sceneManager.analyzer.analyze.mockReturnValue(mockData);

      sceneManager.initFromDOM(mockElement);

      expect(sceneManager.analyzer.analyze).toHaveBeenCalledWith(mockElement);
      expect(sceneManager.transitionManager.sync).toHaveBeenCalledWith(mockData);
    });

    it('should clean up resources when disposed', () => {
      const mockObserver = { disconnect: jest.fn() };
      sceneManager.observer = mockObserver;

      sceneManager.dispose();

      expect(sceneManager.transitionManager.dispose).toHaveBeenCalled();
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });
  });
});
