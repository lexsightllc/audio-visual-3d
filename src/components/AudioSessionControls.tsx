import React from 'react';
import { useAudioSession } from '../hooks/useAudioSession.js';
import type { SceneControl } from '../schema/scene-control.mjs';

// Import the CSS module
import styles from './AudioSessionControls.module.css';

interface AudioSessionControlsProps {
  onSceneControl?: (control: SceneControl) => void;
}

export const AudioSessionControls: React.FC<AudioSessionControlsProps> = ({ onSceneControl }) => {
  const {
    isInitialized,
    isConnected,
    isLoading,
    error,
    sceneControl,
    startSession,
    stopSession,
    updateSceneControl,
  } = useAudioSession();

  const handleStart = async () => {
    await startSession();
  };

  const handleStop = async () => {
    await stopSession();
  };

  const handleSceneUpdate = (updates: Partial<SceneControl>) => {
    updateSceneControl(updates);

    // Propagate the latest complete scene control state
    if (sceneControl) {
      onSceneControl?.(sceneControl);
    }
  };

  if (!isInitialized) {
    return (
      <div className="audio-session-controls">
        <p>Initializing audio service...</p>
        {error && <div className="error">Error: {error.message}</div>}
      </div>
    );
  }

  return (
    <div className={styles.audioSessionControls}>
      <div className={styles.status}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {isLoading && ' (Loading...)'}
      </div>
      
      {error && <div className={styles.error}>Error: {error.message}</div>}
      
      <div className={styles.controls}>
        {!isConnected ? (
          <button 
            className={styles.button}
            onClick={handleStart} 
            disabled={isLoading}
          >
            Start Session
          </button>
        ) : (
          <button 
            className={styles.button}
            onClick={handleStop} 
            disabled={isLoading}
          >
            Stop Session
          </button>
        )}
      </div>
      
      {sceneControl && (
        <div className={styles.sceneControls}>
          <h3>Scene Controls</h3>
          
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Arousal: {sceneControl.arousal.toFixed(2)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sceneControl.arousal}
                onChange={(e) => handleSceneUpdate({ arousal: parseFloat(e.target.value) })}
                className={styles.rangeInput}
              />
            </label>
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Valence: {sceneControl.valence.toFixed(2)}
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={sceneControl.valence}
                onChange={(e) => handleSceneUpdate({ valence: parseFloat(e.target.value) })}
                className={styles.rangeInput}
              />
            </label>
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Twist Magnitude: {sceneControl.twist.magnitude.toFixed(2)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sceneControl.twist.magnitude}
                onChange={(e) => handleSceneUpdate({ 
                  twist: { ...sceneControl.twist, magnitude: parseFloat(e.target.value) } 
                })}
                className={styles.rangeInput}
              />
            </label>
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Palette:
              <select
                value={sceneControl.palette}
                onChange={(e) => handleSceneUpdate({ palette: e.target.value as any })}
                className={styles.select}
              >
                <option value="nocturne">Nocturne</option>
                <option value="prismatic">Prismatic</option>
                <option value="infra">Infra</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioSessionControls;
