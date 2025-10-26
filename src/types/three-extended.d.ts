/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
// Extend the THREE global namespace
declare module 'three' {
  // Re-export everything from three
  export * from 'three';

  // Add any missing types or overrides here
  export class Scene {
    background: any;
    add(...object: any[]): void;
    remove(...object: any[]): void;
  }

  export class PerspectiveCamera {
    constructor(fov: number, aspect: number, near: number, far: number);
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    aspect: number;
    updateProjectionMatrix(): void;
  }

  export class WebGLRenderer {
    domElement: HTMLElement;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(ratio: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
  }

  export class Mesh {
    constructor(geometry?: any, material?: any);
    geometry: any;
    material: any;
    scale: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    userData: Record<string, any>;
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    rotation: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
  }

  export class BufferGeometry {
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

  export class IcosahedronGeometry {
    constructor(radius?: number, detail?: number);
    attributes: Record<string, any>;
    setAttribute(name: string, attribute: any): void;
    dispose(): void;
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

  export class Material {
    dispose(): void;
  }
}

// Add Pass type
declare module 'three/examples/jsm/postprocessing/Pass' {
  import { WebGLRenderer, WebGLRenderTarget } from 'three';

  export class Pass {
    enabled: boolean;
    needsSwap: boolean;
    clear: boolean;
    renderToScreen: boolean;
    clearColor: any;
    clearAlpha: number;

    constructor();
    render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean): void;
    setSize(width: number, height: number): void;
  }
}

// Add EffectComposer type
declare module 'three/examples/jsm/postprocessing/EffectComposer' {
  import { WebGLRenderer, WebGLRenderTarget } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class EffectComposer {
    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
    addPass(pass: Pass): void;
    insertPass(pass: Pass, index: number): boolean;
    isLastEnabledPass(passIndex: number): boolean;
    render(deltaTime?: number): void;
    reset(renderTarget?: WebGLRenderTarget): void;
    setPixelRatio(pixelRatio: number): void;
    setSize(width: number, height: number): void;
    swapBuffers(): void;
  }
}

// Add RenderPass type
declare module 'three/examples/jsm/postprocessing/RenderPass' {
  import { Camera, Scene, Color, Material } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class RenderPass extends Pass {
    constructor(scene: Scene, camera: Camera, overrideMaterial?: Material, clearColor?: Color | string | number, clearAlpha?: number);
    clear: boolean;
    clearColor: any;
    clearAlpha: number;
    copyMaterial: any;
    fsQuad: any;
  }
}

// Add UnrealBloomPass type
declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
  import { Vector2, WebGLRenderTarget } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class UnrealBloomPass extends Pass {
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
    strength: number;
    radius: number;
    threshold: number;
    resolution: Vector2;
    clearColor: any;
    renderTargets: WebGLRenderTarget[];
    dispose(): void;
    setSize(width: number, height: number): void;
  }
}

// Make THREE available globally
declare const THREE: typeof import('three');
