require('@testing-library/jest-dom');

// Mock canvas Three.js
const mockCanvas = {
  style: {},
  width: 0,
  height: 0,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setAttribute: jest.fn(),
  parentNode: {
    removeChild: jest.fn(),
    appendChild: jest.fn()
  },
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    canvas: { width: 0, height: 0 }
  })),
  isConnected: true,
  getBoundingClientRect: jest.fn(() => ({
    width: 100,
    height: 50,
    top: 0,
    left: 0
  })),
  nodeName: 'CANVAS',
  nodeType: 1,
  ownerDocument: document,
  parentElement: null,
  appendChild: jest.fn(),
  cloneNode: jest.fn(),
  contains: jest.fn(),
  insertBefore: jest.fn(),
  replaceChild: jest.fn(),
  hasChildNodes: jest.fn(() => false),
  children: [],
  removeChild: jest.fn()
};

Object.setPrototypeOf(mockCanvas, HTMLCanvasElement.prototype);

// Position mock Three.js
const mockPosition = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn().mockReturnThis(),
  x: 0,
  y: 0,
  z: 0,
  length: jest.fn(() => 1)
};

// Mock rotation
const mockRotation = {
  order: 'XYZ',
  x: 0,
  y: 0,
  z: 0,
  set: jest.fn()
};

// Mock Three.js
jest.mock('three', () => ({
  Camera: jest.fn(() => ({
    position: mockPosition,
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn()
  })),
  Group: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: []
  })),
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    shadowMap: {},
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: mockCanvas
  })),
  OrthographicCamera: jest.fn(() => ({
    position: mockPosition,
    rotation: mockRotation,
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn()
  })),
  GridHelper: jest.fn(() => ({
    position: { ...mockPosition, y: 0 },
    rotation: mockRotation,
    dispose: jest.fn()
  })),
  BoxGeometry: jest.fn(() => ({
    clone: jest.fn().mockReturnThis(),
    dispose: jest.fn()
  })),
  MeshPhongMaterial: jest.fn(() => ({
    dispose: jest.fn(),
    color: { set: jest.fn() }
  })),
  MeshBasicMaterial: jest.fn(() => ({
    dispose: jest.fn(),
    color: { set: jest.fn() },
    transparent: true,
    opacity: 1
  })),
  Mesh: jest.fn(() => ({
    position: mockPosition,
    scale: { set: jest.fn(), y: 1 },
    rotation: { set: jest.fn() },
    material: [{ opacity: 1, color: {} }],
    geometry: { clone: jest.fn().mockReturnThis(), dispose: jest.fn() },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  })),
  Color: jest.fn(() => ({
    r: 0,
    g: 0,
    b: 0,
    set: jest.fn()
  })),
  Vector3: jest.fn(() => ({
    set: jest.fn(),
    clone: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    length: jest.fn(() => 1)
  })),
  PlaneGeometry: jest.fn(() => ({
    dispose: jest.fn()
  })),
  MathUtils: {
    clamp: jest.fn((value, min, max) => Math.min(Math.max(value, min), max))
  },
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(() => ({
    position: mockPosition,
    shadow: {
      camera: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      mapSize: { width: 0, height: 0 }
    }
  })),
  DoubleSide: 'DoubleSide'
}));

// Mock GSAP with Timeline
const gsapMockTimeline = {
  to: jest.fn(function() { return this; }),
  from: jest.fn(function() { return this; }),
  fromTo: jest.fn(function() { return this; }),
  set: jest.fn(function() { return this; }),
  play: jest.fn(function() { return this; }),
  pause: jest.fn(function() { return this; }),
  resume: jest.fn(function() { return this; }),
  reverse: jest.fn(function() { return this; }),
  restart: jest.fn(function() { return this; }),
  seek: jest.fn(function() { return this; }),
  clear: jest.fn(function() { return this; }),
  add: jest.fn(function() { return this; }),
  delay: jest.fn(function() { return this; }),
  endTime: jest.fn(() => 1),
  eventCallback: jest.fn(function() { return this; }),
  progress: jest.fn(() => 0),
  totalProgress: jest.fn(() => 0),
  totalDuration: jest.fn(() => 1),
  repeat: jest.fn(function() { return this; }),
  repeatDelay: jest.fn(function() { return this; }),
  time: jest.fn(function() { return this; }),
  totalTime: jest.fn(function() { return this; }),
  timeScale: jest.fn(function() { return this; }),
  duration: jest.fn(function() { return this; }),
  kill: jest.fn(function() { return this; }),
  paused: true
};

