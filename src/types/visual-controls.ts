/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { log } from '../lib/logger.js';

export interface VisualControlState {
  arousal: number;        // 0 to 1
  valence: number;        // -1 to 1
  twist: {
    axis: 'primaryDiagonal' | 'secondaryDiagonal' | 'y';
    magnitude: number;    // 0 to 1
    durationMs: number;   // 250 to 60000
  };
  shards: {
    density: number;      // 0 to 1
    halfLifeMs: number;  // 200 to 20000
  };
  palette: 'nocturne' | 'prismatic' | 'infra';
}

export const DEFAULT_VISUAL_STATE: VisualControlState = {
  arousal: 0.5,
  valence: 0,
  twist: {
    axis: 'y',
    magnitude: 0.5,
    durationMs: 1000,
  },
  shards: {
    density: 0.5,
    halfLifeMs: 1000,
  },
  palette: 'prismatic',
};

export function validateVisualControlState(state: any): state is VisualControlState {
  if (typeof state !== 'object' || state === null) return false;

  // Validate arousal
  if (typeof state.arousal !== 'number' || state.arousal < 0 || state.arousal > 1) {
    return false;
  }

  // Validate valence
  if (typeof state.valence !== 'number' || state.valence < -1 || state.valence > 1) {
    return false;
  }

  // Validate twist
  if (!state.twist || typeof state.twist !== 'object') return false;
  if (!['primaryDiagonal', 'secondaryDiagonal', 'y'].includes(state.twist.axis)) return false;
  if (typeof state.twist.magnitude !== 'number' || state.twist.magnitude < 0 || state.twist.magnitude > 1) return false;
  if (typeof state.twist.durationMs !== 'number' || state.twist.durationMs < 250 || state.twist.durationMs > 60000) return false;

  // Validate shards
  if (!state.shards || typeof state.shards !== 'object') return false;
  if (typeof state.shards.density !== 'number' || state.shards.density < 0 || state.shards.density > 1) return false;
  if (typeof state.shards.halfLifeMs !== 'number' || state.shards.halfLifeMs < 200 || state.shards.halfLifeMs > 20000) return false;

  // Validate palette
  if (!['nocturne', 'prismatic', 'infra'].includes(state.palette)) return false;

  return true;
}

export function parseVisualControlMessage(message: string): VisualControlState | null {
  try {
    const data = JSON.parse(message);
    if (validateVisualControlState(data)) {
      return data;
    }
    log('warn', 'Received invalid visual control message', { data });
    return null;
  } catch (error) {
    log('error', 'Error parsing visual control message', { error: String(error) });
    return null;
  }
}
