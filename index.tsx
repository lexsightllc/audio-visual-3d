/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';
import './index.css';

// Bootstrap the React application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find root element');
}

// All styling has been moved to external CSS files.
