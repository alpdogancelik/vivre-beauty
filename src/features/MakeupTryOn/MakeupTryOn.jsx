import React, { useEffect, useRef, useState } from "react";

/**
 * Minimal webcam makeup try‑on using MediaPipe Face Mesh (client‑side, free).
 * - Lip tint fill with feathering
 * - Simple eyeliner stroke
 * - Soft blush on cheeks
 *
 * Install once:
 *   npm i @mediapipe/face_mesh @mediapipe/camera_utils
 *
 * Usage:
 *   import MakeupTryOn from "./MakeupTryOn.jsx";
 *   <MakeupTryOn />
 */

// Landmark index sets (MediaPipe FaceMesh, 468 points)
const LIPS_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
const LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];
const LEFT_EYE_UPPER = [33, 160, 159, 158, 157, 173, 133];
const RIGHT_EYE_UPPER = [263, 387, 386, 385, 384, 398, 362];
// Cheek reference points
const CHEEK_LEFT = 234;
const CHEEK_RIGHT = 454;

const PRESETS = [
	{ name: "Soft nude", lip: "rgba(174,94,85,0.38)", eyeliner: "rgba(10,10,10,0.9)", blush: "rgba(224,121,121,0.18)" },
	{ name: "Rose", lip: "rgba(193,76,94,0.42)", eyeliner: "rgba(8,8,8,0.95)", blush: "rgba(231,98,123,0.22)" },
	{ name: "Coral", lip: "rgba(217,75,76,0.40)", eyeliner: "rgba(8,8,8,0.9)", blush: "rgba(240,120,103,0.20)" },
	{ name: "Bare", lip: "rgba(120,80,70,0.22)", eyeliner: "rgba(12,12,12,0.8)", blush: "rgba(210,120,120,0.12)" },
];

// Component name should be capitalized for React to treat it as a component
export default function MakeupTryOn() {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [ready, setReady] = useState(false);
	const [preset, setPreset] = useState(PRESETS[1]); // default Rose
	const [intensity, setIntensity] = useState(1.0);

	useEffect(() => {
		let camera = null;
		let faceMesh = null;
		let running = true;

		const start = async () => {
			const mpFaceMesh = await import("@mediapipe/face_mesh");
			const cam = await import("@mediapipe/camera_utils");

			faceMesh = new mpFaceMesh.FaceMesh({
				locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
			});
			faceMesh.setOptions({
				maxNumFaces: 1,
				refineLandmarks: true,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5,
			});
			faceMesh.onResults(drawResults);

			const video = videoRef.current;
			camera = new cam.Camera(video, {
				onFrame: async () => {
					if (!running) return;
					await faceMesh.send({ image: video });
				},
				width: 640,
				height: 480,
			});
			await camera.start();
			setReady(true);
		};

		start();

		return () => {
			running = false;
			try { camera && camera.stop(); } catch { }
		};
	}, []);

	function drawResults(results) {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const video = videoRef.current;
		if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
			// just mirror the video
			fitCanvasToVideo(canvas, video);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			drawVideo(ctx, video, canvas);
			ctx.restore();
			return;
		}

		const landmarks = results.multiFaceLandmarks[0];

		fitCanvasToVideo(canvas, video);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		drawVideo(ctx, video, canvas);

		// scale normalized [0..1] to pixels
		const pts = landmarks.map((p) => ({ x: p.x * canvas.width, y: p.y * canvas.height }));

		// Helpers
		const pathFrom = (indexes) => {
			const p0 = pts[indexes[0]];
			ctx.beginPath();
			ctx.moveTo(p0.x, p0.y);
			for (let i = 1; i < indexes.length; i++) {
				const p = pts[indexes[i]];
				ctx.lineTo(p.x, p.y);
			}
			ctx.closePath();
		};

		// --- Lips fill with inner hole removed ---
		ctx.save();
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = scaleRGBA(preset.lip, intensity);
		pathFrom(LIPS_OUTER);
		// Use even-odd to subtract inner mouth
		pathFrom(LIPS_INNER);
		ctx.fill("evenodd");

		// slight blur/feather
		feather(ctx, () => {
			pathFrom(LIPS_OUTER);
			pathFrom(LIPS_INNER);
		}, 3);
		ctx.restore();

		// --- Eyeliner along upper eyelid ---
		const eyeStroke = Math.max(1.5, dist(pts[33], pts[133]) * 0.02); // scale with eye width
		ctx.save();
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.strokeStyle = scaleRGBA(preset.eyeliner, intensity);
		ctx.lineWidth = eyeStroke;
		strokePath(LEFT_EYE_UPPER.map(i => pts[i]), ctx);
		strokePath(RIGHT_EYE_UPPER.map(i => pts[i]), ctx);
		ctx.restore();

		// --- Blush as soft radial gradients on cheeks ---
		ctx.save();
		const cheekRadius = dist(pts[CHEEK_LEFT], pts[CHEEK_RIGHT]) * 0.10;
		drawBlush(ctx, pts[CHEEK_LEFT], cheekRadius, scaleRGBA(preset.blush, intensity));
		drawBlush(ctx, pts[CHEEK_RIGHT], cheekRadius, scaleRGBA(preset.blush, intensity));
		ctx.restore();

		ctx.restore();
	}

	return (
		<div className="w-full max-w-[720px] mx-auto">
			<div className="relative rounded-xl overflow-hidden bg-black">
				{/* Mirror video under canvas */}
				<video ref={videoRef} className="w-full h-auto block" playsInline muted />
				<canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
				{PRESETS.map((p) => (
					<button
						key={p.name}
						onClick={() => setPreset(p)}
						className={`px-3 py-1.5 rounded-full border ${preset.name === p.name ? "bg-neutral-900 text-white" : "bg-white"}`}
						title={p.name}
					>
						{p.name}
					</button>
				))}
				<label className="ml-2">Yoğunluk
					<input
						type="range"
						min="0.2"
						max="1.8"
						step="0.05"
						value={intensity}
						onChange={(e) => setIntensity(parseFloat(e.target.value))}
						className="ml-2 align-middle"
					/>
				</label>
				<span className="ml-auto text-neutral-500">{ready ? "Kamera açık" : "Hazırlanıyor"}</span>
			</div>
		</div>
	);
}

