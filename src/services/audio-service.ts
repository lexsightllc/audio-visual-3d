import { SceneControl, validateSceneControl } from '../schema/scene-control.mjs';
import { log } from '../lib/logger.js';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private workletModuleLoaded = false;

  private handleWorkletMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'audioData') {
      this.onAudioChunk?.(event.data.audioData);
    }
  };
  private mediaStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private sessionId: string | null = null;
  private clientSecret: string | null = null;
  private sceneControlDataChannel: RTCDataChannel | null = null;

  // Callbacks
  public onAudioChunk?: (chunk: Float32Array) => void;
  public onSessionUpdate?: (state: 'connecting' | 'connected' | 'disconnected') => void;
  public onError?: (error: Error) => void;
  public onSceneControl?: (control: SceneControl) => void;

  async initialize() {
    try {
      // Create the audio context if it doesn't exist
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          throw new Error('Web Audio API is not supported in this browser');
        }

        // Create audio context with proper type
        this.audioContext = new AudioContext({
          sampleRate: 48000, // Higher sample rate for better quality before downsampling
          latencyHint: 'interactive'
        });
        
        // Set up state change handler
        this.audioContext.onstatechange = () => {
          const state = this.audioContext?.state;
          log('info', `AudioContext state changed to: ${state}`);
          
          // Notify about state changes
          if (state === 'suspended') {
            log('warn', 'AudioContext is suspended. User interaction may be required.');
          } else if (state === 'running') {
            log('info', 'AudioContext is now running');
          }
        };

      }

      // Request microphone access first
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000
        } 
      });
      
      // Load the worklet module with proper error handling (only once)
      if (!this.audioContext.audioWorklet) {
        throw new Error('AudioWorklet is not supported in this browser');
      }

      if (!this.workletModuleLoaded) {
        try {
          // Use absolute URL to avoid path resolution issues
          const workletUrl = new URL('/worklets/mic-processor.js', window.location.origin).href;
          await this.audioContext.audioWorklet.addModule(workletUrl);
          log('info', 'Audio worklet module loaded successfully');
          this.workletModuleLoaded = true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const fullError = `Failed to load audio worklet: ${errorMessage}. ` +
                           `Make sure the worklet file exists at ${window.location.origin}/worklets/mic-processor.js`;
          log('error', fullError);
          throw new Error(fullError);
        }
      }
      
      // Ensure we have a valid audio context
      if (!this.audioContext || !(this.audioContext instanceof (window.AudioContext || (window as any).webkitAudioContext))) {
        throw new Error('Invalid AudioContext instance');
      }

      // Create the worklet node with proper type checking
      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create audio worklet node
      if (!this.workletNode && this.audioContext) {
        try {
          this.workletNode = new AudioWorkletNode(this.audioContext, 'mic-processor', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
            processorOptions: {
              sampleRate: this.audioContext.sampleRate
            }
          });
          this.workletNode.port.onmessage = this.handleWorkletMessage;
          this.workletNode.connect(this.audioContext.destination);
          log('info', 'AudioWorkletNode created and connected');
        } catch (err) {
          console.error('Failed to create AudioWorkletNode:', err);
          throw new Error('Failed to initialize audio processing');
        }
      }

      // Connect microphone to worklet
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      if (this.workletNode) {
        source.connect(this.workletNode);
      }
      
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

    // Create a persistent data channel for scene control
    this.sceneControlDataChannel = this.peerConnection.createDataChannel('scene-control');
    this.sceneControlDataChannel.onmessage = (event) => {
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
    this.sceneControlDataChannel.onopen = () => {
      log('info', 'Scene control data channel opened');
    };
    this.sceneControlDataChannel.onclose = () => {
      log('info', 'Scene control data channel closed');
      this.sceneControlDataChannel = null;
    };
    this.sceneControlDataChannel.onerror = (event) => {
      log('error', 'Scene control data channel error', { error: (event as any).error });
    };

    // Create and send offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Proxy SDP exchange through backend to avoid exposing API key
    const sdpResponse = await fetch('/api/openai/sdp-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: this.sessionId, offerSdp: offer.sdp })
    });

    if (!sdpResponse.ok) {
      const error = await sdpResponse.text();
      throw new Error(`SDP exchange failed: ${error}`);
    }

    const data = await sdpResponse.json();
    await this.peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: data.answerSdp
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
    if (this.sceneControlDataChannel && this.sceneControlDataChannel.readyState === 'open') {
      this.sceneControlDataChannel.send(JSON.stringify(control));
    } else {
      log('warn', 'Scene control data channel not open, cannot send update.');
    }
  }
}

export const audioService = new AudioService();
