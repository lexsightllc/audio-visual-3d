import { useState, useEffect, useCallback } from 'react';
import { audioService } from '../services/audio-service.js';
import type { SceneControl } from '../schema/scene-control.mjs';

export function useAudioSession() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sceneControl, setSceneControl] = useState<SceneControl | null>(null);

  // Initialize audio service on first user interaction
  const initAudio = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setIsLoading(true);
      const success = await audioService.initialize();
      setIsInitialized(success);
      
      // Set up event listeners
      audioService.onSessionUpdate = (state: 'connecting' | 'connected' | 'disconnected') => {
        setIsConnected(state === 'connected');
      };
      
      audioService.onError = (err: Error) => {
        console.error('AudioService error:', err);
        setError(err);
        setIsConnected(false);
      };
      
      audioService.onSceneControl = (control: Partial<SceneControl>) => {
        setSceneControl((prev: SceneControl | null) => {
          // Create a new object with default values
          const defaultState: SceneControl = {
            arousal: 0,
            valence: 0,
            twist: {
              axis: 'y',
              magnitude: 0,
              durationMs: 1000
            },
            shards: {
              density: 0,
              halfLifeMs: 1000
            },
            palette: 'nocturne'
          };
          
          // Merge with previous state and new control values
          return {
            ...defaultState,
            ...prev,
            ...control,
            twist: {
              ...defaultState.twist,
              ...prev?.twist,
              ...(control.twist || {})
            },
            shards: {
              ...defaultState.shards,
              ...prev?.shards,
              ...(control.shards || {})
            }
          };
        });
      };
      
    } catch (err) {
      console.error('Failed to initialize audio service:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);
  
  // Set up a one-time click handler for the document to initialize audio
  useEffect(() => {
    if (isInitialized) return;
    
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isInitialized, initAudio]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioService.stopSession().catch(console.error);
    };
  }, []);

  const startSession = useCallback(async () => {
    if (!isInitialized) {
      setError(new Error('Audio service not initialized'));
      return false;
    }
    
    try {
      setIsLoading(true);
      const success = await audioService.startSession();
      if (!success) {
        throw new Error('Failed to start session');
      }
      return true;
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const stopSession = useCallback(async () => {
    try {
      setIsLoading(true);
      await audioService.stopSession();
      return true;
    } catch (err) {
      console.error('Error stopping session:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSceneControl = useCallback((control: Partial<SceneControl>) => {
    audioService.updateSceneControl(control);
  }, []);

  return {
    isInitialized,
    isConnected,
    isLoading,
    error,
    sceneControl,
    startSession,
    stopSession,
    updateSceneControl,
  };
}
