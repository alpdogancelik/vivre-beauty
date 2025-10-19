export default function Sidebar({ sections, active, onNav, open = false, onClose = () => { } }) {
	return (
		<>
			{/* Mobil örtü */}
			<div
				className={`fixed inset-0 z-40 bg-black/30 ${open ? "block" : "hidden"}`}
				onClick={onClose}
				aria-hidden={!open}
			/>

			{/* Sağ çekmece */}
			<nav
				className={[
					"fixed right-0 top-0 h-screen w-56 z-50",
					"bg-rose-50/95 backdrop-blur-xl border-l border-rose-200/30",
					"transform transition-transform duration-300",
					open ? "translate-x-0" : "translate-x-full",
				].join(" ")}
				aria-label="Sağ gezinme"
			>
				<div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 to-amber-50/90 pointer-events-none" />

				<div className="relative z-10 flex flex-col h-full w-full">
					{/* Mobil kapat */}
					<button
						className="absolute top-3 left-3 px-2 py-1 text-xs border rounded"
						onClick={onClose}
						aria-label="Menüyü kapat"
					>
						Kapat
					</button>

					<div className="p-6 pb-4">
						<button
							onClick={() => { onNav(sections[0]?.id || 'home'); onClose(); window.history.pushState({}, '', '/'); }}
							className="group flex items-center space-x-3 mb-3 px-3 py-2 rounded-lg border border-transparent hover:border-rose-200/60 hover:bg-rose-100/50 transition"
							aria-label="Anasayfa"
						>
							<img src="/vivre-logo-real.png" alt="Vivre Beauty" className="h-8 w-auto transition group-hover:scale-[1.05]" />
							<span className="text-sm font-medium tracking-wide text-stone-700 group-hover:text-stone-900">Home</span>
						</button>
						<div className="text-[10px] uppercase tracking-wider text-stone-500 ml-1">Navigation</div>
					</div>

					<div className="flex-1 px-6 overflow-y-auto">
						<ul className="space-y-1 mt-2">
							{sections.map((section) => (
								<li key={section.id}>
									<button
										onClick={() => { onNav(section.id); onClose(); }}
										className={`w-full text-left px-4 py-2.5 rounded-lg text-sm tracking-wide transition-colors ${active === section.id
											? "bg-rose-200/70 text-stone-900 font-medium shadow-sm ring-1 ring-white/40 backdrop-blur"
											: "text-stone-600 hover:bg-rose-100/60 hover:text-stone-900"}`}
									>
										<span className="text-[10px] opacity-50 mr-3 font-mono">{section.no}</span>
										{section.title}
									</button>
								</li>
							))}
							{/* Reservation sekmesi */}
							<li>
								<button
									onClick={() => { onNav('reservation'); onClose(); document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' }); }}
									className="w-full text-left px-4 py-2.5 rounded-lg text-sm tracking-wide transition-colors text-stone-600 hover:bg-rose-100/60 hover:text-stone-900"
								>
									<span className="text-[10px] opacity-50 mr-3 font-mono">R</span>
									Randevu
								</button>
							</li>
						</ul>
					</div>

					<div className="p-6 text-xs text-stone-500 border-t border-rose-200/40">
						© {new Date().getFullYear()} Vivre Beauty
					</div>
				</div>
			</nav>
		</>
	);
}
