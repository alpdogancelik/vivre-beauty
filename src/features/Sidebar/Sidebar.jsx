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

					<div className="p-6">
						<div className="flex items-center space-x-2 mb-2">
							<img src="/vivre-logo-real.png" alt="Vivre Beauty" className="h-12 w-auto" />
						</div>
						<div className="text-xs text-stone-600 ml-1">Beauty Studio</div>
					</div>

					<div className="flex-1 px-6 overflow-y-auto">
						<ul className="space-y-1">
							{sections.map((section) => (
								<li key={section.id}>
									<button
										onClick={() => { onNav(section.id); onClose(); }}
										className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-300 ${active === section.id
												? "bg-rose-200/60 text-stone-800 font-medium backdrop-blur-sm shadow-sm"
												: "text-stone-600 hover:bg-rose-100/50 hover:text-stone-800"
											}`}
									>
										<span className="text-xs opacity-50 mr-3">{section.no}</span>
										{section.title}
									</button>
								</li>
							))}
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
