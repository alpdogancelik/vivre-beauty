import React, { useEffect, useRef, useState } from 'react';

// Lightweight performance probe to help debug jank in a specific section.
// Shows cumulative layout shift (CLS) and last long task duration while the
// target section is in view.
// Enable by appending ?perf=1 to the URL or setting localStorage.vivre_perf = '1'
export default function PerfProbe({ sectionId = 'cosmetics' }) {
    const [enabled, setEnabled] = useState(false);
    const [cls, setCls] = useState(0);
    const [lastLongTask, setLastLongTask] = useState(0);
    const visibleRef = useRef(false);
    const clsSumRef = useRef(0);

    // Enable flag
    useEffect(() => {
        try {
            const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const byQuery = search?.get('perf') === '1';
            const byStorage = localStorage.getItem('vivre_perf') === '1';
            setEnabled(Boolean(byQuery || byStorage));
        } catch (_) { /* no-op */ }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const sec = document.getElementById(sectionId);
        if (!sec) return;

        const io = new IntersectionObserver((entries) => {
            visibleRef.current = entries.some((e) => e.isIntersecting);
        }, { threshold: 0.01 });
        io.observe(sec);

        let clsObserver;
        let longTaskObserver;

        if ('PerformanceObserver' in window) {
            try {
                clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // Count only when there wasn't recent input and only if our section is on-screen
                        const shift = entry;
                        if (!visibleRef.current) continue;
                        if (shift && !shift.hadRecentInput) {
                            clsSumRef.current += shift.value || 0;
                            setCls(Number(clsSumRef.current.toFixed(3)));
                        }
                    }
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch (_) { /* ignore */ }

            try {
                longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!visibleRef.current) continue;
                        setLastLongTask(Math.round(entry.duration));
                    }
                });
                longTaskObserver.observe({ type: 'longtask', buffered: true });
            } catch (_) { /* ignore */ }
        }

        return () => {
            try { io.disconnect(); } catch { }
            try { clsObserver?.disconnect(); } catch { }
            try { longTaskObserver?.disconnect(); } catch { }
        };
    }, [enabled, sectionId]);

    if (!enabled) return null;

    return (
        <div className="fixed top-2 left-2 z-[9999] px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white shadow">
            <div>CLS: {cls}</div>
            <div>LongTask: {lastLongTask}ms</div>
        </div>
    );
}
