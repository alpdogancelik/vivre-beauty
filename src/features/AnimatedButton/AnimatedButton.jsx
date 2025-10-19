import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import '@/styles/AnimatedButton.css';

const AnimatedButton = ({
	children,
	variant = 'stroke',
	className = '',
	onClick,
	href,
	plain = false,
	...props
}) => {
	const buttonRef = useRef(null);
	const flairRef = useRef(null);

	useEffect(() => {
		if (plain) return; // no flair or mouse animations when plain mode is requested

		const buttonElement = buttonRef.current;
		const flairElement = flairRef.current;

		if (!buttonElement || !flairElement) return;

		const xSet = gsap.quickSetter(flairElement, "xPercent");
		const ySet = gsap.quickSetter(flairElement, "yPercent");

		const getXY = (e) => {
			const { left, top, width, height } = buttonElement.getBoundingClientRect();

			const xTransformer = gsap.utils.pipe(
				gsap.utils.mapRange(0, width, 0, 100),
				gsap.utils.clamp(0, 100)
			);

			const yTransformer = gsap.utils.pipe(
				gsap.utils.mapRange(0, height, 0, 100),
				gsap.utils.clamp(0, 100)
			);

			return {
				x: xTransformer(e.clientX - left),
				y: yTransformer(e.clientY - top)
			};
		};

		const handleMouseEnter = (e) => {
			const { x, y } = getXY(e);

			xSet(x);
			ySet(y);

			gsap.to(flairElement, {
				scale: 1,
				duration: 0.4,
				ease: "power2.out"
			});
		};

		const handleMouseLeave = (e) => {
			const { x, y } = getXY(e);

			gsap.killTweensOf(flairElement);

			gsap.to(flairElement, {
				xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
				yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
				scale: 0,
				duration: 0.3,
				ease: "power2.out"
			});
		};

		const handleMouseMove = (e) => {
			const { x, y } = getXY(e);

			gsap.to(flairElement, {
				xPercent: x,
				yPercent: y,
				duration: 0.4,
				ease: "power2"
			});
		};

		buttonElement.addEventListener("mouseenter", handleMouseEnter);
		buttonElement.addEventListener("mouseleave", handleMouseLeave);
		buttonElement.addEventListener("mousemove", handleMouseMove);

		return () => {
			buttonElement.removeEventListener("mouseenter", handleMouseEnter);
			buttonElement.removeEventListener("mouseleave", handleMouseLeave);
			buttonElement.removeEventListener("mousemove", handleMouseMove);
		};
	}, [plain]);

	const Component = href ? 'a' : 'button';
	const componentProps = href ? { href, ...props } : { onClick, ...props };

	return (
		<Component
			ref={buttonRef}
			className={`animated-button animated-button--${variant}${plain ? ' animated-button--plain' : ''} ${className}`.trim()}
			{...componentProps}
		>
			{!plain && <span ref={flairRef} className="animated-button__flair"></span>}
			<span className="animated-button__label">{children}</span>
		</Component>
	);
};

export default AnimatedButton;
