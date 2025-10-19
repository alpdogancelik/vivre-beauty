import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // if you need later
import styles from "./LogoEntrance.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function LogoEntrance({ onComplete }) {
	const container = useRef(null);          // top-level wrapper
	const logoImg = useRef(null);          // <img> element
	const dots = useRef([]);            // floating pastel dots
	const playCount = useRef(0);
	const [visible, setVisible] = useState(true);

	// --- entrance & exit ---
	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			/* clip-path circle wipe + scale/rotate in */
			gsap.fromTo(
				logoImg.current,
				{ scale: 0.2, rotate: -20, opacity: 0, clipPath: "circle(0% at 50% 50%)" },
				{
					scale: 1,
					rotate: 0,
					opacity: 1,
					clipPath: "circle(75% at 50% 50%)",
					duration: 1.4,
					ease: "power4.out"
				}
			);

			/* floating dots – random gentle loop */
			dots.current.forEach((el, i) => {
				gsap.to(el, {
					y: () => gsap.utils.random(-20, 20),
					x: () => gsap.utils.random(-20, 20),
					scale: () => gsap.utils.random(0.7, 1.3),
					repeat: -1,
					yoyo: true,
					duration: () => gsap.utils.random(4, 7),
					ease: "sine.inOut",
					delay: i * 0.2
				});
			});

			/* pulse bounce after logo settles */
			gsap.to(logoImg.current, {
				scale: 1.06,
				duration: 0.5,
				ease: "power2.inOut",
				yoyo: true,
				repeat: 1,
				delay: 1.6,
				onComplete: () => {
					// slide splash away after a short pause
					gsap.to(container.current, {
						xPercent: -100,
						duration: 1.2,
						ease: "power3.inOut",
						onComplete: () => {
							setVisible(false);
							onComplete?.();
						}
					});
				}
			});
		}, container);           // <- GSAP scope

		return () => ctx.revert(); // cleanup on unmount/hot-reload
	}, [onComplete]);

	if (!visible) return null;

	return (
		<div
			ref={container}
			className={`${styles.wrapper} logo-container fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50 to-stone-50`}
		>
			{/* background pastel dots */}
			<div className="absolute inset-0 overflow-hidden">
				{["rose", "amber", "stone", "rose"].map((c, i) => (
					<div
						key={i}
						ref={el => (dots.current[i] = el)}
						className={`floating-element absolute rounded-full blur-sm ${i === 0
								? "top-20 left-20 w-2 h-2 bg-rose-200/40"
								: i === 1
									? "top-40 right-32 w-3 h-3 bg-amber-200/30"
									: i === 2
										? "bottom-32 left-40 w-2 h-2 bg-stone-300/50"
										: "bottom-20 right-20 w-4 h-4 bg-rose-300/30"
							}`}
					/>
				))}
			</div>

			{/* logo + tagline */}
			<div className="text-center relative z-10">
				<img
					ref={logoImg}
					src="/vivre-logo-real.png"
					alt="Vivre Beauty Logo"
					className="logo-entrance h-40 md:h-56 lg:h-64 w-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.1)]"
				/>

				<div className="logo-tagline mt-6">
					<p className="text-xl md:text-2xl font-light text-stone-600 tracking-wide">
						Beauty Studio
					</p>
					<p className="text-sm text-stone-500 mt-2 tracking-widest">
						Hellenistic Elegance shapes the future’s graceful gaze.
					</p>
				</div>

				{/* loading bar */}
				<div className="mt-8 w-16 h-0.5 bg-stone-300 rounded-full overflow-hidden">
					<div className="h-full bg-gradient-to-r from-rose-300 to-amber-300 rounded-full animate-pulse" />
				</div>
			</div>

			{/* shimmer overlay */}
			<div className={`${styles.shimmer} absolute inset-0`} />
		</div>
	);
}
