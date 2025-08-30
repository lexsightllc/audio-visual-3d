// Type definitions for @google/genai

declare module '@google/genai' {
  export interface GenerationConfig {
    temperature?: number;
    responseMimeType?: string;
  }

  export interface GoogleGenAIOptions {
    apiKey: string;
  }

  export interface LiveSessionCallbacks {
    onopen?: () => void;
    onmessage?: (message: LiveServerMessage) => void;
    onerror?: (error: ErrorEvent) => void;
    onclose?: (event: CloseEvent) => void;
  }

  export interface LiveSessionConfig {
    responseModalities: string[];
    speechConfig?: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: string;
        };
      };
    };
  }

  export interface LiveServerMessage {
    serverContent?: {
      modelTurn?: {
        parts?: Array<{
          inlineData?: {
            data: string;
          };
        }>;
      };
      interrupted?: boolean;
    };
  }

  export interface Session {
    sendRealtimeInput: (input: { media: Blob }) => void;
    close: () => Promise<void>;
  }

  export enum Modality {
    AUDIO = 'AUDIO',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO'
  }

  export class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    live: {
      connect: (options: {
        model: string;
        callbacks?: LiveSessionCallbacks;
        config: LiveSessionConfig;
      }) => Promise<Session>;
    };
    close: () => void;
  }

  export type Modality = 'AUDIO' | 'TEXT' | 'IMAGE';
}
