/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
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
