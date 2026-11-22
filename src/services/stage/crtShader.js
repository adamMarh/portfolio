import * as THREE from 'three';

// GLSL shared by the CRT glass in the room and the full-viewport CRT layer that
// takes over when the camera reaches the glass, so both read as the same tube.
const CRT_COMMON = /* glsl */ `
  vec2 crtBarrel(vec2 uv, float k, float overscan) {
    vec2 c = uv - 0.5;
    float r2 = dot(c, c);
    return 0.5 + c * (1.0 + k * r2) * overscan;
  }

  // 1 inside the rounded picture area, 0 outside, soft edge in uv units.
  float crtPictureMask(vec2 uv, float radius, float soft) {
    vec2 q = abs(uv - 0.5) - (0.5 - radius);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    return 1.0 - smoothstep(-soft, soft, d);
  }

  // Scanlines fade out when a line would be thinner than ~2.5 device pixels,
  // so the glass never moires at distance and the lines grow as you approach.
  float crtScanlines(float y, float lines, float amount) {
    float w = fwidth(y) * lines;
    float visible = 1.0 - smoothstep(0.18, 0.42, w);
    float s = 0.5 + 0.5 * cos(y * lines * 6.2831853);
    return 1.0 - amount * visible * (1.0 - s);
  }

  // CRT power-off: picture collapses to a horizontal line, then to a dot.
  // off: 0 = full picture, 1 = gone. Returns the remapped uv and a brightness boost.
  vec3 crtCollapse(vec2 uv, float off) {
    float sy = mix(1.0, 0.006, smoothstep(0.0, 0.55, off));
    float sx = mix(1.0, 0.004, smoothstep(0.55, 0.9, off));
    vec2 c = uv - 0.5;
    vec2 m = vec2(c.x / sx, c.y / sy) + 0.5;
    float boost = 1.0 + smoothstep(0.1, 0.6, off) * 5.0;
    return vec3(m, boost);
  }
`;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The picture on the CRT glass in the room: the desktop canvas composited over
// the live solar-system render, inside the program window rectangle.
export function createCrtScreenMaterial({ desktopTexture, solarTexture }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDesktop: { value: desktopTexture },
      uSolar: { value: solarTexture },
      uWin: { value: new THREE.Vector4(0, 0, 1, 1) },
      uTime: { value: 0 },
      uBright: { value: 1 },
      uPower: { value: 1 },
      uFlash: { value: 0 },
      uReflectA: { value: new THREE.Color(0xff3d9a) },
      uReflectB: { value: new THREE.Color(0x3ef0ff) },
    },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D uDesktop;
      uniform sampler2D uSolar;
      uniform vec4 uWin;
      uniform float uTime;
      uniform float uBright;
      uniform float uPower;
      uniform float uFlash;
      uniform vec3 uReflectA;
      uniform vec3 uReflectB;
      varying vec2 vUv;
      ${CRT_COMMON}

      void main() {
        vec3 collapse = crtCollapse(vUv, 1.0 - uPower);
        vec2 duv = crtBarrel(collapse.xy, 0.22, 1.12);
        float inside = crtPictureMask(duv, 0.035, 0.004);

        vec4 desk = texture2D(uDesktop, duv);
        vec2 suv = (duv - uWin.xy) / max(uWin.zw - uWin.xy, vec2(1e-4));
        vec3 sol = texture2D(uSolar, clamp(suv, 0.0, 1.0)).rgb;
        vec3 col = mix(sol, desk.rgb, desk.a);

        col *= crtScanlines(duv.y, 320.0, 0.38);
        float vig = smoothstep(0.85, 0.2, length(duv - 0.5));
        col *= mix(0.72, 1.0, vig);
        col *= 1.0 + 0.012 * sin(uTime * 62.0);
        col *= uBright * collapse.z;
        col += uFlash * vec3(0.9, 0.95, 1.0);
        col *= inside * step(0.001, uPower);

        // Dark glass with faint neon reflections where there is no picture.
        vec2 g = vUv - 0.5;
        float rim = smoothstep(0.25, 0.62, length(g));
        vec3 glass = vec3(0.012, 0.016, 0.02)
          + uReflectA * 0.035 * smoothstep(0.1, -0.5, g.x) * rim
          + uReflectB * 0.03 * smoothstep(-0.1, 0.5, g.x) * rim;
        float sheen = smoothstep(0.32, 0.0, length(g - vec2(-0.2, 0.22))) * 0.05;
        col += glass + sheen;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

// Full-viewport CRT layer for the handoff between room and site.
//   uStrength 1: looks like the glass up close; 0: the clean site.
//   uOff      0 to 1: CRT power-off collapse.
export function createCrtPassShader() {
  return {
    uniforms: {
      tDiffuse: { value: null },
      uStrength: { value: 0 },
      uFlash: { value: 0 },
      uOff: { value: 0 },
      uLines: { value: 300 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uStrength;
      uniform float uFlash;
      uniform float uOff;
      uniform float uLines;
      varying vec2 vUv;
      ${CRT_COMMON}

      void main() {
        vec3 collapse = crtCollapse(vUv, uOff);
        vec2 duv = crtBarrel(collapse.xy, 0.22 * uStrength, mix(1.0, 1.04, uStrength));
        float inside = mix(1.0, crtPictureMask(duv, 0.035, 0.003), uStrength);
        vec3 col = texture2D(tDiffuse, clamp(duv, 0.0, 1.0)).rgb;
        col *= crtScanlines(duv.y, uLines, 0.38 * uStrength);
        float vig = smoothstep(0.85, 0.2, length(duv - 0.5));
        col *= mix(1.0, mix(0.72, 1.0, vig), uStrength);
        col *= collapse.z;
        col += uFlash * vec3(0.9, 0.95, 1.0);
        col *= inside * (1.0 - step(0.999, uOff));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  };
}

// Vignette, film grain and the black fade used by skips and reduced motion.
export function createGradePassShader() {
  return {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uFade: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uFade;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 c = vUv - 0.5;
        float ca = dot(c, c) * 0.006;
        vec3 col;
        col.r = texture2D(tDiffuse, vUv + c * ca).r;
        col.g = texture2D(tDiffuse, vUv).g;
        col.b = texture2D(tDiffuse, vUv - c * ca).b;
        float vig = smoothstep(0.95, 0.25, length(c * vec2(1.1, 1.0)));
        col *= mix(0.45, 1.0, vig);
        float grain = hash(vUv * 1000.0 + fract(uTime) * 100.0) - 0.5;
        col += grain * 0.025;
        col *= 1.0 - uFade;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  };
}
