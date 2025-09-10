import { useRef, useEffect } from "react";
import { useSectionReveal, createHoverAnimation } from "./gsap-animations.jsx";

export default function FeatureCard({ title, text, cover }) {
    const cardRef = useRef(null);
    
    // Apply scroll reveal animation
    useSectionReveal(cardRef, {
        y: 30,
        duration: 0.6,
        start: 'top 85%',
    });

    // Apply hover animation
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const { hoverIn, hoverOut } = createHoverAnimation(card, {
            scale: 1.02,
            duration: 0.3,
        });

        card.addEventListener('mouseenter', hoverIn);
        card.addEventListener('mouseleave', hoverOut);

        return () => {
            card.removeEventListener('mouseenter', hoverIn);
            card.removeEventListener('mouseleave', hoverOut);
        };
    }, []);

    return (
        <article
            ref={cardRef}
            className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 cursor-pointer"
        >
            <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-white/0">
                {cover}
            </div>
            <div className="p-4">
                <h3 className="text-base font-medium">{title}</h3>
                <p className="text-sm text-neutral-400">{text}</p>
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
        </article>
    );
}
