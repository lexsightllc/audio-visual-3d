/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { SceneControl } from '../schema/scene-control.mjs';

interface SceneProps {
  control?: SceneControl | null;
}

/**
 * Basic three.js scene rendered through React Three Fiber.
 * The geometry reacts to the provided `SceneControl` by
 * scaling based on the `arousal` value.
 */
export default function Scene({ control }: SceneProps) {
  const mesh = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.5;
    mesh.current.rotation.y += delta * 0.6;

    if (control) {
      const scale = 1 + control.arousal;
      mesh.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      <ambientLight args={[0x404040, 0.4]} />
      <directionalLight position={[5, 5, 5]} />
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={0x00ff83} />
      </mesh>
    </>
  );
}

