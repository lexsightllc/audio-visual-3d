// This file provides type declarations for Three.js and its extensions

declare module 'three' {
  import * as _THREE from 'three';
  
  // Export everything from the main THREE module
  export * from 'three';
  
  // Extended type definitions
  export class Scene {
    background: any;
    add(...object: any[]): void;
    aspect: number;

    remove(...object: any[]): void;
  }
  
  export class PerspectiveCamera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    aspect: number;
    updateProjectionMatrix(): void;
  }
  
  export class WebGLRenderer {
    constructor(parameters?: any);
    domElement: HTMLElement;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(ratio: number): void;
    render(scene: any, camera: any): void;
    dispose(): void;
  }
  
  export class Mesh {
    geometry: any;
    material: any;
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    rotation: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    scale: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    userData: Record<string, any>;
  }
  
  export class IcosahedronGeometry {
    constructor(radius?: number, detail?: number);
    attributes: Record<string, any>;
    setAttribute(name: string, attribute: any): void;
    dispose(): void;
  }
  
  export class BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number, normalized?: boolean);
    count: number;
    array: ArrayLike<number>;
    getX(index: number): number;
    getY(index: number): number;
    getZ(index: number): number;
  }
  
  export class MeshStandardMaterial {
    constructor(parameters?: any);
    color: { set: (color: any) => void };
    metalness: number;
    roughness: number;
    dispose(): void;
  }
  
  export class MeshPhongMaterial {
    constructor(parameters?: any);
    color: { set: (color: any) => void };
    shininess: number;
    dispose(): void;
  }
  
  export class MeshBasicMaterial {
    constructor(parameters?: any);
    color: { set: (color: any) => void };
    wireframe: boolean;
    dispose(): void;
  }
  
  export class PointLight {
    constructor(color?: any, intensity?: number, distance?: number, decay?: number);
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
  }
  
  export class AmbientLight {
    constructor(color?: any, intensity?: number);
  }
  
  export class DirectionalLight {
    constructor(color?: any, intensity?: number);
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
  }
  
  export class Color {
    constructor(color?: any);
    set(color: any): Color;
  }
  
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
  }
  
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
  }
  
  export class Object3D {
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    rotation: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    scale: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    add(...object: any[]): void;
    remove(...object: any[]): void;
    dispose?(): void;
  }
  
  // Export the THREE namespace as default
  const THREE: typeof _THREE;
  export default THREE;
  
  // Export example classes
  export * from 'three/examples/jsm/postprocessing/EffectComposer';
  export * from 'three/examples/jsm/postprocessing/RenderPass';
  export * from 'three/examples/jsm/postprocessing/UnrealBloomPass';
}

// Make THREE available globally
declare const THREE: typeof import('three');
declare global {
  interface Window {
    THREE: typeof import('three');
  }
  export * from 'three/src/lights/DirectionalLight';
  export * from 'three/src/core/BufferGeometry';
  export * from 'three/src/materials/ShaderMaterial';
  export * from 'three/src/core/Object3D';
  export * from 'three/src/renderers/WebGLRenderer';
  export * from 'three/src/renderers/webgl/WebGLRenderTarget';
  export * from 'three/src/materials/MeshBasicMaterial';
  export * from 'three/src/geometries/BoxGeometry';
  export * from 'three/src/geometries/PlaneGeometry';
  export * from 'three/src/geometries/ConeGeometry';
  export * from 'three/src/core/Clock';
  export * from 'three/src/core/Event';
  export * from 'three/src/core/Object3D.EventMap';
  export * from 'three/src/core/BufferAttribute';
  export * from 'three/src/core/InterleavedBufferAttribute';
  export * from 'three/src/core/InterleavedBuffer';
  export * from 'three/src/core/InstancedBufferGeometry';
  export * from 'three/src/core/InstancedBufferAttribute';
  export * from 'three/src/textures/Texture';
  export * from 'three/src/materials/MeshStandardMaterial';
  export * from 'three/src/extras/PMREMGenerator';
}

// Example JSM modules
declare module 'three/examples/jsm/loaders/EXRLoader.js' {
  import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
  export { EXRLoader };
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  export { OrbitControls };
}

declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
  export { EffectComposer };
}

declare module 'three/examples/jsm/postprocessing/RenderPass.js' {
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
  export { RenderPass };
}

declare module 'three/examples/jsm/postprocessing/ShaderPass.js' {
  import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
  export { ShaderPass };
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass.js' {
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
  export { UnrealBloomPass };
}

declare module 'three/examples/jsm/shaders/FXAAShader.js' {
  import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
  export { FXAAShader };
}
