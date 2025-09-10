import { useEffect, useRef } from "react";
import { useNavigationHover } from "./gsap-animations.jsx";

export default function Sidebar({ sections, active, onNav }) {
    useNavigationHover();

    return (
        <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-44 flex-col justify-between z-40">
            <div className="text-sm tracking-widest text-neutral-400">VIVRE</div>
            <nav className="space-y-2">
                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onNav(s.id)}
                        className={`nav-item group flex items-center gap-3 w-full text-left transition-colors ${active === s.id ? "text-white" : "text-neutral-500 hover:text-neutral-200"
                            }`}
                    >
                        <span className={`text-xs tabular-nums w-8 ${active === s.id ? "opacity-100" : "opacity-60"}`}>{s.no}</span>
                        <span className="text-sm uppercase tracking-wide">{s.title}</span>
                        <span className={`ml-auto h-px flex-1 transition-all duration-300 ${active === s.id ? "bg-white/80" : "bg-white/10 group-hover:bg-white/40"}`}></span>
                    </button>
                ))}
            </nav>
            <div className="text-xs text-neutral-500 space-y-1">
                <a href="#" className="nav-item block hover:text-white transition-colors duration-200">IG / @vivre.beauty</a>
                <a href="#" className="nav-item block hover:text-white transition-colors duration-200">TT / @vivre.beauty</a>
            </div>
        </aside>
    );
}
