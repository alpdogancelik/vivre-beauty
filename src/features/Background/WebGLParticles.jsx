import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { shouldUseWebGL } from '@/lib/detectWebGL.js';

export default function WebGLParticles() {
	const mountRef = useRef(null);
	const animRef = useRef(0);
	const rendererRef = useRef(null);

	useEffect(() => {
		const support = shouldUseWebGL();
		if (!support.ok) return;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.domElement.style.position = 'fixed';
		renderer.domElement.style.top = '0';
		renderer.domElement.style.left = '0';
		renderer.domElement.style.zIndex = '-1';
		renderer.domElement.style.pointerEvents = 'none';
        const onLost = (e) => { try { e?.preventDefault?.(); } catch(_){} };
        renderer.domElement.addEventListener('webglcontextlost', onLost, { passive: false });

		const particles = 2000;
		const geometry = new THREE.BufferGeometry();
		const positions = new Float32Array(particles * 3);
		const speeds = new Float32Array(particles);
		for (let i = 0; i < particles; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 20;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
			speeds[i] = 0.001 + Math.random() * 0.003;
		}
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		const material = new THREE.PointsMaterial({ color: 0xffe0e6, size: 0.03, transparent: true, opacity: 0.8 });
		const points = new THREE.Points(geometry, material);
		scene.add(points);

		// Light motion with sine waves
		const animate = () => {
			const pos = geometry.attributes.position.array;
			const t = performance.now() * 0.001;
			for (let i = 0; i < particles; i++) {
				const i3 = i * 3;
				pos[i3 + 1] += Math.sin(t + pos[i3] * 0.5) * speeds[i];
				pos[i3] += Math.cos(t * 0.7 + pos[i3 + 2] * 0.2) * speeds[i] * 0.3;
			}
			geometry.attributes.position.needsUpdate = true;
			points.rotation.y += 0.0008;
			renderer.render(scene, camera);
			animRef.current = requestAnimationFrame(animate);
		};

		mountRef.current?.appendChild(renderer.domElement);
		rendererRef.current = renderer;
		animRef.current = requestAnimationFrame(animate);

		const onResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
			if (animRef.current) cancelAnimationFrame(animRef.current);
			if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
			geometry.dispose();
			material.dispose();
			try { renderer.domElement.removeEventListener('webglcontextlost', onLost); } catch(_){}
			renderer.dispose();
		};
	}, []);

	return <div ref={mountRef} />;
}
