import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import { shouldUseWebGL } from '@/lib/detectWebGL.js';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Iridescence({ color = [1, 1, 1], speed = 1.0, amplitude = 0.1, mouseReact = true, className = '', style, maxDpr = 2, allowSoftware = false, forceWebGL = false, respectReducedMotion = true, ...rest }) {
    const ctnDom = useRef(null);
    const mousePos = useRef({ x: 0.5, y: 0.5 });
    const initRef = useRef(false);

    useEffect(() => {
        const support = shouldUseWebGL({ allowSoftware, force: forceWebGL, respectReducedMotion });
        if (!support.ok) return;
        if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    if (initRef.current) return;
    initRef.current = true;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, maxDpr), alpha: true });
        const gl = renderer.gl;
    // Transparent clear so it blends with page background
    gl.clearColor(0, 0, 0, 0);

        let program;

        function resize() {
            const w = ctn.offsetWidth;
            const h = ctn.offsetHeight;
            renderer.setSize(w, h);
            if (program) {
                program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
            }
        }
        window.addEventListener('resize', resize, false);
        resize();

        const geometry = new Triangle(gl);
        program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new Color(...color) },
                uResolution: { value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
                uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
                uAmplitude: { value: amplitude },
                uSpeed: { value: speed },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });
        let animateId;

        function update(t) {
            animateId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh });
        }
        animateId = requestAnimationFrame(update);
        ctn.appendChild(gl.canvas);
        // Ensure canvas covers the container fully and stays non-interactive
        try {
            gl.canvas.style.position = 'absolute';
            gl.canvas.style.top = '0';
            gl.canvas.style.left = '0';
            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';
            gl.canvas.style.pointerEvents = 'none';
        } catch(_) {}

        function handleMouseMove(e) {
            const rect = ctn.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            mousePos.current = { x, y };
            program.uniforms.uMouse.value[0] = x;
            program.uniforms.uMouse.value[1] = y;
        }
        if (mouseReact) {
            ctn.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            cancelAnimationFrame(animateId);
            window.removeEventListener('resize', resize);
            if (mouseReact) ctn.removeEventListener('mousemove', handleMouseMove);
            if (gl && gl.canvas && gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            initRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [color, speed, amplitude, mouseReact]);

    return <div ref={ctnDom} className={`w-full h-full relative ${className}`} style={style} {...rest} />;
}
