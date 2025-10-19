// src/lib/useReducedMotion.js
import { useEffect, useState } from "react";

export function useReducedMotion() {
    const getPref = () =>
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const [prefers, setPrefers] = useState(getPref);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setPrefers(mq.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);
        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange);
            else mq.removeListener(onChange);
        };
    }, []);

    return prefers;
}

export default useReducedMotion;
