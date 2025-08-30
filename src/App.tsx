import { useState, useEffect, useRef } from 'react';
import { AudioSessionControls } from './components/AudioSessionControls';
import { SceneControl } from './schema/scene-control';

// Import Three.js
import * as THREE from 'three';

// Import Three.js examples
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Define types for Three.js objects
type ThreeScene = THREE.Scene;
type ThreeCamera = THREE.PerspectiveCamera;
type ThreeRenderer = THREE.WebGLRenderer;
type ThreeObject3D = THREE.Object3D;
type ThreeMesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
type ThreeMaterial = THREE.Material;

// Extend the Window interface to include the THREE namespace
declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

// Make THREE available globally for debugging
if (typeof window !== 'undefined') {
  window.THREE = THREE;
}

const App: React.FC = () => {
  const [scene, setScene] = useState<ThreeScene | null>(null);
  const [camera, setCamera] = useState<ThreeCamera | null>(null);
  const [renderer, setRenderer] = useState<ThreeRenderer | null>(null);
  const [composer, setComposer] = useState<EffectComposer | null>(null);
  const objectsRef = useRef<ThreeObject3D[]>([]);
  
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
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Effect composer setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom effect
    const bloomPass = new UnrealBloomPass(
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
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update objects
      objectsRef.current.forEach((obj: ThreeObject3D) => {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
      });
      
      // Render
      composer.render();
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
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        break;
      case 'infra':
      default:
        material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
        });
    }
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(1 + control.arousal);
    
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

    objectsRef.current = [...objectsRef.current, mesh, ambientLight, directionalLight];

    return () => {
      scene.remove(mesh);
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      objectsRef.current = objectsRef.current.filter(obj => obj !== mesh && obj !== ambientLight && obj !== directionalLight);
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);
  
  return (
    <div className="app">
      <div id="scene-container" className="scene-container" />
      
      <div className="controls-overlay">
        <AudioSessionControls 
          onSceneUpdate={updateScene}
        />
      </div>
      
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .app {
          position: relative;
          width: 100vw;
          height: 100vh;
        }
        
        .scene-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .controls-overlay {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 300px;
        }
      `}</style>
    </div>
  );
};

export default App;
