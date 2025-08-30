/// <reference types="vite/client" />

interface Window {
  webkitAudioContext: typeof AudioContext;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    OPENAI_API_KEY: string;
    GOOGLE_API_KEY: string;
  }
}
