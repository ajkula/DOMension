import * as THREE from 'three';

/**
 * @typedef {Object} SceneManagerOptions
 * @property {number} width - Largeur du conteneur
 * @property {number} height - Hauteur du conteneur
 * @property {number} gridSize - Taille de la grille au sol
 * @property {string} backgroundColor - Couleur de fond
 * @property {string} groundColor - Couleur du sol
 */

class SceneManager {
  /**
   * @param {HTMLElement} container 
   * @param {SceneManagerOptions} options 
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: container.clientWidth,
      height: container.clientHeight,
      gridSize: 1000,
      backgroundColor: 0xf0f0f0,
      groundColor: 0xffffff,
      ...options
    };

    this.scene = new THREE.Scene();
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    this.setupGround();
    
    // Gestion du redimensionnement
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Configuration du renderer
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    
    this.renderer.setSize(this.options.width, this.options.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Configuration de la caméra isométrique
   */
  setupCamera() {
    const aspect = this.options.width / this.options.height;
    const d = this.options.gridSize / 2;
    
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 2000);
    
    // Position isométrique standard (angle de 120°)
    const iso = Math.PI / 6; // 30 degrés
    this.camera.position.set(d, d, d);
    this.camera.lookAt(0, 0, 0);
    
    // Rotation pour vue isométrique parfaite
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = -Math.PI / 4;
    this.camera.rotation.x = iso;
  }

  /**
   * Configuration des lumières
   */
  setupLights() {
    // Lumière ambiante douce
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Lumière directionnelle principale
    this.mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.mainLight.position.set(this.options.gridSize / 2, this.options.gridSize, this.options.gridSize / 2);
    this.mainLight.castShadow = true;

    // Configuration des ombres
    this.mainLight.shadow.camera.left = -this.options.gridSize / 2;
    this.mainLight.shadow.camera.right = this.options.gridSize / 2;
    this.mainLight.shadow.camera.top = this.options.gridSize / 2;
    this.mainLight.shadow.camera.bottom = -this.options.gridSize / 2;
    this.mainLight.shadow.camera.far = 2000;
    this.mainLight.shadow.mapSize.width = 2048;
    this.mainLight.shadow.mapSize.height = 2048;

    this.scene.add(this.mainLight);

    // Lumière d'appoint pour adoucir les ombres
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.fillLight.position.set(-this.options.gridSize / 2, this.options.gridSize / 2, -this.options.gridSize / 2);
    this.scene.add(this.fillLight);
  }

  /**
   * Configuration du sol
   */
  setupGround() {
    // Création de la grille
    const gridHelper = new THREE.GridHelper(
      this.options.gridSize, 
      20, 
      0xdddddd, 
      0xeeeeee
    );
    gridHelper.position.y = -0.01; // Légèrement en dessous du sol pour éviter le z-fighting
    this.scene.add(gridHelper);

    // Sol principal
    const groundGeometry = new THREE.PlaneGeometry(this.options.gridSize, this.options.gridSize);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: this.options.groundColor,
      side: THREE.DoubleSide
    });
    
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  /**
   * Gestion du redimensionnement
   */
  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    this.camera.left = -this.options.gridSize / 2 * aspect;
    this.camera.right = this.options.gridSize / 2 * aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Ajout d'un élément à la scène
   * @param {THREE.Object3D} object 
   */
  add(object) {
    this.scene.add(object);
  }

  /**
   * Suppression d'un élément de la scène
   * @param {THREE.Object3D} object 
   */
  remove(object) {
    this.scene.remove(object);
  }

  /**
   * Rendu de la scène
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Boucle d'animation
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  /**
   * Nettoyage de la scène
   */
  dispose() {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
    // Nettoyage des meshes et matériaux si nécessaire
  }
}

export { SceneManager };