import gsap from 'gsap';
jest.mock('gsap');
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ElementMesh } from './elementMesh';
import * as THREE from 'three';

describe('ElementMesh', () => {
  let elementData;
  let mesh;
  let mockTimeline;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock timeline
    mockTimeline = {
      to: jest.fn().mockReturnThis(),
      play: jest.fn(),
      reverse: jest.fn()
    };
    gsap.timeline.mockReturnValue(mockTimeline);

    // Setup test data
    elementData = {
      dimensions: { width: 100, height: 50 },
      position: { x: 10, y: 20 },
      depth: 1,
      computedStyle: { backgroundColor: '#ff0000' }
    };

    // Mock geometry with isBoxGeometry
    const mockGeometry = {
      clone: jest.fn().mockReturnThis(),
      dispose: jest.fn(),
      isBoxGeometry: true
    };

    // Mock material with dispose
    const mockMaterial = {
      dispose: jest.fn(),
      opacity: 0.9,
      transparent: true,
      color: { r: 0, g: 0, b: 0, set: jest.fn() }
    };

    // Mock position with copy
    const mockPosition = {
      x: 0, y: 0, z: 0,
      set: jest.fn(),
      copy: jest.fn()
    };

    // Mock scale with set
    const mockScale = {
      x: 1, y: 1, z: 1,
      set: jest.fn()
    };

    // Setup THREE.js mocks
    THREE.Group.mockImplementation(() => ({
      add: jest.fn(),
      children: [],
      isGroup: true
    }));

    THREE.BoxGeometry.mockImplementation(() => mockGeometry);

    THREE.MeshPhongMaterial.mockImplementation(() => mockMaterial);
    THREE.MeshBasicMaterial.mockImplementation(() => ({
      ...mockMaterial,
      dispose: jest.fn()
    }));

    THREE.Mesh.mockImplementation((geometry, material) => ({
      position: mockPosition,
      scale: mockScale,
      geometry: geometry || mockGeometry,
      material: material || Array(6).fill(mockMaterial),
      isMesh: true
    }));

    // Create test instance
    mesh = new ElementMesh(elementData);
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      expect(mesh.options.baseHeight).toBe(20);
      expect(mesh.options.depthStep).toBe(10);
      expect(mesh.options.hoverScale).toBe(1.05);
      expect(mesh.data).toEqual(elementData);
    });

    it('should accept custom options', () => {
      const customMesh = new ElementMesh(elementData, {
        baseHeight: 30,
        depthStep: 15,
        hoverScale: 1.1
      });
      expect(customMesh.options.baseHeight).toBe(30);
      expect(customMesh.options.depthStep).toBe(15);
      expect(customMesh.options.hoverScale).toBe(1.1);
    });

    it('should create a THREE.js group', () => {
      expect(mesh.group.isGroup).toBeTruthy();
      expect(mesh.mesh.isMesh).toBeTruthy();
      expect(mesh.group.add).toHaveBeenCalledWith(mesh.mesh);
    });
  });

  describe('mesh creation', () => {
    it('should create main mesh with correct geometry', () => {
      expect(mesh.mesh.geometry.isBoxGeometry).toBeTruthy();
      expect(mesh.mesh.material).toHaveLength(6);
      expect(mesh.mesh.material[0].opacity).toBe(0.9);
    });

    it('should position mesh correctly', () => {
      const expectedX = elementData.position.x + elementData.dimensions.width / 2;
      const expectedZ = elementData.position.y + elementData.dimensions.height / 2;
      const height = mesh.options.baseHeight + (mesh.data.depth * mesh.options.depthStep);
      const expectedY = height / 2;
    
      expect(mesh.mesh.position.set).toHaveBeenCalledWith(expectedX, expectedY, expectedZ);
    });
    
  });

  describe('animations', () => {
    it('should configure appearance animation', () => {
      // Reset les mocks GSAP
      gsap.timeline.mockClear();
      mockTimeline.to.mockClear();

      mesh.animateIn();

      expect(gsap.timeline).toHaveBeenCalled();
      expect(mockTimeline.to).toHaveBeenCalled();
    });

    it('should update correctly with new data', () => {
      const newData = {
        ...elementData,
        dimensions: { width: 200, height: 100 },
        position: { x: 50, y: 30 }
      };

      mesh.updateFromData(newData);
      
      expect(gsap.to).toHaveBeenCalledWith(
        mesh.mesh.position,
        expect.objectContaining({
          duration: 0.5,
          ease: "power2.out"
        })
      );
    });
  });

  describe('cleanup', () => {
    it('should properly dispose resources', () => {
      const geometryDisposeSpy = jest.spyOn(mesh.mesh.geometry, 'dispose');
      const materialDisposeSpy = jest.spyOn(mesh.mesh.material[0], 'dispose');
      const highlightGeometryDisposeSpy = jest.spyOn(mesh.highlight.geometry, 'dispose');
      const highlightMaterialDisposeSpy = jest.spyOn(mesh.highlight.material, 'dispose');

      // Suppression du spy sur highlight.material.dispose qui n'existe pas

      mesh.dispose();

      expect(geometryDisposeSpy).toHaveBeenCalled();
      expect(materialDisposeSpy).toHaveBeenCalled();
      expect(highlightGeometryDisposeSpy).toHaveBeenCalled();
      expect(gsap.killTweensOf).toHaveBeenCalledWith(mesh.mesh.scale);
      expect(highlightMaterialDisposeSpy).toHaveBeenCalled();
    });
  });
});
