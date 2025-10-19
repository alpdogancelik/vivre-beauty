"use client";

import { useEffect, useRef, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Slider,
} from "@/components/ui.jsx";
import { Camera, Download, RotateCcw, Palette } from "lucide-react";
import AnimatedButton from '@features/AnimatedButton/AnimatedButton.jsx';

// Palet
const MAKEUP_PRODUCTS = {
	lipstick: [
		{ name: "Nude Rose", hex: "#D4A574" },
		{ name: "Classic Red", hex: "#DC143C" },
		{ name: "Berry Pink", hex: "#C71585" },
		{ name: "Coral Sunset", hex: "#FF7F50" },
		{ name: "Mauve Dream", hex: "#C49BBB" },
	],
	eyeshadow: [
		{ name: "Golden Bronze", hex: "#CD7F32" },
		{ name: "Smoky Gray", hex: "#708090" },
		{ name: "Rose Gold", hex: "#E8B4B8" },
		{ name: "Deep Plum", hex: "#8B008B" },
		{ name: "Champagne", hex: "#F7E7CE" },
	],
	blush: [
		{ name: "Peach Glow", hex: "#FFCBA4" },
		{ name: "Rose Petal", hex: "#FFB6C1" },
		{ name: "Coral Flush", hex: "#FF6B6B" },
		{ name: "Berry Tint", hex: "#DC143C" },
	],
};

const toXY = (p, w, h) => [p.x * w, p.y * h];

