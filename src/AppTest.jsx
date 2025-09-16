import React, { useEffect, useRef, useState, Suspense, useCallback, useMemo } from "react";
import Hero from "@pages/Hero/Hero.jsx";
import Sidebar from "@features/Sidebar/Sidebar.jsx";
import FeatureCard from "@features/FeatureCard/FeatureCard.jsx";
import FAQ from "@pages/FAQ/FAQ.jsx";
import WorkList from "@features/WorkList/WorkList.jsx";
import LandingVideo from "@features/LandingVideo/LandingVideo.jsx";
import LogoEntrance from "@features/LogoEntrance/LogoEntrance.jsx";
import Booking from "@/pages/Booking/Booking.jsx";
// import { gsap } from 'gsap';
import { SECTIONS as RAW_SECTIONS } from "./constants/sections.jsx";
import { PROJECTS as RAW_PROJECTS } from "./constants/projects.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/quality.css"; // kalite iyileştirmeleri

// Lazy-load heavy modules
const PixelCursor = React.lazy(() => import("@features/PixelCursor/PixelCursor.jsx"));
const LiquidEtherOriginal = React.lazy(() => import("@features/Background/LiquidEther.jsx"));
const Iridescence = React.lazy(() => import("@features/Background/Iridescence.jsx"));
const SkinAI = React.lazy(() => import("@features/SkinAI/SkinAI.jsx"));
const MakeupTryOn = React.lazy(() => import("@features/MakeupTryOn/MakeupTryOn.jsx"));

const SECTIONS = Array.isArray(RAW_SECTIONS) && RAW_SECTIONS.length
  ? RAW_SECTIONS
  : [{ id: "home", no: "00", title: "Vivre", blurb: "" }];
const PROJECTS = Array.isArray(RAW_PROJECTS) ? RAW_PROJECTS : [];

// Swallow-only boundary for background visual; avoids user-facing error box
class SilentBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // no-op; keep console clean or log if desired
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// Fix experimental-web-gl typo in WebGL support probe
function __apptest_canCreateWebGLContext() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const opts = { alpha: true, antialias: true, depth: true, powerPreference: 'high-performance', desynchronized: true };
    const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    if (!gl) return false;
    try { gl.getExtension && gl.getExtension('WEBGL_lose_context')?.loseContext?.(); } catch (_) { }
    return true;
  } catch (_) { return false; }
}

function SafeLiquidEther({ Inner, ...props }) {
  // Pass-through to avoid wrapper side-effects while keeping code intact
  return <Inner {...props} />;
  // The original logic below remains for reference but is not executed.
  /*
  const [blocked, setBlocked] = React.useState(false);
  const [supported, setSupported] = React.useState(true);
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    setSupported(__apptest_canCreateWebGLContext());
  }, []);

  React.useEffect(() => {
    // Try to bind to a specific canvas when available
    const c = canvasRef.current;
    const onLost = (e) => { try { e?.preventDefault?.(); } catch (_) {} setBlocked(true); };
    if (c) c.addEventListener('webglcontextlost', onLost, { passive: false });
    // Also listen at the document level to catch contexts created internally
    document.addEventListener('webglcontextlost', onLost, { passive: false });
    return () => {
      try { if (c) c.removeEventListener('webglcontextlost', onLost); } catch (_) {}
      try { document.removeEventListener('webglcontextlost', onLost); } catch (_) {}
    };
  }, []);

  React.useEffect(() => {
    return () => {
      // On unmount, aggressively release any WebGL contexts to avoid budget exhaustion in dev
      try {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        for (const c of canvases) {
          const gl = c.getContext && (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-web-gl'));
          if (gl && gl.getExtension) {
            const lose = gl.getExtension('WEBGL_lose_context');
            if (lose && lose.loseContext) lose.loseContext();
          }
        }
      } catch (_) {}
    };
  }, []);

  if (!supported || blocked) return null;
  return <Inner canvasRef={canvasRef} {...props} />;
  */
}

const LiquidEther = (props) => (
  <SilentBoundary>
    <Suspense fallback={null}>
      <SafeLiquidEther Inner={LiquidEtherOriginal} {...props} />
    </Suspense>
  </SilentBoundary>
);

if (typeof window !== 'undefined' && import.meta && import.meta.hot) {
  try {
    import.meta.hot.dispose(() => {
      try {
        document.querySelectorAll('canvas').forEach((c) => {
          const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
          if (gl && gl.getExtension) {
            const lose = gl.getExtension('WEBGL_lose_context');
            if (lose && lose.loseContext) lose.loseContext();
          }
        });
      } catch (_) { }
    });
  } catch (_) { }
}

