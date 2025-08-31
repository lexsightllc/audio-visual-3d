import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import OpenAIService from '../services/openai-service.js';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
  interface HTMLElementTagNameMap {
    'gdm-live-audio': GdmLiveAudio;
  }
}

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state()
  accessor isRecording = false;
  @state()
  accessor status = '';
  @state()
  accessor error: string | null = null;

  private openAIService: OpenAIService | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    
    button {
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .status {
      margin-top: 10px;
      color: #666;
    }
    
    .error {
      color: #f44336;
      margin-top: 10px;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    this.openAIService = new OpenAIService();
  }

  private async startRecording() {
    try {
      this.audioChunks = [];
      this.status = 'Initializing audio...';
      this.error = null;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = async () => {
        this.status = 'Processing audio...';
        await this.processAudio();
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      this.status = 'Recording...';
      
      // Stop recording after 5 seconds
      setTimeout(() => {
        if (this.mediaRecorder && this.isRecording) {
          this.mediaRecorder.stop();
          this.isRecording = false;
          this.status = 'Processing...';
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      this.error = 'Error accessing microphone. Please check permissions.';
      this.isRecording = false;
      this.status = '';
    }
  }
  
  private async processAudio() {
    try {
      if (!this.audioChunks.length) {
        throw new Error('No audio data recorded');
      }
      
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      if (this.openAIService) {
        // Process with OpenAI Whisper
        const transcription = await this.openAIService.transcribeAudio(audioBlob);
        this.status = `Transcription: ${transcription}`;
        
        // Future enhancement: Add Google Generative AI integration here if needed
        // Example:
        // const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        // const result = await model.generateContent(transcription);
        // const response = await result.response;
        // const text = response.text();
        // console.log('Generated response:', text);
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      this.error = 'Error processing audio. Please try again.';
    } finally {
      this.isRecording = false;
      if (!this.status) this.status = 'Ready';
    }
  }
  
  private stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.status = 'Processing...';
    }
  }
  
  render() {
    return html`
      <div>
        <button 
          @click=${this.isRecording ? this.stopRecording : this.startRecording}
          ?disabled=${!this.audioContext && this.isRecording}
        >
          ${this.isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        ${this.status ? html`<div class="status">${this.status}</div>` : ''}
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      </div>
    `;
  }
}
