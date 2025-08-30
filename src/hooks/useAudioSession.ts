import { useState, useEffect, useCallback } from 'react';
import { audioService } from '../services/audio-service';
import { SceneControl } from '../schema/scene-control';

export function useAudioSession() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sceneControl, setSceneControl] = useState<SceneControl | null>(null);

  // Initialize audio service on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const success = await audioService.initialize();
        setIsInitialized(success);
        
        // Set up event listeners
        audioService.onSessionUpdate = (state) => {
          setIsConnected(state === 'connected');
        };
        
        audioService.onError = (err) => {
          console.error('AudioService error:', err);
          setError(err);
          setIsConnected(false);
        };
        
        audioService.onSceneControl = (control) => {
          setSceneControl(prev => ({
            ...prev,
            ...control,
            twist: { ...prev?.twist, ...control.twist },
            shards: { ...prev?.shards, ...control.shards },
          }));
        };
        
      } catch (err) {
        console.error('Failed to initialize audio service:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    init();
    
    // Cleanup on unmount
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
