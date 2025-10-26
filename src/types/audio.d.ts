/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
/// <reference types="@types/webrtc" />
/// <reference types="@types/web" />

import { SceneControl } from '../schema/scene-control';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export type AudioWorkletMessageEvent = MessageEvent<Float32Array | SceneControl>;
