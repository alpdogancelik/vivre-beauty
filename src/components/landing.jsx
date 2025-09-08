import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
let THREE; // lazy import

export default function Landing({ onFinish = () => { }, brand = "VIVRE", tagline = "Beauty Studio" }) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const [ok, setOk] = useState(false); // WebGL kuruldu mu?

    useEffect(() => {
        let ctx = { stop: () => { } };

        (async () => {
            try {
                // three'ü dinamik yükle
                const mod = await import("three");
                THREE = mod;

                const canvas = canvasRef.current;
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
                const scene = new THREE.Scene();
                const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

                const vertex = `
          precision highp float;
          attribute vec3 position;
          void main(){ gl_Position = vec4(position,1.0); }
        `;
                const fragment = `
          precision highp float;
          uniform vec2 uResolution; uniform float uTime; uniform float uProgress;
          vec3 colA = vec3(250.0,247.0,242.0)/255.0; // #FAF7F2
          vec3 colB = vec3(238.0,227.0,218.0)/255.0; // #EEE3DA
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
          void main(){
            vec2 uv = gl_FragCoord.xy / uResolution.xy; uv.y = 1.0 - uv.y;
            vec3 base = mix(colA, colB, smoothstep(0.0,1.0,uv.y));
            float vig = smoothstep(1.2, 0.5, distance(uv, vec2(0.5,0.45)));
            base *= vig; base += (hash(uv*800.0)-0.5)*0.015;
            float r = distance(uv, vec2(0.5,0.5));
            float reveal = smoothstep(0.0,1.1,uProgress);
            float ring = smoothstep(reveal, reveal-0.003, r);
            vec3 color = base + ring*0.08 + smoothstep(reveal-0.12, reveal-0.13, r)*0.02;
            gl_FragColor = vec4(color,1.0);
          }
        `;
                const uniforms = {
                    uResolution: { value: new THREE.Vector2(1, 1) },
                    uTime: { value: 0 },
                    uProgress: { value: 0 },
                };
                const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
                const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
                scene.add(mesh);

                const setSize = () => {
                    const w = wrapRef.current.clientWidth, h = wrapRef.current.clientHeight;
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    renderer.setSize(w, h, false);
                    uniforms.uResolution.value.set(w, h);
                };
                setSize(); window.addEventListener("resize", setSize);

                let raf;
                const tick = (t) => { uniforms.uTime.value = t * 0.001; renderer.render(scene, camera); raf = requestAnimationFrame(tick); };
                raf = requestAnimationFrame(tick);

                ctx.stop = () => {
                    cancelAnimationFrame(raf); window.removeEventListener("resize", setSize);
                    mesh.geometry.dispose(); mat.dispose(); renderer.dispose();
                };

                setOk(true); // WebGL kuruldu

                // GSAP intro
                gsap.timeline({ defaults: { ease: "power2.out" } })
                    .fromTo(wrapRef.current.querySelector(".brand"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
                    .fromTo(wrapRef.current.querySelector(".tag"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "<0.15")
                    .to(uniforms.uProgress, { value: 0.95, duration: 1.6 }, "+=0.3")
                    .to(wrapRef.current, { opacity: 0, duration: 0.6, pointerEvents: "none", onComplete: onFinish });

            } catch (e) {
                console.error("Landing init failed:", e);
                // WebGL yoksa 3 saniyelik CSS fallback ve sonra kapan
                gsap.timeline()
                    .fromTo(wrapRef.current.querySelector(".brand"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
                    .fromTo(wrapRef.current.querySelector(".tag"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "<0.1")
                    .to(wrapRef.current, { opacity: 0, duration: 0.5, delay: 2, onComplete: onFinish });
            }
        })();

        return () => ctx.stop();
    }, [onFinish]);

    return (
        <div ref={wrapRef} className="fixed inset-0 z-[9999] bg-[#faf7f2] select-none">
            {/* WebGL varsa canvas üstte çalışır; yoksa bu arka plan kalır */}
            <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${ok ? "" : "opacity-0"}`} />
            <div className="relative h-full w-full grid place-items-center">
                <div className="text-center">
                    <div className="brand text-5xl md:text-7xl tracking-tight text-stone-900" style={{ fontFamily: "Prata, serif" }}>
                        {brand}
                    </div>
                    <div className="tag mt-3 text-stone-600 text-sm md:text-base">
                        {tagline}
                    </div>
                </div>
            </div>
        </div>
    );
}
