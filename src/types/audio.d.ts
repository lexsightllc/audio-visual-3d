/// <reference types="@types/webrtc" />
/// <reference types="@types/web" />

import { SceneControl } from '../schema/scene-control';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export type AudioWorkletMessageEvent = MessageEvent<Float32Array | SceneControl>;
