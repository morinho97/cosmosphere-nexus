// Atmosphere fragment shader — soft blue rim glow with sun-side brightening

const atmosphereFragmentShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform vec3 uSunDirection;   // Normalised direction toward the sun
  uniform vec3 uAtmColor;       // Base atmosphere colour (default: 0.15, 0.4, 1.0)
  uniform float uOpacity;       // Master opacity multiplier

  void main() {
    // Fresnel rim intensity — strongest at grazing angles
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.5);

    // Sun-facing brightening (dayside glow is warmer/brighter)
    float sunFacing = max(0.0, dot(normalize(vNormal), normalize(uSunDirection)));
    vec3 dayColor   = mix(uAtmColor, vec3(0.9, 0.85, 0.7), sunFacing * 0.4);

    float alpha = rim * uOpacity * (0.6 + sunFacing * 0.4);
    gl_FragColor  = vec4(dayColor, alpha);
  }
`;

export default atmosphereFragmentShader;
