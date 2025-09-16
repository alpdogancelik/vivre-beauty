import { useEffect, useState, lazy, Suspense } from 'react';
import { initHeroAnimations } from '@/lib/gsap-hero.js';
import VivreMetallic from '@features/MetallicPaint/VivreMetallic.jsx';
import { useGlobalScrollSlider } from '@/hooks/useScrollSlider.js';
import AnimatedButton from '@features/AnimatedButton/AnimatedButton.jsx';
import GradualBlur from '../../shared/ui/GradualBlur';
import StaggeredMenu from '@features/StaggeredMenu/StaggeredMenu.jsx';
import { NAV_ITEMS } from '@/constants/sections.jsx';
const Iridescence = lazy(() => import('@features/Background/Iridescence.jsx'));

const ENABLE_GRADUAL_BLUR = false;

// Geri döndürülen sürüm: Üç buton ayrı ayrı tanımlı, 'buttons.map' yok.
export default function Hero() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener?.('change', update);
        return () => mq.removeEventListener?.('change', update);
    }, []);
    const slides = [
        {
            title: 'Vivre Beauty',
            subtitle: 'Lüks Güzellik',
            description: '',
            primaryCTA: 'Randevu Al',
            secondaryCTA: 'AI Makyajı Dene',
            tertiaryCTA: 'Cilt Analizi'
        },
        {
            title: 'Beauty',
            subtitle: 'Geleceğin Güzellik Teknolojisi',
            description: '',
            primaryCTA: 'Sanal makyaj deneyimi',
            secondaryCTA: 'Sanal Makyaj',
            tertiaryCTA: 'Cilt Skoru'
        },
        {
            title: 'Professional Care',
            subtitle: 'Uzman Ellerde Güzelliğiniz',
            description: '',
            primaryCTA: 'Uzman Randevusu',
            secondaryCTA: 'Hizmetlerimiz',
            tertiaryCTA: 'Galeri'
        }
    ];

    const slider = useGlobalScrollSlider({
        totalSlides: slides.length,
        autoPlayInterval: 5000,
        autoPlayDelay: 1000
    });

    useEffect(() => {
        // Logo animasyonu tamamlandıktan sonra hero animasyonu başlasın
        const timer = setTimeout(() => {
            initHeroAnimations();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Sidebar menu items + socials (adjust links/labels as needed)
    const menuItems = [
        { label: 'Cosmetica', ariaLabel: 'Cosmetica section', link: '#cosmetica' },
        { label: 'Clinic', ariaLabel: 'Clinic section', link: '#clinic' },
        { label: 'About', ariaLabel: 'About us', link: '#about' },
        { label: 'Work', ariaLabel: 'Our work', link: '#work' },
        { label: 'Training', ariaLabel: 'Training', link: '#training' },
        { label: 'Studio', ariaLabel: 'Studio', link: '#studio' },
        { label: 'News', ariaLabel: 'News', link: '#news' },
        { label: 'Franchise', ariaLabel: 'Franchise', link: '#franchise' },
        { label: 'Contact', ariaLabel: 'Contact', link: '#contact' }
    ];
    // Also build from shared NAV_ITEMS to keep single source of truth
    const menuItemsFromSections = (Array.isArray(NAV_ITEMS) ? NAV_ITEMS : []).map(it => ({
        label: it.label,
        ariaLabel: `${it.label} section`,
        link: it.href,
    }));
    const socialItems = [
        { label: 'Instagram', link: 'https://instagram.com' },
        { label: 'Twitter', link: 'https://twitter.com' },
        { label: 'TikTok', link: 'https://www.tiktok.com' }
    ];

    return (
        <>
            {/* Fixed Staggered Menu overlay; only toggle is clickable (pointer-events handled inside) */}
            <div className="fixed inset-0 z-[60] pointer-events-none">
                <StaggeredMenu
                    className="w-full h-full"
                    position="right"
                    items={menuItemsFromSections.length ? menuItemsFromSections : menuItems}
                    socialItems={socialItems}
                    displaySocials={true}
                    displayItemNumbering={true}
                    colors={['#B19EEF', '#5227FF']}
                    accentColor="#5227FF"
                    menuButtonColor="#fff"
                    openMenuButtonColor="#fff"
                    changeMenuColorOnOpen={false}
                    logoUrl="/vivre-logo.png" // put your Vivre logo in public/vivre-logo.png (adjust if needed)
                    // onMenuOpen={() => console.log('menu opened')}
                    // onMenuClose={() => console.log('menu closed')}
                />
            </div>

            <section className="hero-section relative min-h-screen overflow-hidden">
                {/* Iridescent background layer (non-blocking) - disabled on mobile for perf */}
                {false && !isMobile && (
                    <div className="absolute inset-0 -z-10 opacity-80">
                        <Suspense fallback={null}>
                            <Iridescence color={[0.95, 0.9, 0.85]} speed={0.6} amplitude={0.08} mouseReact={false} maxDpr={1.5} />
                        </Suspense>
                    </div>
                )}
                {/* Soft gradient overlay to keep nude look */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-100/80 via-amber-50/70 to-stone-100/80"></div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-rose-200/25 via-transparent to-amber-100/20"></div>
                <div className="grain"></div>

                {/* Global Scroll Progress Indicator - Faster animation */}
                <div className="fixed top-0 left-0 w-full h-1 bg-rose-200/30 z-50">
                    <div
                        className="h-full bg-gradient-to-r from-rose-400 to-amber-400 transition-all duration-150"
                        style={{ width: `${slider.scrollProgress * 100}%` }}
                    ></div>
                </div>

                {/* Metallic Vivre logo (overlay, non-interactive) */}
                <div className="pointer-events-none absolute inset-x-0 top-32 md:top-28 z-30 flex items-center justify-center">
                    <VivreMetallic src="/vivre-logo.svg" width="18vw" />
                </div>

                {/* Slide Content - Much faster and smoother transitions */}
                <div className="relative z-10 min-h-screen flex items-center justify-center">
                    <div className="hero-content max-w-5xl mx-auto text-center px-6">
                        {slides.map((slide, index) => {
                            const active = index === slider.currentSlide;
                            return (
                                <div
                                    key={index}
                                    className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ease-out ${active
                                        ? 'opacity-100 translate-x-0 scale-100'
                                        : index < slider.currentSlide
                                            ? 'opacity-0 -translate-x-8 scale-95'
                                            : 'opacity-0 translate-x-8 scale-95'
                                        }`}
                                    style={{
                                        transform: `translateX(${active ? '0px' : index < slider.currentSlide ? '-20px' : '20px'}) scale(${active ? '1' : '0.98'})`,
                                        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
                                    }}
                                >
                                    <h1 className="hero-title text-6xl md:text-8xl lg:text-9xl font-serif font-light tracking-tight text-stone-800 mb-8 leading-none">
                                        <span className="block font-extralight">{slide.title}</span>
                                        <span className="block text-xl md:text-2xl lg:text-3xl font-sans font-light text-stone-600 mt-4 tracking-wider">
                                            {slide.subtitle}
                                        </span>
                                    </h1>

                                    <p className="hero-subtitle text-lg md:text-xl lg:text-2xl text-stone-500 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
                                        {slide.description}
                                    </p>

                                    <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center">
                                        <AnimatedButton
                                            variant="filled"
                                            className="hero-cta-primary min-w-[240px] text-lg py-3 text-stone-800 bg-gradient-to-r from-rose-200 to-amber-100 hover:from-rose-300 hover:to-amber-200 shadow-2xl"
                                            aria-label={slide.primaryCTA}
                                        >
                                            {slide.primaryCTA}
                                        </AnimatedButton>
                                        <AnimatedButton
                                            variant="stroke"
                                            className="hero-cta-secondary min-w-[240px] text-lg py-3 text-stone-700 border border-rose-300 hover:border-rose-400 hover:bg-rose-50 backdrop-blur-sm"
                                            aria-label={slide.secondaryCTA}
                                        >
                                            {slide.secondaryCTA}
                                        </AnimatedButton>
                                        <AnimatedButton
                                            variant="stroke"
                                            className="hero-cta-tertiary min-w-[240px] text-lg py-3 text-stone-700 border border-rose-300 hover:border-rose-400 hover:bg-rose-50 backdrop-blur-sm"
                                            aria-label={slide.tertiaryCTA}
                                        >
                                            {slide.tertiaryCTA}
                                        </AnimatedButton>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Fixed Slide Indicators - Faster transitions */}
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => slider.goToSlide(i)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${i === slider.currentSlide
                                ? 'bg-rose-400 scale-125 shadow-lg'
                                : 'bg-rose-200/50 hover:bg-rose-300 hover:scale-110'
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Scroll Hint - More responsive */}
                <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-20 transition-all duration-200 ${slider.scrollProgress > 0.05 ? 'opacity-20 scale-90' : 'opacity-70 scale-100'
                    }`}>
                    <p className="text-stone-500 text-sm mb-2">Kaydırarak keşfedin</p>
                    <div className="animate-bounce">
                        <svg className="w-6 h-6 text-stone-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>

                {/* Auto-play Indicator - Faster fade */}
                {!slider.isPaused && !slider.isScrolling && slider.scrollProgress < 0.05 && (
                    <div className="fixed top-6 right-6 z-50 transition-all duration-200">
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                            <span className="text-stone-600 text-xs">Otomatik</span>
                        </div>
                    </div>
                )}

                {/* Current Slide Indicator - Instant update */}
                <div className="fixed top-6 left-6 z-50 transition-all duration-100">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-stone-600 text-sm font-medium">
                            {slider.currentSlide + 1} / {slider.totalSlides}
                        </span>
                    </div>
                </div>

                {/* Contact / Booking CTA grubu (devre dışı bırakıldı) */}
                {false && (
                    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
                        <a
                            href="#contacto-booking"
                            className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50/80 backdrop-blur-md text-stone-700 text-sm sm:text-base hover:bg-rose-100 transition shadow-sm"
                        >
                            Contact / Booking
                        </a>
                    </div>
                )}
            </section>

            {ENABLE_GRADUAL_BLUR && (
                <>
                    <GradualBlur
                        target="page"
                        position="top"
                        height="5rem"
                        strength={1.5}
                        divCount={4}
                        curve="bezier"
                        opacity={1}
                    />
                    <GradualBlur
                        target="page"
                        position="bottom"
                        height="6rem"
                        strength={2}
                        divCount={6}
                        curve="bezier"
                        exponential={true}
                        opacity={1}
                        offsetBottom="96px"
                    />
                </>
            )}
        </>
    );
}
// Tip: add className="shiny-text animate-shine" to main heading elements in this component as needed.
