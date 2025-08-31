import { useState, useRef, useCallback, useEffect } from 'react';

const FFT_SIZE = 512;

export const useAudioAnalyzer = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const analyze = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      setAudioData(dataArray);
    }
    animationFrameIdRef.current = requestAnimationFrame(analyze);
  }, []);

  const start = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = FFT_SIZE;

      sourceRef.current.connect(analyserRef.current);

      setIsMicEnabled(true);
      analyze();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone access was denied. Please allow microphone access in your browser settings.');
        } else {
          setError("Could not access microphone. Please ensure it's connected and not in use by another application.");
        }
      } else {
        setError('An unknown error occurred while accessing the microphone.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [analyze]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    setIsMicEnabled(false);
  }, []);

  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return { audioData, start, stop, error, isMicEnabled, isInitializing };
};

export default useAudioAnalyzer;
