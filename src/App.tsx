import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { AudioSessionControls } from './components/AudioSessionControls.js';
import AudioVisualizer from './canvas/AudioVisualizer.js';
import type { SceneControl } from './schema/scene-control.js';
import styles from './App.module.css';

const App = () => {
  const [control, setControl] = useState<SceneControl | null>(null);

  return (
    <div className={styles.app}>
      <div className={styles.sceneContainer}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <AudioVisualizer control={control} />
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.controlsOverlay}>
        <AudioSessionControls onSceneControl={setControl} />
      </div>
    </div>
  );
};

export default App;

