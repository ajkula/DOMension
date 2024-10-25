import * as THREE from 'three';
import gsap from 'gsap';

/**
 * @typedef {import('./domAnalyzer').ElementMetrics} ElementMetrics
 */

class ElementMesh {
  /**
   * @param {ElementMetrics} elementData 
   * @param {Object} options
   */
  constructor(elementData, options = {}) {
    this.data = elementData;
    this.options = {
      baseHeight: 20,
      depthStep: 10,
      padding: 5,
      hoverScale: 1.05,
      colors: {
        default: 0x2196F3,
        hover: 0x1976D2
      },
      ...options
    };

    this.createMesh();
    this.setupInteractions();
  }

  /**
   * Elementcolor getter
   * @returns {number}
   */
  getElementColor() {
    return this.data.computedStyle?.backgroundColor || this.options.colors.default;
  }

  /**
   * Main mesh and components creation
   */
  createMesh() {
    this.group = new THREE.Group();

    const width = Math.max(this.data.dimensions.width, 10);
    const height = this.options.baseHeight + (this.data.depth * this.options.depthStep);
    const depth = Math.max(this.data.dimensions.height, 10);

    // Main geometry creation
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // Different materials with different opacities for each side
    const materials = [
      this.createMaterial(this.getElementColor(), 0.9),  // front
      this.createMaterial(this.getElementColor(), 0.9),  // back
      this.createMaterial(this.getElementColor(), 0.8),  // top
      this.createMaterial(this.getElementColor(), 0.8),  // bottom
      this.createMaterial(this.getElementColor(), 0.7),  // right
      this.createMaterial(this.getElementColor(), 0.7)   // left
    ];

    // Main mesh creation
    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // DOM data based positioning
    this.mesh.position.set(
      this.data.position.x + width / 2,
      height / 2,
      this.data.position.y + depth / 2
    );

    // Add mesh to group
    this.group.add(this.mesh);

    // Highlight outline creation (invisible by default)
    this.createHighlight();
  }

  /**
   * Material creation with custom opacity
   */
  createMaterial(color, opacity = 1) {
    return new THREE.MeshPhongMaterial({
      color: color,
      transparent: opacity < 1,
      opacity: opacity,
      side: THREE.DoubleSide,
      depthWrite: opacity === 1
    });
  }

  /**
   * Highlight outline creation
   */
  createHighlight() {
    const geometry = this.mesh.geometry.clone();
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide
    });

    this.highlight = new THREE.Mesh(geometry, material);
    this.highlight.scale.set(1.05, 1.05, 1.05);
    this.highlight.position.copy(this.mesh.position);
    
    this.group.add(this.highlight);
  }

  /**
   * Interactions setup
   */
  setupInteractions() {
    this.isHovered = false;
    this.isSelected = false;

    // GSAP hover animation
    this.hoverTimeline = gsap.timeline({ paused: true })
      .to(this.mesh.scale, {
        x: this.options.hoverScale,
        y: this.options.hoverScale,
        z: this.options.hoverScale,
        duration: 0.3,
        ease: "back.out(1.5)"
      })
      .to(this.mesh.position, {
        y: "+=5",
        duration: 0.3,
        ease: "back.out(1.5)"
      }, 0)
      .to(this.highlight.material, {
        opacity: 0.3,
        duration: 0.2
      }, 0);
  }

  /**
   * Hover management
   * @param {boolean} isHovered 
   */
  setHovered(isHovered) {
    if (this.isHovered === isHovered) return;
    this.isHovered = isHovered;

    if (isHovered) {
      this.hoverTimeline.play();
      this.updateMaterialsColor(this.options.colors.hover);
    } else {
      this.hoverTimeline.reverse();
      this.updateMaterialsColor(this.options.colors.default);
    }
  }

  /**
   * Materials color update
   * @param {number} color 
   */
  updateMaterialsColor(color) {
    this.mesh.material.forEach(material => {
      gsap.to(material.color, {
        r: new THREE.Color(color).r,
        g: new THREE.Color(color).g,
        b: new THREE.Color(color).b,
        duration: 0.3
      });
    });
  }

  /**
   * Popup animation
   */
  animateIn() {
    this.mesh.scale.set(0.001, 0.001, 0.001);
    this.mesh.position.y -= 50;

    gsap.timeline()
      .to(this.mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      })
      .to(this.mesh.position, {
        y: "+=50",
        duration: 0.5,
        ease: "power2.out"
      }, 0);
  }

  /**
   * Update animation from new data
   * @param {ElementMetrics} newData 
   */
  updateFromData(newData) {
    const newPosition = {
      x: newData.position.x + newData.dimensions.width / 2,
      y: this.mesh.position.y,
      z: newData.position.y + newData.dimensions.height / 2
    };

    gsap.to(this.mesh.position, {
      x: newPosition.x,
      z: newPosition.z,
      duration: 0.5,
      ease: "power2.out"
    });

    gsap.to(this.mesh.scale, {
      x: newData.dimensions.width / this.data.dimensions.width,
      z: newData.dimensions.height / this.data.dimensions.height,
      duration: 0.5,
      ease: "power2.out"
    });

    this.data = newData;
  }

  /**
   * Ressources cleanup
   */
  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.forEach(material => material.dispose());
    this.highlight.geometry.dispose();
    this.highlight.material.dispose();
    
    // GSAP animations stop
    gsap.killTweensOf(this.mesh.scale);
    gsap.killTweensOf(this.mesh.position);
    gsap.killTweensOf(this.highlight.material);
  }
}

export { ElementMesh };