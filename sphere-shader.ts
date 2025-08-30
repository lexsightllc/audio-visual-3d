/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
const vs = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float time;
uniform sampler3D controlPoints;

// This function now returns the displacement vector as an out parameter
// so we can use it for coloring without an extra texture lookup.
vec3 T(vec3 u, out vec3 displacement) {
    displacement = texture(controlPoints, u).rgb;
    return u + displacement;
}

void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>

  // Normalize vertex position to [0,1]^3 to use as coordinates for the manifold.
  vec3 u = (position + 1.0) / 2.0;

  // Evaluate the manifold T(u) to get the deformed position and displacement.
  vec3 displacement;
  vec3 deformed_u = T(u, displacement);

  // Color based on displacement vector, adding to a base color.
  vec3 baseColor = vec3(0.2, 0.2, 0.5); // A cool blue base
  vec3 displacementColor = vec3(displacement.x, displacement.y, displacement.z) * 2.0;
  float displacementMagnitude = length(displacement);
  float intensity = 1.0 + displacementMagnitude * 4.0;
  vColor.rgb = (baseColor + displacementColor) * intensity;


  // Denormalize back to the original [-1,1]^3 space.
  transformed = (deformed_u * 2.0) - 1.0;

  // Recalculate normals for deformed geometry using finite differences on the manifold.
  float inc = 0.01;
  vec3 dummy_displacement; // We don't need the displacement for these samples
  vec3 u_dx = T(u + vec3(inc, 0.0, 0.0), dummy_displacement);
  vec3 u_dy = T(u + vec3(0.0, inc, 0.0), dummy_displacement);
  vec3 u_dz = T(u + vec3(0.0, 0.0, inc), dummy_displacement);

  // Convert tangents from manifold space back to model space.
  vec3 p_dx = (u_dx * 2.0) - 1.0;
  vec3 p_dy = (u_dy * 2.0) - 1.0;
  vec3 p_dz = (u_dz * 2.0) - 1.0;

  // Compute normals by taking the cross product of the tangents.
  vec3 normal_x = cross(p_dy - transformed, p_dz - transformed);
  vec3 normal_y = cross(p_dz - transformed, p_dx - transformed);
  vec3 normal_z = cross(p_dx - transformed, p_dy - transformed);

  // Blend the normals based on the original vertex normal to handle cube faces correctly.
  transformedNormal = normalMatrix * normalize(
    abs(objectNormal.x) * normal_x +
    abs(objectNormal.y) * normal_y +
    abs(objectNormal.z) * normal_z
  );

  vNormal = normalize( transformedNormal );

  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
  #ifdef USE_TRANSMISSION
    vWorldPosition = worldPosition.xyz;
  #endif
}`
// FIX: Export the vertex shader string so it can be imported as a module.
export {vs};