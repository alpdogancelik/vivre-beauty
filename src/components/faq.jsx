import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function FAQ({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
            {items.map((it, i) => (
                <FAQItem 
                    key={i} 
                    item={it} 
                    index={i}
                    isOpen={openIndex === i}
                    onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
            ))}
        </div>
    );
}

function FAQItem({ item, index, isOpen, onToggle }) {
    const contentRef = useRef(null);
    const iconRef = useRef(null);

    useEffect(() => {
        const content = contentRef.current;
        const icon = iconRef.current;
        
        if (isOpen) {
            // Open animation
            gsap.fromTo(content, 
                { height: 0, opacity: 0 },
                { 
                    height: 'auto', 
                    opacity: 1, 
                    duration: 0.4, 
                    ease: 'power2.out' 
                }
            );
            gsap.to(icon, {
                rotation: 45,
                duration: 0.3,
                ease: 'power2.out'
            });
        } else {
            // Close animation
            gsap.to(content, {
                height: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in'
            });
            gsap.to(icon, {
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }, [isOpen]);

    return (
        <div className="p-5">
            <button 
                onClick={onToggle}
                className="w-full flex items-center justify-between text-left group"
            >
                <span className="text-sm md:text-base font-medium group-hover:text-white transition-colors duration-200">
                    {item.q}
                </span>
                <span 
                    ref={iconRef}
                    className="text-neutral-400 text-lg font-light transition-colors duration-200 group-hover:text-white"
                >
                    +
                </span>
            </button>
            <div 
                ref={contentRef}
                className="overflow-hidden"
                style={{ height: 0, opacity: 0 }}
            >
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                    {item.a}
                </p>
            </div>
        </div>
    );
}
