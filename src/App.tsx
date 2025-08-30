import { useState, useEffect, useRef } from 'react';
import { AudioSessionControls } from './components/AudioSessionControls';
import type { SceneControl } from './schema/scene-control.js';
import styles from './App.module.css';

// Import Three.js with type information
import * as THREE from 'three';

// Import specific types
import type { WebGLRenderer as ThreeWebGLRenderer } from 'three';
type WebGLRenderer = ThreeWebGLRenderer;

// Import Three.js examples
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Type definitions for Three.js objects
type AnyObject3D = THREE.Object3D | THREE.Mesh | THREE.AmbientLight | THREE.DirectionalLight;

// Extend THREE types to include missing properties
declare global {
  namespace THREE {
    interface Scene {
      add: (...object: any[]) => this;
    }
    interface PerspectiveCamera {
      // Add any missing properties if needed
      aspect: number;
      updateProjectionMatrix: () => void;
    }
    interface WebGLRenderer {
      // Add any missing properties if needed
      domElement: HTMLCanvasElement;
      setSize: (width: number, height: number) => void;
      setPixelRatio: (ratio: number) => void;
      render: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void;
    }
  }
}

// Type for the UnrealBloomPass constructor
type UnrealBloomPassConstructor = {
  new(
    resolution: THREE.Vector2,
    strength: number,
    radius: number,
    threshold: number
  ): any; // We'll type this more specifically if needed
};

// Import extended THREE types
import './types/three-extended';

// Define types for Three.js objects
type ThreeScene = any;
type ThreeCamera = any;
type ThreeRenderer = any;
type ThreeObject3D = any;
type ThreeMesh = any;
type ThreeMaterial = any;

// Cast THREE to any to avoid TypeScript errors
const THREE_ANY = THREE as any;

// Make THREE available globally for debugging
if (typeof window !== 'undefined') {
  window.THREE = THREE_ANY;
}

// Extend the Window interface to include the THREE namespace
declare global {
  interface Window {
    THREE: typeof THREE_ANY;
    __sceneStable?: boolean;
  }
}

// Make THREE available globally for debugging
if (typeof window !== 'undefined') {
  window.THREE = THREE_ANY;
}

const App = () => {
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<WebGLRenderer | null>(null!);
  const [composer, setComposer] = useState<any>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  
  // Initialize Three.js scene
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    ) as THREE.PerspectiveCamera;
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Effect composer setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Post-processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new (UnrealBloomPass as unknown as UnrealBloomPassConstructor)(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);
    
    // Add to DOM
    const container = document.getElementById('three-container');
    if (container) {
      container.appendChild(renderer.domElement);
    }
    
    // Set state
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setComposer(composer);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let firstFrame = true;
    const animate = () => {
      requestAnimationFrame(animate);

      // Update objects
      objectsRef.current.forEach((obj: ThreeObject3D) => {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
      });

      // Render
      composer.render();

      // Mark first frame stable for E2E tests
      if (firstFrame) {
        firstFrame = false;
        window.__sceneStable = true;
      }
    };

    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // Update scene based on audio analysis
  const updateScene = (control: SceneControl) => {
    if (!scene) return;
    
    // Clear previous objects
    objectsRef.current.forEach(obj => {
      scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });
    
    const newObjects: ThreeObject3D[] = [];
    
    // Create geometry based on audio analysis
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    
    // Create material with palette
    let material: ThreeMaterial;
    switch (control.palette) {
      case 'nocturne':
        material = new THREE.MeshStandardMaterial({
          color: 0x4a4e69,
          metalness: 0.7,
          roughness: 0.3,
          emissive: 0x22223b,
          emissiveIntensity: 0.5,
        });
        break;
      case 'prismatic':
        material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          shininess: 100,
          specular: 0xffffff,
          vertexColors: true,
        });
        
        // Add vertex colors for rainbow effect
        const colors = [];
        const position = (geometry.attributes.position as THREE.BufferAttribute);
        for (let i = 0; i < position.count; i++) {
          const x = position.getX(i);
          const y = position.getY(i);
          const z = position.getZ(i);
          colors.push(
            (x + 1) / 2,
            (y + 1) / 2,
            (z + 1) / 2
          );
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        break;
      case 'infra':
      default:
        material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
        });
    }
    
    const newLocal = new THREE.Mesh(geometry, material);
    const newLocal = newLocal;
    // Create mesh
    const mesh = newLocal;
    const scale = 1 + control.arousal;
    mesh.scale.set(scale, scale, scale);
    
    // Add twist effect
    mesh.userData.twist = {
      axis: control.twist.axis,
      amount: control.twist.magnitude * 2,
      speed: 0.5 + control.arousal * 2
    };
    
    scene.add(mesh);
    newObjects.push(mesh);
    
    // Add point lights for better visibility
    const light1 = new THREE.PointLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xffffff, 0.5);
    light2.position.set(-5, -5, -5);
    scene.add(light2);
    
    newObjects.push(light1, light2);
    
    // Update object reference
    objectsRef.current = newObjects;
  };
  
  useEffect(() => {
    if (!scene) return;
    
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff83,
      metalness: 0.7,
      roughness: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);

    scene.add(mesh);
    scene.add(ambientLight);
    scene.add(directionalLight);

    objectsRef.current.push(
      mesh as unknown as THREE.Object3D, 
      ambientLight as unknown as THREE.Object3D, 
      directionalLight as unknown as THREE.Object3D
    );

    return () => {
      // Remove objects from scene
      scene.remove(mesh);
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      
      // Filter out the objects being removed
      objectsRef.current = objectsRef.current.filter(obj => 
        obj !== (mesh as unknown as THREE.Object3D) && 
        obj !== (ambientLight as unknown as THREE.Object3D) && 
        obj !== (directionalLight as unknown as THREE.Object3D)
      );
      
      // Clean up geometry and materials
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);
  
  return (
    <div className={styles.app}>
      <div id="scene-container" className={styles.sceneContainer} />
      
      <div className={styles.controlsOverlay}>
        <AudioSessionControls 
          onSceneControl={updateScene}
        />
      </div>
    </div>
  );
};

export default App;
