/* ================= BACKUP PREVIOUS HeroWithScroll.jsx (BOŞTU) =================
// Önceki dosya boştu, şimdi çalışan sürüm eklendi.
================= END BACKUP ================= */
import { useEffect } from 'react';
import useScrollSlider from '@/hooks/useScrollSlider.js';

const SLIDES = [
	{ id: 1, image: '/images/hero1.jpg', title: 'Doğal Güzelliğin Gücü', subtitle: 'Premium kalitede organik kozmetik ürünleri', desc: 'Cildinizin ihtiyacı olan bakımı doğal içeriklerle keşfedin', cta: 'Keşfet' },
	{ id: 2, image: '/images/hero2.jpg', title: 'Lüks Bakım Deneyimi', subtitle: 'Uzman formülasyonları ile geliştirilmiş', desc: 'Her gün kendinizi özel hissedin', cta: 'Randevu Al' },
	{ id: 3, image: '/images/hero3.jpg', title: 'Sürdürülebilir Güzellik', subtitle: 'Çevre dostu ambalajlarda', desc: 'Doğaya saygılı güzellik rutini', cta: 'Ürünlere Bak' }
];

export default function HeroWithScroll() {
	const slider = useScrollSlider({ total: SLIDES.length, autoPlayInterval: 6500 });

	useEffect(() => { SLIDES.forEach(s => { const img = new Image(); img.src = s.image; }); }, []);

	return (
		<section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50 to-stone-50">
			<div className="absolute inset-0">
				{SLIDES.map((s, i) => {
					const active = i === slider.index;
					return (
						<div key={s.id} className={`absolute inset-0 transition-all duration-[850ms] ease-[cubic-bezier(.4,0,.2,1)] ${active ? 'opacity-100 scale-100 translate-x-0 z-20' : 'opacity-0 scale-[0.95] translate-x-10 pointer-events-none z-10'}`}>
							<div className="absolute inset-0">
								<img src={s.image} alt={s.title} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
								<div className="absolute inset-0 bg-black/30" />
							</div>
							<div className="relative z-10 flex h-full items-center justify-center text-center text-white px-6">
								<div className="max-w-4xl mx-auto">
									<h1 className={`text-5xl md:text-7xl font-light tracking-tight mb-6 transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>{s.title}</h1>
									<p className={`text-xl md:text-2xl font-light mb-4 transition-all duration-700 delay-100 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>{s.subtitle}</p>
									<p className={`text-lg md:text-xl opacity-90 mb-8 transition-all duration-700 delay-200 ${active ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-6'}`}>{s.desc}</p>
									<button className={`px-8 py-3 rounded-full font-medium bg-white text-stone-900 shadow shadow-white/30 hover:shadow-lg hover:scale-[1.04] transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>{s.cta}</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<button onClick={slider.prev} aria-label="Önceki" className="group absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/35 text-white transition">
				<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition"><path d="M15 18l-6-6 6-6" /></svg>
			</button>
			<button onClick={slider.next} aria-label="Sonraki" className="group absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/35 text-white transition">
				<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition"><path d="M9 18l6-6-6-6" /></svg>
			</button>
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
				{SLIDES.map((_, i) => <button key={i} onClick={() => slider.go(i)} aria-label={`Slide ${i + 1}`} className={`w-3 h-3 rounded-full transition-all ${i === slider.index ? 'bg-white scale-125 shadow shadow-white/40' : 'bg-white/50 hover:bg-white/70'}`} />)}
			</div>
			<div className="absolute top-0 left-0 right-0 h-1 bg-white/25">
				<div className="h-full bg-white transition-all duration-300" style={{ width: `${((slider.index + 1) / SLIDES.length) * 100}%` }} />
			</div>
		</section>
	);
}