// Mount-gate for camera modules (once per session)
function DeferMount({ storageKey = "camera_enabled", title = "Kamerayı Başlat", children }) {
  const isClient = typeof window !== "undefined";
  const [enabled, setEnabled] = React.useState(() =>
    isClient ? sessionStorage.getItem(storageKey) === "1" : false
  );
  useEffect(() => {
    if (isClient && enabled) sessionStorage.setItem(storageKey, "1");
  }, [enabled, isClient]);
  if (!enabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium"
      >
        {title}
      </button>
    );
  }
  return children;
}

export default function App() {
  const isClient = typeof window !== "undefined" && typeof sessionStorage !== "undefined";
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [active, setActive] = useState(SECTIONS[0]?.id || "home");
  const [showLanding, setShowLanding] = useState(() => (isClient ? !sessionStorage.getItem("landingSeen") : false));
  const [showLogo, setShowLogo] = useState(() => (isClient ? !sessionStorage.getItem("logoSeen") : false));
  const [navOpen, setNavOpen] = useState(false);
  // + eklenen
  const [isMobile, setIsMobile] = useState(false);
  // + yüksek çözünürlük kontrolü
  const [dpr, setDpr] = useState(() => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1));
  // + PixelCursor remount anahtarı
  const pixelCursorKey = useMemo(() => `pc-${Math.round((dpr || 1) * 100)}`, [dpr]);

  const refs = useRef(Object.fromEntries(SECTIONS.map(s => [s.id, { el: null }])));

  useEffect(() => {
    if (!SECTIONS?.length) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
    );
    SECTIONS.forEach(s => refs.current[s.id]?.el && io.observe(refs.current[s.id].el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      navbar?.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Esc ile menüyü kapat
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setNavOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const finishLanding = () => {
    if (isClient) sessionStorage.setItem("landingSeen", "1");
    setShowLanding(false);
  };
  const finishLogo = () => {
    if (isClient) sessionStorage.setItem("logoSeen", "1");
    setShowLogo(false);
  };

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Global Contact/Booking click handler (smooth scroll if #contact exists)
  const handleGlobalContactClick = useCallback((e) => {
    try {
      const sel = '#contact';
      const el = document.querySelector(sel);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Anchor yoksa hash'e yönlendir
        window.location.hash = sel;
      }
    } catch (_) { /* no-op */ }
  }, []);

  // Hide small fixed badges: left slide counter (e.g., 1/3) and right 'Otomatik' pill
  useEffect(() => {
    try {
      const nodes = Array.from(document.querySelectorAll('a,button,div,span'));
      const hide = (el) => { el.style.display = 'none'; el.setAttribute('data-hidden-by-apptest', 'true'); };
      const vw = window.innerWidth || 0;
      for (const el of nodes) {
        const style = window.getComputedStyle(el);
        if (style.position !== 'fixed') continue;
        const rect = el.getBoundingClientRect?.() || { top: 0, left: 0, width: 0, height: 0 };
        const text = (el.textContent || '').trim().toLowerCase();
        // Left badge like "1 / 3"
        const isTopLeft = rect.top >= 0 && rect.top < 120 && rect.left >= 0 && rect.left < 160;
        if (isTopLeft && /\d+\s*\/\s*\d+/.test(text)) { hide(el); continue; }
        // Right pill with 'Otomatik'
        const isTopRight = rect.top >= 0 && rect.top < 120 && rect.left > vw - 260;
        if (isTopRight && text.includes('otomatik')) { hide(el); continue; }
      }
    } catch { /* no-op */ }
  }, []);

  useEffect(() => {
    document.body.classList.add('shiny-all');
    document.body.classList.add('shiny-fast');
    document.body.classList.add('shiny-ultrafast');
    return () => {
      document.body.classList.remove('shiny-all');
      document.body.classList.remove('shiny-fast');
      document.body.classList.remove('shiny-ultrafast');
    };
  }, []);

  // + viewport breakpoint takibi
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // + global kalite sınıfı
  useEffect(() => {
    document.body.classList.add('quality-upscale');
    return () => document.body.classList.remove('quality-upscale');
  }, []);

  // + style enjeksiyonu (canvas kalite ipucu)
  useEffect(() => {
    const id = 'hires-canvas-style';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      [data-hq-bg] canvas { image-rendering: optimizeQuality; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById(id)?.remove();
  }, []);

  // + canvas yeniden boyutlandırma (Iridescence render olduktan sonra)
  useEffect(() => {
    const target = Math.min(isMobile ? 1.6 : 2.5, dpr || 1);
    // Biraz gecikme: bileşen canvasi mount edilsin
    const t = setTimeout(() => {
      document.querySelectorAll('[data-hq-bg] canvas')
        .forEach(c => {
          if (!c || c.dataset.hiresApplied === '1') return;
            const rect = c.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            // Eğer canvas CSS ile scale ediliyorsa width attribute'ları yetersiz kalır
            const desiredW = Math.round(rect.width * target);
            const desiredH = Math.round(rect.height * target);
            // Değişiklik yoksa atla
            if (c.width === desiredW && c.height === desiredH) {
              c.dataset.hiresApplied = '1';
              return;
            }
            c.width = desiredW;
            c.height = desiredH;
            c.style.width = rect.width + 'px';
            c.style.height = rect.height + 'px';
            const ctx = c.getContext('2d');
            if (ctx && !c.dataset.ctxScaled) {
              try { ctx.scale(target, target); c.dataset.ctxScaled = '1'; } catch(_) {}
            }
            c.dataset.hiresApplied = '1';
        });
    }, 40);
    return () => clearTimeout(t);
  }, [dpr, isMobile, active]);

  return (
    <ErrorBoundary>
    <div className="bg-transparent text-stone-900 min-h-screen relative">
        {/* Global Iridescence background (behind everything) */}
        <div className="fixed inset-0 -z-10 opacity-90 pointer-events-none" data-hq-bg>
          <Suspense fallback={null}>
            {/* eski versiyon yorum içinde korunuyor */}
            {/* <Iridescence speed={0.55} amplitude={0.08} mouseReact={!isMobile} maxDpr={Math.min(2, (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1)} quality="high" /> */}
            <Iridescence
              speed={0.55}
              amplitude={0.085}
              mouseReact={!isMobile}
              maxDpr={Math.min(isMobile ? 1.6 : 2.5, dpr)}
              internalResolution={isMobile ? 0.9 : 1}
              quality="ultra"
              allowSoftware={true}
              respectReducedMotion={false}
            />
          </Suspense>
        </div>
        {/* Floating decorative elements */}
        {/* eski blur noktalar:
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="floating-element absolute top-20 left-10 w-4 h-4 bg-rose-200/40 rounded-full blur-sm"></div>
          <div className="floating-element absolute top-40 right-16 w-6 h-6 bg-amber-200/30 rounded-full blur-sm"></div>
          <div className="floating-element absolute top-60 left-1/3 w-3 h-3 bg-orange-200/50 rounded-full blur-sm"></div>
          <div className="floating-element absolute bottom-40 right-20 w-5 h-5 bg-rose-300/30 rounded-full blur-sm"></div>
          <div className="floating-element absolute bottom-60 left-20 w-4 h-4 bg-amber-300/40 rounded-full blur-sm"></div>
          <div className="floating-element absolute top-1/3 right-1/4 w-2 h-2 bg-stone-300/60 rounded-full blur-sm"></div>
        </div>
        */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="floating-element fx-dot dot-sm" style={{ top: '5rem', left: '2.5rem' }} />
          <div className="floating-element fx-dot dot-lg" style={{ top: '10rem', right: '4rem' }} />
            <div className="floating-element fx-dot dot-xs" style={{ top: '15rem', left: '33%' }} />
          <div className="floating-element fx-dot dot-md" style={{ bottom: '10rem', right: '5rem' }} />
          <div className="floating-element fx-dot dot-sm" style={{ bottom: '15rem', left: '5rem' }} />
          <div className="floating-element fx-dot dot-xxs" style={{ top: '30%', right: '25%' }} />
        </div>

        {/* PixelCursor (yeniden etkin / yüksek DPI) */}
        {/* eski:
        <Suspense fallback={null}>
          <PixelCursor />
        </Suspense>
        */}
        <Suspense fallback={null}>
          <PixelCursor key={pixelCursorKey} dpr={Math.min(2, dpr)} highQuality />
        </Suspense>

        {showLogo && <LogoEntrance onComplete={finishLogo} />}
        {showLanding && <LandingVideo onFinish={finishLanding} />}

        {/* Global: Üst-ortada sabit ve büyük Contact/Booking butonu */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <a
            href="#contact"
            onClick={handleGlobalContactClick}
            className="px-5 py-2 rounded-full border bg-rose-50/90 backdrop-blur-md text-stone-800 text-base sm:text-lg font-medium hover:bg-rose-100 transition shadow-md"
            style={{ boxShadow: '0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)' }}
          >
            Contact / Booking
          </a>
        </div>

        <a
          href="#contact"
          className="fixed right-5 bottom-5 z-50 px-5 py-3 rounded-full bg-gradient-to-r from-rose-200 to-amber-100 text-stone-800 text-base font-medium shadow-xl border border-rose-200/50 shimmer-btn shimmer-btn-nude hover:from-rose-300 hover:to-amber-200 transition-all duration-300"
        >
          Randevu Al
        </a>

        {/* Üst-orta Contact/Booking kısayolu (devre dışı) */}
        {false && (
          <div className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-[55] items-center gap-2">
            <a
              href="#contacto-booking"
              className="px-3 py-1.5 rounded-full border bg-rose-50/80 backdrop-blur-md text-stone-700 text-sm hover:bg-rose-100 transition shadow-sm"
            >
              Contact / Booking
            </a>
          </div>
        )}

        {/* Masaüstü için menü toggle (devre dışı) */}
        {false && (
          <button
            onClick={() => setNavOpen(v => !v)}
            className="hidden lg:flex fixed top-4 right-4 z-[60] px-4 py-2 text-base border rounded-full bg-rose-50/80 backdrop-blur-md hover:bg-rose-100 transition shadow-sm"
            aria-label="Menüyü aç/kapat"
          >
            {navOpen ? "Kapat" : "Menü"}
          </button>
        )}

        {/* Açılır-kapanır sidebar (devre dışı) */}
        {false && (
          <Sidebar
            sections={SECTIONS}
            active={active}
            onNav={scrollTo}
            open={navOpen}
            onClose={() => setNavOpen(false)}
          />
        )}

        {/* Mobil üst bar */}
        <header className="navbar lg:hidden sticky top-0 z-40 bg-rose-50/80 backdrop-blur-md border-b border-rose-200/40 transition-all duration-300">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* ...existing code... */}
            <div className="flex items-center space-x-2">
              <img
                src="/vivre-logo-real.png"
                srcSet="/vivre-logo-real.png 1x, /vivre-logo-real@2x.png 2x, /vivre-logo-real@3x.png 3x"
                sizes="(max-width: 768px) 72px, 96px"
                alt="Vivre Beauty"
                className="h-16 w-auto logo-smooth select-none"
                decoding="async"
                loading="lazy"
                draggable="false"
              />
            </div>
            <div className="text-xs text-stone-600">Beauty Studio</div>
          </div>
        </header>

        {/* İçerik */}
        <main className={`transition-[margin] duration-300 ${navOpen ? "lg:mr-56" : "lg:mr-0"}`}>
          <ErrorBoundary>
            <Hero />
          </ErrorBoundary>

          {SECTIONS.map((s) => (
            <section
              id={s.id}
              key={s.id}
              ref={el => (refs.current[s.id].el = el)}
              className="section-shell min-h-[92svh] relative"
            >
              {/*
              {false && s.id === 'cosmetics' && active === 'cosmetics' && !prefersReducedMotion && (
                <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
                  <LiquidEther
                    colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                    autoDemo={true}
                    autoSpeed={0.7}
                    autoIntensity={2.2}
                    resolution={0.5}
                    cursorSize={120}
                    mouseForce={24}
                    backgroundOpacity={0.12}
                  />
                </div>
              )}
              {false && s.id === 'contacto' && active === 'contacto' && !prefersReducedMotion && (
                <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
                  <LiquidEther
                    colors={["#FFC4D6", "#FFE6B3", "#FFE9F5"]}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={1.8}
                    resolution={0.6}
                    cursorSize={120}
                    mouseForce={22}
                    backgroundOpacity={0.10}
                  />
                </div>
              )}
              */}

              {/* Render LiquidEther background also for the 'contacto' section (background only) */}
              {/*
              {s.id === 'contacto' && (
                <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
                  <LiquidEther
                    colors={["#FFC4D6", "#FFE6B3", "#FFE9F5"]}
                    autoDemo={true}
                    autoSpeed={0.6}
                    autoIntensity={2.2}
                    resolution={0.6}
                    cursorSize={150}
                    mouseForce={28}
                    backgroundOpacity={0.12}
                  />
                </div>
              )}
              */}

              <div
                className={`max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10 transition-all duration-500 ${active === s.id ? "opacity-100 translate-x-0" : "opacity-60 translate-x-2"
                  }`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-xs tabular-nums text-stone-500">{s.no}</span>
                  <h2 className="text-3xl md:text-5xl font-semibold tracking-tight heading-smooth">{s.title}</h2>
                </div>
                <p className="mt-4 text-stone-600 max-w-2xl">{s.blurb}</p>

                <div className={`mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${s.id === "work" ? "hidden" : ""}`}>
                  <FeatureCard title={`${s.title} #1`} text="Kısa açıklama metni. İçerik gelecek." />
                  <FeatureCard title={`${s.title} #2`} text="Kısa açıklama metni. İçerik gelecek." />
                  <FeatureCard title={`${s.title} #3`} text="Kısa açıklama metni. İçerik gelecek." />
                </div>

                {s.id === "work" && (
                  <ErrorBoundary>
                    <WorkList projects={PROJECTS} />
                  </ErrorBoundary>
                )}

                {s.id === "news" && (
                  <div className="mt-12 rounded-2xl border border-stone-200 p-6">
                    <h3 className="text-lg font-medium">Newsletter</h3>
                    <p className="text-sm text-stone-500">Yeni ürünler ve kampanyalar için e-posta alın.</p>
                    <form className="mt-4 flex gap-3" onSubmit={e => e.preventDefault()}>
                      <input
                        type="email"
                        required
                        placeholder="e-posta adresiniz"
                        className="flex-1 px-4 py-2 rounded-xl bg-white border border-stone-200 outline-none focus:border-stone-400"
                      />
                      <button className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium">Kaydol</button>
                    </form>
                  </div>
                )}

                {s.id === "franquicias" && (
                  <div className="mt-12 grid md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-stone-200 p-6">
                      <h3 className="text-lg font-medium">Neden Vivre?</h3>
                      <ul className="mt-3 text-sm text-stone-700 space-y-2 list-disc list-inside">
                        <li>Kanıtlanmış ürün portföyü</li>
                        <li>Eğitim ve sertifikasyon desteği</li>
                        <li>Merkezi pazarlama ve içerik</li>
                      </ul>
                    </div>
                    <FAQ
                      items={[
                        { q: "Başlangıç maliyeti nedir?", a: "Lokasyona göre değişir. Görüşmede netleştiriyoruz." },
                        { q: "Sözleşme süresi?", a: "Genellikle 3 yıl. Detaylar sözleşmede tanımlanır." },
                        { q: "Bölge koruması?", a: "Nüfus yoğunluğu ve mevcut ağımıza göre sağlanır." }
                      ]}
                    />
                  </div>
                )}

                {s.id === "contacto" && (
                  <div className="mt-12 grid sm:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-stone-200 p-6">
                      <h3 className="text-lg font-medium mb-2">Cilt Analizi (Kamera ile)</h3>
                      <p className="text-xs text-stone-500 mb-3">
                        Kamera verisi cihazınızda işlenir, kaydedilmez. Tıbbi teşhis değildir.
                      </p>
                      <ErrorBoundary>
                        <DeferMount title="Kamerayı Başlat">
                          <Suspense fallback={<div className="text-xs text-stone-500">Yükleniyor...</div>}>
                            <SkinAI />
                          </Suspense>
                        </DeferMount>
                      </ErrorBoundary>
                      <button
                        onClick={() =>
                          document.getElementById("contacto-booking")?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium"
                      >
                        Önerilen randevuya git
                      </button>
                    </div>

                    <div className="rounded-2xl border border-stone-200 p-6 sm:col-span-2">
                      <ErrorBoundary>
                        <DeferMount title="Kamerayı Başlat">
                          <Suspense fallback={<div className="text-xs text-stone-500">Yükleniyor...</div>}>
                            <MakeupTryOn />
                          </Suspense>
                        </DeferMount>
                      </ErrorBoundary>
                    </div>

                    <div className="rounded-2xl border border-stone-200 p-6" id="contacto-booking">
                      <h3 className="text-lg font-medium mb-2">Randevu</h3>
                      <p className="text-sm text-stone-500 mb-4">
                        Aşağıdaki form ile hizmet, tarih ve personel seçiminizi yaparak
                        randevu talebi oluşturabilirsiniz.
                      </p>
                      <ErrorBoundary>
                        <Booking />
                      </ErrorBoundary>
                    </div>

                    <div className="rounded-2xl border border-stone-200 p-6">
                      <h3 className="text-lg font-medium">Sosyal</h3>
                      <ul className="mt-2 text-sm text-stone-700 space-y-1">
                        <li>IG / @vivre.beauty</li>
                        <li>TT / @vivre.beauty</li>
                        <li>Mail / hello@vivre.example</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}

          <footer className="border-t border-stone-200">
            <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-stone-600 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between">
              <div>© {new Date().getFullYear()} Vivre Beauty</div>
              <div className="space-x-4">
                <a href="#" className="hover:text-stone-900">Gizlilik</a>
                <a href="#" className="hover:text-stone-900">Çerezler</a>
                <a href="#" className="hover:text-stone-900">İletişim</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  );
}
