/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
// A lightweight capture worklet that processes audio with low latency
// - Emits Float32Array frames via port.postMessage
// - Optionally down-samples to 16 kHz (required by some providers)
// - Packs ~20 ms frames (320 samples @16k) to maintain low latency

class Downsampler {
  constructor(inRate, outRate) {
    this.inRate = inRate;
    this.outRate = outRate;
    this.ratio = inRate / outRate;
    this._acc = 0;
  }

  // Simple decimator (suitable for speech to LLM)
  run(input) {
    if (this.inRate === this.outRate) return input.slice(0);
    const outLen = Math.floor(input.length / this.ratio);
    const out = new Float32Array(outLen);
    let i = 0, o = 0, acc = this._acc;
    
    while (o < outLen) {
      const idx = Math.floor(acc);
      out[o++] = input[idx] || 0;
      acc += this.ratio;
    }
    
    this._acc = acc - Math.floor(acc);
    return out;
  }
}

class MicProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetRate = 16000;  // Target sample rate (16kHz)
    this.frameSize = 320;     // ~20ms @ 16kHz
    this.down = new Downsampler(options.processorOptions.sampleRate || 48000, this.targetRate);
    this._stash = new Float32Array(0);
    this.port.onmessage = this.onMessage.bind(this);
  }

  onMessage(event) {
    // Handle any incoming messages from the main thread
    if (event.data.type === 'config') {
      // Handle configuration updates if needed
    }
  }

  // Append `source` to `target`, growing the underlying buffer less often
  _append(target, source) {
    const newLength = target.length + source.length;
    let out;
    if (target.buffer.byteLength >= newLength * Float32Array.BYTES_PER_ELEMENT) {
      // Reuse existing buffer if there is enough space
      out = new Float32Array(target.buffer, 0, newLength);
    } else {
      // Allocate a slightly larger buffer to reduce future allocations
      out = new Float32Array(Math.ceil(newLength * 1.5));
    }
    out.set(target, 0);
    out.set(source, target.length);
    return out.subarray(0, newLength);
  }

  process(inputs) {
    const ch = inputs[0]?.[0];  // Get first input channel
    if (!ch) return true;       // Keep processor alive

    // Get mono buffer at context rate
    const mono = ch;

    // Downsample if needed
    const downsampled = this.down.run(mono);

    // Accumulate into 20ms payloads and post
    this._stash = this._append(this._stash, downsampled);
    
    while (this._stash.length >= this.frameSize) {
      const chunk = this._stash.subarray(0, this.frameSize);
      // Transfer buffer ownership to reduce copies
      this.port.postMessage(chunk, [chunk.buffer]);
      // Keep remainder
      this._stash = this._stash.subarray(this.frameSize);
    }

    return true;  // Keep processor alive
  }
}

// Register the processor
registerProcessor("mic-processor", MicProcessor);
