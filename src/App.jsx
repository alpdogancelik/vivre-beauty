import React, { useEffect, useRef, useState, Suspense, useCallback, useMemo, lazy } from "react";
// DEBUG_MARKER_V3 injected to verify latest bundle
if (typeof window !== 'undefined') {
  // Tarayıcı console'da arayacağın işaret
  window.__VIVRE_DEBUG_VERSION__ = 'V3-' + Date.now();
  console.log('[VIVRE DEBUG] Bundle Version:', window.__VIVRE_DEBUG_VERSION__);
}
import AmbientAudio from "@/components/AudioToggle.jsx";
import StaggeredMenu from "@features/StaggeredMenu/StaggeredMenu.jsx";
import { AnimatePresence, motion } from 'framer-motion';
// import Hero from "@pages/Hero/Hero.jsx"; // removed usage
import SpotlightHero from "@/features/SpotlightHero/SpotlightHero.jsx";
import BottomRiseNav from "@/features/BottomRiseNav/BottomRiseNav.jsx";
import Sidebar from "@features/Sidebar/Sidebar.jsx";
import FeatureCard from "@features/FeatureCard/FeatureCard.jsx";
import FAQ from "@pages/FAQ/FAQ.jsx";
import WorkList from "@features/WorkList/WorkList.jsx";
import GoogleMap from "./components/GoogleMap.jsx";
import Booking from "@/pages/Booking/Booking.jsx";
import BookingSidebar from "@/features/BookingSidebar/BookingSidebar.jsx";
import { gsap } from "gsap";
import { SECTIONS as RAW_SECTIONS, NAV_ITEMS as CONST_NAV_ITEMS } from "./constants/sections.jsx";
import { PROJECTS as RAW_PROJECTS } from "./constants/projects.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
// import { useIntersection } from "./lib/useIntersection.js";
import { shouldUseWebGL } from "./lib/detectWebGL.js";
import { useReducedMotion } from "./lib/useReducedMotion.js";
import "./styles/quality.css"; // kalite iyileştirmeleri

