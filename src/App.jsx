import { useEffect, useRef, useState, lazy, Suspense } from "react";
import Hero from "@pages/Hero/Hero.jsx";
import Sidebar from "@features/Sidebar/Sidebar.jsx";
import FeatureCard from "@features/FeatureCard/FeatureCard.jsx";
import FAQ from "@pages/FAQ/FAQ.jsx";
import WorkList from "@features/WorkList/WorkList.jsx";
import LandingVideo from "@features/LandingVideo/LandingVideo.jsx";
import PixelCursor from "@features/PixelCursor/PixelCursor.jsx";
import LogoEntrance from "@features/LogoEntrance/LogoEntrance.jsx";
// import { gsap } from 'gsap';
import { SECTIONS as RAW_SECTIONS } from "./constants/sections.jsx";
import { PROJECTS as RAW_PROJECTS } from "./constants/projects.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SkinAI from "@features/SkinAI/SkinAI.jsx";
import Booking from "@pages/Booking/Booking.jsx";
import MakeupTryOn from "@features/MakeupTryOn/MakeupTryOn.jsx";
// Lazy-load heavy WebGL background to reduce initial cost
const LiquidEther = lazy(() => import("@features/Background/LiquidEther.jsx"));
const Iridescence = lazy(() => import("@features/Background/Iridescence.jsx"));
import "./styles/quality.css"; // yüksek kalite iyi003,
// 


2leştirmeleri

const SECTIONS = Array.isArray0(RAW_SECTIONS) && RAW_SECTIONS.length
  ? RAW_SECTIONS
  : [{ id: "home", no: "00", title: "Vivre", blurb: "" }];
const PROJECTS = Array.isArray(RAW_PROJECTS) ? RAW_PROJECTS : [];

export default function App() {
  const isClient = typeof window !== "undefined" && typeof sessionStorage !== "undefined";

  const [active, setActive] = useState(SECTIONS[0]?.id || "home");
  const [showLanding, setShowLanding] = useState(() => (isClient ? !sessionStorage.getItem("landingSeen") : false));
  const [showLogo, setShowLogo] = useState(() => (isClient ? !sessionStorage.getItem("logoSeen") : false));
  const [navOpen, setNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Track viewport breakpoint for perf tuning
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Esc ile menüyü kapat
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setNavOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Only enable global shiny effects on desktop and when reduced motion is not requested
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!prefersReduced && desktop) {
      document.body.classList.add('shiny-all');
      document.body.classList.add('shiny-fast');
    }
    return () => {
      document.body.classList.remove('shiny-all');
      document.body.classList.remove('shiny-fast');
    };
  }, []);

  // Global kalite sınıfı
  useEffect(() => {
    document.body.classList.add('quality-upscale');
    return () => document.body.classList.remove('quality-upscale');
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

  return (
    <ErrorBoundary>
      <div className="bg-transparent text-stone-900 min-h-screen relative">
        {/* Global Iridescence background (behind everything) */}
        <div className="fixed inset-0 -z-10 opacity-90 pointer-events-none">
          <Suspense fallback={null}>
            <Iridescence
              speed={0.55}
              amplitude={0.08}
              mouseReact={!isMobile}
              maxDpr={Math.min(2, (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1)}
              quality="high"
            />
          </Suspense>
        </div>
        {/* Floating decorative elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Daha keskin, gradient tabanlı noktalar */}
          <div className="floating-element fx-dot dot-sm" style={{ top: '5rem', left: '2.5rem' }} />
          <div className="floating-element fx-dot dot-lg" style={{ top: '10rem', right: '4rem' }} />
          <div className="floating-element fx-dot dot-xs" style={{ top: '15rem', left: '33%' }} />
          <div className="floating-element fx-dot dot-md" style={{ bottom: '10rem', right: '5rem' }} />
          <div className="floating-element fx-dot dot-sm" style={{ bottom: '15rem', left: '5rem' }} />
          <div className="floating-element fx-dot dot-xxs" style={{ top: '30%', right: '25%' }} />
        </div>

        <PixelCursor />
        {showLogo && <LogoEntrance onComplete={finishLogo} />}
        {showLanding && <LandingVideo onFinish={finishLanding} />}

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
            {false && (
              <button
                onClick={() => setNavOpen(true)}
                className="px-4 py-2 text-base border rounded-full shadow-sm"
                aria-label="Menüyü aç"
              >
                Menü
              </button>
            )}
            <div className="flex items-center space-x-2">
              <img
                src="/vivre-logo-real.png"
                srcSet="/vivre-logo-real.png 1x, /vivre-logo-real@2x.png 2x, /vivre-logo-real@3x.png 3x"
                alt="Vivre Beauty"
                className="h-10 w-auto logo-smooth"
                decoding="async"
                loading="lazy"
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
              {/* Cosmetics bölümünde Liquid Ether arka plan */}
                {/* Cosmetics özel Liquid Ether arka planı devre dışı; global Iridescence kullanılıyor */}
                {false && s.id === 'cosmetics' && (
                  <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
                    <Suspense fallback={null}>
                      <LiquidEther
                        colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                        autoDemo={!isMobile}
                        autoSpeed={isMobile ? 0.45 : 0.7}
                        autoIntensity={isMobile ? 1.6 : 2.2}
                        resolution={isMobile ? 0.28 : 0.4}
                        cursorSize={isMobile ? 72 : 120}
                        mouseForce={isMobile ? 12 : 24}
                        backgroundOpacity={0.10}
                        maxDpr={1.35}
                        allowSoftware={false}
                        forceWebGL={false}
                      />
                    </Suspense>
                  </div>
                )}
              <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
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
                        <SkinAI />
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
                        <MakeupTryOn />
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
