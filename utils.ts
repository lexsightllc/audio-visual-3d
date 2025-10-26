/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */

interface AudioBlob extends Blob {
  data: string;
  mimeType: string;
}

class AudioBlobImpl extends Blob {
  constructor(
    public readonly data: string,
    public readonly mimeType: string,
    options?: BlobPropertyBag
  ) {
    super([data], { type: mimeType, ...options });
  }

  static fromBase64(data: string, mimeType: string): AudioBlob {
    return new AudioBlobImpl(data, mimeType) as AudioBlob;
  }
}

export const toBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  // Browser: avoid huge String.fromCharCode(...)
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): AudioBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // convert float32 -1 to 1 to int16 -32768 to 32767
    int16[i] = Math.max(-32768, Math.min(32767, Math.floor(data[i] * 32768)));
  }

  const encoded = toBase64(new Uint8Array(int16.buffer));
  return AudioBlobImpl.fromBase64(encoded, 'audio/pcm;rate=16000');
}

export function splitInterleavedFloat32(data: Float32Array, numChannels: number): Float32Array[] {
  const frames = Math.floor(data.length / numChannels);
  const outs = Array.from({ length: numChannels }, () => new Float32Array(frames));
  for (let i = 0, f = 0; f < frames; f++, i += numChannels)
    for (let c = 0; c < numChannels; c++) outs[c][f] = data[i + c];
  return outs;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const buffer = ctx.createBuffer(
    numChannels,
    data.length / 2 / numChannels,
    sampleRate,
  );

  const dataInt16 = new Int16Array(data.buffer);
  const l = dataInt16.length;
  const dataFloat32 = new Float32Array(l);
  for (let i = 0; i < l; i++) {
    dataFloat32[i] = dataInt16[i] / 32768.0;
  }
  // Extract interleaved channels
  if (numChannels < 1) {
    console.warn('Invalid number of channels provided to decodeAudioData, defaulting to 1.');
    numChannels = 1;
  }
  if (numChannels === 1) {
    buffer.copyToChannel(dataFloat32, 0);
  } else {
    // use indexed copy instead of filter-based split
    const channels = splitInterleavedFloat32(dataFloat32, numChannels);
    for (let i = 0; i < numChannels; i++) buffer.copyToChannel(channels[i], i);
  }

  return buffer;
}

export { createBlob, decode, decodeAudioData };
