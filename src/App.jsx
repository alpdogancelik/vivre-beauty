import { useEffect, useRef, useState } from "react";
import Hero from "./components/hero.jsx";
import Sidebar from "./components/sidebar.jsx";
import FeatureCard from "./components/featurecard.jsx";
import FAQ from "./components/faq.jsx";
import WorkList from "./components/worklist.jsx";
import LandingVideo from "./components/landing-video.jsx";
import { SECTIONS } from "./constants/sections.jsx";
import { PROJECTS } from "./constants/projects.jsx";
import SkinAI from "./components/SkinAI.jsx";
import Booking from "./components/Booking.jsx";
import MakeupTryOn from "./components/makeuptryon.jsx";


export default function App() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [showLanding, setShowLanding] = useState(() => !sessionStorage.getItem("landingSeen"));
  const refs = useRef(Object.fromEntries(SECTIONS.map(s => [s.id, { el: null }])));

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
    );
    SECTIONS.forEach(s => refs.current[s.id]?.el && io.observe(refs.current[s.id].el));
    return () => io.disconnect();
  }, []);

  const finishLanding = () => {
    sessionStorage.setItem("landingSeen", "1");
    setShowLanding(false);
  };

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {showLanding && <LandingVideo onFinish={finishLanding} />}

      <a
        href="#contacto-booking"
        className="fixed right-5 bottom-5 z-50 px-4 py-2 rounded-full bg-stone-900 text-stone-50 text-sm font-medium shadow-lg border border-stone-300"
      >
        Randevu Al
      </a>

      <Sidebar sections={SECTIONS} active={active} onNav={scrollTo} />

      <header className="lg:hidden sticky top-0 z-40 bg-stone-50/80 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-base tracking-widest">VIVRE</div>
          <div className="text-xs text-stone-500">Beauty</div>
        </div>
      </header>

      <main className="lg:ml-56">
        <Hero />

        {SECTIONS.map((s) => (
          <section
            id={s.id}
            key={s.id}
            ref={el => (refs.current[s.id].el = el)}
            className="min-h-[92svh] border-t border-stone-200 relative"
          >
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
              <div className="flex items-baseline gap-4">
                <span className="text-xs tabular-nums text-stone-500">{s.no}</span>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">{s.title}</h2>
              </div>
              <p className="mt-4 text-stone-600 max-w-2xl">{s.blurb}</p>

              <div className={`mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${s.id === "work" ? "hidden" : ""}`}>
                <FeatureCard title={`${s.title} #1`} text="Kısa açıklama metni. İçerik gelecek." />
                <FeatureCard title={`${s.title} #2`} text="Kısa açıklama metni. İçerik gelecek." />
                <FeatureCard title={`${s.title} #3`} text="Kısa açıklama metni. İçerik gelecek." />
              </div>

              {s.id === "work" && <WorkList projects={PROJECTS} />}

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
                  {/* Cilt Analizi */}
                  <div className="rounded-2xl border border-stone-200 p-6">
                    <h3 className="text-lg font-medium mb-2">Cilt Analizi (Kamera ile)</h3>
                    <p className="text-xs text-stone-500 mb-3">
                      Kamera verisi cihazınızda işlenir, kaydedilmez. Tıbbi teşhis değildir.
                    </p>
                    <SkinAI />
                    <button
                      onClick={() =>
                        document.getElementById("contacto-booking")?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium"
                    >
                      Önerilen randevuya git
                    </button>
                  </div>

                  {/* Makyaj Denemesi */}
                  <div className="rounded-2xl border border-stone-200 p-6 sm:col-span-2">
                    <MakeupTryOn />
                  </div>

                  {/* Randevu */}
                  <div className="rounded-2xl border border-stone-200 p-6">
                    <h3 className="text-lg font-medium mb-2">Randevu</h3>
                    <p className="text-sm text-stone-500 mb-4">
                      Aşağıdaki form ile hizmet, tarih ve personel seçiminizi yaparak
                      randevu talebi oluşturabilirsiniz.
                    </p>
                    <Booking />
                  </div>

                  {/* Sosyal */}
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
  );
}
