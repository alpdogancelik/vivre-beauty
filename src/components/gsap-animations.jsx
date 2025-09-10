import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Page load animation hook
export const usePageLoadAnimation = () => {
  const tl = useRef();

  useEffect(() => {
    // Create timeline for page load
    tl.current = gsap.timeline({ paused: true });
    
    // Animate page elements on load
    tl.current
      .from('body', { 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power2.out' 
      })
      .from('.hero-title', { 
        y: 50, 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power3.out' 
      }, 0.2)
      .from('.hero-subtitle', { 
        y: 30, 
        opacity: 0, 
        duration: 0.6, 
        ease: 'power2.out' 
      }, 0.4)
      .from('.hero-buttons', { 
        y: 20, 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power2.out' 
      }, 0.6)
      .from('.sidebar', { 
        x: -100, 
        opacity: 0, 
        duration: 0.7, 
        ease: 'power3.out' 
      }, 0.3);

    // Play animation when component mounts
    tl.current.play();

    return () => {
      tl.current?.kill();
    };
  }, []);

  return tl.current;
};

// Section reveal animation hook
export const useSectionReveal = (triggerRef, options = {}) => {
  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const {
      y = 50,
      opacity = 0,
      duration = 0.8,
      ease = 'power3.out',
      start = 'top 80%',
      end = 'bottom 20%',
      ...restOptions
    } = options;

    gsap.fromTo(
      element,
      {
        y,
        opacity,
      },
      {
        y: 0,
        opacity: 1,
        duration,
        ease,
        scrollTrigger: {
          trigger: element,
          start,
          end,
          toggleActions: 'play none none reverse',
          ...restOptions,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [triggerRef, options]);
};

// Stagger animation hook for multiple elements
export const useStaggerAnimation = (containerRef, childSelector, options = {}) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    if (children.length === 0) return;

    const {
      y = 30,
      opacity = 0,
      duration = 0.6,
      stagger = 0.1,
      ease = 'power2.out',
      start = 'top 80%',
      ...restOptions
    } = options;

    gsap.fromTo(
      children,
      {
        y,
        opacity,
      },
      {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease,
        scrollTrigger: {
          trigger: container,
          start,
          toggleActions: 'play none none reverse',
          ...restOptions,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [containerRef, childSelector, options]);
};

// Hover animation utility
export const createHoverAnimation = (element, options = {}) => {
  const {
    scale = 1.05,
    duration = 0.3,
    ease = 'power2.out',
  } = options;

  const hoverIn = () => {
    gsap.to(element, {
      scale,
      duration,
      ease,
    });
  };

  const hoverOut = () => {
    gsap.to(element, {
      scale: 1,
      duration,
      ease,
    });
  };

  return { hoverIn, hoverOut };
};

// Navigation hover effects
export const useNavigationHover = () => {
  useEffect(() => {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      const { hoverIn, hoverOut } = createHoverAnimation(item, {
        scale: 1.02,
        duration: 0.2,
      });

      item.addEventListener('mouseenter', hoverIn);
      item.addEventListener('mouseleave', hoverOut);
    });

    return () => {
      navItems.forEach(item => {
        item.removeEventListener('mouseenter', () => {});
        item.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);
};

// Parallax effect hook
export const useParallax = (elementRef, options = {}) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      y = -50,
      ease = 'none',
      start = 'top bottom',
      end = 'bottom top',
    } = options;

    gsap.to(element, {
      y,
      ease,
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [elementRef, options]);
};