// src/lib/useIntersection.js
import { useEffect, useState } from "react";

/**
 * useIntersection(ref, options) -> { inView, ratio }
 * ref: React.useRef(domEl)
 * options: IntersectionObserver options (root, rootMargin, threshold)
 */
export function useIntersection(ref, options = {}) {
    const [state, setState] = useState({ inView: false, ratio: 0 });

    useEffect(() => {
        const el = ref?.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            // Eski tarayıcı/SSR: görünür varsay
            setState({ inView: true, ratio: 1 });
            return;
        }

        const obs = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setState({
                    inView: !!entry.isIntersecting,
                    ratio: typeof entry.intersectionRatio === "number" ? entry.intersectionRatio : 0,
                });
            },
            {
                root: options.root ?? null,
                rootMargin: options.rootMargin ?? "0px",
                threshold: options.threshold ?? 0,
            }
        );

        obs.observe(el);
        return () => obs.disconnect();
        // threshold array’ı değişimini yakalamak için stringify
    }, [ref, options.root, options.rootMargin, JSON.stringify(options.threshold)]);

    return state;
}

export default useIntersection;
