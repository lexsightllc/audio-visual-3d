/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
const vs = `precision highp float;

in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;

const fs = `precision highp float;

out vec4 fragmentColor;

uniform vec2 resolution;
uniform float u_time;
uniform float u_jitter;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453 + u_jitter);
}

void main() {
  float aspectRatio = resolution.x / resolution.y;
  vec2 vUv = gl_FragCoord.xy / resolution;
  float noise = hash(vUv * (12.9898 + u_time * 0.0003));

  vUv -= .5;
  vUv.x *= aspectRatio;

  float factor = 4.;
  float d = factor * length(vUv);
  vec3 from = vec3(3.) / 255.;
  vec3 to = vec3(16., 12., 20.) / 255.;

  fragmentColor = vec4(mix(from, to, d) + .005 * noise, 1.);
}`;

export {fs, vs};

