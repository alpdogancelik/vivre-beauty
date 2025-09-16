import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function LogoEntrance({ onComplete }) {
	const [showLogo, setShowLogo] = useState(true);

	useEffect(() => {
		const tl = gsap.timeline({
			onComplete: () => {
				// Logo animasyonu tamamlandıktan sonra sliding transition başlasın
				setTimeout(() => {
					slideOut();
				}, 1000);
			}
		});

		// Logo entrance animasyonu
		tl.from('.logo-entrance', {
			scale: 0.5,
			opacity: 0,
			duration: 1.2,
			ease: "back.out(1.7)"
		})
			.from('.logo-tagline', {
				y: 30,
				opacity: 0,
				duration: 0.8,
				ease: "power2.out"
			}, "-=0.4")
			.to('.logo-entrance', {
				scale: 1.1,
				duration: 0.5,
				ease: "power2.inOut",
				yoyo: true,
				repeat: 1
			}, "+=0.5");

		return () => tl.kill();
	}, []);

	const slideOut = () => {
		const tl = gsap.timeline({
			onComplete: () => {
				setShowLogo(false);
				onComplete && onComplete();
			}
		});

		// Sliding transition - sol tarafa kaydır
		tl.to('.logo-container', {
			x: '-100%',
			duration: 1.2,
			ease: "power3.inOut"
		})
			.to('.logo-container', {
				opacity: 0,
				duration: 0.3
			}, "-=0.3");
	};

	if (!showLogo) return null;

	return (
		<div className="logo-container fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50 to-stone-50">
			{/* Background floating elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="floating-element absolute top-20 left-20 w-2 h-2 bg-rose-200/40 rounded-full blur-sm"></div>
				<div className="floating-element absolute top-40 right-32 w-3 h-3 bg-amber-200/30 rounded-full blur-sm"></div>
				<div className="floating-element absolute bottom-32 left-40 w-2 h-2 bg-stone-300/50 rounded-full blur-sm"></div>
				<div className="floating-element absolute bottom-20 right-20 w-4 h-4 bg-rose-300/30 rounded-full blur-sm"></div>
			</div>

			{/* Logo content */}
			<div className="text-center relative z-10">
				{/* Main logo */}
				<div className="logo-entrance mb-8">
					<div className="flex items-center justify-center mb-6">
						{/* Gerçek Vivre logo */}
						<div className="relative">
							<img
								src="/vivre-logo-real.png"
								alt="Vivre Beauty Logo"
								className="h-40 md:h-56 lg:h-64 w-auto"
								style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.1))' }}
							/>
						</div>
					</div>

					<div className="logo-tagline">
						<p className="text-xl md:text-2xl font-light text-stone-600 tracking-wide">
							Beauty Studio
						</p>
						<p className="text-sm text-stone-500 mt-2 tracking-widest">
							YAPAY ZEKA DESTEKLİ GÜZELLIK
						</p>
					</div>
				</div>

				{/* Loading indicator */}
				<div className="flex justify-center">
					<div className="w-16 h-0.5 bg-stone-300 rounded-full overflow-hidden">
						<div className="h-full bg-gradient-to-r from-rose-300 to-amber-300 rounded-full animate-pulse"></div>
					</div>
				</div>
			</div>

			{/* Shimmer overlay */}
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30 animate-shimmer"></div>
		</div>
	);
}
