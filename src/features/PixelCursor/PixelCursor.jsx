import { useEffect, useRef, useState } from 'react';

const letters = {
	V: [
		[1, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 1],
		[0, 1, 0, 0, 0, 1, 0],
		[0, 1, 0, 0, 0, 1, 0],
		[0, 0, 1, 0, 1, 0, 0],
		[0, 0, 1, 0, 1, 0, 0],
		[0, 0, 0, 1, 0, 0, 0],
	],
	I: [
		[1, 1, 1, 1, 1, 1, 1],
		[0, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1],
	],
	R: [
		[1, 1, 1, 1, 0, 0, 0],
		[1, 0, 0, 0, 1, 0, 0],
		[1, 0, 0, 0, 1, 0, 0],
		[1, 1, 1, 1, 0, 0, 0],
		[1, 0, 1, 0, 0, 0, 0],
		[1, 0, 0, 1, 0, 0, 0],
		[1, 0, 0, 0, 1, 0, 0],
	],
	E: [
		[1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1],
	]
};

export default function PixelCursor({
  buttonTriggered = false,
  onAnimationComplete = null,
  dpr = (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
  highQuality = false
}) {
	const containerRef = useRef(null);
	const pixelsRef = useRef([]);
	const [showText, setShowText] = useState(false);
	const [animating, setAnimating] = useState(false);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const mountedRef = useRef(false);

	// Cleanup helper
	const cleanupPixels = () => {
		pixelsRef.current.forEach(px => px && px.remove && px.remove());
		pixelsRef.current = [];
	};

	useEffect(() => {
		if (mountedRef.current) return; // only once
		if (typeof document === 'undefined') return;
		mountedRef.current = true;
		const text = ['V', 'I', 'V', 'R', 'E'];
		const spacing = 4 * (highQuality ? Math.min(1.2, dpr) : 1);
		const pixels = [];
		const frag = document.createDocumentFragment();
		text.forEach((char, index) => {
			const map = letters[char];
			for (let y = 0; y < map.length; y++) {
				for (let x = 0; x < map[y].length; x++) {
					if (map[y][x] === 1) {
						const px = document.createElement('div');
						px.className = 'pixel-dot';
						px.dataset.charOffsetX = (x * spacing + index * 6 * spacing + index * spacing).toString();
						px.dataset.charOffsetY = (y * spacing).toString();
						// include missing semicolon after background
						px.style.cssText = `position:fixed;inset:auto;top:0;left:0;width:2px;height:2px;` +
							`background:rgba(125,46,158,0.8);border-radius:50%;pointer-events:none;z-index:9999;` +
							`will-change:transform;transition:transform .2s ease,width .2s ease,height .2s ease;mix-blend-mode:plus-lighter;`;
						frag.appendChild(px);
						pixels.push(px);
					}
				}
			}
		});
		containerRef.current && containerRef.current.appendChild(frag);
		pixelsRef.current = pixels;
		return () => cleanupPixels();
	}, [dpr, highQuality]);

	// Button trigger effect
	useEffect(() => {
		if (buttonTriggered && !animating) {
			handleButtonClick();
		}
	}, [buttonTriggered, animating]);

	const handleButtonClick = () => {
		if (animating) return;
		setAnimating(true);
		const newShowText = !showText;
		setShowText(newShowText);

		if (newShowText) {
			// Yazıyı buton konumunda oluştur
			pixelsRef.current.forEach(px => {
				const ox = parseFloat(px.dataset.charOffsetX);
				const oy = parseFloat(px.dataset.charOffsetY);
				px.style.transition = 'transform 1.1s cubic-bezier(.4,0,.2,1), width 1.1s ease, height 1.1s ease';
				px.style.width = highQuality ? '5px' : '4px';
				px.style.height = highQuality ? '5px' : '4px';
				px.style.borderRadius = '0%';
				px.style.transform = `translate(${window.innerWidth / 2 + ox - 60}px, ${window.innerHeight / 2 + oy}px)`;
			});
			setTimeout(() => {
				setAnimating(false);
				onAnimationComplete && onAnimationComplete();
			}, 1150);
		} else {
			// Yazıyı dağıt
			pixelsRef.current.forEach(px => {
				const randomX = Math.random() * window.innerWidth;
				const randomY = Math.random() * window.innerHeight;
				px.style.transition = 'transform 0.75s ease';
				px.style.transform = `translate(${randomX}px, ${randomY}px)`;
			});
			setTimeout(() => {
				setAnimating(false);
				if (onAnimationComplete) onAnimationComplete();
			}, 750);
		}
	};

	useEffect(() => {
		if (typeof window === 'undefined') return;
		let rafId = null;
		let latest = { x: 0, y: 0, dirty: false };
		const apply = () => {
			if (!latest.dirty) { rafId = requestAnimationFrame(apply); return; }
			latest.dirty = false;
			if (!buttonTriggered) {
				pixelsRef.current.forEach(px => {
					if (!px) return;
					if (!showText) {
						px.style.transition = 'none';
						px.style.width = '2px';
						px.style.height = '2px';
						px.style.borderRadius = '50%';
						px.style.transform = `translate(${latest.x}px, ${latest.y}px)`;
					} else {
						const ox = parseFloat(px.dataset.charOffsetX);
						const oy = parseFloat(px.dataset.charOffsetY);
						px.style.transition = 'transform 0.2s ease, width 0.2s ease, height 0.2s ease';
						px.style.width = highQuality ? '5px' : '4px';
						px.style.height = highQuality ? '5px' : '4px';
						px.style.borderRadius = '0%';
						px.style.transform = `translate(${latest.x + ox - 45}px, ${latest.y + oy - 10}px)`;
					}
				});
			}
			rafId = requestAnimationFrame(apply);
		};
		const handleMouseMove = (e) => {
			latest.x = e.clientX;
			latest.y = e.clientY;
			latest.dirty = true;
		};
		const handleClick = () => { if (!buttonTriggered) handleButtonClick(); };
		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('click', handleClick);
		rafId = requestAnimationFrame(apply);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('click', handleClick);
			if (rafId) cancelAnimationFrame(rafId);
		};
	}, [showText, buttonTriggered, highQuality]);

	// Resize -> if centered text, reposition to keep centered
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const onResize = () => {
			if (!showText) return;
			pixelsRef.current.forEach(px => {
				const ox = parseFloat(px.dataset.charOffsetX);
				const oy = parseFloat(px.dataset.charOffsetY);
				px.style.transform = `translate(${window.innerWidth / 2 + ox - 60}px, ${window.innerHeight / 2 + oy}px)`;
			});
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [showText]);

	return <div ref={containerRef} aria-hidden="true" />;
}
