/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Analyser} from './analyser';

@customElement('gdm-live-audio-visuals')
export class GdmLiveAudioVisuals extends LitElement {
  private inputAnalyser!: Analyser;
  private outputAnalyser!: Analyser;

  private _outputNode!: AudioNode;

  @property({type: Object})
  set outputNode(node: AudioNode) {
    this._outputNode = node;
    this.outputAnalyser = new Analyser(this._outputNode);
  }

  get outputNode() {
    return this._outputNode;
  }

  private _inputNode!: AudioNode;

  @property({type: Object})
  set inputNode(node: AudioNode) {
    this._inputNode = node;
    this.inputAnalyser = new Analyser(this._inputNode);
  }

  get inputNode() {
    return this._inputNode;
  }

  private canvas!: HTMLCanvasElement;
  private canvasCtx!: CanvasRenderingContext2D;
  private inputGradient!: CanvasGradient;
  private outputGradient!: CanvasGradient;

  static styles = css`
    canvas {
      width: 400px;
      aspect-ratio: 1 / 1;
    }
  `;

  protected firstUpdated() {
    const canvas = this.renderRoot.querySelector('canvas');
    if (!canvas) return;
    this.canvas = canvas;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    this.canvasCtx = ctx;

    this.canvas.width = 400;
    this.canvas.height = 400;

    this.inputGradient = this.canvasCtx.createLinearGradient(0, 0, this.canvas.width, 0);
    this.inputGradient.addColorStop(0, '#002');
    this.inputGradient.addColorStop(1, '#26f');

    this.outputGradient = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height);
    this.outputGradient.addColorStop(0, '#120');
    this.outputGradient.addColorStop(1, '#2f6');

    this.visualize();
  }

  private visualize() {
    if (!this.canvas || !this.outputAnalyser) return;

    const canvas = this.canvas;
    const canvasCtx = this.canvasCtx;
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = '#1f2937';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = WIDTH / this.outputAnalyser.data.length;
    let x = 0;

    canvasCtx.fillStyle = this.inputGradient;
    this.inputAnalyser.update();
    for (let i = 0; i < this.inputAnalyser.data.length; i++) {
      const barHeight = this.inputAnalyser.data[i] * (HEIGHT / 255);
      canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    canvasCtx.globalCompositeOperation = 'lighter';
    canvasCtx.fillStyle = this.outputGradient;
    x = 0;
    this.outputAnalyser.update();
    for (let i = 0; i < this.outputAnalyser.data.length; i++) {
      const barHeight = this.outputAnalyser.data[i] * (HEIGHT / 255);
      canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    requestAnimationFrame(() => this.visualize());
  }

  protected render() {
    return html`<canvas></canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gdm-live-audio-visuals': GdmLiveAudioVisuals;
  }
}