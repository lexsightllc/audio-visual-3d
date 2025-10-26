/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { MeshStandardMaterial } from 'three';

interface VisualizerProps {
  audioData: Uint8Array;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioData, color }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const audioDataRef = useRef(audioData);
  const colorRef = useRef(color);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene() as any;
    scene.fog = new (THREE as any).Fog(0xffffff, 1, 250);

    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 25, 100);

    const renderer = new (THREE as any).WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const bars = 128;
    const radius = 50;
    const geometry = new (THREE as any).BoxGeometry(2, 0.5, 2);
    const material = new THREE.MeshStandardMaterial({
      color: new (THREE as any).Color(colorRef.current),
      metalness: 0.2,
      roughness: 0.6
    });
    const mesh = new (THREE as any).InstancedMesh(geometry, material, bars);
    mesh.instanceMatrix.setUsage((THREE as any).DynamicDrawUsage);
    scene.add(mesh);
    const dummy = new (THREE as any).Object3D();

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const spectrum = audioDataRef.current;
      const mat = mesh.material as MeshStandardMaterial;
      (mat.color as any).set(colorRef.current);

      for (let i = 0; i < bars; i++) {
        const t = (i / bars) * Math.PI * 2;
        const x = Math.cos(t) * radius;
        const z = Math.sin(t) * radius;
        const bin = spectrum[Math.min(i, spectrum.length - 1)] / 255;
        const h = Math.pow(bin, 0.8) * 1.8 + 0.05;

        dummy.position.set(x, 0, z);
        dummy.scale.set(1, h, 1);
        dummy.lookAt(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      mesh.rotation.y += 0.002;
      // Removed redundant pixel ratio update; it's set during initialization and resize
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      geometry.dispose();
      material.dispose();
      scene.traverse((object: any) => {
        if (object instanceof THREE.Mesh && object !== mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();

      if (currentMount && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Visualizer;
