// Star field shaders — size-attenuated points with colour tint

export const starVertexShader = /* glsl */`
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    // Size attenuation — stars farther away appear smaller
    gl_PointSize = size * (400.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

export const starFragmentShader = /* glsl */`
  varying vec3 vColor;

  void main() {
    // Circular soft point
    vec2 uv  = gl_PointCoord - vec2(0.5);
    float d  = length(uv);
    if (d > 0.5) discard;

    float glow = exp(-d * 6.0);
    gl_FragColor = vec4(vColor * glow, glow);
  }
`;
