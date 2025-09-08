export default function FAQ({ items }) {
    return (
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
            {items.map((it, i) => (
                <details key={i} className="p-5 group">
                    <summary className="list-none cursor-pointer flex items-center justify-between">
                        <span className="text-sm md:text-base font-medium">{it.q}</span>
                        <span className="text-neutral-400 text-xs">{"+"}</span>
                    </summary>
                    <p className="mt-3 text-sm text-neutral-400">{it.a}</p>
                </details>
            ))}
        </div>
    );
}
