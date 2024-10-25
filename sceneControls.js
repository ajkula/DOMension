import * as THREE from 'three';
import gsap from 'gsap';

const { SceneManager } = require('./sceneManager');

class IsometricControls {
  /**
   * @param {THREE.Camera} camera 
   * @param {HTMLElement} domElement 
   * @param {Object} options 
   */
  constructor(camera, domElement, options = {}) {
    this.camera = camera;
    this.domElement = domElement;

    // Default options
    this.options = {
      rotationSpeed: 0.5,
      zoomSpeed: 0.1,
      minZoom: 0.5,
      maxZoom: 2,
      dampingFactor: 0.05,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 3,
      ...options
    };

    // Controls state
    this.state = {
      isActive: false,
      isDragging: false,
      rotationAngle: 0,
      targetRotationAngle: 0,
      zoom: 1,
      targetZoom: 1,
      lastX: 0
    };

    this.init();
  }

  /**
   * Event listeners initialisation
   */
  init() {
    // Drag for rotation initialisation
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Zoom with mouse wheel initialisation
    this.domElement.addEventListener('wheel', this.onWheel.bind(this));
    
    // Mobile touch management initialisation
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Fluid animation
    this.animate();
  }

  /**
   * Mouse click management
   */
  onMouseDown(event) {
    this.state.isDragging = true;
    this.state.lastX = event.clientX;
    this.domElement.style.cursor = 'grabbing';
  }

  /**
   * Mouse move management
   */
  onMouseMove(event) {
    if (!this.state.isDragging) return;

    const deltaX = event.clientX - this.state.lastX;
    this.state.targetRotationAngle += deltaX * this.options.rotationSpeed * 0.01;
    this.state.lastX = event.clientX;
  }

  /**
   * Click release management
   */
  onMouseUp() {
    this.state.isDragging = false;
    this.domElement.style.cursor = 'grab';
  }

  /**
   * Mouse wheel zoom management
   */
  onWheel(event) {
    event.preventDefault();

    const zoomDelta = event.deltaY * -0.001 * this.options.zoomSpeed;
    this.state.targetZoom = THREE.MathUtils.clamp(
      this.state.targetZoom + zoomDelta,
      this.options.minZoom,
      this.options.maxZoom
    );

    // Fluid zoom animation
    gsap.to(this.state, {
      zoom: this.state.targetZoom,
      duration: 0.5,
      ease: "power2.out"
    });
  }

  /**
   * Touch start management
   */
  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.state.isDragging = true;
      this.state.lastX = event.touches[0].clientX;
    }
  }

  /**
   * Touch move management
   */
  onTouchMove(event) {
    if (!this.state.isDragging) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - this.state.lastX;
    this.state.targetRotationAngle += deltaX * this.options.rotationSpeed * 0.01;
    this.state.lastX = touch.clientX;
  }

  /**
   * Touch end management
   */
  onTouchEnd() {
    this.state.isDragging = false;
  }

  /**
   * Controls animation
   */
  animate() {
    if (!this.state.isActive) return;

    // Rotation fluid animation
    this.state.rotationAngle += (this.state.targetRotationAngle - this.state.rotationAngle) * this.options.dampingFactor;

    // Transformation apply to the camera
    this.updateCamera();

    // Continu animation
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Camera update management
   */
  updateCamera() {
    // Maintain isometric view while allowing rotation around Y axis
    const radius = this.camera.position.length() * this.state.zoom;
    const iso = Math.PI / 6; // 30 degrés pour la vue isométrique

    // radius is the distance from the camera to the center of the scene
    // iso is the angle between the camera and the horizontal axis
    // rotationAngle is the angle between the camera and the vertical axis
    this.camera.position.x = radius * Math.cos(this.state.rotationAngle) * Math.cos(iso);
    this.camera.position.y = radius * Math.sin(iso);
    this.camera.position.z = radius * Math.sin(this.state.rotationAngle) * Math.cos(iso);

    // Camera always look at the center of the scene
    this.camera.lookAt(0, 0, 0);

    // Projection matrix update
    this.camera.updateProjectionMatrix();
  }

  /**
   * Controls activation
   */
  start() {
    this.state.isActive = true;
    this.domElement.style.cursor = 'grab';
    this.animate();
  }

  /**
   * Controls deactivation
   */
  stop() {
    this.state.isActive = false;
    this.domElement.style.cursor = 'default';
  }

  /**
   * View reset
   */
  reset() {
    gsap.to(this.state, {
      targetRotationAngle: 0,
      zoom: 1,
      duration: 1,
      ease: "power2.inOut"
    });
  }

  /**
   * Ressources disposal
   */
  dispose() {
    this.stop();
    
    // Event listeners disposal
    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.domElement.removeEventListener('wheel', this.onWheel.bind(this));
    this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this));
    this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this));
    this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }
}

// SceneManager extension to add controls
class SceneManagerWithControls extends SceneManager {
  constructor(container, options = {}) {
    super(container, options);
    
    this.controls = new IsometricControls(this.camera, this.renderer.domElement, {
      rotationSpeed: options.rotationSpeed || 0.5,
      zoomSpeed: options.zoomSpeed || 0.1
    });

    // Reset button addition
    this.addResetButton();
  }

  addResetButton() {
    const button = document.createElement('button');
    button.innerHTML = '⟲ Reset Vue';
    button.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    `;

    button.addEventListener('mouseover', () => {
      button.style.background = 'rgba(0, 0, 0, 0.9)';
    });

    button.addEventListener('mouseout', () => {
      button.style.background = 'rgba(0, 0, 0, 0.7)';
    });

    button.addEventListener('click', () => {
      this.controls.reset();
    });

    this.container.appendChild(button);
  }

  start() {
    super.start();
    this.controls.start();
  }

  stop() {
    super.stop();
    this.controls.stop();
  }

  dispose() {
    super.dispose();
    this.controls.dispose();
  }
}

export { IsometricControls, SceneManagerWithControls };