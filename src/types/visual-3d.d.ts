/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
// Type definitions for visual-3d module
declare module '*.glsl' {
  const content: string;
  export default content;
}

declare class Visualizer3D extends HTMLElement {
  updateVisuals(arousal: number, valence: number): void;
  applyTwist(axis: 'x' | 'y' | 'z', amount: number): void;
  updatePalette(paletteName: string): void;
  updateShards(density: number, halfLife: number): void;
  destroy(): void;
}

declare global {
  interface Window {
    Visualizer3D: typeof Visualizer3D;
  }
}

export { Visualizer3D }; module '../visual-3d' {
  export class Visualizer3D {
    updateVisuals(state: {
      arousal: number;
      valence: number;
      twist: {
        axis: 'primaryDiagonal' | 'secondaryDiagonal' | 'y';
        magnitude: number;
        durationMs: number;
      };
      shards: {
        density: number;
        halfLifeMs: number;
      };
      palette: 'nocturne' | 'prismatic' | 'infra';
    }): void;
  }
}
  interface HTMLElementTagNameMap {
    'visualizer-3d': Visualizer3D;
  }
