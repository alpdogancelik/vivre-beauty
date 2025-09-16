import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
let THREE; // lazy import

// add styles/constants/hook for sections & projects
import styles from './LandingPage.module.css';
import { SECTIONS } from '../../constants/sections';
import { PROJECTS } from '../../constants/projects';
import { useInView } from '../../hooks/useInView';
import GradualBlur from '../../shared/ui/GradualBlur';
const ENABLE_GRADUAL_BLUR = false;

// Cards (kept minimal, leveraging CSS module)
function SectionCard({ s }) {
    const [ref, inView] = useInView();
    return (
        <article
            ref={ref}
            className={`${styles.card} ${styles.reveal} ${inView ? styles.visible : ''}`}
            style={{ '--h': s.theme?.hue ?? 24 }}
        >
            <div className={styles.cardBody}>
                <div style={{ color: '#9ca3af', fontWeight: 600, fontSize: 12 }}>{s.no}</div>
                <h3 className={`${styles.cardTitle} shiny-text animate-shine`}>{s.title}</h3>
                <p className={styles.cardBlurb}>{s.blurb}</p>
                <a href={s.href} className={styles.cardCta}>{s.cta}</a>
            </div>
        </article>
    );
}

function ProjectCard({ p }) {
    const [ref, inView] = useInView();
    const kpiText = p?.kpis ? Object.entries(p.kpis).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' • ') : null;
    return (
        <article
            ref={ref}
            className={`${styles.projectCard} ${styles.reveal} ${inView ? styles.visible : ''}`}
            style={{ '--accent': p.theme?.accent || '#e5e5e5' }}
        >
            <img className={styles.projectMedia} src={p.cover} alt={p.title} loading="lazy" />
            {/* subtle hover preview */}
            <img className={styles.hoverPreview} src={p.cover} alt="" aria-hidden="true" />
            <div className={styles.projectBody}>
                <div className={styles.metaRow}>
                    <span className={styles.chip} />
                    <h4 className={`${styles.projectTitle} shiny-text animate-shine`}>{p.title}</h4>
                </div>
                <div className={styles.metaRow}>
                    <div className={styles.projectMeta}>
                        <span>{p.client}</span>
                        <span>•</span>
                        <span>{p.year}</span>
                    </div>
                    {kpiText ? <span className={styles.kpiRight}>{kpiText}</span> : null}
                </div>
            </div>
        </article>
    );
}

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
        <>
            <div ref={wrapRef} className="fixed inset-0 z-[9999] bg-[#faf7f2] select-none">
                {/* WebGL varsa canvas üstte çalışır; yoksa bu arka plan kalır */}
                <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${ok ? "" : "opacity-0"}`} />
                <div className="relative h-full w-full grid place-items-center">
                    <div className="text-center">
                        <div className="brand text-5xl md:text-7xl tracking-tight text-stone-900 shiny-text animate-shine" style={{ fontFamily: "Prata, serif" }}>
                            {brand}
                        </div>
                        <div className="tag mt-3 text-stone-600 text-sm md:text-base">
                            {tagline}
                        </div>
                    </div>
                </div>
            </div>

            <main>
                {/* Sections */}
                <section style={{ padding: '32px 20px 18px' }}>
                    <div className={`${styles.sectionGrid} ${styles.stagger}`}>
                        {SECTIONS.map((s) => (
                            <SectionCard key={s.id} s={s} />
                        ))}
                    </div>
                </section>

                {/* Projects */}
                <section style={{ padding: '24px 20px 48px' }}>
                    <div className={`${styles.projectGrid} ${styles.stagger}`}>
                        {PROJECTS.map((p) => <ProjectCard key={p.id} p={p} />)}
                    </div>
                </section>

                {/* Demo: Gradual blur at bottom of page content */}
                {ENABLE_GRADUAL_BLUR && (
                    <section style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
                        <div style={{ height: '100%', overflowY: 'auto', padding: '3rem 1.5rem' }}>
                            {/* ...existing content or placeholder... */}
                            <p style={{ maxWidth: 680, color: '#4b5563' }}>
                                {/* ...existing code... */}
                                This area demonstrates the GradualBlur component. Scroll or hover to see the effect.
                            </p>
                            <div style={{ height: 900 }} />
                        </div>
                        <GradualBlur
                            target="parent"
                            position="bottom"
                            height="6rem"
                            strength={2}
                            divCount={5}
                            curve="bezier"
                            exponential={true}
                            opacity={1}
                        />
                    </section>
                )}
            </main>
        </>
    );
}
