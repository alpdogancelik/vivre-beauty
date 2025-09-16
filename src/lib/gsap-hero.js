/* ================= GSAP HERO BACKUP (PREVIOUS) =================
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroAnimations() {
  const tl = gsap.timeline({ delay: 0.2 });
  tl.fromTo('.hero-section',{ x: '100%', opacity: 0 },{ x: '0%', opacity: 1, duration: 1.2, ease: 'power3.out' })
    .fromTo('.hero-title',{ opacity: 0, y: 80, scale: 0.95 },{ opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power3.out' },'-=0.8')
    .fromTo('.hero-subtitle',{ opacity: 0, y: 50 },{ opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },'-=1.0')
    .fromTo('.hero-cta',{ opacity: 0, y: 40, scale: 0.95 },{ opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.4)' },'-=0.8');
  gsap.to('.hero-cta-primary',{ boxShadow: '0 0 40px rgba(255,255,255,0.3), 0 25px 50px rgba(0,0,0,0.3)', duration: 3, ease: 'power2.inOut', yoyo: true, repeat: -1 });
  gsap.to('.hero-cta-secondary',{ scale: 1.02, duration: 4, ease: 'power2.inOut', yoyo: true, repeat: -1 });
  gsap.to('.hero-content',{ opacity: 0.2, scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1 }});
  return tl;
}
================= END BACKUP ================= */

import { gsap } from 'gsap';

export function initHeroAnimations() {
  if (typeof window === 'undefined') return;
  if (window.__HERO_ANIM_DONE__) return; // idempotent
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.__HERO_ANIM_DONE__ = true;
    return;
  }
  window.__HERO_ANIM_DONE__ = true;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero-title span:first-child', { opacity: 0, y: 40, duration: 0.8 })
    .from('.hero-title span:nth-child(2)', { opacity: 0, y: 30, duration: 0.6 }, '-=0.45')
    .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.55 }, '-=0.35')
    .from('.hero-cta > *', { opacity: 0, y: 28, stagger: 0.08, duration: 0.5 }, '-=0.25');

  // Looping subtle effects
  gsap.to('.hero-cta-primary', {
    boxShadow: '0 0 30px rgba(255,255,255,0.25), 0 18px 35px rgba(0,0,0,0.25)',
    duration: 2.5,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1
  });

  gsap.to('.hero-cta-secondary', {
    scale: 1.015,
    duration: 3.2,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1
  });

  return tl;
}