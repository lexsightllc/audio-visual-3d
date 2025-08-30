// services/openai-service.ts

export default class OpenAIService {
  private onControlUpdate: (data: unknown) => void;
  private outCtx: AudioContext;
  private outNode: AudioNode;
  private mediaStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isActive = false;
  private sessionId: string | null = null;

  constructor(
    onControlUpdate: (data: unknown) => void,
    outputAudioContext: AudioContext,
    outputNode: AudioNode
  ) {
    this.onControlUpdate = onControlUpdate;
    this.outCtx = outputAudioContext;
    this.outNode = outputNode;
  }

  async startSession(): Promise<void> {
    if (this.isActive) return;
    this.isActive = true;
    // TODO: Implement WebRTC connection to OpenAI
  }

  async startAudioCapture(): Promise<void> {
    if (!this.isActive) {
      throw new Error('Session not started');
    }
    
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      // TODO: Process and send audio to WebRTC
      
    } catch (error) {
      console.error('Error starting audio capture:', error);
      this.stopSession();
      throw error;
    }
  }

  stopSession(): void {
    this.isActive = false;
    
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    this.sessionId = null;
  }
}
