import { useRef } from "react";
import { useStaggerAnimation } from "./gsap-animations.jsx";

export default function WorkList({ projects }) {
    const workListRef = useRef(null);

    // Apply stagger animation to work items
    useStaggerAnimation(workListRef, 'a', {
        y: 30,
        stagger: 0.15,
        duration: 0.7,
        start: 'top 80%',
    });

    return (
        <div ref={workListRef} className="mt-10">
            {projects.map((p, idx) => (
                <a key={idx} href={p.href || "#"} className="work-item block py-10 border-t border-white/20 group">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
                        <h3 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[0.95] group-hover:opacity-90 transition-opacity duration-300">{p.title}</h3>
                        <div className="text-neutral-300 text-base">{(p.tags || []).join(", ")}</div>
                    </div>
                    <div className="mt-6 h-[2px] bg-white/60 max-w-full transition-all duration-300 group-hover:bg-white/80" />
                </a>
            ))}
            <div className="border-t border-white/20" />
        </div>
    );
}
