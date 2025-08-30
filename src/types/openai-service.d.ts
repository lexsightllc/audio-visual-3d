import type { AudioContext, AudioNode } from 'standardized-audio-context';

declare class OpenAIService {
  constructor(
    onControlUpdate: (data: unknown) => void,
    outputAudioContext: AudioContext,
    outputNode: AudioNode
  );
  
  startSession(): Promise<void>;
  startAudioCapture(): Promise<void>;
  stopSession(): void;
  
  // Internal state
  private onControlUpdate: (data: unknown) => void;
  private outCtx: AudioContext;
  private outNode: AudioNode;
  private mediaStream: MediaStream | null;
  private peerConnection: RTCPeerConnection | null;
  private dataChannel: RTCDataChannel | null;
  private isActive: boolean;
  private sessionId: string | null;
}

export default OpenAIService;
