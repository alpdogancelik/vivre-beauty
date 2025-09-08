import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section id="hero" className="relative overflow-hidden">
            {/* arka plan */}
            <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(0,0,0,0.06),transparent_60%)]" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[72vmin] aspect-square rounded-full bg-white shadow-[0_0_80px_rgba(0,0,0,0.06)]" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="container min-h-[78svh] grid md:grid-cols-12 gap-6 items-end pt-24"
            >
                <div className="md:col-span-7 pb-10">
                    <h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight font-display">
                        Doğal güzellik için <span className="text-stone-500">rafine</span> tasarım.
                    </h1>
                </div>
                <div className="md:col-span-5 md:pb-12">
                    <p className="text-stone-600 max-w-md">
                        Soho Skin hissiyatında, yumuşak arka planlar ve tipografi odaklı bir kahraman alanı.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <a href="#cosmetics" className="px-5 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-medium">Başla</a>
                        <a href="#contacto" className="px-5 py-2.5 rounded-full border border-stone-300 text-sm">İletişim</a>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
