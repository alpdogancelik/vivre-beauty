import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import html2canvas from "html2canvas";
import imagesLoaded from "imagesloaded";

// Scroll ile parçalanıp yok olma efekti (disintegration)
// Kullanım: <Disappear targetRef={imgRef} triggerRef={sectionRef} />

gsap.registerPlugin(ScrollTrigger);

export default function Disappear({
    targetRef, // Hedef DOM (ör: portrait <img>)
    triggerRef, // ScrollTrigger için bölüm kapsayıcısı
    count = 75,
    repeatCount = 3,
    start = "top+=120 center",
    end = () => window.innerHeight * 2,
    once = true,
}) {
    const inited = useRef(false);
    const createdNodes = useRef([]);
    const stRef = useRef(null);

    useEffect(() => {
        const el = targetRef?.current;
        const triggerEl = triggerRef?.current || el;
        if (!el || !triggerEl) return;

        // Hedef görüntü tamamen yüklensin
        const waitImages = () => new Promise((resolve) => {
            const imgs = el.tagName === 'IMG' ? [el] : Array.from(el.querySelectorAll('img'));
            if (!imgs.length) return resolve();
            const il = imagesLoaded(imgs);
            il.on('done', resolve);
            il.on('fail', resolve);
        });

        const createEffect = async () => {
            if (inited.current) return;
            inited.current = true;
            await waitImages();

            // Ekrandaki konumu al ki canvase aynı yere yerleşsin
            const rect = el.getBoundingClientRect();

            const baseCanvas = await html2canvas(el, {
                backgroundColor: null,
                useCORS: true,
                scale: Math.min(2, window.devicePixelRatio || 1),
            });

            const width = baseCanvas.width;
            const height = baseCanvas.height;
            const ctx = baseCanvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, width, height);
            const dataList = [];

            for (let i = 0; i < count; i++) dataList.push(ctx.createImageData(width, height));

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    for (let l = 0; l < repeatCount; l++) {
                        const index = (x + y * width) * 4;
                        const dataIndex = Math.floor((count * (Math.random() + (2 * x) / width)) / 3);
                        for (let p = 0; p < 4; p++) dataList[dataIndex].data[index + p] = imageData.data[index + p];
                    }
                }
            }

            // Orijinali gizle (stacking/flicker olmasın)
            el.style.visibility = 'hidden';

            // Her parçayı DOM'a ekle ve ScrollTrigger ile animasyonla
            dataList.forEach((data, i) => {
                const cloned = baseCanvas.cloneNode();
                cloned.getContext('2d').putImageData(data, 0, 0);
                cloned.className = 'capture-canvas';
                Object.assign(cloned.style, {
                    position: 'fixed',
                    left: rect.left + 'px',
                    top: rect.top + 'px',
                    width: rect.width + 'px',
                    height: rect.height + 'px',
                    pointerEvents: 'none',
                    willChange: 'transform, opacity',
                    transform: 'translate3d(0,0,0)',
                    zIndex: 20,
                });
                document.body.appendChild(cloned);
                createdNodes.current.push(cloned);

                const ra = (Math.random() - 0.5) * 2 * Math.PI;
                const rot = 30 * (Math.random() - 0.5);

                gsap.to(cloned, {
                    rotate: rot,
                    x: 40 * Math.sin(ra),
                    y: 40 * Math.cos(ra),
                    opacity: 0,
                    ease: 'power1.out',
                    scrollTrigger: {
                        trigger: triggerEl,
                        start,
                        end,
                        scrub: 1,
                    },
                    delay: (i / dataList.length) * 2,
                    duration: 1,
                });
            });
        };

        // Scroll'a bağla; bir kez tetiklensin
        stRef.current = ScrollTrigger.create({
            trigger: triggerEl,
            start,
            onEnter: () => createEffect(),
            once,
        });

        return () => {
            try { stRef.current?.kill?.(); } catch (_) { }
            createdNodes.current.forEach((n) => n.remove());
            createdNodes.current = [];
            el.style.visibility = '';
        };
    }, [targetRef, triggerRef, count, repeatCount, start, end, once]);

    return null;
}
