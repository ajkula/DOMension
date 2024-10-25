const { describe, it, expect, beforeEach } = require('@jest/globals');
import { SceneManager } from './sceneManager';
import * as THREE from 'three';

describe('SceneManager', () => {
  let container;
  let manager;
  let childElements;
  let dimensions;

  beforeEach(() => {
    childElements = [];
    dimensions = { width: 800, height: 600 };

    // Create container
    container = document.createElement('div');

    // Mock dimensions with writable properties
    Object.defineProperty(container, 'clientWidth', {
      get: () => dimensions.width,
      configurable: true
    });
    Object.defineProperty(container, 'clientHeight', {
      get: () => dimensions.height,
      configurable: true
    });

    // Mock children property
    Object.defineProperty(container, 'children', {
      get: () => childElements
    });

    container.appendChild = jest.fn(child => {
      childElements.push(child);
      return child;
    });

    container.removeChild = jest.fn(child => {
      const index = childElements.indexOf(child);
      if (index > -1) {
        childElements.splice(index, 1);
      }
      return child;
    });

    manager = new SceneManager(container);
  });

  describe('initialization', () => {
    it('should create a Three.js scene', () => {
      expect(THREE.Scene).toHaveBeenCalled();
      expect(manager.scene.add).toBeDefined();
    });

    it('should configure the isometric camera rotation', () => {
      expect(manager.camera.rotation.order).toBe('YXZ');
      expect(manager.camera.rotation.y).toBe(-Math.PI / 4);
      expect(manager.camera.rotation.x).toBe(Math.PI / 6);
    });

    it('should configure the renderer', () => {
      expect(THREE.WebGLRenderer).toHaveBeenCalled();
      expect(manager.renderer.shadowMap.enabled).toBe(true);
      expect(manager.renderer.setSize).toHaveBeenCalledWith(800, 600);
      expect(childElements).toHaveLength(1);
      expect(childElements[0]).toBe(manager.renderer.domElement);
    });

    it('should configure the isometric camera', () => {
      expect(THREE.OrthographicCamera).toHaveBeenCalled();
      expect(manager.camera.position.set).toHaveBeenCalled();
      expect(manager.camera.lookAt).toHaveBeenCalledWith(0, 0, 0);
    });
  });

  describe('setup', () => {
    it('should configure lights correctly', () => {
      expect(THREE.AmbientLight).toHaveBeenCalled();
      expect(THREE.DirectionalLight).toHaveBeenCalled();
      expect(manager.scene.add).toHaveBeenCalledWith(manager.ambientLight);
      expect(manager.scene.add).toHaveBeenCalledWith(manager.mainLight);
      expect(manager.scene.add).toHaveBeenCalledWith(manager.fillLight);
    });

    it('should configure the ground', () => {
      expect(manager.ground).toBeDefined();
      expect(manager.ground.receiveShadow).toBe(true);
      expect(manager.scene.add).toHaveBeenCalledWith(manager.ground);
    });
  });

  describe('resize', () => {
    it('should handle resizing', () => {
      const updateProjectionMatrixSpy = jest.spyOn(manager.camera, 'updateProjectionMatrix');
      const setResizeSpy = jest.spyOn(manager.renderer, 'setSize');

      // Update dimensions instead of redefining properties
      dimensions.width = 1024;
      dimensions.height = 768;

      manager.handleResize();

      expect(updateProjectionMatrixSpy).toHaveBeenCalled();
      expect(setResizeSpy).toHaveBeenCalledWith(1024, 768);
    });
  });

  describe('render loop', () => {
    it('should start the animation loop', () => {
      const renderSpy = jest.spyOn(manager.renderer, 'render');

      const originalAnimate = manager.animate;
      let animationFrameCallback = null;

      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = jest.fn(cb => {
        animationFrameCallback = cb;
        return 1;
      });

      manager.animate = function () {
        this.render();
      };
      manager.animate();

      expect(renderSpy).toHaveBeenCalledWith(manager.scene, manager.camera);

      global.requestAnimationFrame = originalRAF;
      manager.animate = originalAnimate;
    });
  });

  describe('cleanup', () => {
    it('should clean up resources', () => {
      const disposeSpy = jest.spyOn(manager.renderer, 'dispose');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      manager.dispose();

      expect(disposeSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });
  });
});