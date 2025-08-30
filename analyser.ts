/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
    this.analyser.fftSize = 32;
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

  getFrequencyData(): number[] {
    this.update();
    return Array.from(this.dataArray);
  }
}
