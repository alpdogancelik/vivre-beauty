import { motion } from "framer-motion";

export default function FeatureCard({ title, text, cover }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/5"
        >
            <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-white/0">
                {cover}
            </div>
            <div className="p-4">
                <h3 className="text-base font-medium">{title}</h3>
                <p className="text-sm text-neutral-400">{text}</p>
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
        </motion.article>
    );
}
