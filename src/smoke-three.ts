/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { log } from './lib/logger.js';
import * as THREE from 'three';

// Test WebGLRenderer and its properties
const r = new (THREE as any).WebGLRenderer();
r.toneMapping = (THREE as any).ACESFilmicToneMapping;
r.outputColorSpace = 'srgb';

// Test texture creation and properties
const tex = new (THREE as any).DataTexture(
  new Float32Array(4 * 4 * 4),
  4,
  4,
  (THREE as any).RGBAFormat,
  (THREE as any).FloatType
);

tex.minFilter = (THREE as any).LinearFilter;
tex.magFilter = (THREE as any).LinearFilter;
tex.mapping = (THREE as any).EquirectangularReflectionMapping;

// Test basic Three.js functionality
// Scene and camera are not used in this file
// const scene = new (THREE as any).Scene();
// const camera = new (THREE as any).PerspectiveCamera(75, 1, 0.1, 1000);

log('info', 'Three.js smoke test passed', {
  renderer: r.info,
  isDataTexture: tex.isDataTexture
});
