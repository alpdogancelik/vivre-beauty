import { useEffect, useRef, useState } from 'react';

export function useInView(options = { root: null, rootMargin: '0px', threshold: 0.15 }) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                obs.unobserve(entry.target); // reveal once
            }
        }, options);
        obs.observe(el);
        return () => obs.disconnect();
    }, [options]);

    return [ref, inView];
}

export default useInView;
