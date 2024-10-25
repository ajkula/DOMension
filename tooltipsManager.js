import { ElementMesh } from './elementMesh';
import * as THREE from 'three'; 

/**
 * Convert the 3D position to 2D coordinates for the screen
 * @param {THREE.Vector3} position 
 * @param {THREE.Camera} camera 
 * @param {HTMLElement} container 
 */
function getScreenPosition(position, camera, container) {
  const vector = position.clone();
  vector.project(camera);

  const x = (vector.x + 1) * container.clientWidth / 2;
  const y = (-vector.y + 1) * container.clientHeight / 2;

  return { x, y };
}

class DOMTooltip {
  constructor(container) {
    this.container = container;
    this.tooltip = this.createTooltipElement();
    this.visible = false;
    container.appendChild(this.tooltip);
  }

  /**
   * Tooltip element creation
   */
  createTooltipElement() {
    const tooltip = document.createElement('div');
    tooltip.className = 'dom-visualizer-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      visibility: hidden;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      pointer-events: none;
      transform: translate(-50%, -100%);
      transition: opacity 0.2s;
      z-index: 1000;
      max-width: 300px;
      backdrop-filter: blur(5px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    // Tooltip arrow
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position: absolute;
      left: 50%;
      bottom: -4px;
      transform: translateX(-50%) rotate(45deg);
      width: 8px;
      height: 8px;
      background: rgba(0, 0, 0, 0.8);
    `;
    tooltip.appendChild(arrow);

    return tooltip;
  }

  /**
   * Tooltip content update
   * @param {ElementMetrics} elementData 
   */
  updateContent(elementData) {
    // Structured content creation
    const content = document.createElement('div');
    content.className = 'tooltip-content';
    content.innerHTML = `
      <div style="margin-bottom: 6px;">
        <span style="color: #62DAFC;">&lt;${elementData.tagName}&gt;</span>
        ${elementData.classes.length ? `
          <span style="color: #98C379;">
            .${elementData.classes.join('.')}
          </span>
        ` : ''}
      </div>

      <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px; font-size: 11px;">
        <div style="color: #888;">Dimensions:</div>
        <div>${Math.round(elementData.dimensions.width)} × ${Math.round(elementData.dimensions.height)}px</div>
        
        ${elementData.computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ? `
          <div style="color: #888;">Couleur:</div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 2px;
              background: ${elementData.computedStyle.backgroundColor};
              border: 1px solid rgba(255,255,255,0.1);
            "></span>
            ${elementData.computedStyle.backgroundColor}
          </div>
        ` : ''}
        
        <div style="color: #888;">Profondeur:</div>
        <div>Niveau ${elementData.depth}</div>
      </div>
    `;

    // Clean and update
    while (this.tooltip.firstChild) {
      if (this.tooltip.firstChild.className !== 'tooltip-arrow') {
        this.tooltip.removeChild(this.tooltip.firstChild);
      }
    }
    this.tooltip.insertBefore(content, this.tooltip.firstChild);
  }

  /**
   * Tooltip position calculation
   * @param {THREE.Vector3} position 
   * @param {THREE.Camera} camera 
   */
  updatePosition(position, camera) {
    const screenPosition = getScreenPosition(position, camera, this.container);
    
    // Adding an offset to avoid the tooltip to overlap the element
    const offsetY = -10;
    
    this.tooltip.style.left = `${screenPosition.x}px`;
    this.tooltip.style.top = `${screenPosition.y + offsetY}px`;

    // Screen bounds management
    this.handleScreenBounds(screenPosition);
  }

  /**
   * Sceen bounds management
   * @param {Object} position 
   */
  handleScreenBounds(position) {
    const bounds = this.tooltip.getBoundingClientRect();
    const containerBounds = this.container.getBoundingClientRect();

    // Horizontal alignment
    if (bounds.right > containerBounds.right) {
      this.tooltip.style.transform = 'translate(-100%, -100%)';
    } else if (bounds.left < containerBounds.left) {
      this.tooltip.style.transform = 'translate(0%, -100%)';
    } else {
      this.tooltip.style.transform = 'translate(-50%, -100%)';
    }
  }

  /**
   * Tooltip display
   * @param {ElementMetrics} elementData 
   * @param {THREE.Vector3} position 
   * @param {THREE.Camera} camera 
   */
  show(elementData, position, camera) {
    this.updateContent(elementData);
    this.updatePosition(position, camera);
    this.tooltip.style.visibility = 'visible';
    this.tooltip.style.opacity = '1';
    this.visible = true;
  }

  /**
   * Tooltip masking
   */
  hide() {
    this.tooltip.style.visibility = 'hidden';
    this.tooltip.style.opacity = '0';
    this.visible = false;
  }

  /**
   * Tooltip update if visible
   * @param {ElementMetrics} elementData 
   * @param {THREE.Vector3} position 
   * @param {THREE.Camera} camera 
   */
  update(elementData, position, camera) {
    if (this.visible) {
      this.updatePosition(position, camera);
    }
  }

  dispose() {
    this.container.removeChild(this.tooltip);
  }
}

// ElementMesh class extension to integrate tooltips
class ElementMeshWithTooltip extends ElementMesh {
  constructor(elementData, options = {}) {
    super(elementData, options);
    this.tooltip = null;
  }

  setupTooltip(container, camera) {
    this.tooltip = new DOMTooltip(container);

    // Events binding
    this.mesh.addEventListener('mouseover', () => {
      this.tooltip.show(
        this.data,
        this.mesh.position.clone().add(new THREE.Vector3(0, this.mesh.scale.y * 10, 0)),
        camera
      );
    });

    this.mesh.addEventListener('mouseout', () => {
      this.tooltip.hide();
    });
  }

  update() {
    super.update();
    if (this.tooltip) {
      this.tooltip.update(
        this.data,
        this.mesh.position.clone().add(new THREE.Vector3(0, this.mesh.scale.y * 10, 0)),
        this.options.camera
      );
    }
  }

  dispose() {
    super.dispose();
    if (this.tooltip) {
      this.tooltip.dispose();
    }
  }
}

export { ElementMeshWithTooltip, DOMTooltip };