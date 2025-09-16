// ...existing code...
export const SECTIONS = [
    {
        id: "cosmetics", no: "01", title: "Cosmetics",
        blurb: "High‑performance formulas that deliver visible results.",
        cta: "Explore products", href: "#cosmetics",
        theme: { hue: 28 }
    },

    {
        id: "clinic", no: "02", title: "Clinic",
        blurb: "Minimally invasive treatments and bespoke skin protocols.",
        cta: "View treatments", href: "#clinic",
        theme: { hue: 12 }
    },

    {
        id: "about", no: "03", title: "About",
        blurb: "Our philosophy, people, and values.",
        cta: "Our story", href: "#about",
        theme: { hue: 22 }
    },

    {
        id: "work", no: "04", title: "Work",
        blurb: "Selected work and case studies.",
        cta: "See all", href: "#work",
        theme: { hue: 18 }
    },

    {
        id: "training", no: "05", title: "Training",
        blurb: "Workshops, masterclasses, and certifications.",
        cta: "See schedule", href: "#training",
        theme: { hue: 16 }
    },

    {
        id: "studios", no: "06", title: "Studios",
        blurb: "Find a studio and book online.",
        cta: "Book now", href: "#studios",
        theme: { hue: 20 }
    },

    {
        id: "news", no: "07", title: "News",
        blurb: "Announcements, launches, and updates.",
        cta: "Read news", href: "#news",
        theme: { hue: 26 }
    },

    {
        id: "franchise", no: "08", title: "Franchise",
        blurb: "Partnership model and expansion roadmap.",
        cta: "Become a partner", href: "#franchise",
        theme: { hue: 24 }
    },

    {
        id: "contact", no: "09", title: "Contact",
        blurb: "Questions, press, and collaborations.",
        cta: "Get in touch", href: "#contact",
        theme: { hue: 30 }
    }
];
// ...existing code...

// Shared navigation items derived from SECTIONS (no deletions, additive only)
export const NAV_ITEMS = (Array.isArray(SECTIONS) ? SECTIONS : []).map((s) => ({
    id: s.id,
    number: s.no,
    label: s.title,
    href: s.href || `#${s.id}`,
}));