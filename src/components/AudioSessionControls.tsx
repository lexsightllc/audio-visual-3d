import React from 'react';
import { useAudioSession } from '../hooks/useAudioSession';
import { SceneControl } from '../schema/scene-control';

export const AudioSessionControls: React.FC = () => {
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
    <div className="audio-session-controls">
      <div className="status">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {isLoading && ' (Loading...)'}
      </div>
      
      {error && <div className="error">Error: {error.message}</div>}
      
      <div className="controls">
        {!isConnected ? (
          <button 
            onClick={handleStart} 
            disabled={isLoading}
          >
            Start Session
          </button>
        ) : (
          <button 
            onClick={handleStop} 
            disabled={isLoading}
          >
            Stop Session
          </button>
        )}
      </div>
      
      {sceneControl && (
        <div className="scene-controls">
          <h3>Scene Controls</h3>
          
          <div className="control-group">
            <label>Arousal: {sceneControl.arousal.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sceneControl.arousal}
              onChange={(e) => handleSceneUpdate({ arousal: parseFloat(e.target.value) })}
            />
          </div>
          
          <div className="control-group">
            <label>Valence: {sceneControl.valence.toFixed(2)}</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={sceneControl.valence}
              onChange={(e) => handleSceneUpdate({ valence: parseFloat(e.target.value) })}
            />
          </div>
          
          <div className="control-group">
            <label>Twist Magnitude: {sceneControl.twist.magnitude.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sceneControl.twist.magnitude}
              onChange={(e) => handleSceneUpdate({ 
                twist: { ...sceneControl.twist, magnitude: parseFloat(e.target.value) } 
              })}
            />
          </div>
          
          <div className="control-group">
            <label>Palette:</label>
            <select
              value={sceneControl.palette}
              onChange={(e) => handleSceneUpdate({ palette: e.target.value as any })}
            >
              <option value="nocturne">Nocturne</option>
              <option value="prismatic">Prismatic</option>
              <option value="infra">Infra</option>
            </select>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .audio-session-controls {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
          color: white;
          max-width: 400px;
          margin: 1rem 0;
        }
        
        .status {
          margin-bottom: 1rem;
          font-weight: bold;
        }
        
        .error {
          color: #ff6b6b;
          margin: 1rem 0;
          padding: 0.5rem;
          background: rgba(255, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        button {
          background: #4a90e2;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          margin-right: 0.5rem;
        }
        
        button:disabled {
          background: #666;
          cursor: not-allowed;
        }
        
        .scene-controls {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #444;
        }
        
        .control-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        input[type="range"] {
          width: 100%;
        }
        
        select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 4px;
          background: #333;
          color: white;
          border: 1px solid #555;
        }
      `}</style>
    </div>
  );
};

export default AudioSessionControls;
