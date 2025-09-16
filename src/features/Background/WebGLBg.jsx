import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { shouldUseWebGL } from '@/lib/detectWebGL.js';

const vertexShader = `
	varying vec2 vUv;
	varying vec3 vPosition;
  
	void main() {
		vUv = uv;
		vPosition = position;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const fragmentShader = `
	uniform float u_time;
	uniform vec2 u_resolution;
	varying vec2 vUv;
	varying vec3 vPosition;

	// Simplex noise
	vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
	vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

	float snoise(vec3 v) {
		const vec2 C = vec2(1.0/6.0, 1.0/3.0);
		const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
		vec3 i = floor(v + dot(v, C.yyy));
		vec3 x0 = v - i + dot(i, C.xxx);
    
		vec3 g = step(x0.yzx, x0.xyz);
		vec3 l = 1.0 - g;
		vec3 i1 = min(g.xyz, l.zxy);
		vec3 i2 = max(g.xyz, l.zxy);
    
		vec3 x1 = x0 - i1 + C.xxx;
		vec3 x2 = x0 - i2 + C.yyy;
		vec3 x3 = x0 - D.yyy;
    
		i = mod289(i);
		vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
		float n_ = 0.142857142857;
		vec3 ns = n_ * D.wyz - D.xzx;
    
		vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
		vec4 x_ = floor(j * ns.z);
		vec4 y_ = floor(j - 7.0 * x_);
    
		vec4 x = x_ *ns.x + ns.yyyy;
		vec4 y = y_ *ns.x + ns.yyyy;
		vec4 h = 1.0 - abs(x) - abs(y);
    
		vec4 b0 = vec4(x.xy, y.xy);
		vec4 b1 = vec4(x.zw, y.zw);
    
		vec4 s0 = floor(b0)*2.0 + 1.0;
		vec4 s1 = floor(b1)*2.0 + 1.0;
		vec4 sh = -step(h, vec4(0.0));
    
		vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
		vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
		vec3 p0 = vec3(a0.xy, h.x);
		vec3 p1 = vec3(a0.zw, h.y);
		vec3 p2 = vec3(a1.xy, h.z);
		vec3 p3 = vec3(a1.zw, h.w);
    
		vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
		p0 *= norm.x;
		p1 *= norm.y;
		p2 *= norm.z;
		p3 *= norm.w;
    
		vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
		m = m * m;
		return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
	}

	void main() {
		vec2 st = vUv;
		vec3 color = vec3(0.0);
    
		// Flowing noise
		float noise1 = snoise(vec3(st * 3.0, u_time * 0.1));
		float noise2 = snoise(vec3(st * 2.0 + vec2(100.0), u_time * 0.15));
		float noise3 = snoise(vec3(st * 4.0 + vec2(200.0), u_time * 0.08));
    
		float combined = (noise1 + noise2 * 0.5 + noise3 * 0.3) / 1.8;
    
		// Dark gradient base with warm accent
		vec3 darkBase = vec3(0.02, 0.02, 0.04);
		vec3 warmAccent = vec3(0.15, 0.08, 0.12);
		vec3 coolAccent = vec3(0.08, 0.12, 0.18);
    
		color = mix(darkBase, warmAccent, combined * 0.6 + 0.3);
		color = mix(color, coolAccent, sin(u_time * 0.1) * 0.2 + 0.2);
    
		// Vignette
		float dist = distance(st, vec2(0.5));
		color *= 1.0 - smoothstep(0.0, 0.8, dist);
    
		gl_FragColor = vec4(color, 1.0);
	}
`;

export default function WebGLBg() {
		const mountRef = useRef(null);
		const sceneRef = useRef(null);
		const rendererRef = useRef(null);
		const materialRef = useRef(null);
		const animationRef = useRef(null);
        const blockedRef = useRef(false);

		useEffect(() => {
				// Check for WebGL support and motion preference via centralized helper
                const support = shouldUseWebGL();
                if (!support.ok) {
                    blockedRef.current = true;
                    return;
                }

				// Scene setup
				const scene = new THREE.Scene();
				const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

				const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
				renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
				renderer.setSize(window.innerWidth, window.innerHeight);
				renderer.domElement.style.position = 'fixed';
				renderer.domElement.style.top = '0';
				renderer.domElement.style.left = '0';
				renderer.domElement.style.zIndex = '-1';
				renderer.domElement.style.pointerEvents = 'none';
                const onLost = (e) => { try { e?.preventDefault?.(); } catch(_){} };
                renderer.domElement.addEventListener('webglcontextlost', onLost, { passive: false });

				// Material with uniforms
				const material = new THREE.ShaderMaterial({
						vertexShader,
						fragmentShader,
						uniforms: {
								u_time: { value: 0 },
								u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
						}
				});

				// Plane geometry
				const geometry = new THREE.PlaneGeometry(2, 2);
				const mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);

				mountRef.current?.appendChild(renderer.domElement);

				// Store refs
				sceneRef.current = scene;
				rendererRef.current = renderer;
				materialRef.current = material;

				// Animation loop
				const animate = (time) => {
						material.uniforms.u_time.value = time * 0.001;
						renderer.render(scene, camera);
						animationRef.current = requestAnimationFrame(animate);
				};
				animationRef.current = requestAnimationFrame(animate);

				// Resize handler
				const handleResize = () => {
						const width = window.innerWidth;
						const height = window.innerHeight;
						renderer.setSize(width, height);
						material.uniforms.u_resolution.value.set(width, height);
				};
				window.addEventListener('resize', handleResize);

				return () => {
						window.removeEventListener('resize', handleResize);
						if (animationRef.current) cancelAnimationFrame(animationRef.current);
						if (mountRef.current && renderer.domElement) {
								mountRef.current.removeChild(renderer.domElement);
						}
						try { renderer.domElement.removeEventListener('webglcontextlost', onLost); } catch(_){}
						renderer.dispose();
						geometry.dispose();
						material.dispose();
				};
		}, []);

		// Graceful CSS fallback background when WebGL is blocked/unsupported
		return (
            <div ref={mountRef} style={blockedRef.current ? {
                position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none',
                background: 'radial-gradient(120% 80% at 10% 10%, rgba(82,39,255,0.15), transparent), radial-gradient(120% 80% at 90% 80%, rgba(255,159,252,0.12), transparent), linear-gradient(180deg, rgba(8,10,18,0.5), rgba(8,10,18,0))'
            } : undefined} />
        );
}
