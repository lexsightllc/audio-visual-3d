/**
 * @license
 * SPDX-License-Identifier: MPL-2.0
*/
/**
 * Analyser class for live audio visualisation.
 */
export class Analyser {
  private analyser: AnalyserNode;
  private bufferLength: number;
  private dataArray: Uint8Array;

  constructor(node: AudioNode) {
    this.analyser = node.context.createAnalyser();
    // Increase fftSize for more detailed frequency analysis
    // Larger sizes provide more frequency bins but add latency.
    this.analyser.fftSize = 256;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    node.connect(this.analyser);
  }

  update(): void {
    this.analyser.getByteFrequencyData(this.dataArray);
  }

  get data(): Uint8Array {
    return this.dataArray;
  }

  getFrequencyData(): Uint8Array {
    this.update();
    return this.dataArray;
  }

  copyFrequencyData(targetArray: Uint8Array): void {
    this.update();
    targetArray.set(this.dataArray);
  }
}
