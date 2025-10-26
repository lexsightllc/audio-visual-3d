/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import * as THREE from 'three';

declare module 'three' {
  // Fix for toneMapping type
  interface WebGLRenderer {
    toneMapping: number;
    outputColorSpace?: string;
  }

  // Fix for texture mapping type
  interface Texture {
    mapping: number;
  }

  // Add missing constants
  const ACESFilmicToneMapping: number;
  const EquirectangularReflectionMapping: number;
  const sRGBEncoding: number;
  const SRGBColorSpace: string;
  const LinearFilter: number;
  const RGBAFormat: number;
  const FloatType: number;
  const RepeatWrapping: number;
  const DoubleSide: number;
  const AdditiveBlending: number;
  const GLSL3: string;
  const BackSide: number;
  const FrontSide: number;
  const NoToneMapping: number;
  const LinearToneMapping: number;
  const ReinhardToneMapping: number;
  const CineonToneMapping: number;
  const NoColorSpace: string;
  const LinearSRGBColorSpace: string;
  const LinearDisplayP3ColorSpace: string;
  const DisplayP3ColorSpace: string;
}

// Add type for ShaderMaterial uniforms
declare module 'three' {
  interface ShaderMaterialParameters {
    uniforms?: { [uniform: string]: THREE.IUniform };
  }
}

// Add type for OrbitControls
declare module 'three/examples/jsm/controls/OrbitControls' {
  export class OrbitControls {
    constructor(camera: THREE.Camera, domElement?: HTMLElement);
    update(): void;
    enableDamping: boolean;
    dampingFactor: number;
    screenSpacePanning: boolean;
    minDistance: number;
    maxDistance: number;
    target: THREE.Vector3;
    // Add other OrbitControls properties and methods as needed
  }
}

// Add type for EffectComposer
declare module 'three/examples/jsm/postprocessing/EffectComposer' {
  export class EffectComposer {
    constructor(renderer: THREE.WebGLRenderer, renderTarget?: THREE.WebGLRenderTarget);
    setSize(width: number, height: number): void;
    render(): void;
    addPass(pass: any): void;
    // Add other EffectComposer properties and methods as needed
  }
}

// Add type for RenderPass
declare module 'three/examples/jsm/postprocessing/RenderPass' {
  export class RenderPass {
    constructor(scene: THREE.Scene, camera: THREE.Camera);
    // Add RenderPass properties and methods as needed
  }
}

// Add type for ShaderPass
declare module 'three/examples/jsm/postprocessing/ShaderPass' {
  export class ShaderPass {
    constructor(shader: object, textureID?: string);
    material: THREE.ShaderMaterial;
    // Add ShaderPass properties and methods as needed
  }
}

// Add type for UnrealBloomPass
declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
  export class UnrealBloomPass {
    constructor(resolution: THREE.Vector2, strength: number, radius: number, threshold: number);
    // Add UnrealBloomPass properties and methods as needed
  }
}

// Add type for FXAAShader
declare module 'three/examples/jsm/shaders/FXAAShader' {
  export const FXAAShader: {
    uniforms: {
      tDiffuse: { value: null };
      resolution: { value: THREE.Vector2 };
    };
    vertexShader: string;
    fragmentShader: string;
  };
}

// Add type for EXRLoader
declare module 'three/examples/jsm/loaders/EXRLoader' {
  export class EXRLoader {
    load(url: string, onLoad: (texture: THREE.Texture) => void): void;
    // Add EXRLoader properties and methods as needed
  }
}

// Add type for PMREMGenerator
declare module 'three' {
  class PMREMGenerator {
    constructor(renderer: THREE.WebGLRenderer);
    fromEquirectangular(texture: THREE.Texture): { texture: THREE.Texture };
    compileEquirectangularShader(): void;
    // Add PMREMGenerator properties and methods as needed
  }
}
