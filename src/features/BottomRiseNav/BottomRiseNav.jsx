import React from "react";

/**
 * BottomRiseNav — fixed bottom navbar that slides up on scroll.
 * Props:
 * - show: boolean — when true, nav rises into view
 * - items: [{ id, label }]
 * - onNavigate: (id) => void
 * - onReservation?: () => void
 */
export default function BottomRiseNav({ show = false, items = [], onNavigate, onReservation }) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
            <nav
                className={`mx-auto mb-3 max-w-4xl px-3 sm:px-4 pointer-events-auto transition-transform duration-400 ease-out ${show ? "translate-y-0" : "translate-y-[110%]"
                    }`}
                aria-label="Primary"
            >
                <div className="flex items-center justify-between rounded-2xl border border-stone-200/60 bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgba(28,25,23,0.12)]">
                    <div className="hidden sm:flex items-center gap-1 sm:gap-2 px-2">
                        <img src="/vivre-logo-real.png" alt="Vivre" className="h-9 w-auto select-none" />
                    </div>
                    <ul className="flex flex-1 items-center justify-center gap-3 sm:gap-5 py-2 px-2 text-sm text-stone-700">
                        {items.map((it) => (
                            <li key={it.id}>
                                <button
                                    className="px-2 py-1 rounded-lg hover:bg-stone-100/70 active:scale-[0.98] transition"
                                    onClick={() => onNavigate?.(it.id)}
                                >
                                    {it.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="px-2 sm:px-3 py-2">
                        <button
                            onClick={() => onReservation?.()}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-sm font-medium shadow hover:bg-stone-800 active:scale-[0.98] transition"
                        >
                            Randevu
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}
