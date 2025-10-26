/**
 * @license
 * SPDX-License-Identifier: MPL-2.0
 */

import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Analyser} from './analyser';

// Three.js Core
import * as THREE from 'three';
import { Mesh, IcosahedronGeometry, ConeGeometry, MeshBasicMaterial, AdditiveBlending } from 'three';
import { createRenderer } from './renderer';

// Three.js Extensions
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import {fs as backdropFS, vs as backdropVS} from './backdrop-shader';
import {vs as sphereVS} from './sphere-shader';
import { initSeed } from './src/lib/seed.js';

const { rand } = initSeed(new URLSearchParams(window.location.search).get('seed') || undefined);

const GRID_SIZE = 4;

/**
 * Represents a high-level directive from the planner for the conductor to execute
 * over a duration.
 */
interface Intent {
  program: string;
  startTime: number;
  duration: number;
  startValence: number;
  targetValence: number;
}

interface StatusMap {
  [key: string]: string;
  twist: string;
  ripple: string;
  breathe: string;
  shear: string;
  idle: string;
}

const statusMap: StatusMap = {
  twist: 'Twisting the manifold along the primary diagonal.',
  ripple: 'Pulsing energy from the core.',
  breathe: 'Inhaling... expanding the control volume.',
  shear: 'Applying a shear transform across the Z-plane.',
  idle: 'Awaiting input...',
};

/**
 * 3D live audio visual.
 */
@customElement('gdm-live-audio-visuals-3d')
export class GdmLiveAudioVisuals3D extends LitElement {
  // Three.js properties
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private composer!: EffectComposer;
  private backdrop!: Mesh;
  private sphere!: Mesh;
  private controlGrid!: Float32Array;
  private controlPointsTexture!: THREE.Data3DTexture;
  private inputAnalyser!: Analyser;
  private outputAnalyser!: Analyser;
  private start = 0;
  private lancetas!: THREE.InstancedMesh;

  // The conductor state is the smoothly interpolated, per-frame state used for rendering.
  private conductorState = {
    time: 0,
    arousal: 0,
    valence: 0,
  };

  // The planner state represents the lower-frequency, high-level decision making.
  private plannerState = {
    targetArousal: 0, // Target for arousal, driven by audio volume
  };

  // The current directive being executed by the conductor.
  private currentIntent: Intent = {
    program: 'idle',
    startTime: 0,
    duration: 7000,
    startValence: 0,
    targetValence: 0,
  };

  private _outputNode!: AudioNode;

  @property()
  set outputNode(node: AudioNode) {
    this._outputNode = node;
    this.outputAnalyser = new Analyser(this._outputNode);
  }

  get outputNode() {
    return this._outputNode;
  }

  private _inputNode!: AudioNode;

  @property()
  set inputNode(node: AudioNode) {
    this._inputNode = node;
    this.inputAnalyser = new Analyser(this._inputNode);
  }

  get inputNode() {
    return this._inputNode;
  }

  private canvas!: HTMLCanvasElement;

