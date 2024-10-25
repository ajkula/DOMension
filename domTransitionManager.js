import * as THREE from 'three';
import gsap from 'gsap';

const { SceneManagerWithControls } = require('./sceneControls');
const { DOMAnalyzer } = require('./domAnalyzer');

class DOMTransitionManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.meshMap = new Map();
    this.transitionDuration = 0.5;
    this.analyzer = new DOMAnalyzer();
  }

  analyzeDOMStructure(rootElement) {
    return this.analyzer.analyze(rootElement);
  }

  /**
   * Synchronize the scene with the new DOM data
   * @param {ElementMetrics[]} newDOMData 
   */
  sync(newDOMData) {
    const changes = this.diffDOM(this.currentData, newDOMData);
    this.applyChanges(changes);
    this.currentData = newDOMData;
  }

  /**
   * Comparing old and new DOM data and returns the changes
   * @param {ElementMetrics[]} oldData 
   * @param {ElementMetrics[]} newData 
   */
  diffDOM(oldData = [], newData = []) {
    const changes = {
      added: [],
      removed: [],
      modified: [],
      unchanged: []
    };

    const oldMap = new Map(oldData.map(el => [el.id, el]));
    const newMap = new Map(newData.map(el => [el.id, el]));

    // Added and modified elements detection
    newMap.forEach((newEl, id) => {
      const oldEl = oldMap.get(id);
      if (!oldEl) {
        changes.added.push(newEl);
      } else if (this.hasChanged(oldEl, newEl)) {
        changes.modified.push({ old: oldEl, new: newEl });
      } else {
        changes.unchanged.push(newEl);
      }
    });

    // Deleted elements detection
    oldMap.forEach((oldEl, id) => {
      if (!newMap.has(id)) {
        changes.removed.push(oldEl);
      }
    });

    return changes;
  }

  /**
   * Checks if an element has changed
   * @param {ElementMetrics} oldEl 
   * @param {ElementMetrics} newEl 
   */
  hasChanged(oldEl, newEl) {
    return (
      oldEl.dimensions.width !== newEl.dimensions.width ||
      oldEl.dimensions.height !== newEl.dimensions.height ||
      oldEl.position.x !== newEl.position.x ||
      oldEl.position.y !== newEl.position.y ||
      oldEl.computedStyle.backgroundColor !== newEl.computedStyle.backgroundColor
    );
  }

  /**
   * Apply changes with animations
   * @param {Object} changes 
   */
  applyChanges(changes) {
    changes.removed.forEach(el => {
      const mesh = this.meshMap.get(el.id);
      if (mesh) {
        this.animateRemoval(mesh);
      }
    });

    changes.added.forEach(el => {
      const mesh = this.createMesh(el);
      this.animateAddition(mesh);
      this.meshMap.set(el.id, mesh);
    });

    changes.modified.forEach(({ old, new: newEl }) => {
      const mesh = this.meshMap.get(old.id);
      if (mesh) {
        this.animateModification(mesh, old, newEl);
      }
    });
  }

  /**
   * Element deletion animation
   * @param {ElementMesh} mesh 
   */
  animateRemoval(mesh) {
    const timeline = gsap.timeline({
      onComplete: () => {
        this.sceneManager.remove(mesh.group);
        mesh.dispose();
        this.meshMap.delete(mesh.data.id);
      }
    });

    timeline
      .to(mesh.mesh.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: this.transitionDuration,
        ease: "power2.in"
      })
      .to(mesh.mesh.material, {
        opacity: 0,
        duration: this.transitionDuration * 0.5,
        ease: "power2.in"
      }, 0);
  }

  /**
   * New element creation animation
   * @param {ElementMesh} mesh 
   */
  animateAddition(mesh) {
    mesh.mesh.scale.set(0.01, 0.01, 0.01);
    mesh.mesh.material.forEach(mat => mat.opacity = 0);

    const timeline = gsap.timeline();

    timeline
      .to(mesh.mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: this.transitionDuration,
        ease: "back.out(1.7)"
      })
      .to(mesh.mesh.material, {
        opacity: 1,
        duration: this.transitionDuration * 0.5,
        ease: "power2.out"
      }, 0);
  }

  /**
   * Element modification animation
   * @param {ElementMesh} mesh 
   * @param {ElementMetrics} oldData 
   * @param {ElementMetrics} newData 
   */
  animateModification(mesh, oldData, newData) {
    const timeline = gsap.timeline();

    const newDimensions = {
      width: newData.dimensions.width,
      height: newData.dimensions.height,
      x: newData.position.x + newData.dimensions.width / 2,
      y: newData.position.y + newData.dimensions.height / 2
    };

    timeline
      .to(mesh.mesh.scale, {
        x: newDimensions.width / oldData.dimensions.width,
        y: 1,
        z: newDimensions.height / oldData.dimensions.height,
        duration: this.transitionDuration,
        ease: "power2.inOut"
      })
      .to(mesh.mesh.position, {
        x: newDimensions.x,
        z: newDimensions.y,
        duration: this.transitionDuration,
        ease: "power2.inOut"
      }, 0);

      // Color change animation
      if (oldData.computedStyle.backgroundColor !== newData.computedStyle.backgroundColor) {
      const newColor = new THREE.Color(newData.computedStyle.backgroundColor);
      mesh.mesh.material.forEach(material => {
        gsap.to(material.color, {
          r: newColor.r,
          g: newColor.g,
          b: newColor.b,
          duration: this.transitionDuration,
          ease: "power2.inOut"
        });
      });
    }

    // Pulse effect
    timeline.to(mesh.mesh.scale, {
      x: "*=1.05",
      y: "*=1.05",
      z: "*=1.05",
      duration: this.transitionDuration * 0.3,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    }, 0);
  }

  /**
   * Realtime DOM changes observation
   * @param {HTMLElement} rootElement 
   */
  observeDOM(rootElement) {
    const observer = new MutationObserver(() => {
      // Short delay to avoid multiple updates at once
      requestAnimationFrame(() => {
        const newData = this.analyzeDOMStructure(rootElement);
        this.sync(newData);
      });
    });

    observer.observe(rootElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeFilter: ['style', 'class']
    });

    return observer;
  }

  /**
   * Ressources cleanup
   */
  dispose() {
    this.meshMap.forEach(mesh => {
      mesh.dispose();
    });
    this.meshMap.clear();
  }
}

// SceneManager extension for DOM transitions
class SceneManagerWithTransitions extends SceneManagerWithControls {
  constructor(container, options = {}) {
    super(container, options);
    this.transitionManager = new DOMTransitionManager(this);
  }

  // Inittial DOM analysis and synchronization
  initFromDOM(rootElement) {
    const domData = this.analyzer.analyze(rootElement);
    this.transitionManager.sync(domData);

    this.observer = this.transitionManager.observeDOM(rootElement);
  }

  dispose() {
    super.dispose();
    this.transitionManager.dispose();
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export { DOMTransitionManager, SceneManagerWithTransitions };
