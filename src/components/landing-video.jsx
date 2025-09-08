export default function LandingVideo({ onFinish }) {
    return (
        <div className="fixed inset-0 z-[60] bg-[#faf7f2]">
            <video
                className="absolute inset-0 w-full h-full object-contain"
                autoPlay
                muted
                playsInline
                onEnded={onFinish}
                onError={onFinish}   // hata olursa siteye geç
                poster="/landing/vivre-landing-poster.jpg" // varsa
            >
                <source src="/landing/vivre-landing.mp4" type="video/mp4" />
            </video>

            <button
                className="absolute bottom-8 inset-x-0 mx-auto px-4 py-2 rounded-full bg-stone-900 text-stone-50 text-sm"
                onClick={onFinish}
            >
                Geç
            </button>
        </div>
    );
}
