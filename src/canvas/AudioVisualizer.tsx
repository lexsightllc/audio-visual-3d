import Scene from './Scene.js';
import type { SceneControl } from '../schema/scene-control.mjs';

interface AudioVisualizerProps {
  control?: SceneControl | null;
}

/**
 * Wrapper component that renders the reactive Scene.
 */
export default function AudioVisualizer({ control }: AudioVisualizerProps) {
  return <Scene control={control} />;
}

