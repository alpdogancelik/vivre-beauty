import { useEffect, useRef, useState, useCallback } from "react";
import ambientTrack from "@/assets/vivresound1.mp3";

const INTERACTION_EVENTS = ["pointerdown", "click", "touchstart", "keydown"];

export default function AmbientAudio() {
    const audioRef = useRef(null);
    const interactionAttachedRef = useRef(false);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const audio = document.createElement("audio");
        audio.src = ambientTrack;
        audio.loop = true;
        audio.preload = "auto";
        audio.autoplay = true;
        audio.muted = false;
        audio.volume = 0.3;
        audio.setAttribute("playsinline", "");
        audio.style.display = "none";
        document.body.appendChild(audio);
        audioRef.current = audio;

        const detachInteractions = () => {
            if (!interactionAttachedRef.current) return;
            INTERACTION_EVENTS.forEach((evt) => document.removeEventListener(evt, handleInteraction, true));
            interactionAttachedRef.current = false;
        };

        const attachInteractions = () => {
            if (interactionAttachedRef.current) return;
            INTERACTION_EVENTS.forEach((evt) => document.addEventListener(evt, handleInteraction, true));
            interactionAttachedRef.current = true;
        };

        const tryPlay = () => {
            if (!audioRef.current) return Promise.resolve(false);
            return audioRef.current
                .play()
                .then(() => {
                    detachInteractions();
                    return true;
                })
                .catch((err) => {
                    console.debug("Ambient audio playback blocked, waiting for user interaction", err?.name ?? err);
                    return false;
                });
        };

        async function handleInteraction() {
            const played = await tryPlay();
            if (!played) attachInteractions();
        }

        const handleCanPlay = () => {
            tryPlay().then((played) => {
                if (!played) attachInteractions();
            });
        };

        const handleVisibilityChange = () => {
            if (!audioRef.current) return;
            if (document.hidden) {
                audioRef.current.pause();
            } else {
                tryPlay().then((played) => {
                    if (!played) attachInteractions();
                });
            }
        };

        const handleWindowFocus = () => {
            tryPlay().then((played) => {
                if (!played) attachInteractions();
            });
        };

        audio.addEventListener("canplaythrough", handleCanPlay, { once: true });
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleWindowFocus);

        // İlk deneme (bazı tarayıcılar izin verebilir)
        tryPlay().then((played) => {
            if (!played) attachInteractions();
        });

        return () => {
            audio.removeEventListener("canplaythrough", handleCanPlay);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleWindowFocus);
            detachInteractions();
            audio.pause();
            audio.currentTime = 0;
            document.body.removeChild(audio);
            audioRef.current = null;
        };
    }, []);

    const toggleMute = useCallback(() => {
        const a = audioRef.current;
        if (!a) return;
        const next = !a.muted;
        a.muted = next;
        setMuted(next);
        if (!next) {
            // ensure playback resumes when unmuting
            a.play().catch(() => { });
        }
    }, []);

    return (
        <button
            onClick={toggleMute}
            aria-label={muted ? "Sesi aç" : "Sesi kapat"}
            className="fixed bottom-3 left-3 z-50 p-2 rounded-full bg-stone-900/60 text-white shadow-md backdrop-blur hover:bg-stone-900/70 transition pointer-events-auto"
            style={{ lineHeight: 0 }}
        >
            {/* Simple speaker icon: waves when unmuted, cross when muted */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 L6 9 H3 V15 H6 L11 19 V5 Z" />
                {muted ? (
                    <g>
                        <line x1="16" y1="9" x2="21" y2="14" />
                        <line x1="21" y1="9" x2="16" y2="14" />
                    </g>
                ) : (
                    <g>
                        <path d="M16 9 C17.5 10.5 17.5 13.5 16 15" />
                        <path d="M19 7 C21.5 10 21.5 14 19 17" />
                    </g>
                )}
            </svg>
        </button>
    );
}