export default function VirtualMakeup() {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const landmarkerRef = useRef(null);
	const rafRef = useRef(null);

	const [status, setStatus] = useState("Kamera izni bekleniyor…");
	const [isActive, setIsActive] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState("lipstick");
	const [selectedColor, setSelectedColor] = useState(MAKEUP_PRODUCTS.lipstick[0]);
	const [intensity, setIntensity] = useState([70]);

	// Kamera + model
	useEffect(() => {
		let stream;
		(async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "user" },
					audio: false,
				});
				const v = videoRef.current;
				v.srcObject = stream;
				v.muted = true;
				v.playsInline = true;

				await new Promise((res) => {
					const done = () => {
						v.onloadedmetadata = null;
						res();
					};
					v.readyState >= 1 ? done() : (v.onloadedmetadata = done);
				});
				await v.play();

				const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
				const fr = await FilesetResolver.forVisionTasks(
					"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
				);
				landmarkerRef.current = await FaceLandmarker.createFromOptions(fr, {
					baseOptions: {
						modelAssetPath:
							"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
					},
					runningMode: "VIDEO",
					numFaces: 1,
				});

				setStatus("Hazır – makyajı deneyin");
				setIsActive(true);
				startLoop();
			} catch {
				setStatus("Kamera reddedildi veya model yüklenemedi");
			}
		})();

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			if (stream) stream.getTracks().forEach((t) => t.stop());
		};
	}, []);

	// Render döngüsü
	const startLoop = () => {
		const loop = () => {
			rafRef.current = requestAnimationFrame(loop);
			const v = videoRef.current;
			const c = canvasRef.current;
			if (!v || !c || !v.videoWidth) return;

			c.width = v.videoWidth;
			c.height = v.videoHeight;
			const ctx = c.getContext("2d");
			ctx.drawImage(v, 0, 0, c.width, c.height);

			const res = landmarkerRef.current?.detectForVideo(v, performance.now());
			if (res?.faceLandmarks?.length) applyMakeup(ctx, res.faceLandmarks[0], c.width, c.height);
		};
		loop();
	};

	// Boyayıcılar
	const applyMakeup = (ctx, pts, w, h) => {
		ctx.save();
		ctx.globalAlpha = intensity[0] / 100;
		ctx.fillStyle = selectedColor.hex;
		if (selectedProduct === "lipstick") paintLips(ctx, pts, w, h);
		if (selectedProduct === "eyeshadow") paintEyes(ctx, pts, w, h);
		if (selectedProduct === "blush") paintBlush(ctx, pts, w, h);
		ctx.restore();
	};

	const paintLips = (ctx, pts, w, h) => {
		const idx = [
			...Array.from({ length: 7 }, (_, i) => 61 + i),
			...Array.from({ length: 7 }, (_, i) => 291 + i),
			...Array.from({ length: 12 }, (_, i) => i),
		];
		ctx.beginPath();
		idx.forEach((i, k) => {
			const [x, y] = toXY(pts[i], w, h);
			k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
		});
		ctx.closePath();
		ctx.fill();
	};

	const paintEyes = (ctx, pts, w, h) => {
		const eyes = [Array.from({ length: 9 }, (_, i) => 33 + i), Array.from({ length: 9 }, (_, i) => 362 + i)];
		ctx.globalAlpha *= 0.6;
		eyes.forEach((arr) => {
			ctx.beginPath();
			arr.forEach((i, k) => {
				const [x, y] = toXY(pts[i], w, h - 10);
				k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
			});
			ctx.closePath();
			ctx.fill();
		});
	};

	const paintBlush = (ctx, pts, w, h) => {
		const cheeks = [pts[116], pts[345]];
		ctx.globalAlpha *= 0.4;
		cheeks.forEach((p) => {
			const [x, y] = toXY(p, w, h);
			const g = ctx.createRadialGradient(x, y, 0, x, y, 40);
			g.addColorStop(0, selectedColor.hex);
			g.addColorStop(1, "transparent");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(x, y, 40, 0, Math.PI * 2);
			ctx.fill();
		});
	};

	// Yardımcılar
	const resetMakeup = () => {
		setIntensity([70]);
		setSelectedColor(MAKEUP_PRODUCTS[selectedProduct][0]);
	};
	const capturePhoto = () => {
		const c = canvasRef.current;
		if (!c) return;
		const a = document.createElement("a");
		a.download = `vivre-makeup-${Date.now()}.png`;
		a.href = c.toDataURL();
		a.click();
	};

	// UI
	const labelOf = (p) => (p === "lipstick" ? "Ruj" : p === "eyeshadow" ? "Göz Farı" : "Allık");

	return (
		<section className="w-full max-w-6xl mx-auto p-6">
			<div className="mb-8">
				<h2 className="text-3xl font-serif font-bold mb-2">Sanal Makyaj Denemesi</h2>
				<p className="text-muted-foreground">AI ile gerçek zamanlı makyaj deneyimi yaşayın</p>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				{/* Önizleme */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Camera className="h-5 w-5" /> Canlı Önizleme
							</CardTitle>
							<CardDescription>{status}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
								<video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
								<canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
								{isActive && (
									<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
										<AnimatedButton variant="filled" className="text-xs px-3 py-2" onClick={capturePhoto}>
											<Download className="h-4 w-4 mr-1" /> Kaydet
										</AnimatedButton>
										<AnimatedButton variant="stroke" className="text-xs px-3 py-2" onClick={resetMakeup}>
											<RotateCcw className="h-4 w-4 mr-1" /> Sıfırla
										</AnimatedButton>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Kontroller */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Palette className="h-5 w-5" /> Makyaj Kontrolleri
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Ürün tipi */}
							<div>
								<label className="text-sm font-medium mb-2 block">Ürün Tipi</label>
								<div className="grid grid-cols-3 gap-2">
									{Object.keys(MAKEUP_PRODUCTS).map((p) => (
										<AnimatedButton
											key={p}
											variant={selectedProduct === p ? "filled" : "stroke"}
											className="text-xs px-3 py-2"
											onClick={() => {
												setSelectedProduct(p);
												setSelectedColor(MAKEUP_PRODUCTS[p][0]);
											}}
										>
											{labelOf(p)}
										</AnimatedButton>
									))}
								</div>
							</div>

							{/* Renkler */}
							<div>
								<label className="text-sm font-medium mb-2 block">Renk</label>
								<div className="grid grid-cols-2 gap-2">
									{MAKEUP_PRODUCTS[selectedProduct].map((c) => (
										<AnimatedButton
											key={c.name}
											variant={selectedColor.name === c.name ? "filled" : "stroke"}
											className="justify-start text-xs px-3 py-2"
											onClick={() => setSelectedColor(c)}
										>
											<span
												className="inline-block w-3 h-3 rounded-full mr-2 border"
												style={{ backgroundColor: c.hex }}
											/>
											{c.name}
										</AnimatedButton>
									))}
								</div>
							</div>

							{/* Yoğunluk */}
							<div>
								<label className="text-sm font-medium mb-2 block">Yoğunluk: {intensity[0]}%</label>
								<Slider value={intensity} onValueChange={setIntensity} min={10} max={100} step={5} />
							</div>
						</CardContent>
					</Card>

					{/* İpuçları */}
					<Card>
						<CardHeader>
							<CardTitle>İpuçları</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="text-sm space-y-2 text-muted-foreground">
								<li>• Kameraya doğru bakın ve iyi ışık kullanın.</li>
								<li>• Renkleri karşılaştırın, yoğunluğu kaydırın.</li>
								<li>• Beğendiğiniz görünümü Kaydet ile alın.</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
