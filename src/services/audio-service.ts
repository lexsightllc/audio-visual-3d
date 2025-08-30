import { SceneControl, validateSceneControl } from '../schema/scene-control.js';
import { log } from '../lib/logger.js';
import type { AudioWorkletMessageEvent } from '../types/audio.js';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private sessionId: string | null = null;
  private clientSecret: string | null = null;

  // Callbacks
  public onAudioChunk?: (chunk: Float32Array) => void;
  public onSessionUpdate?: (state: 'connecting' | 'connected' | 'disconnected') => void;
  public onError?: (error: Error) => void;
  public onSceneControl?: (control: SceneControl) => void;

  async initialize() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 48000, // Higher sample rate for better quality before downsampling
        });
      }

      // Load the worklet module
      await this.audioContext.audioWorklet.addModule('/worklets/mic-processor.js');
      
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create worklet node
      this.workletNode = new AudioWorkletNode(this.audioContext, 'mic-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });

      // Connect microphone to worklet
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.workletNode);
      
      // Handle audio chunks from worklet
      this.workletNode.port.onmessage = (event: AudioWorkletMessageEvent) => {
        if (event.data instanceof Float32Array) {
          this.onAudioChunk?.(event.data);
        } else if (this.onSceneControl) {
          this.onSceneControl(event.data);
        }
      };

      // Connect to output (optional, for monitoring)
      this.workletNode.connect(this.audioContext.destination);
      
      return true;
    } catch (error) {
      console.error('AudioService initialization failed:', error);
      this.onError?.(error as Error);
      return false;
    }
  }

  async startSession() {
    if (!this.audioContext || !this.workletNode) {
      throw new Error('AudioService not initialized');
    }

    try {
      this.onSessionUpdate?.('connecting');
      
      // Request ephemeral token from our server
      const response = await fetch('/api/openai/session', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.statusText}`);
      }
      
      const session = await response.json();
      this.sessionId = session.id;
      this.clientSecret = session.client_secret.value;
      
      // Set up WebRTC connection
      await this.setupWebRTC();
      
      // Start audio processing
      await this.audioContext.resume();
      this.onSessionUpdate?.('connected');
      
      return true;
    } catch (error) {
      console.error('Failed to start session:', error);
      this.onSessionUpdate?.('disconnected');
      this.onError?.(error as Error);
      return false;
    }
  }

  private async setupWebRTC() {
    if (!this.clientSecret) throw new Error('No client secret available');
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Add audio track from microphone
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.mediaStream!);
      });
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidates to the server if needed
      }
    };

    // Handle data channel for scene control
    const dataChannel = this.peerConnection.createDataChannel('scene-control');
    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const result = validateSceneControl(data);
        if (result.ok) {
          this.onSceneControl?.(result.data);
        } else {
          log('error', 'Invalid scene control payload', { errors: result.errors });
        }
      } catch (error) {
        log('error', 'Error parsing scene control data', { error: String(error) });
      }
    };

    // Create and send offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Send SDP to OpenAI
    const sdpResponse = await fetch('https://api.openai.com/v1/realtime/answer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.clientSecret}`,
        'Content-Type': 'application/sdp'
      },
      body: offer.sdp
    });

    if (!sdpResponse.ok) {
      const error = await sdpResponse.text();
      throw new Error(`SDP exchange failed: ${error}`);
    }

    const answer = await sdpResponse.text();
    await this.peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: answer
    });
  }

  async stopSession() {
    try {
      if (this.workletNode) {
        this.workletNode.disconnect();
        this.workletNode = null;
      }
      
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      this.onSessionUpdate?.('disconnected');
      return true;
    } catch (error) {
      console.error('Error stopping session:', error);
      this.onError?.(error as Error);
      return false;
    }
  }

  // Send scene control updates to the server
  updateSceneControl(control: Partial<SceneControl>) {
    if (this.peerConnection?.signalingState === 'stable') {
      const dataChannel = this.peerConnection.createDataChannel('scene-update');
      dataChannel.onopen = () => {
        dataChannel.send(JSON.stringify(control));
        dataChannel.close();
      };
    }
  }
}

export const audioService = new AudioService();