// ---------- drawing helpers ----------

function drawVideo(ctx, video, canvas) {
	// mirror horizontally like selfie
	ctx.translate(canvas.width, 0);
	ctx.scale(-1, 1);
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	// reset for overlays
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function fitCanvasToVideo(canvas, video) {
	const w = video.videoWidth || 640;
	const h = video.videoHeight || 480;
	const box = canvas.parentElement.getBoundingClientRect();
	// match displayed size while keeping pixel density crisp
	canvas.width = box.width;
	canvas.height = Math.round(box.width * h / w);
}

function strokePath(points, ctx) {
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y);
	}
	ctx.stroke();
}

function drawBlush(ctx, center, r, rgba) {
	const g = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, r);
	const c = rgbaToArray(rgba);
	g.addColorStop(0.0, `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`);
	g.addColorStop(1.0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
	ctx.fill();
}

function feather(ctx, makePath, blur = 2) {
	// soft edge by drawing thicker transparent stroke around shape
	ctx.save();
	ctx.shadowColor = "rgba(0,0,0,0.5)";
	ctx.shadowBlur = blur;
	ctx.globalAlpha *= 0.5;
	ctx.beginPath();
	makePath();
	ctx.fill("evenodd");
	ctx.restore();
}

function dist(a, b) {
	const dx = a.x - b.x, dy = a.y - b.y;
	return Math.hypot(dx, dy);
}

function rgbaToArray(rgba) {
	// expects 'rgba(r,g,b,a)'
	const m = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/i);
	if (!m) return [0, 0, 0, 0.5];
	return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), parseFloat(m[4])];
}

function scaleRGBA(rgba, k) {
	const [r, g, b, a] = rgbaToArray(rgba);
	return `rgba(${r},${g},${b},${Math.min(1, a * k)})`;
}
