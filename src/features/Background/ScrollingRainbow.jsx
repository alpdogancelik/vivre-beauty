import React, { useEffect, useRef } from "react";

// Scrolling rainbow gradient background effect
export default function ScrollingRainbow() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        let offset = 0;
        const animate = () => {
            offset += 0.5;
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `hsl(${(offset + 0) % 360}, 70%, 60%)`);
            gradient.addColorStop(0.5, `hsl(${(offset + 120) % 360}, 70%, 60%)`);
            gradient.addColorStop(1, `hsl(${(offset + 240) % 360}, 70%, 60%)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-30" />;
}
