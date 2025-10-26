/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import React from 'react';
import { log } from './lib/logger.js';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Create a root container for our React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  log('error', 'Failed to find root element');
}
