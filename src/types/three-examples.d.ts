/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
// Type definitions for three.js examples

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
  import { Camera, Scene, WebGLRenderer, WebGLRenderTarget } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class EffectComposer {
    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
    render(deltaTime?: number): void;
    setSize(width: number, height: number): void;
    addPass(pass: Pass): void;
    insertPass(pass: Pass, index: number): void;
    isLastEnabledPass(passIndex: number): boolean;
    swapBuffers(): void;
    reset(renderTarget?: WebGLRenderTarget): void;
    dispose(): void;
    passes: Pass[];
    renderTarget1: WebGLRenderTarget;
    renderTarget2: WebGLRenderTarget;
    writeBuffer: WebGLRenderTarget;
    readBuffer: WebGLRenderTarget;
    renderToScreen: boolean;
  }
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
  import { Camera, Color, Scene, WebGLRenderer } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class RenderPass extends Pass {
    constructor(scene: Scene, camera: Camera, overrideMaterial?: any, clearColor?: Color | string | number, clearAlpha?: number);
    scene: Scene;
    camera: Camera;
    overrideMaterial: any;
    clearColor: Color | string | number;
    clearAlpha: number;
    clearDepth: boolean;
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
  import { Vector2, WebGLRenderer, WebGLRenderTarget } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass';

  export class UnrealBloomPass extends Pass {
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
    render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean): void;
    setSize(width: number, height: number): void;
    dispose(): void;
    strength: number;
    radius: number;
    threshold: number;
    resolution: Vector2;
  }
}

declare module 'three/examples/jsm/postprocessing/Pass' {
  import { Color, Scene, Camera, ShaderMaterial, WebGLRenderTarget } from 'three';

  export class Pass {
    enabled: boolean;
    needsSwap: boolean;
    clear: boolean;
    renderToScreen: boolean;
    setSize?(width: number, height: number): void;
    render?(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean): void;
  }
}
