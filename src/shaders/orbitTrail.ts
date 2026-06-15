// Orbit trail shaders — fading line with animated dash

export const orbitTrailVertexShader = /* glsl */`
  attribute float progress;   // 0 at tail → 1 at head
  varying float vProgress;
  varying vec3 vColor;

  void main() {
    vProgress = progress;
    vColor     = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const orbitTrailFragmentShader = /* glsl */`
  varying float vProgress;
  varying vec3 vColor;
  uniform float uTime;

  void main() {
    // Fade from transparent at tail to full opacity at head
    float alpha = smoothstep(0.0, 0.3, vProgress) * pow(vProgress, 0.4);

    // Animated dash pattern
    float dash = step(0.5, fract(vProgress * 20.0 - uTime * 0.3));
    alpha *= mix(0.3, 1.0, dash);

    gl_FragColor = vec4(vColor, alpha * 0.85);
  }
`;
