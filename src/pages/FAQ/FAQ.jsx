import GradualBlur from '../../shared/ui/GradualBlur';
const ENABLE_GRADUAL_BLUR = false;

export default function FAQ(props = {}) {
    const { items, faqs, data, list } = props;
    const rows = Array.isArray(items)
        ? items
        : Array.isArray(faqs)
            ? faqs
            : Array.isArray(data)
                ? data
                : Array.isArray(list)
                    ? list
                    : [];

    return (
        <>
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
                {rows.map((it, i) => (
                    <details key={i} className="p-5 group">
                        <summary className="list-none cursor-pointer flex items-center justify-between">
                            <span className="text-sm md:text-base font-medium">{it.q}</span>
                            <span className="text-neutral-400 text-xs">{"+"}</span>
                        </summary>
                        <p className="mt-3 text-sm text-neutral-400">{it.a}</p>
                    </details>
                ))}
            </div>
            {ENABLE_GRADUAL_BLUR && (
                <GradualBlur
                    target="page"
                    position="bottom"
                    height="6rem"
                    strength={1.8}
                    divCount={5}
                    curve="bezier"
                    opacity={1}
                    offsetBottom="96px"
                />
            )}
        </>
    );
}
