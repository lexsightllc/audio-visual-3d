/// <reference types="vite/client" />

// Type definitions for environment variables
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global types
declare global {
  interface Window {
    // Add any global window properties here
  }
}

export {};
