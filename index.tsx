/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage, Session } from '@google/genai';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createBlob, decode, decodeAudioData as decodePCM } from './utils';
import OpenAIService from './src/services/openai-service';

declare global {
  interface Window { 
    webkitAudioContext: typeof AudioContext;
  }
}

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() accessor isRecording = false;
  @state() accessor status = '';
  @state() accessor error = '';
  @state() accessor aiStatus = '';
  @state() accessor useOpenAI = false;

  private client: GoogleGenAI | null = null;
  private session: Session | null = null;
  private openAIService: OpenAIService | null = null;

  private inputAudioContext: AudioContext;
  private outputAudioContext: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private scriptProcessorNode: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;

  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  static styles = css`
    #status {
      position: absolute;
      bottom: 100px;
      left: 0;
      right: 0;
      z-index: 10;
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      font-size: 16px;
    }
    
    #aiStatus {
      font-family: 'Courier New', monospace;
      font-style: italic;
      color: #d8b4fe;
      background: #1e0a3c;
      padding: 8px 24px;
      border-radius: 999px;
      max-width: 80%;
      border: 1px solid #7e22ce;
      box-shadow: 0 0 5px rgba(196, 181, 253, 0.7), 0 0 10px rgba(196, 181, 253, 0.5);
      text-shadow: 0 0 3px rgba(216, 180, 254, 0.5);
      transition: 0.3s;
      opacity: 1;
    }
    
    #aiStatus[hidden] {
      opacity: 0;
      transform: translateY(10px);
    }
    
    .controls {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 16px;
      z-index: 10;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
    }
    
    .record {
      background: #4CAF50;
      color: #fff;
      min-width: 120px;
    }
    
    .record.recording {
      background: #f44336;
    }
    
    .toggle {
      background: #2196F3;
      color: #fff;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    this.inputNode = this.inputAudioContext.createGain();
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);
    this.nextStartTime = this.outputAudioContext.currentTime;

    // Initialize Google GenAI client with API key from Vite environment
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    } else {
      console.warn('Google API key not found. Set VITE_GOOGLE_API_KEY in your .env file');
    }
  }

  private async initGeminiSession() {
    if (!this.client) {
      this.fail('Google GenAI client not initialized');
      return;
    }

    try {
      this.session = await this.client.live.connect({
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
        callbacks: {
          onopen: () => this.note('Conectado ao Gemini Live'),
          onmessage: async (msg: LiveServerMessage) => {
            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            if (audio?.data) {
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              const buf = await decodePCM(decode(audio.data), this.outputAudioContext, 24000, 1);
              const src = this.outputAudioContext.createBufferSource();
              src.buffer = buf;
              src.connect(this.outputNode);
              src.addEventListener('ended', () => this.sources.delete(src));
              src.start(this.nextStartTime);
              this.nextStartTime += buf.duration;
              this.sources.add(src);
            }
            if (msg.serverContent?.interrupted) {
              for (const s of this.sources) s.stop();
              this.sources.clear();
              this.nextStartTime = this.outputAudioContext.currentTime;
            }
          },
          onerror: (e: ErrorEvent) => this.fail(e.message),
          onclose: (e: CloseEvent) => this.note(`Conexão encerrada: ${e.reason}`),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: 'Orus' 
              } 
            } 
          },
        },
      });
    } catch (err) {
      const error = err as Error;
      this.fail(error.message || 'Failed to initialize Gemini session');
    }
  }

  private async startRecording() {
    try {
      this.isRecording = true;
      this.error = '';

      if (this.useOpenAI) {
        this.aiStatus = 'Conectando ao OpenAI…';
        this.openAIService = new OpenAIService(
          this.handleControlUpdate.bind(this),
          this.outputAudioContext,
          this.outputNode
        );
        await this.openAIService.startSession();
        await this.openAIService.startAudioCapture();
        this.status = 'Gravando';
        this.aiStatus = 'Ouvindo…';
        return;
      }

      this.aiStatus = 'Conectando ao Gemini…';
      await this.initGeminiSession();

      this.status = 'Solicitando microfone…';
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      const mic = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      mic.connect(this.inputNode);

      const bufferSize = 256;
      this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(bufferSize, 1, 1);
      this.scriptProcessorNode.onaudioprocess = (ev) => {
        if (!this.isRecording || !this.session) return;
        const pcm = ev.inputBuffer.getChannelData(0);
        this.session.sendRealtimeInput({ media: createBlob(pcm) });
      };
      
      this.inputNode.connect(this.scriptProcessorNode);
      this.scriptProcessorNode.connect(this.inputAudioContext.destination);

      this.status = 'Gravando';
      this.aiStatus = 'Ouvindo…';
    } catch (err) {
      const error = err as Error;
      this.fail(error.message || 'Failed to start recording');
      this.isRecording = false;
    }
  }

  private stopRecording() {
    if (this.openAIService) {
      this.openAIService.stopSession();
      this.openAIService = null;
    }
    
    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        console.error('Error closing session:', e);
      }
      this.session = null;
    }
    
    if (this.scriptProcessorNode) {
      try {
        this.scriptProcessorNode.disconnect();
      } catch (e) {
        console.error('Error disconnecting script processor:', e);
      }
      this.scriptProcessorNode = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    for (const source of this.sources) {
      try {
        source.stop();
      } catch (e) {
        console.error('Error stopping audio source:', e);
      }
    }
    
    this.sources.clear();
    this.nextStartTime = this.outputAudioContext.currentTime;
    this.isRecording = false;
    this.status = 'Parado';
    this.aiStatus = 'Desconectado';
  }

  private toggleProvider() {
    if (this.isRecording) {
      this.stopRecording();
    }
    this.useOpenAI = !this.useOpenAI;
    this.status = this.useOpenAI ? 'Provedor: OpenAI' : 'Provedor: Gemini';
  }

  private handleControlUpdate(data: unknown) {
    const visual = this.shadowRoot?.querySelector('gdm-live-audio-visuals-3d') as any;
    if (visual?.updateFromControlData) {
      visual.updateFromControlData(data);
    }
  }

  private note(msg: string) {
    this.status = msg;
  }

  private fail(msg: string) {
    this.error = msg;
  }

  render() {
    return html`
      <div class="controls">
        <button 
          class="toggle" 
          @click=${this.toggleProvider} 
          ?disabled=${this.isRecording}
        >
          ${this.useOpenAI ? 'Usando OpenAI' : 'Usando Gemini'}
        </button>
        <button 
          class="record ${this.isRecording ? 'recording' : ''}" 
          @click=${this.startRecording} 
          ?disabled=${this.isRecording}
        >
          Iniciar
        </button>
        <button 
          @click=${this.stopRecording} 
          ?disabled=${!this.isRecording}
        >
          Parar
        </button>
      </div>
      <div id="status">
        <div id="connectionStatus">${this.status}</div>
        <div id="aiStatus" ?hidden=${!this.aiStatus}>
          ${this.aiStatus}
        </div>
        <div id="errorStatus">${this.error}</div>
      </div>
      <gdm-live-audio-visuals-3d
        .inputNode=${this.inputNode}
        .outputNode=${this.outputNode}
        @aistatusupdate=${(e: CustomEvent) => (this.aiStatus = e.detail)}
      ></gdm-live-audio-visuals-3d>
    `;
  }
}
