import React, { useEffect, useRef } from "react";
import VivreMetallic from "@features/MetallicPaint/VivreMetallic.jsx";
import TextType from "@/components/TextType.jsx";

/**
 * SpotlightHero — mouse-follow spotlight over a portrait image.
 *
 * Props:
 * - src: image URL (public path). Default: "/images/hero/model.jpg"
 * - alt: alt text
 * - strength: 0.6–1.6 recommended
 * - size: spotlight diameter in vmin (e.g. 40–60)
 * - className: extra classes for root container
 */
export default function SpotlightHero({
    src = "/images/hero/model2.png",
    alt = "Vivre Beauty",
    strength = 0.5,
    size = 28,
    rx = 22, // ellipse horizontal radius in vmin
    ry = 12, // ellipse vertical radius in vmin
    className = "",
    align = 'right', // 'right' | 'center'
    showContent = true,
    showMetallic = true,
    interactiveLight = true,
    eyebrow = 'VIVRE',
    heading = 'Yeniden başlamanın en doğal yolu.',
    description = 'Vivre, yeniden başlamak isteyenler için doğal merkezine alan, insan sağlığını önceleyen bir bakım yaklaşımı sunar. Gereksiz kimyasal yükten arındırılmış protokollerimiz, bağımsız test ve şeffaf içerik politikasıyla desteklenir. Daha az işlemle, ölçülebilir ve sürdürülebilir sonuçlar hedefler; cildi yormadan iyi oluşa dönmeyi kolaylaştırır.',
}) {
    const rootRef = useRef(null);
    const imgRef = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const lerpPos = useRef({ x: 0, y: 0 });
    const raf = useRef(0);
    const lastPointer = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!interactiveLight) return; // spotlight kapalıysa hiçbir listener ekleme
        const el = rootRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        lerpPos.current.x = rect.width / 2;
        lerpPos.current.y = rect.height / 2;
        el.style.setProperty("--x", `${lerpPos.current.x}px`);
        el.style.setProperty("--y", `${lerpPos.current.y}px`);
        el.style.setProperty("--size", `${size}vmin`);
        el.style.setProperty("--strength", String(strength));
        el.style.setProperty("--rx", `${rx}vmin`);
        el.style.setProperty("--ry", `${ry}vmin`);
        el.style.setProperty("--angle", `0deg`);

        const onMove = (e) => {
            const containerRect = el.getBoundingClientRect();
            const imgRect = imgRef.current?.getBoundingClientRect?.() || containerRect;
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
            // Clamp to image bounds so ışık portre dışına taşmaz
            const clampedX = Math.max(imgRect.left, Math.min(clientX, imgRect.right));
            const clampedY = Math.max(imgRect.top, Math.min(clientY, imgRect.bottom));
            pos.current.x = clampedX - containerRect.left;
            pos.current.y = clampedY - containerRect.top;
            // pointer yönünden açı hesapla (derece)
            const dx = clampedX - lastPointer.current.x;
            const dy = clampedY - lastPointer.current.y;
            if (dx !== 0 || dy !== 0) {
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                el.style.setProperty("--angle", `${angle}deg`);
                lastPointer.current.x = clampedX;
                lastPointer.current.y = clampedY;
            }
        };
        // content moved to JSX return below

        const onLeave = () => {
            const r = el.getBoundingClientRect();
            pos.current.x = r.width / 2;
            pos.current.y = r.height / 2;
        };

        const tick = () => {
            const s = 0.12; // smoothing factor
            lerpPos.current.x += (pos.current.x - lerpPos.current.x) * s;
            lerpPos.current.y += (pos.current.y - lerpPos.current.y) * s;
            el.style.setProperty("--x", `${lerpPos.current.x}px`);
            el.style.setProperty("--y", `${lerpPos.current.y}px`);
            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);

        el.addEventListener("pointermove", onMove, { passive: true });
        el.addEventListener("pointerenter", onMove, { passive: true });
        el.addEventListener("pointerleave", onLeave, { passive: true });
        el.addEventListener("touchstart", onMove, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: true });

        return () => {
            cancelAnimationFrame(raf.current);
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerenter", onMove);
            el.removeEventListener("pointerleave", onLeave);
            el.removeEventListener("touchstart", onMove);
            el.removeEventListener("touchmove", onMove);
        };
    }, [size, strength, interactiveLight]);

    const onImgError = (e) => {
        // graceful fallback if the portrait isn't available yet
        if (e?.target) {
            const current = e.target.src || "";
            // Avoid infinite loop by checking if already tried fallback
            if (!current.includes("model2.png")) {
                e.target.src = "/model2.png"; // existing asset in public/
            }
        }
    };

    return (
        <section
            ref={rootRef}
            className={`spotlight-hero relative isolate h-[100svh] w-full overflow-hidden bg-transparent ${className}`}
            aria-label="Interactive spotlight"
        >
            {/* Global ultra-thin glass veneer over the hero (very subtle) */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-4 md:inset-6 -z-10 rounded-[28px] bg-white/7 border border-white/10 backdrop-blur-[3px] backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_20px_60px_-40px_rgba(255,255,255,0.35)]"
            />
            {/* Left content (text) */}
            {showContent && (
                <div className="absolute inset-y-0 left-0 z-20 flex items-center">
                    <div className="relative px-6 md:px-12 py-6 max-w-[760px] text-left space-y-5">
                        <div className="uppercase tracking-[0.45em] text-[10px] md:text-xs text-white/70">{eyebrow}</div>
                        <TextType
                            as="h1"
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-tight font-light text-white"
                            text={heading}
                            typingSpeed={60}
                            deletingSpeed={60}
                            pauseDuration={1500}
                            cursorBlinkDuration={0.5}
                            showCursor={false}
                            cursorCharacter="|"
                            loop={false}
                        />
                        <TextType
                            as="p"
                            className="text-sm md:text-base lg:text-lg leading-relaxed text-white/80"
                            text={description}
                            typingSpeed={60}
                            deletingSpeed={60}
                            pauseDuration={1500}
                            cursorBlinkDuration={0.5}
                            showCursor={false}
                            cursorCharacter="|"
                            loop={false}
                        />
                    </div>
                </div>
            )}

            <img
                src={src}
                alt={alt}
                onError={onImgError}
                className={`spotlit-img pointer-events-none select-none absolute z-10 ${align === 'right'
                    ? 'top-1/2 -translate-y-1/2 right-0 h-full w-auto object-contain'
                    : 'inset-0 m-auto h-full w-auto object-contain'
                    }`}
                ref={imgRef}
                style={!interactiveLight ? { filter: 'none' } : undefined}
                draggable={false}
            />

            {/* Metallic Vivre logo near the model */}
            {showMetallic && (
                <div className="pointer-events-none absolute top-8 inset-x-0 z-30 hidden md:flex items-start justify-center">
                    <VivreMetallic src="/vivre-logo.svg" width="18vw" />
                </div>
            )}

            {interactiveLight && (
                <>
                    <div className="spotlight-layer pointer-events-none absolute inset-0" />
                    {/* Elliptical, regional light (subtle) */}
                    <div className="light-ellipse pointer-events-none absolute" aria-hidden />
                    <div className="lamp-dot pointer-events-none absolute" aria-hidden />
                </>
            )}
        </section>
    );
}
