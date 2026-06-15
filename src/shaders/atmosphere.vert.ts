// Atmosphere vertex shader — Rayleigh scattering approximation
// Used by the custom atmosphere mesh for rim glow effect

const atmosphereVertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export default atmosphereVertexShader;
