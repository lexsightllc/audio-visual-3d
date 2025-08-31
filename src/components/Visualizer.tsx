import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { Mesh, MeshStandardMaterial } from 'three';

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
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const group = new (THREE as any).Group();
    const bars = 128;
    const radius = 50;

    for (let i = 0; i < bars; i++) {
      const geometry = new (THREE as any).BoxGeometry(2, 1, 2);
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const bar = new (THREE as any).Mesh(geometry, material);

      const angle = (i / bars) * Math.PI * 2;
      bar.position.x = radius * Math.cos(angle);
      bar.position.z = radius * Math.sin(angle);
      (bar as any).lookAt(new (THREE as any).Vector3(0, 0, 0));

      group.add(bar);
    }
    scene.add(group);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    let animationFrameId: number;
    const baseColor = new (THREE as any).Color(colorRef.current);
    const baseHsl = { h: 0.5, s: 0.5, l: 0.5 };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentAudioData = audioDataRef.current;
      baseColor.set(colorRef.current);
      // Use baseHsl with default values

      group.children.forEach((child: any, index: number) => {
        const bar = child as THREE.Mesh;
        const scale = (currentAudioData[index] / 255) || 0;
        bar.scale.y = Math.max(0.1, scale * 40);

        const material = bar.material as THREE.MeshStandardMaterial;
        const lightness = Math.max(0.2, Math.min(1.0, 0.2 + scale * 0.8));
        (material.color as any).setHSL(baseHsl.h, baseHsl.s, lightness);
      });

      group.rotation.y += 0.002;
      (camera as any).lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      scene.traverse((object: any) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
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
