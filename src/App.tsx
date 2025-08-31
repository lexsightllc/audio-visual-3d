import React, { Suspense, useState, useEffect } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer.js';
import Visualizer from './components/Visualizer.jsx';
import { AlertIcon, MicrophoneIcon } from './components/Icons.js';

const qualitySettings = {
  low: { fftSize: 512, smoothing: 0.6 },
  medium: { fftSize: 1024, smoothing: 0.75 },
  high: { fftSize: 2048, smoothing: 0.85 }
} as const;

const App: React.FC = () => {
  const [color, setColor] = useState<string>(() => localStorage.getItem('barColor') ?? '#00ffff');
  const [quality, setQuality] = useState<keyof typeof qualitySettings>(
    () => (localStorage.getItem('quality') as keyof typeof qualitySettings) || 'medium'
  );

  const { fftSize, smoothing } = qualitySettings[quality];
  const { audioData, start, error, isMicEnabled, isInitializing } = useAudioAnalyzer(
    fftSize,
    smoothing
  );

  useEffect(() => {
    localStorage.setItem('barColor', color);
  }, [color]);

  useEffect(() => {
    localStorage.setItem('quality', quality);
  }, [quality]);

  return (
    <main className="relative w-screen h-screen bg-white text-black flex flex-col items-center justify-center font-sans overflow-hidden">
      {isMicEnabled && audioData ? (
        <>
          <Suspense fallback={<LoadingSpinner />}>
            <Visualizer audioData={audioData} color={color} />
          </Suspense>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 rounded-lg bg-white/50 backdrop-blur-sm z-20">
            <label htmlFor="colorPicker" className="text-gray-800 text-sm font-mono select-none">
              Bar Color
            </label>
            <input
              type="color"
              id="colorPicker"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 bg-transparent border-2 border-gray-400 rounded-md cursor-pointer"
              aria-label="Change visualizer bar color"
            />
            <label htmlFor="quality" className="text-gray-800 text-sm font-mono select-none">
              Quality
            </label>
            <select
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as keyof typeof qualitySettings)}
              className="bg-transparent border-2 border-gray-400 rounded-md p-1 text-sm"
              aria-label="Set analysis quality"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 text-xs md:text-sm text-center pointer-events-none font-mono"
            aria-hidden="true"
          >
            <p className="flex items-center justify-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Live Audio Feed
            </p>
          </div>
        </>
      ) : (
        <div className="text-center p-8 z-10">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
              3D Audio Visualizer
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              Experience your sound in a new dimension. Allow microphone access to begin the real-time visualization.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 max-w-md mx-auto flex items-center space-x-3">
              <AlertIcon className="w-6 h-6 flex-shrink-0" />
              <div>
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={start}
            disabled={isInitializing}
            aria-label="Start microphone"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black transition-all duration-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute -inset-full top-0 left-0 -z-10 block transform-gpu transition-all duration-500 group-hover:-inset-3/4 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-cyan-600"></span>
            <MicrophoneIcon className="w-6 h-6 mr-3" />
            {isInitializing ? 'Initializing...' : 'Start Microphone'}
          </button>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="sr-only" aria-live="polite">
        {isMicEnabled ? 'Microphone active' : 'Microphone inactive'}
      </div>
    </main>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-black">
    <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-lg">Loading 3D Scene...</p>
  </div>
);

export default App;
