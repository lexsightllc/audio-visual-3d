// Type definitions for visual controls
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
