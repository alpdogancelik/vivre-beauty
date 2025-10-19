import { useEffect, useState, lazy, Suspense } from 'react';
import styles from './Hero.module.css';

import { initHeroAnimations } from '@/lib/gsap-hero.js';
import VivreMetallic from '@features/MetallicPaint/VivreMetallic.jsx';
import { useGlobalScrollSlider } from '@/hooks/useScrollSlider.js';
import AnimatedButton from '@features/AnimatedButton/AnimatedButton.jsx';
import GradualBlur from '../../shared/ui/GradualBlur';
import StaggeredMenu from '@features/StaggeredMenu/StaggeredMenu.jsx';
import { NAV_ITEMS } from '@/constants/sections.jsx';

const Iridescence = lazy(() => import('@features/Background/Iridescence.jsx'));

const ENABLE_GRADUAL_BLUR = false;

export default function Hero() {
    const [isMobile, setIsMobile] = useState(false);

    /* --- media-query watcher --- */
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener?.('change', update);
        return () => mq.removeEventListener?.('change', update);
    }, []);

    /* --- slides content --- */
    const slides = [
        {
            title: 'Vivre Beauty',
            subtitle: 'Luxury Beauty',
            description: '',
            primaryCTA: 'Get Booking',
            secondaryCTA: 'Try Skin Analysis',
            tertiaryCTA: 'Skin Analysis'
        },
        {
            title: 'Vivre Beauty',
            subtitle: 'Future Beauty Revolution',
            description: '',
            primaryCTA: 'Sanal makyaj deneyimi',
            secondaryCTA: 'Try Virtual Make-Up',
            tertiaryCTA: ''
        },
        {
            title: 'Vivre Beauty',
            subtitle: 'Professional Care Becomes New Normal',
            description: '',
            primaryCTA: 'Booking',
            secondaryCTA: 'Our works',
            tertiaryCTA: ''
        }
    ];

    const slider = useGlobalScrollSlider({
        totalSlides: slides.length,
        autoPlayInterval: 5000,
        autoPlayDelay: 1000
    });

    /* --- kick off GSAP hero anims after logo splash --- */
    useEffect(() => {
        const t = setTimeout(initHeroAnimations, 500);
        return () => clearTimeout(t);
    }, []);

    /* --- sidebar menu --- */
    const menuItems = (Array.isArray(NAV_ITEMS) ? NAV_ITEMS : [
        { label: 'Home', href: '#home' },
        { label: 'Cosmetics', href: '#cosmetics' },
        { label: 'Clinic', href: '#clinic' },
        { label: 'About', href: '#about' },
        { label: 'Work', href: '#work' },
        { label: 'Training', href: '#training' },
        { label: 'Studios', href: '#studios' },
        { label: 'News', href: '#news' },
        { label: 'Franchise', href: '#franchise' },
        { label: 'Contact', href: '#contact' }
    ]).map(it => ({
        label: it.label,
        ariaLabel: `${it.label} section`,
        link: it.href
    }));

    const socialItems = [
        { label: 'Instagram', link: 'https://instagram.com/vivrebeauty' },
        { label: 'Twitter', link: 'https://twitter.com/vivrebeauty' },
        { label: 'TikTok', link: 'https://www.tiktok.com/vivrebeauty' }
    ];

    return (
        <>
            {/* --- Staggered menu overlay --- */}
            <div className="fixed inset-0 z-[60] pointer-events-none">
                <StaggeredMenu
                    className="w-full h-full"
                    position="right"
                    items={menuItems}
                    socialItems={socialItems}
                    displaySocials
                    displayItemNumbering
                    colors={['#B19EEF', '#5227FF']}
                    accentColor="#5227FF"
                    menuButtonColor="#fff"
                    openMenuButtonColor="#fff"
                    changeMenuColorOnOpen={false}
                    showTopNav={false}
                    logoUrl="/vivre-logo.png"
                />
            </div>

            {/* --- HERO SECTION --- */}
            <section id="home" className={`${styles.wrapper} hero-section relative min-h-[60svh] md:min-h-[70svh] overflow-hidden`}>

                {/* iridescent WebGL BG (disabled on mobile) */}
                {!isMobile && false && (
                    <div className="absolute inset-0 -z-10 opacity-80">
                        <Suspense fallback={null}>
                            <Iridescence
                                color={[0.95, 0.9, 0.85]}
                                speed={0.6}
                                amplitude={0.08}
                                mouseReact={false}
                                maxDpr={1.5}
                            />
                        </Suspense>
                    </div>
                )}

                {/* gradient overlays + grain */}
                {/* <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-100/80 via-amber-50/70 to-stone-100/80" /> */}
                {/* <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-rose-200/25 via-transparent to-amber-100/20" /> */}
                <div className="grain" />

                {/* Figma hero copy */}
                <div className="absolute inset-x-4 md:inset-x-12 top-24 md:top-1/2 md:-translate-y-1/2 z-20 flex justify-start">
                    <div className="max-w-xl bg-black/10 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none rounded-3xl md:rounded-none px-6 py-6 md:px-0 md:py-0 text-left space-y-5">
                        <div className="uppercase tracking-[0.45em] text-[10px] md:text-xs text-rose-200/70">vivre</div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-tight font-light text-white">
                            Yeniden başlamanın en doğal yolu.
                        </h1>
                        <p className="text-sm md:text-base lg:text-lg leading-relaxed text-stone-200/90">
                            Vivre, yeniden başlamak isteyenler için doğal merkezine alan, insan sağlığını önceleyen bir bakım yaklaşımı sunar. Gereksiz kimyasal yükten arındırılmış protokollerimiz, bağımsız test ve şeffaf içerik politikasıyla desteklenir. Daha az işlemle, ölçülebilir ve sürdürülebilir sonuçlar hedefler; cildi yormadan iyi oluşa dönmeyi kolaylaştırır.
                        </p>
                    </div>
                </div>

                {/* scroll progress bar */}
                <div className="fixed top-0 left-0 w-full h-1 bg-rose-200/30 z-50">
                    <div
                        className="h-full bg-gradient-to-r from-rose-400 to-amber-400 transition-all duration-150"
                        style={{ width: `${slider.scrollProgress * 100}%` }}
                    />
                </div>

                {/* metallic logo overlay */}
                <div className="pointer-events-none absolute inset-x-0 top-32 md:top-28 z-30 flex items-center justify-center">
                    <VivreMetallic src="/vivre-logo.svg" width="18vw" />
                </div>

                {/* slides */}
                <div className="relative z-10 min-h-[60svh] md:min-h-[70svh] flex items-center justify-center">
                    <div className="hero-content max-w-4xl mx-auto text-center px-4 md:px-6">
                        {slides.map((slide, idx) => {
                            const active = idx === slider.currentSlide;
                            return (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ease-out ${active
                                        ? 'opacity-100 translate-x-0 scale-100'
                                        : idx < slider.currentSlide
                                            ? 'opacity-0 -translate-x-8 scale-95'
                                            : 'opacity-0 translate-x-8 scale-95'
                                        }`}
                                    style={{
                                        transform: `translateX(${active ? '0' : idx < slider.currentSlide ? '-20px' : '20px'
                                            }) scale(${active ? '1' : '0.98'})`,
                                        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
                                    }}
                                >
                                    <h1 className="hero-title hidden text-6xl md:text-8xl lg:text-9xl font-serif font-light tracking-tight text-stone-800 mb-8 leading-none">
                                        <span className={`block font-extralight`}>
                                            {slide.title}
                                        </span>
                                        <span className="block text-xl md:text-2xl lg:text-3xl font-sans font-light text-stone-600 mt-4 tracking-wider">
                                            {slide.subtitle}
                                        </span>
                                    </h1>

                                    <p className="hero-subtitle hidden text-lg md:text-xl lg:text-2xl text-stone-500 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
                                        {slide.description}
                                    </p>

                                    <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center">
                                        <AnimatedButton
                                            variant="filled"
                                            plain={true}
                                            className="hero-cta-primary min-w-[240px] text-lg py-3 text-stone-800 bg-gradient-to-r from-rose-200 to-amber-100 hover:from-rose-300 hover:to-amber-200 shadow-2xl"
                                            aria-label={slide.primaryCTA}
                                        >
                                            {slide.primaryCTA}
                                        </AnimatedButton>
                                        <AnimatedButton
                                            variant="stroke"
                                            plain={true}
                                            className="hero-cta-secondary min-w-[240px] text-lg py-3 text-stone-700 border border-rose-300 hover:border-rose-400 hover:bg-rose-50 backdrop-blur-sm"
                                            aria-label={slide.secondaryCTA}
                                        >
                                            {slide.secondaryCTA}
                                        </AnimatedButton>
                                        <AnimatedButton
                                            variant="stroke"
                                            plain={true}
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

                {/* slide indicators */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex space-x-4 z-50">
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

                {/* scroll hint */}
                <div
                    className={`absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-20 transition-all duration-200 ${slider.scrollProgress > 0.05 ? 'opacity-20 scale-90' : 'opacity-70 scale-100'
                        }`}
                >
                    <p className="text-stone-500 text-sm mb-2">Kaydırarak keşfedin</p>
                    <div className="animate-bounce">
                        <svg
                            className="w-6 h-6 text-stone-400 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </div>

                {/* auto-play indicator */}
                {!slider.isPaused && !slider.isScrolling && slider.scrollProgress < 0.05 && (
                    <div className="fixed top-6 right-6 z-50 transition-all duration-200">
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" aria-hidden="true" />
                            <span className="sr-only">Otomatik</span>
                        </div>
                    </div>
                )}

                {/* current slide counter */}
                <div className="fixed top-6 left-6 z-50 transition-all duration-100">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-stone-600 text-sm font-medium">
                            {slider.currentSlide + 1} / {slider.totalSlides}
                        </span>
                    </div>
                </div>
            </section>

            {/* optional blur strips */}
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
                        exponential
                        opacity={1}
                        offsetBottom="96px"
                    />
                </>
            )}
        </>
    );
}
