import React, { useEffect } from "react";
import Booking from "@/pages/Booking/Booking.jsx";

export default function BookingSidebar({ open = false, onClose = () => { }, side = 'right' }) {
    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden={!open}
            />

            {/* Slide-over panel */}
            <aside
                className={[
                    // If panel opens from the left, make it full-screen width. Otherwise keep the compact sidebar width.
                    `fixed top-0 h-screen ${side === 'left' ? 'w-screen' : 'w-full sm:w-[420px] md:w-[480px]'} z-[75] text-stone-900`,
                    side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
                    "bg-white/95 backdrop-blur-xl border-stone-200/70 shadow-xl",
                    "transform transition-transform duration-300 will-change-transform",
                    open ? "translate-x-0" : (side === 'right' ? "translate-x-full" : "-translate-x-full"),
                ].join(' ')}
                role="dialog"
                aria-modal="true"
                aria-label="Randevu Paneli"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-stone-50/90 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-stone-200/70 bg-white/70 backdrop-blur sticky top-0">
                        <img src="/vivre-logo-real.png" alt="Vivre" className="h-8 w-auto select-none" />
                        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">Randevu</h2>
                        <button
                            onClick={onClose}
                            className="ml-auto px-3 py-1.5 rounded-lg border border-stone-300/70 bg-white/70 text-sm hover:bg-stone-100 active:scale-[0.98] transition select-none"
                            aria-label="Paneli kapat"
                        >
                            Kapat
                        </button>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 glass-scroll">
                        <div className="rounded-2xl border border-stone-200 bg-white/70 backdrop-blur p-4 sm:p-5">
                            <Booking />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
