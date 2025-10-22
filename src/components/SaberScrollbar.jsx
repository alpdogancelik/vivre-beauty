import { useEffect, useRef, useState } from "react";

/**
 * Üstte “ışın kılıcı” tarzı custom scrollbar.
 * - Scroll ilerlemesine göre genişler
 * - Track’e tıkla → o konuma scroll
 * - Head’i sürükle → drag ile kontrol
 */
export default function SaberScrollbar({
    color = "white",       // (şu an CSS tarafında; istersen inline style ile kullan)
    hideNative = true,
    zIndex = 60,
    height = 8,
} = {}) {
    const rootRef = useRef(null);
    const [progress, setProgress] = useState(0);

    // Progress hesapla (raf ile pürüzsüz)
    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const doc = document.documentElement;
                const max = doc.scrollHeight - doc.clientHeight;
                const p = max > 0 ? window.scrollY / max : 0;
                setProgress(p);
                if (rootRef.current) {
                    rootRef.current.style.setProperty("--progress", String(p));
                }
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    // Native scrollbar’ı gizle/incelet
    useEffect(() => {
        const html = document.documentElement;
        if (hideNative) html.classList.add("hide-native-scrollbar");
        return () => html.classList.remove("hide-native-scrollbar");
    }, [hideNative]);

    // Track’e tıklayınca o konuma git
    const onTrackPointerDown = (e) => {
        if (!rootRef.current) return;
        const track = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - track.left) / track.width;
        scrollToRatio(ratio);
        startDragging(e);
    };

    // Head sürükleme
    const startDragging = (e) => {
        e.preventDefault();
        const onMove = (ev) => {
            if (!rootRef.current) return;
            const track = rootRef.current.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (ev.clientX - track.left) / track.width));
            scrollToRatio(ratio);
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
    };

    const scrollToRatio = (ratio) => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        window.scrollTo({ top: max * ratio, behavior: "smooth" });
    };

    return (
        <div
            ref={rootRef}
            className="saber-scrollbar"
            style={{ zIndex, height }}
            aria-label="Scroll progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
        >
            <div className="saber-track" onPointerDown={onTrackPointerDown} />
            {/* subtle highlight for the scrolled portion */}
            <div className="saber-trail" />
            <div className="saber-fill" />
            <div className="saber-head" onPointerDown={startDragging} />
        </div>
    );
}
