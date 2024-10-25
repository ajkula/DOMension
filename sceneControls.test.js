const {  describe, it, expect, beforeEach } = require('@jest/globals');
import { IsometricControls } from './sceneControls';
import * as THREE from 'three';

jest.mock('three');

describe('IsometricControls', () => {
  let camera;
  let domElement;
  let controls;

  beforeEach(() => {
    camera = new THREE.OrthographicCamera();
    domElement = document.createElement('div');
    controls = new IsometricControls(camera, domElement);
  });

  describe('initialization', () => {
    it('devrait initialiser avec les options par défaut', () => {
      expect(controls.options.rotationSpeed).toBe(0.5);
      expect(controls.options.zoomSpeed).toBe(0.1);
    });

    it('devrait configurer les états initiaux', () => {
      expect(controls.state.isActive).toBe(false);
      expect(controls.state.zoom).toBe(1);
    });
  });

  describe('event handlers', () => {
    it('devrait gérer le mousedown', () => {
      const event = new MouseEvent('mousedown', { clientX: 100 });
      controls.onMouseDown(event);
      expect(controls.state.isDragging).toBe(true);
    });

    it('devrait gérer le wheel pour le zoom', () => {
      const event = new WheelEvent('wheel', { deltaY: -100 });
      controls.onWheel(event);
      expect(controls.state.targetZoom).not.toBe(1);
    });
  });

  describe('camera updates', () => {
    it('devrait mettre à jour la caméra lors de la rotation', () => {
      controls.state.rotationAngle = Math.PI / 4;
      controls.updateCamera();
      expect(camera.position.x).not.toBe(0);
    });
  });

  describe('activation/deactivation', () => {
    it('devrait démarrer/arrêter les contrôles', () => {
      controls.start();
      expect(controls.state.isActive).toBe(true);
      
      controls.stop();
      expect(controls.state.isActive).toBe(false);
    });
  });

  describe('reset', () => {
    it('devrait réinitialiser la vue', () => {
      controls.state.rotationAngle = Math.PI;
      controls.state.zoom = 2;
      controls.reset();
      expect(controls.state.targetRotationAngle).toBe(0);
      expect(controls.state.targetZoom).toBe(1);
    });
  });
});
