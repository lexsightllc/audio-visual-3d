/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
declare module 'visual-controls' {
  export interface VisualControlState {
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
  }

  export const VALID_PALETTES: readonly ['nocturne', 'prismatic', 'infra'];
  export const DEFAULT_VISUAL_STATE: VisualControlState;
  export function validateVisualControlState(state: unknown): state is VisualControlState;
  export function parseVisualControlMessage(message: string): VisualControlState | null;
}

declare namespace Modality {
  const AUDIO: 'AUDIO';
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const content: string;
  export default content;
}