const timelineFunction = jest.fn(() => ({
  ...gsapMockTimeline,
  to: jest.fn(function() { return this; })
}));
timelineFunction.from = gsapMockTimeline.from;
timelineFunction.fromTo = gsapMockTimeline.fromTo;

// Main mock GSAP
const gsap = {
  ...timelineFunction,
  to: jest.fn((target, vars) => gsapMockTimeline),
  from: jest.fn((target, vars) => gsapMockTimeline),
  fromTo: jest.fn((target, fromVars, toVars) => gsapMockTimeline),
  set: jest.fn((target, vars) => gsapMockTimeline),
  timeline: timelineFunction,
  getProperty: jest.fn(),
  quickSetter: jest.fn(),
  registerPlugin: jest.fn(),
  core: {
    globals: jest.fn(),
    Animation: jest.fn(),
    Timeline: jest.fn(),
    Tween: jest.fn()
  },
  config: {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: { lineHeight: "" }
  },
  ticker: {
    add: jest.fn(),
    remove: jest.fn(),
    fps: jest.fn(() => 60),
    time: 0
  }
};

// Mock Data for tests
global.mockElementData = {
  id: 'test-1',
  tagName: 'div',
  classes: [],
  dimensions: { width: 100, height: 50 },
  position: { x: 0, y: 0 },
  computedStyle: { 
    backgroundColor: 'red',
    color: 'blue',
    opacity: 1,
    visibility: 'visible',
    display: 'block'
  },
  depth: 1,
  children: []
};

global.mockDOMData = {
  old: [{
    id: '1',
    dimensions: { width: 100, height: 50 },
    position: { x: 0, y: 0 },
    computedStyle: { backgroundColor: 'red' }
  }],
  new: [{
    id: '1',
    dimensions: { width: 200, height: 50 },
    position: { x: 0, y: 0 },
    computedStyle: { backgroundColor: 'red' }
  }, {
    id: '2',
    dimensions: { width: 100, height: 50 },
    position: { x: 0, y: 0 },
    computedStyle: { backgroundColor: 'blue' }
  }]
};

global.createMockElement = (tagName, options = {}) => {
  const element = document.createElement(tagName);
  console.log("element.children", element.children)
  Object.defineProperties(element, {
    style: { value: {} },
    classList: {
      value: {
        contains: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        toString: () => (options.classes || []).join(' '),
        length: (options.classes || []).length
      }
    },
    getBoundingClientRect: {
      value: () => ({
        width: options.width || 100,
        height: options.height || 50,
        top: options.top || 0,
        left: options.left || 0
      })
    }
  });

  // Mock methods
  element.addEventListener = jest.fn();
  element.removeEventListener = jest.fn();
  element.setAttribute = jest.fn();
  element.appendChild = jest.fn().mockImplementation(child => {
    console.log(element.children.length)
    element.children.push(child);
    return child;
  });
  element.removeChild = jest.fn();

  // Other options copy
  if (options.children) {
    element.children = [...options.children];
  }
  if (options.id) {
    element.id = options.id;
  }
  if (options.style) {
    Object.assign(element.style, options.style);
  }
  
  return element;
};

global.tooltipTestData = {
  tagName: 'div',
  classes: ['test-class'],
  dimensions: { width: 100, height: 50 },
  position: { x: 0, y: 0 },
  computedStyle: { 
    backgroundColor: 'red',
    color: 'blue',
    opacity: 1,
    visibility: 'visible',
    display: 'block'
  },
  depth: 1,
  children: []
};

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
});

/**
 * Analyze mock calls for all function fields in an object
 * @param {Object} obj - Object to analyze
 * @returns {Object} Map of method names and their calls parameters
 */
function analyzeMockCalls(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
      if (typeof value === 'function' && value.mock) {
          acc[key] = value.mock.calls;
      }
      else if (typeof value === 'object' && value !== null) {
          const subCalls = analyzeMockCalls(value);
          Object.entries(subCalls).forEach(([subKey, subCalls]) => {
              acc[`${key}.${subKey}`] = subCalls;
          });
      }
      return acc;
  }, {});
}

global.analyzeMockCalls = analyzeMockCalls;

export { gsap }
