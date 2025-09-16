/* ================= BACKUP PREVIOUS useScrollSlider.js =================
// Önceki sürüm yedeklendi (gerekirse git diff ile geri alabilirsiniz)
================= END BACKUP ================= */
import { useCallback, useEffect, useRef, useState } from 'react';

export function useScrollSlider({
    total = 3,
    autoPlay = true,
    autoPlayInterval = 6500,
    pauseAfterManual = 2000,
    wheelThreshold = 40
} = {}) {
    const [index, setIndex] = useState(0);
    const [isAuto, setIsAuto] = useState(autoPlay);
    const lastWheelRef = useRef(0);
    const autoTimer = useRef(null);
    const resumeTimer = useRef(null);

    const clamp = useCallback(i => (i + total) % total, [total]);
    const go = useCallback(i => setIndex(clamp(i)), [clamp]);
    const next = useCallback(() => setIndex(i => clamp(i + 1)), [clamp]);
    const prev = useCallback(() => setIndex(i => clamp(i - 1)), [clamp]);

    useEffect(() => {
        function onWheel(e) {
            const now = performance.now();
            if (Math.abs(e.deltaY) < wheelThreshold) return;
            if (now - lastWheelRef.current < 550) return; // debounce
            lastWheelRef.current = now;
            setIsAuto(false);
            e.deltaY > 0 ? next() : prev();
            clearTimeout(resumeTimer.current);
            resumeTimer.current = setTimeout(() => setIsAuto(true), pauseAfterManual);
        }
        window.addEventListener('wheel', onWheel, { passive: true });
        return () => window.removeEventListener('wheel', onWheel);
    }, [next, prev, pauseAfterManual, wheelThreshold]);

    useEffect(() => {
        clearInterval(autoTimer.current);
        if (!isAuto) return;
        autoTimer.current = setInterval(next, autoPlayInterval);
        return () => clearInterval(autoTimer.current);
    }, [isAuto, next, autoPlayInterval]);

    useEffect(() => {
        function onKey(e) {
            if (e.key === 'ArrowRight') { setIsAuto(false); next(); }
            if (e.key === 'ArrowLeft') { setIsAuto(false); prev(); }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [next, prev]);

    return { index, total, next, prev, go, isAuto, setIsAuto };
}

export default useScrollSlider;

// Compatibility wrapper expected by components like hero.jsx
// It exposes: currentSlide, totalSlides, goToSlide, isPaused, isScrolling, scrollProgress
export function useGlobalScrollSlider({
    totalSlides = 3,
    autoPlayInterval = 6500,
    autoPlayDelay = 0,
    pauseAfterManual = 2000,
    wheelThreshold = 40,
} = {}) {
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Reuse the core slider logic
    const core = useScrollSlider({
        total: totalSlides,
        autoPlay: true,
        autoPlayInterval,
        pauseAfterManual,
        wheelThreshold,
    });

    // Honor an initial autoplay delay if provided
    useEffect(() => {
        if (!autoPlayDelay) return;
        // Pause initially, resume after delay
        core.setIsAuto(false);
        const t = setTimeout(() => core.setIsAuto(true), autoPlayDelay);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlayDelay]);

    // Track global scroll state and progress
    useEffect(() => {
        function updateProgress() {
            const doc = document.documentElement;
            const body = document.body;
            const scrollTop = doc.scrollTop || body.scrollTop || 0;
            const scrollHeight = (doc.scrollHeight || body.scrollHeight || 1) - window.innerHeight;
            const p = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
            setScrollProgress(Math.max(0, Math.min(1, p)));
        }

        function onScroll() {
            setIsScrolling(true);
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
            updateProgress();
        }

        updateProgress();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return {
        // naming expected by hero.jsx
        currentSlide: core.index,
        totalSlides,
        goToSlide: core.go,
        next: core.next,
        prev: core.prev,
        isPaused: !core.isAuto,
        isScrolling,
        scrollProgress,
    };
}
