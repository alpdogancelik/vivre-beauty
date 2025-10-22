import React, { useEffect, useRef, useState } from 'react';

// Full-screen entry loader overlay for the home page.
// Uses public assets in /public: /vivre-logo.png and /blueflower.png
// Props:
// - onDone: () => void  // called after loader finishes and fades out
// - durationMs?: number // total duration for progress to reach 100 (default 4000ms)
// - autoClose?: boolean // auto close when progress hits 100 (default true)
//
// Notes:
// - To change text, edit the <text> element below.
// - To change duration, pass durationMs prop from App, e.g. 8000 for 8s.
// - Clicking anywhere closes the loader early.
export default function EntryLoader({ onDone, durationMs = 4000, autoClose = true }) {
    const [hidden, setHidden] = useState(false);
    const [percent, setPercent] = useState(1);
    const progressTimerRef = useRef(null);
    const rootRef = useRef(null);

    useEffect(() => {
        // Drive progress 1% -> 100%
        const total = Math.max(1000, Number(durationMs) || 4000);
        const step = total / 100;
        progressTimerRef.current = setInterval(() => {
            setPercent((p) => {
                if (p >= 100) {
                    clearInterval(progressTimerRef.current);
                    progressTimerRef.current = null;
                    if (autoClose) requestAnimationFrame(() => close());
                    return 100;
                }
                return p + 1;
            });
        }, step);
        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
            }
        };
    }, [durationMs, autoClose]);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const onMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width;
            const ny = (e.clientY - rect.top) / rect.height;
            const px = (nx - 0.5) * 2;
            const py = (ny - 0.5) * 2;
            el.style.setProperty('--px', String(px));
            el.style.setProperty('--py', String(py));
        };
        el.addEventListener('mousemove', onMouseMove);
        return () => el.removeEventListener('mousemove', onMouseMove);
    }, []);

    const close = () => {
        if (hidden) return;
        setHidden(true);
        // allow fade-out transition then unmount via onDone
        setTimeout(() => onDone?.(), 600);
    };

    return (
        <div
            ref={rootRef}
            className={`fixed inset-0 z-[1000] ${hidden ? 'pointer-events-none' : ''}`}
            aria-hidden={!hidden ? undefined : true}
        >
            <style>{`
        .vivre-loader, .vivre-loader__content { position: fixed; top:0; left:0; width:100%; height:100%; }
        .vivre-loader {
          --px: 0; --py: 0;
          background: radial-gradient(1000px 700px at calc(50% + 10px * var(--px)) calc(40% + 10px * var(--py)), #F7EFE5, #EAD4C2 55%, #C8A78E 90%);
          display:flex; align-items:center; justify-content:center; overflow:hidden; z-index:10;
          transition: opacity .8s ease-out, filter .8s ease-out;
        }
        .vivre-loader.hidden { opacity:0; filter: blur(8px); pointer-events:none; }
        .vivre-loader svg { width:60vmin; height:60vmin; }
        .vivre-rotating { animation: vivre-rotateIn 1.2s ease-out forwards; transform-origin:center center; }
        @keyframes vivre-rotateIn { from { transform: rotate(-20deg);} to { transform: rotate(0deg);} }
        .vivre-circle { fill:none; stroke: rgba(255,255,255,.7); stroke-width:2; opacity:0; transform:scale(.8); animation: vivre-circleAppear .8s ease-out forwards; }
        @keyframes vivre-circleAppear { to { opacity:.5; transform: scale(1);} }
        .vivre-petal { fill:none; stroke: rgba(255,255,255,.7); stroke-width:2; opacity:0; animation: vivre-petalAppear .8s ease-out forwards; }
        @keyframes vivre-petalAppear { to { opacity:.5; } }
        .vivre-main-ring { stroke-width:3; fill:none; stroke: rgba(255,255,255,.8); opacity:0; transform:scale(.8); animation: vivre-mainRing 1s ease-out forwards; }
        @keyframes vivre-mainRing { to { opacity:1; transform: scale(1);} }
        .vivre-cta { fill: rgba(255,255,255,.98); font-size:28px; letter-spacing:2px; opacity:0; transform: scale(.96); font-family: 'Segoe UI', Tahoma, sans-serif; font-weight:600; text-shadow:0 0 8px rgba(255,255,255,.85); animation: vivre-ctaAppear .8s .5s ease-out forwards, vivre-ctaPulse 2s 1.3s infinite; }
        @keyframes vivre-ctaAppear { to { opacity:.9; transform: scale(1.02);} }
        @keyframes vivre-ctaPulse { 0%,100% { transform: scale(1.02);} 50% { transform: scale(.96);} }
        .vivre-loader__content { display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; width:100%; height:100%; }
        .vivre-logo { width:20vmin; max-width:180px; margin-bottom:1.5rem; opacity:0; animation: vivre-logoFadeIn 1s .2s ease-out forwards; }
        .vivre-flower-wrap { position:relative; width:25vmin; max-width:200px; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:center; }
        .vivre-flower { width:100%; opacity:0; animation: vivre-flowerAppear 1.2s .5s ease-out forwards, vivre-flowerRotate 8s linear infinite; }
        .vivre-progress { position:absolute; top:50%; left:50%; transform: translate(-50%, -50%); font-size:2rem; font-weight:600; color: rgba(255,255,255,.98); text-shadow:0 0 6px rgba(255,255,255,.85); opacity:0; animation: vivre-progressAppear 1.2s .7s ease-out forwards; }
        @keyframes vivre-logoFadeIn { from { opacity:0; transform: translateY(-30px);} to { opacity:1; transform: translateY(0);} }
        @keyframes vivre-flowerAppear { from { opacity:0; transform: scale(.5);} to { opacity:1; transform: scale(1);} }
        @keyframes vivre-flowerRotate { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes vivre-progressAppear { from { opacity:0; transform: translate(-50%, -50%) scale(.5);} to { opacity:1; transform: translate(-50%, -50%) scale(1);} }
      `}</style>

            <div className={`vivre-loader ${hidden ? 'hidden' : ''}`} onClick={close}>
                <div className="vivre-loader__content">
                    <img className="vivre-logo" src="/vivre-logo.png" alt="Vivre Logo" decoding="async" />
                    <div className="vivre-flower-wrap">
                        <img className="vivre-flower" src="/blueflower.png" alt="Blue Flower" decoding="async" />
                        <div className="vivre-progress" aria-live="polite">{percent}%</div>
                    </div>

                    <svg viewBox="-220 -220 440 440" role="img" aria-label="Vivre loader flower">
                        <g className="vivre-rotating">
                            <ellipse className="vivre-petal" cx="80" cy="0" rx="70" ry="30" transform="rotate(0 80 0)" style={{ animationDelay: '0.3s' }} />
                            <ellipse className="vivre-petal" cx="24.72135955" cy="76.08452130" rx="70" ry="30" transform="rotate(72 24.72135955 76.08452130)" style={{ animationDelay: '0.45s' }} />
                            <ellipse className="vivre-petal" cx="-64.72135955" cy="47.02282018" rx="70" ry="30" transform="rotate(144 -64.72135955 47.02282018)" style={{ animationDelay: '0.6s' }} />
                            <ellipse className="vivre-petal" cx="-64.72135955" cy="-47.02282018" rx="70" ry="30" transform="rotate(216 -64.72135955 -47.02282018)" style={{ animationDelay: '0.75s' }} />
                            <ellipse className="vivre-petal" cx="24.72135955" cy="-76.08452130" rx="70" ry="30" transform="rotate(288 24.72135955 -76.08452130)" style={{ animationDelay: '0.9s' }} />
                        </g>
                        <circle className="vivre-main-ring" cx="0" cy="0" r="112"></circle>
                        <text className="vivre-cta" x="0" y="6" textAnchor="middle" alignmentBaseline="middle">enter the natural beauty</text>
                    </svg>
                </div>
            </div>
        </div>
    );
}
