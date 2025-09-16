import { useRef, useEffect, useState } from 'react';

// Toggle to quickly disable visual duplication / gooey overlay if causing overlap artifacts
const DISABLE_GOOEY_EFFECTS = true;

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [scale, setScale] = useState(1); // legacy (kept to avoid large code removal)
  const [overflowing, setOverflowing] = useState(false);
  const [compact, setCompact] = useState(false);
  const totalWidthRef = useRef(0);

  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };
  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };
  const makeParticles = element => {
    if (DISABLE_GOOEY_EFFECTS) return; // skip particle generation
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // do nothing
          }
        }, t);
      }, 30);
    }
  };
  const updateEffectPosition = element => {
    if (DISABLE_GOOEY_EFFECTS) return; // skip moving overlay
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };
  const handleClick = (e, index) => {
    const liEl = e.currentTarget;
    if (activeIndex === index) return;
    setActiveIndex(index);
    updateEffectPosition(liEl);
    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current.removeChild(p));
    }
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      if (liEl) {
        handleClick({ currentTarget: liEl }, index);
      }
    }
  };
  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (!DISABLE_GOOEY_EFFECTS) {
      if (activeLi) {
        updateEffectPosition(activeLi);
        textRef.current?.classList.add('active');
      }
    }
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
      // Also recompute scale on container resize
      recomputeScale();
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  // Recompute scale when items change
  useEffect(() => { recomputeScale(); }, [items]);

  const recomputeScale = () => {
    try {
      if (!navRef.current || !containerRef.current) return;
      const ul = navRef.current;
      const containerWidth = containerRef.current.offsetWidth || 0;
      const total = Array.from(ul.children).reduce((acc, li) => acc + li.getBoundingClientRect().width, 0);
      totalWidthRef.current = total;
      if (!total || !containerWidth) { setScale(1); return; }
      const desired = Math.min(1, (containerWidth * 0.94) / total);
      const appliedScale = desired < 0.7 ? 0.7 : desired;
      setScale(1); // disable transform shrinking to prevent text overlap artifacts
      const isOverflow = total > containerWidth;
      setOverflowing(isOverflow);
      setCompact(isOverflow || appliedScale < 0.92);
      // Zorla tek satır: toplam genişliği minWidth olarak ata (scroll/scale fallback)
      ul.style.minWidth = total + 'px';
      ul.style.whiteSpace = 'nowrap';
      ul.style.flexWrap = 'nowrap';
    } catch {/* no-op */}
  };

  return (
    <>
      <style>
        {`
          :root { --linear-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1); }
          .effect { position: absolute; opacity: 1; pointer-events: none; display: grid; place-items: center; z-index: 1; }
          .effect.text { color: black; transition: color 0.3s ease; }
          .effect.text.active { color: black; }
          .effect.filter { filter: blur(7px) contrast(100) blur(0); mix-blend-mode: lighten; }
          .effect.filter::before { content: ""; position: absolute; inset: -75px; z-index: -2; background: transparent; }
          .effect.filter::after { content: ""; position: absolute; inset: 0; background: transparent; transform: scale(0); opacity: 0; z-index: -1; border-radius: 9999px; }
          .effect.active::after { animation: pill 0.3s ease both; }
          @keyframes pill { to { transform: scale(1); opacity: 1; } }
          .particle, .point { display: block; opacity: 0; width: 20px; height: 20px; border-radius: 9999px; transform-origin: center; }
          .particle { --time: 5s; position: absolute; top: calc(50% - 8px); left: calc(50% - 8px); animation: particle calc(var(--time)) ease 1 -350ms; }
          .point { background: var(--color); opacity: 1; animation: point calc(var(--time)) ease 1 -350ms; }
          @keyframes particle {
            0% { transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y))); opacity: 1; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
            70% { transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2)); opacity: 1; animation-timing-function: ease; }
            85% { transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y))); opacity: 1; }
            100% { transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)); opacity: 1; }
          }
          @keyframes point {
            0% { transform: scale(0); opacity: 0; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
            25% { transform: scale(calc(var(--scale) * 0.25)); }
            38% { opacity: 1; }
            65% { transform: scale(var(--scale)); opacity: 1; animation-timing-function: ease; }
            85% { transform: scale(var(--scale)); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          li.active { color: black; text-shadow: none; }
          li.active::after { opacity: 1; transform: scale(1); }
          li::after { content: ""; position: absolute; inset: 0; border-radius: 8px; background: transparent; opacity: 0; transform: scale(0); transition: all 0.3s ease; z-index: -1; }
          /* Typography scale for centered header */
          nav ul { font-size: 18px; gap: 1.4rem; }
          nav ul li { display:inline-flex; align-items:center; }
          nav ul li a { padding: 0.7em 1.05em; letter-spacing:.01em; }
          @media (min-width: 1024px) { nav ul { font-size: 20px; gap: 1.5rem; } nav ul li a{ padding: 0.75em 1.2em; } }
          @media (min-width: 1440px) { nav ul { font-size: 22px; gap: 1.75rem; } nav ul li a{ padding: 0.8em 1.3em; } }
          /* Prevent wrapping & hide native scrollbar for horizontal overflow */
          .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          /* Fade edges when scrollable (mask technique) */
          .gooey-fade-mask { mask: linear-gradient(90deg, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%); -webkit-mask: linear-gradient(90deg, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%); }
          @media (hover:hover){ .gooey-fade-mask:hover { mask: linear-gradient(90deg, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%); -webkit-mask: linear-gradient(90deg, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%); }}
          /* Extra hardening against wrapping */
          .gooey-nav-ul { flex-wrap: nowrap !important; white-space: nowrap !important; min-width: max-content; }
          .gooey-nav-ul > li { flex: 0 0 auto; }
          .gooey-nav-ul.compact { gap: 1rem !important; }
          .gooey-nav-ul.compact li a { padding: 0.55em 0.85em; font-size: 0.9em; }
          @media (max-width: 1200px){ .gooey-nav-ul { gap: 1.1rem; } }
          @media (max-width: 1050px){ .gooey-nav-ul { gap: .9rem; } .gooey-nav-ul li a{ padding:0.55em 0.85em; } }
          @media (max-width: 920px){ .gooey-nav-ul { gap: .75rem; } .gooey-nav-ul li a{ padding:0.5em 0.8em; font-size:.9em; } }
        `}
      </style>
      <div className="relative w-full" ref={containerRef}>
        <nav className="flex relative w-full" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex flex-nowrap gap-8 list-none p-0 px-4 m-0 relative z-[3] overflow-x-auto no-scrollbar overscroll-x-contain gooey-fade-mask"
            className={`gooey-nav-ul ${compact ? 'compact' : ''} flex flex-nowrap gap-8 list-none p-0 px-4 m-0 relative z-[3] overflow-x-auto no-scrollbar overscroll-x-contain ${overflowing ? 'gooey-fade-mask' : ''}`}
            style={{ color: 'black', textShadow: '0 1px 1px hsl(205deg 30% 10% / 0.2)' }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-full relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease shadow-[0_0_0.5px_1.5px_transparent] text-black shrink-0 ${activeIndex === index ? 'active' : ''}`}
              >
                <a
                  onClick={e => handleClick(e, index)}
                  href={item.href}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className="outline-none py-[0.6em] px-[1em] inline-block whitespace-nowrap"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {!DISABLE_GOOEY_EFFECTS && <span className="effect filter" ref={filterRef} />}
        {!DISABLE_GOOEY_EFFECTS && <span className="effect text" ref={textRef} />}
      </div>
    </>
  );
};

export default GooeyNav;
