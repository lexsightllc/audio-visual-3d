// This file provides type declarations for Three.js and its extensions

// Main Three.js module
declare module 'three' {
  export * as THREE from 'three/src/Three';
  export default THREE;
  
  // Re-export common types
  export * from 'three/src/Three';
  
  // Constants
  export const ACESFilmicToneMapping: number;
  export const SRGBColorSpace: string;
  export const RGBAFormat: number;
  export const FloatType: number;
  export const LinearFilter: number;
  export const EquirectangularReflectionMapping: number;
  export const GLSL3: number;
  export const BackSide: number;
  
  // Classes
  export * from 'three/src/cameras/PerspectiveCamera';
  export * from 'three/src/cameras/OrthographicCamera';
  export * from 'three/src/objects/Mesh';
  export * from 'three/src/textures/Data3DTexture';
  export * from 'three/src/objects/InstancedMesh';
  export * from 'three/src/scenes/Scene';
  export * from 'three/src/math/Color';
  export * from 'three/src/geometries/IcosahedronGeometry';
  export * from 'three/src/materials/RawShaderMaterial';
  export * from 'three/src/math/Vector2';
  export * from 'three/src/math/Vector3';
  export * from 'three/src/math/Vector4';
  export * from 'three/src/math/Matrix4';
  export * from 'three/src/math/Quaternion';
  export * from 'three/src/math/Euler';
  export * from 'three/src/lights/AmbientLight';
  export * from 'three/src/lights/DirectionalLight';
  export * from 'three/src/core/BufferGeometry';
  export * from 'three/src/materials/ShaderMaterial';
  export * from 'three/src/core/Object3D';
  export * from 'three/src/renderers/WebGLRenderer';
  export * from 'three/src/renderers/webgl/WebGLRenderTarget';
  export * from 'three/src/materials/MeshBasicMaterial';
  export * from 'three/src/geometries/BoxGeometry';
  export * from 'three/src/geometries/PlaneGeometry';
  export * from 'three/src/geometries/ConeGeometry';
  export * from 'three/src/core/Clock';
  export * from 'three/src/core/Event';
  export * from 'three/src/core/Object3D.EventMap';
  export * from 'three/src/core/BufferAttribute';
  export * from 'three/src/core/InterleavedBufferAttribute';
  export * from 'three/src/core/InterleavedBuffer';
  export * from 'three/src/core/InstancedBufferGeometry';
  export * from 'three/src/core/InstancedBufferAttribute';
  export * from 'three/src/textures/Texture';
  export * from 'three/src/materials/MeshStandardMaterial';
  export * from 'three/src/extras/PMREMGenerator';
}

// Example JSM modules
declare module 'three/examples/jsm/loaders/EXRLoader.js' {
  import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
  export { EXRLoader };
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  export { OrbitControls };
}

declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
  export { EffectComposer };
}

declare module 'three/examples/jsm/postprocessing/RenderPass.js' {
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
  export { RenderPass };
}

declare module 'three/examples/jsm/postprocessing/ShaderPass.js' {
  import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
  export { ShaderPass };
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass.js' {
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
  export { UnrealBloomPass };
}

declare module 'three/examples/jsm/shaders/FXAAShader.js' {
  import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
  export { FXAAShader };
}
