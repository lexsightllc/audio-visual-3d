import { GoogleGenerativeAI } from '@google/generative-ai';
import { LitElement, css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { createBlob } from '../../utils';
import OpenAIService from '../services/openai-service';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state()
  accessor isRecording = false;
  @state()
  accessor status = '';
  @state()
  accessor error = '';
  @state()
  accessor aiStatus = '';
  @state()
  accessor useOpenAI = false;

  // Audio context and nodes
  private inputAudioContext: AudioContext;
  private outputAudioContext: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private scriptProcessorNode: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  // AI Services
  private genAI: GoogleGenerativeAI | null = null;
  private openAIService: OpenAIService | null = null;

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
      font-family: 'Courier New', Courier, monospace;
      font-style: italic;
      color: #d8b4fe;
      background: #1e0a3c;
      padding: 8px 24px;
      border-radius: 999px;
      max-width: 80%;
      border: 1px solid #7e22ce;
      box-shadow: 0 0 5px rgba(196,181,253,.7), 0 0 10px rgba(196,181,253,.5);
      text-shadow: 0 0 3px rgba(216,180,254,.5);
      transition: all .3s ease-in-out;
      opacity: 1;
    }
    #aiStatus[hidden] { opacity: 0; transform: translateY(10px); }
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
      transition: all .2s ease; 
      outline: none;
    }
    .record { 
      background: #4CAF50; 
      color: white; 
      min-width: 120px; 
    }
    .record.recording { 
      background: #f44336; 
    }
    .toggle { 
      background: #2196F3; 
      color: white; 
    }
    button:disabled { 
      opacity: .6; 
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
    this.initGeminiClient();
  }

  private initGeminiClient() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('Google API key not found');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private updateStatus(status: string) {
    this.status = status;
    console.log(status);
  }

  private updateError(error: string) {
    this.error = error;
    console.error(error);
  }

  async startRecording() {
    try {
      this.isRecording = true;
      this.error = '';

      if (this.useOpenAI) {
        this.aiStatus = 'Conectando ao OpenAI…';
        this.openAIService = new OpenAIService(this.handleControlUpdate.bind(this), this.outputAudioContext, this.outputNode);
        await this.openAIService.startSession();
        await this.openAIService.startAudioCapture();
        this.status = 'Gravando';
        this.aiStatus = 'Ouvindo…';
        return;
      }

      // Implement Gemini AI integration here, similar to OpenAI's WebRTC setup.
      this.aiStatus = 'Conectando ao Gemini…';
      // ... actual Gemini connection logic ...
      // If successful:
      // this.status = 'Gravando';
      // this.aiStatus = 'Ouvindo…';
      // else:
      // this.aiStatus = 'Error connecting to Gemini';
      this.isRecording = false; // Or true if recording starts
      
    } catch (err) {
      console.error('Error starting recording:', err);
      this.error = `Error: ${err instanceof Error ? err.message : String(err)}`;
      this.status = 'Error';
      this.aiStatus = 'Error';
      this.isRecording = false;
    }
  }

  stopRecording() {
    if (this.openAIService) {
      this.openAIService.stopSession();
      this.openAIService = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.scriptProcessorNode) {
      this.scriptProcessorNode.disconnect();
      this.scriptProcessorNode = null;
    }
    this.isRecording = false;
    this.status = 'Stopped';
    this.aiStatus = 'Disconnected';
  }

  private toggleProvider() {
    if (this.isRecording) this.stopRecording();
    this.useOpenAI = !this.useOpenAI;
    this.status = this.useOpenAI ? 'Provedor: OpenAI' : 'Provedor: Gemini';
  }

  private handleControlUpdate = (data: any) => {
    const visual = this.shadowRoot?.querySelector('gdm-live-audio-visuals-3d') as any;
    if (visual?.updateFromControlData) visual.updateFromControlData(data);
  }

  render() {
    return html`
      <div class="controls">
        <button class="toggle" @click=${this.toggleProvider} ?disabled=${this.isRecording}>
          ${this.useOpenAI ? 'Usando OpenAI' : 'Usando Gemini'}
        </button>
        <button 
          class="record ${this.isRecording ? 'recording' : ''}"
          @click=${this.startRecording}
          ?disabled=${this.isRecording}>
          Iniciar
        </button>
        <button 
          @click=${this.stopRecording} 
          ?disabled=${!this.isRecording}>
          Parar
        </button>
      </div>

      <div id="status">
        <div id="connectionStatus">${this.status}</div>
        <div id="aiStatus" ?hidden=${!this.aiStatus}>${this.aiStatus}</div>
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

declare global {
  interface HTMLElementTagNameMap {
    'gdm-live-audio': GdmLiveAudio;
  }
}