// Lazy-load heavy modules
const PixelCursor = React.lazy(() => import("@features/PixelCursor/PixelCursor.jsx"));
const LiquidEtherOriginal = React.lazy(() => import("@features/Background/LiquidEther.jsx"));
const Iridescence = React.lazy(() => import("@features/Background/Iridescence.jsx"));
const Galaxy = React.lazy(() => import("@/features/Background/Galaxy.jsx"));
const SkinAI = React.lazy(() => import("@features/SkinAI/SkinAI.jsx"));
const MakeupTryOn = React.lazy(() => import("@features/MakeupTryOn/MakeupTryOn.jsx"));
const VirtualMakeup = React.lazy(() => import("@features/VirtualMakeup/VirtualMakeup.jsx"));
// const Silk = React.lazy(() => import("@features/Background/Silk.jsx"));

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
  const prefersReducedMotion = useReducedMotion();

  const [active, setActive] = useState(SECTIONS[0]?.id || "home");
  // const [showLanding, setShowLanding] = useState(false); // removed
  // const [showLogo, setShowLogo] = useState(false); // removed
  const [route, setRoute] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const [navOpen, setNavOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(() => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1));
  const pixelCursorKey = useMemo(() => `pc-${Math.round((dpr || 1) * 100)}`, [dpr]);
  const [suspendDynamics, setSuspendDynamics] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [hideHero, setHideHero] = useState(false);
  const timelinePausedRef = useRef(false);
  const [webglSupport, setWebglSupport] = useState(() => shouldUseWebGL({ respectReducedMotion: false }));

  const refs = useRef(Object.fromEntries(SECTIONS.map(s => [s.id, { el: null }])));

  // Active section observer
  useEffect(() => {
    if (!SECTIONS?.length) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });
    SECTIONS.forEach(s => refs.current[s.id]?.el && io.observe(refs.current[s.id].el));
    return () => io.disconnect();
  }, []);

  // WebGL re-eval
  useEffect(() => { setWebglSupport(shouldUseWebGL({ respectReducedMotion: false })); }, [prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tl = gsap.globalTimeline; if (!tl) return;
    if (suspendDynamics && !timelinePausedRef.current) { tl.pause(); timelinePausedRef.current = true; }
    else if (!suspendDynamics && timelinePausedRef.current) { tl.resume(); timelinePausedRef.current = false; }
    return () => { if (timelinePausedRef.current) { tl.resume(); timelinePausedRef.current = false; } };
  }, [suspendDynamics]);

  // Resize DPR
  useEffect(() => {
    const handleResize = () => setDpr(window.devicePixelRatio || 1);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll navbar
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || 0;
      // hero görünürlüğünü azalt (0–1)
      const fadeEnd = 280; // px
      const op = Math.max(0, 1 - y / fadeEnd);
      setHeroOpacity(op);
      setHideHero(y > fadeEnd + 40);
      // aşağı kaydıkça alt navbar yükselsin
      setShowBottomNav(y > 40);
      // eski .navbar sınıfı varsa yine güncelle
      document.querySelector('.navbar')?.classList.toggle('scrolled', y > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ESC closes nav
  useEffect(() => { const onKey = e => { if (e.key === 'Escape') setNavOpen(false); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);

  // const finishLanding = () => {};
  // const finishLogo = () => {};
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // basit popstate router
  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = useCallback((to) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, '', to);
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
    // Remove global shiny classes to keep text/plain appearance
    return () => { };
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
            try { ctx.scale(target, target); c.dataset.ctxScaled = '1'; } catch (_) { }
          }
          c.dataset.hiresApplied = '1';
        });
    }, 40);
    return () => clearTimeout(t);
  }, [dpr, isMobile, active]);

  // '/home' route removed

  // /contact route ÖNCE: aşağıdaki Home JSX'i render etmeden önce yakala
  if (route === '/contact') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="contact-page" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.55, ease: 'easeOut' }} className="min-h-screen bg-transparent text-white relative">
          {/* Galaxy background (CONTACT) */}
          {webglSupport.ok && !prefersReducedMotion && (
            <div className="fixed inset-0 -z-10 pointer-events-none bg-[#fffff]" aria-hidden>
              <Suspense fallback={null}>
                <Galaxy
                  mouseInteraction={false}
                  mouseRepulsion={false}
                  transparent={true}
                  density={3}
                  glowIntensity={0.5}
                  saturation={1}
                  hueShift={220}
                  twinkleIntensity={1}
                  rotationSpeed={0}
                  repulsionStrength={10}
                  starSpeed={0.3}
                  speed={1}
                />
              </Suspense>
            </div>
          )}
          <header className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10 text-white">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
                <img src="/vivre-logo-real.png" alt="Vivre" className="h-10 w-auto select-none" />
                <span className="text-sm font-medium tracking-wide text-white/80 group-hover:text-white transition">Home</span>
              </button>
              <span className="ml-auto text-xs text-white/70"> Güzelliğe bir adım daha at - Randevu Oluştur </span>
            </div>
          </header>
          <div className="max-w-6xl mx-auto px-6 pt-14 pb-32">
            <button onClick={() => navigate('/')} className="text-sm px-4 py-1.5 rounded-full border border-stone-300/60 bg-white/70 backdrop-blur hover:bg-white transition">← Anasayfa</button>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mt-10 text-white">İletişim</h1>
            <p className="text-white/80 max-w-2xl mt-4">Randevu, iş birliği veya sorularınız için bize ulaşın.</p>
            <div className="mt-14 grid md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-6 text-white">
                  <h2 className="text-lg font-medium mb-2">Stüdyo</h2>
                  <GoogleMap lat={41.0369} lng={28.9850} zoom={17} markerTitle="Vivre Beauty" />
                  <ul className="mt-4 text-sm text-white/80 space-y-1">
                    <li><strong>Adres:</strong> Korutürk Mahallesi/Balçova/İzmir</li>
                    <li><strong>Telefon:</strong> +90 555 000 00 00</li>
                    <li><strong>E‑posta:</strong> vivrebeauty@gmail.com</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-8">
                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-6 text-white">
                  <h2 className="text-lg font-medium mb-2">Randevu</h2>
                  <Booking />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-6 text-white">
                  <h2 className="text-lg font-medium mb-2">Not</h2>
                  <p className="text-xs text-white/70">Google Maps görünmezse `.env` dosyanıza VITE_GOOGLE_MAPS_API_KEY ekleyin.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // HOME route
  return (
    <ErrorBoundary>
      <div className="bg-transparent text-white min-h-screen relative">
        {/* Global StaggeredMenu overlay with menu button */}
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <StaggeredMenu
            className="w-full h-full"
            position="right"
            items={(Array.isArray(CONST_NAV_ITEMS) ? CONST_NAV_ITEMS : []).map(it => ({ label: it.label, ariaLabel: `${it.label} section`, link: it.href }))}
            socialItems={[{ label: 'Instagram', link: 'https://instagram.com/vivrebeauty' }, { label: 'Twitter', link: 'https://twitter.com/vivrebeauty' }, { label: 'TikTok', link: 'https://www.tiktok.com/vivrebeauty' }]}
            displaySocials
            displayItemNumbering
            colors={['#B19EEF', '#5227FF']}
            accentColor="#5227FF"
            menuButtonColor="#000"
            openMenuButtonColor="#000"
            changeMenuColorOnOpen={false}
            showTopNav={false}
            logoUrl="/vivre-logo.png"
          />
        </div>
        {/* Spotlight intro section (mouse-follow light over portrait) */}
        {!hideHero && (
          <div style={{ opacity: heroOpacity, transition: 'opacity 240ms ease' }}>
            <SpotlightHero
              src="/model2.png"
              alt="Vivre Beauty"
              strength={0.45}
              size={24}
              align="right"
              showContent={true}
              eyebrow="VIVRE"
              heading="Yeniden başlamanın en doğal yolu."
              description="Vivre, yeniden başlamak isteyenler için doğal merkezine alan, insan sağlığını önceleyen bir bakım yaklaşımı sunar. Gereksiz kimyasal yükten arındırılmış protokollerimiz, bağımsız test ve şeffaf içerik politikasıyla desteklenir. Daha az işlemle, ölçülebilir ve sürdürülebilir sonuçlar hedefler; cildi yormadan iyi oluşa dönmeyi kolaylaştırır."
              className="[--img-right:1]"
            />
          </div>
        )}
        {/* Legacy GooeyNav removed */}
        {/* Global Iridescence background disabled */}
        {/* Galaxy background (HOME) */}
        {webglSupport.ok && !prefersReducedMotion && (
          <div className="fixed inset-0 -z-10 pointer-events-none bg-[#0b0912]" aria-hidden>
            <Suspense fallback={null}>
              <Galaxy
                mouseInteraction={false}
                mouseRepulsion={false}
                transparent={true}
                density={3}
                glowIntensity={0.5}
                saturation={1}
                hueShift={220}
                twinkleIntensity={1}
                rotationSpeed={0}
                repulsionStrength={10}
                starSpeed={0.3}
                speed={1}
              />
            </Suspense>
          </div>
        )}
        {/* Floating decorative elements */}
        {
        }
        {/* Floating bubble elements removed */}

        {/* PixelCursor (yeniden etkin / yüksek DPI) */}
        {/* eski:
        <Suspense fallback={null}>
          <PixelCursor />
        </Suspense>
        */}
        <AmbientAudio />

        {/* PixelCursor sadece masaüstü */}
        {!suspendDynamics && !prefersReducedMotion && !isMobile ? (
          <Suspense fallback={null}>
            <PixelCursor key={pixelCursorKey} dpr={Math.min(2, dpr)} highQuality />
          </Suspense>
        ) : null}

        {/* LogoEntrance overlay removed */}
        {/* Landing overlay removed */}

        {/* Global: Üst orta Contact/Booking butonu navbar'a taşındı - referans için yorumlandı */}
        {false && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
            <button
              onClick={() => navigate('/contact')}
              className="px-5 py-2 rounded-full border bg-rose-50/90 backdrop-blur-md text-stone-800 text-base sm:text-lg font-medium hover:bg-rose-100 transition shadow-md"
              style={{ boxShadow: '0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)' }}
            >
              Contact / Booking
            </button>
          </div>
        )}

        <button
          onClick={() => setBookingOpen(true)}
          className="fixed left-6 top-18 md:left-12 md:top-18 z-[65] px-4 py-2 rounded-full bg-stone-900 text-stone-50 text-sm md:text-base font-medium shadow-lg hover:bg-stone-800 active:scale-[0.98] transition"
          aria-haspopup="dialog"
          aria-expanded={bookingOpen ? 'true' : 'false'}
        >
          Randevu
        </button>

        {/* Booking Slide-over */}
        <BookingSidebar open={bookingOpen} onClose={() => setBookingOpen(false)} side="left" />

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
        <header className="navbar lg:hidden sticky top-0 z-40 bg-rose-50/80 backdrop-blur-md border-b border-rose-200/40 transition-all duration-300 hidden">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 active:scale-[0.97] transition">
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
              <span className="text-xs font-medium text-stone-600">Home</span>
            </button>
            <div className="text-xs text-stone-600">Beauty Studio</div>
          </div>
        </header>

        {/* İçerik */}
        <main className={`transition-[margin] duration-300 ${navOpen ? "lg:mr-56" : "lg:mr-0"}`}>
          <BottomRiseNav
            show={showBottomNav}
            items={SECTIONS.map(s => ({ id: s.id, label: s.title }))}
            onNavigate={(id) => {
              if (id === 'reservation') {
                document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onReservation={() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })}
          />
          <BottomRiseNav
            show={showBottomNav}
            items={SECTIONS.map(s => ({ id: s.id, label: s.title }))}
            onNavigate={(id) => {
              if (id === 'reservation') {
                document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onReservation={() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })}
          />
          {/* Standalone Hero section removed to avoid duplicate hero between Home and Cosmetics */}

          {SECTIONS.map((s) => {
            return (
              <section
                id={s.id}
                key={s.id}
                ref={(el) => {
                  if (refs.current[s.id]) refs.current[s.id].el = el;
                }}
                className="section-shell min-h-[92svh] relative"
              >
                {/*
                {false && s.id === 'cosmetics' && active === 'cosmetics' && }

                {/* Render LiquidEther background also for the 'contacto' section (background only) */}
                {/*
            
                */}

                <div
                  className={`max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10 transition-all duration-500 ${active === s.id ? "opacity-100 translate-x-0" : "opacity-60 translate-x-2"}`}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs tabular-nums text-stone-500">{s.no}</span>
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tight heading-smooth">{s.title}</h2>
                  </div>
                  <p className="mt-4 text-stone-600 max-w-2xl">{s.blurb}</p>
                  <>
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
                        <form className="mt-4 flex gap-3" onSubmit={(e) => e.preventDefault()}>
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
                          <h3 className="text-lg font-medium mb-2">Sanal Makyaj (Yeni)</h3>
                          <ErrorBoundary>
                            <DeferMount title="Kamerayı Başlat">
                              <Suspense fallback={<div className="text-xs text-stone-500">Yükleniyor...</div>}>
                                <VirtualMakeup />
                              </Suspense>
                            </DeferMount>
                          </ErrorBoundary>
                        </div>

                        <div className="rounded-2xl border border-stone-200 p-6" id="contacto-booking">
                          <h3 className="text-lg font-medium mb-2">Randevu</h3>
                          <p className="text-sm text-stone-500 mb-4">
                            Hizmet, tarih ve personel seçimi yaparak randevu talebi oluşturun.
                          </p>
                          <ErrorBoundary>
                            <Booking />
                          </ErrorBoundary>
                        </div>

                        <div className="rounded-2xl border border-stone-200 p-6">
                          <h3 className="text-lg font-medium">Sosyal</h3>
                          <ul className="mt-2 text-sm text-stone-700 space-y-1">
                            <li>IG / @vivrebeauty.co</li>
                            <li>TT / @vivrebeauty</li>
                            <li>Mail / vivrebeauty@gmail.com</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {s.id === 'contact' && route === '/' && (
                      <div className="mt-12 grid md:grid-cols-2 gap-6" id="contact-map">
                        <div className="rounded-2xl border border-stone-200 p-6 bg-white/60 backdrop-blur-sm">
                          <h3 className="text-lg font-medium mb-2">Konum</h3>
                          <GoogleMap lat={41.0369} lng={28.9850} zoom={16} markerTitle="Vivre Beauty" />
                          <p className="text-xs text-stone-500 mt-3">Detaylı iletişim için → <button onClick={() => navigate('/contact')} className="underline decoration-dotted">/contact</button></p>
                        </div>
                        <div className="rounded-2xl border border-stone-200 p-6 bg-white/60 backdrop-blur-sm">
                          <h3 className="text-lg font-medium mb-2">İletişim</h3>
                          <ul className="text-sm text-stone-700 space-y-1">
                            <li>hello@vivre.example</li>
                            <li>+90 555 000 00 00</li>
                            <li>Instagram: @vivre.beauty</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                </div>
              </section>
            );
          })}


          <footer className="border-t border-stone-200">
            <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-stone-600 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between">
              <div>© {new Date().getFullYear()} Vivre Beauty</div>
              <div className="space-x-4">
                <a href="#" className="hover:text-stone-900">Gizlilik</a>
                <a href="#" className="hover:text-stone-900">Çerezler</a>
                <button onClick={() => navigate('/contact')} className="hover:text-stone-900">İletişim</button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  );
}