  static styles = css`
    canvas {
      width: 100% !important;
      height: 100% !important;
      position: absolute;
      inset: 0;
      image-rendering: pixelated;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
  }

  private init() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x100c14);

    const backdrop = new Mesh(
      new IcosahedronGeometry(10, 5),
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_jitter: { value: 0 },
        resolution: { value: new THREE.Vector2() },
      },
      vertexShader: backdropVS,
      fragmentShader: backdropFS,
      glslVersion: '300 es' as const,
      side: THREE.DoubleSide as THREE.Side,
    });
    backdrop.material = material;
    scene.add(backdrop);
    this.backdrop = backdrop;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 4);
    this.camera = camera;

    this.renderer = createRenderer(this.canvas);

    this.controls = new OrbitControls(camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.update();

    const geometry = new THREE.BoxGeometry(2, 2, 2, 64, 64, 64);

    const controlGrid = new Float32Array(
      GRID_SIZE * GRID_SIZE * GRID_SIZE * 4,
    );
    for (let i = 0; i < controlGrid.length; i++) {
      controlGrid[i] = 0;
    }
    const controlPointsTexture = new THREE.Data3DTexture(
      controlGrid,
      GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE,
    );
    controlPointsTexture.format = THREE.RGBAFormat as THREE.PixelFormat;
    controlPointsTexture.type = THREE.FloatType as THREE.TextureDataType;
    controlPointsTexture.minFilter = THREE.LinearFilter as THREE.MinificationTextureFilter;
    controlPointsTexture.magFilter = THREE.LinearFilter as THREE.MagnificationTextureFilter;
    controlPointsTexture.unpackAlignment = 4;
    controlPointsTexture.needsUpdate = true;

    this.controlGrid = controlGrid;
    this.controlPointsTexture = controlPointsTexture;

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    new EXRLoader().load('piz_compressed.exr', (texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping as THREE.Mapping;
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      const sphereMaterial = this.sphere.material as THREE.MeshStandardMaterial;
      sphereMaterial.envMap = exrCubeRenderTarget.texture;
      this.sphere.visible = true;
    });
    pmremGenerator.compileEquirectangularShader();

    // Declare sphereMaterial before using it in the EXRLoader callback
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x000010,
      emissiveIntensity: 1.5,
      wireframe: true,
      vertexColors: true,
    });

    sphereMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.time = {value: 0};
      shader.uniforms.controlPoints = {value: this.controlPointsTexture};

      sphereMaterial.userData.shader = shader;

      shader.vertexShader = sphereVS;
    };

    const sphere = new Mesh(geometry, sphereMaterial);
    scene.add(sphere);
    sphere.visible = false;

    this.sphere = sphere;

    const lancetaCount = GRID_SIZE * GRID_SIZE * GRID_SIZE;
    const lancetaGeometry = new ConeGeometry(0.02, 0.2, 4);
    const lancetaMaterial = new MeshBasicMaterial({
      color: 0xffaaff,
      blending: AdditiveBlending,
    });
    this.lancetas = new THREE.InstancedMesh(
      lancetaGeometry,
      lancetaMaterial,
      lancetaCount,
    );
    scene.add(this.lancetas);

    const renderPass = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1,
      0.2,
      0.85,
    );

    const fxaaPass = new ShaderPass(FXAAShader);

    const composer = new EffectComposer(this.renderer);
    composer.addPass(renderPass);
    // composer.addPass(fxaaPass);
    composer.addPass(bloomPass);

    this.composer = composer;

    const onWindowResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      const dPR = this.renderer.getPixelRatio();
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Update backdrop material uniforms with proper type assertion
      const material = this.backdrop.material as THREE.ShaderMaterial;
      
      if (material.uniforms?.resolution) {
        material.uniforms.resolution.value.set(w * dPR, h * dPR);
      }
      
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
      
      // Update FXAA pass if it exists
      if (fxaaPass?.material?.uniforms?.resolution) {
        fxaaPass.material.uniforms.resolution.value.set(
          1 / (w * dPR),
          1 / (h * dPR),
        );
      }
    };

    window.addEventListener('resize', onWindowResize.bind(this));
    onWindowResize();
    this.start = performance.now();
    requestAnimationFrame(this.animate);
  }

  /**
   * The planner creates a new high-level intent for the conductor to execute.
   */
  private createNewIntent(time: number) {
    const programs = ['twist', 'ripple', 'breathe', 'shear'] as const;
    const program = programs[Math.floor(rand() * programs.length)];
    this.currentIntent = {
      program,
      startTime: time,
      duration: 3000 + rand() * 5000,
      startValence: this.conductorState.valence,
      targetValence: rand() * 2 - 1,
    };

    this.dispatchEvent(
      new CustomEvent('aistatusupdate', {
        detail: statusMap[this.currentIntent.program],
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getAverageVolume(analyser: Analyser): number {
    const data = analyser.getFrequencyData();
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
  }

  private applyTwist() {
    if (!this.sphere) return;
    const time = this.conductorState.time;
    const twistAmount = Math.sin(time * 0.001) * 2;
    this.sphere.rotation.y = twistAmount;
  }

  private applyBreathe() {
    const amount =
      (Math.sin(this.conductorState.time * 0.002) * 0.5 + 0.5) *
      this.conductorState.arousal *
      0.3;
    for (let z = 0; z < GRID_SIZE; z++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const u = x / (GRID_SIZE - 1) - 0.5;
          const v = y / (GRID_SIZE - 1) - 0.5;
          const w = z / (GRID_SIZE - 1) - 0.5;

          const idx = (z * GRID_SIZE * GRID_SIZE + y * GRID_SIZE + x) * 4;
          this.controlGrid[idx] += u * amount * 0.1;
          this.controlGrid[idx + 1] += v * amount * 0.1;
          this.controlGrid[idx + 2] += w * amount * 0.1;
        }
      }
    }
  }

  private applyRipple() {
    if (!this.sphere) return;
    const time = this.conductorState.time;
    const material = this.sphere.material as THREE.MeshStandardMaterial & {
      userData: { shader?: { uniforms: { time: { value: number } } } };
    };
    if (material.userData?.shader?.uniforms?.time) {
      material.userData.shader.uniforms.time.value = time * 0.001;
    }
  }

  private applyShear() {
    const amount = this.conductorState.valence * 0.3;
    for (let z = 0; z < GRID_SIZE; z++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const w = z / (GRID_SIZE - 1) - 0.5;
          const dx = w * amount;
          const idx = (z * GRID_SIZE * GRID_SIZE + y * GRID_SIZE + x) * 4;
          this.controlGrid[idx] += dx * 0.1;
        }
      }
    }
  }

  private animate = (now: number) => {
    const t = now - this.start;
    this.conductorState.time = t;

    const material = this.backdrop.material as THREE.ShaderMaterial;
    material.uniforms.u_time.value = t;
    material.uniforms.u_jitter.value = (rand() - 0.5) * 1e-3;

    if (this.inputAnalyser) {
      const volume = this.getAverageVolume(this.inputAnalyser);
      this.plannerState.targetArousal = Math.min(volume / 100, 1);
    }

    if (!this.currentIntent || now > this.currentIntent.startTime + this.currentIntent.duration) {
      this.createNewIntent(now);
    }

    const intent = this.currentIntent;
    const progress = Math.min(1, (now - intent.startTime) / intent.duration);
    this.conductorState.valence =
      intent.startValence + (intent.targetValence - intent.startValence) * progress;

    switch (intent.program) {
      case 'twist':
        this.applyTwist();
        break;
      case 'breathe':
        this.applyBreathe();
        break;
      case 'ripple':
        this.applyRipple();
        break;
      case 'shear':
        this.applyShear();
        break;
    }

    this.controls.update();
    this.composer.render();
    requestAnimationFrame(this.animate);
  };

  protected firstUpdated() {
    const canvas = this.renderRoot.querySelector('canvas');
    if (!canvas) return;
    this.canvas = canvas;
    this.init();
    // Kick off the first intent.
    this.createNewIntent(this.start);
  }

  protected render() {
    return html`<canvas></canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gdm-live-audio-visuals-3d': GdmLiveAudioVisuals3D;
  }
}
