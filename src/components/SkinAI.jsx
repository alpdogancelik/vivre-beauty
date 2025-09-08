import { useEffect, useRef, useState } from "react";

// ---------- helper utils ----------
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function roiStats(ctx, x, y, w, h) {
    const img = ctx.getImageData(Math.max(0, x), Math.max(0, y), Math.max(1, w), Math.max(1, h));
    const d = img.data,
        W = img.width,
        H = img.height;
    let sum = 0,
        sum2 = 0,
        hi = 0,
        edges = 0;
    const Y = new Float32Array(W * H);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) {
        const Yv = luma(d[i], d[i + 1], d[i + 2]);
        Y[j] = Yv;
        sum += Yv;
        sum2 += Yv * Yv;
        if (Yv > 220) hi++;
    }
    for (let yy = 1; yy < H - 1; yy++)
        for (let xx = 1; xx < W - 1; xx++) {
            const p = yy * W + xx;
            const gx =
                -Y[p - W - 1] -
                2 * Y[p - 1] -
                Y[p + W - 1] +
                Y[p - W + 1] +
                2 * Y[p + 1] +
                Y[p + W + 1];
            const gy =
                -Y[p - W - 1] -
                2 * Y[p - W] -
                Y[p - W + 1] +
                Y[p + W - 1] +
                2 * Y[p + W] +
                Y[p + W + 1];
            edges += Math.hypot(gx, gy);
        }
    const n = W * H;
    const mean = sum / n;
    const std = Math.sqrt(sum2 / n - mean * mean);
    return {
        mean,
        std,
        highlightRatio: hi / n,
        edgeMean: edges / ((W - 2) * (H - 2) || 1),
    };
}

function classify({ tStats, cLeft, cRight, overall }) {
    const cheeksMean = (cLeft.mean + cRight.mean) / 2;
    // heuristic rules
    if (tStats.highlightRatio > 0.035 && tStats.mean - cheeksMean > 8)
        return { label: "Karma", why: "T‑bölgesi yanaklardan daha parlak" };
    if (overall.highlightRatio > 0.055 && overall.std < 36)
        return { label: "Yağlı", why: "Yüksek parlaklık ve highlight oranı" };
    if (overall.mean < 110 && (cLeft.edgeMean + cRight.edgeMean) / 2 > 18)
        return { label: "Kuru", why: "Düşük parlaklık, belirgin mikro‑doku" };
    return { label: "Normal", why: "Parlaklık ve doku dengeli" };
}

// ---------- comprehensive recommendation map ----------
const suggestionsMap = {
    Kuru: {
        evdeBakim: [
            "Yumuşak temizleyici, parfümsüz",
            "Hyaluronik + seramid krem, gece %5 üre losyon",
            "Mineral SPF, bariyer onarıcı balzam",
            "Haftalık: Nem maskesi (sleeping pack)"
        ],
        salonUygulamasi: [
            "Oksijen bakımı, mezoterapi 'nem kokteyli'",
            "Ultrasound spatula + vacuum hydrafacial",
            "LED kızıl + nem ampul maskesi",
            "Skin booster (hyaluronik dolgu)"
        ],
        ozelSorunlar: [
            "Elastikiyet kaybı → Kollajen peptidli krem + HIFU",
            "İnce çizgi → Retinal 0.05% + peptidli göz kremi",
            "Soyulma → pH 5.5 krem, %1 panthenol spreyi"
        ]
    },
    Yağlı: {
        evdeBakim: [
            "%2 salisilik jel temizleyici, yağsız nemlendirici",
            "Kil maskesi ×2/hafta, matlaştırıcı jel krem",
            "AHA %5 tonik, C %10 serum, SPF50",
            "Gündüz: Antioksidan mist, gece çift temizlik"
        ],
        salonUygulamasi: [
            "Hafif BHA/LHA kimyasal peeling, LED mavi",
            "Enzim peeling + LED sarı, karbon lazer peel",
            "Diamond mikroderm + oksijen spreyi",
            "Hydrafacial 'clarify' modu"
        ],
        ozelSorunlar: [
            "Aktif sivilce → LED mavi, %10 niasinamid serum",
            "Gözenek genişlemesi → Q-switch tonlama, mikroneedling",
            "Mat ton ihtiyacı → Dermaplaning, fraksiyonel lazer"
        ]
    },
    Karma: {
        evdeBakim: [
            "T-bölge: BHA tonik + yanaklara zengin krem",
            "Nemlendirici SPF 30+, bölgesel farklı maskeler",
            "Haftalık: T-zone kil, U-zone nem maskesi",
            "Gece: Hafif retinal 0.03%, sabah C vitamini"
        ],
        salonUygulamasi: [
            "Kombine Hydrafacial (T-yağ dengesi, U-nem)",
            "Enzim peeling + LED sarı + karbon lazer peel",
            "Bölgesel: T-zone BHA, yanaklar hyaluronik",
            "IPL vasküler (kızarıklık varsa)"
        ],
        ozelSorunlar: [
            "Dehidrate karma → Jel + skualan serum",
            "T-bölge genişleme → Kil + çinko maskesi",
            "Hassas/kızaran → IPL kılcal, LED kırmızı"
        ]
    },
    Normal: {
        evdeBakim: [
            "Nazik temizleyici, antioksidan serum (C+E)",
            "Hafif nemlendirici + SPF30, gece yaşlanma karşıtı",
            "Haftalık: PHA %4 tonik, koruyucu maskeler",
            "Mevsimsel: Bariyer onarım, peptidli serumlar"
        ],
        salonUygulamasi: [
            "Klasik bakım veya LED sarı parlaklık",
            "Dermaplaning, mikroskopik fraksiyon",
            "Non-ablative 1550 nm, traneksamik mezoterapi",
            "Botulinum toksin light-dose (önleyici)"
        ],
        ozelSorunlar: [
            "Yaşlanma önlemi → %10 C vitamini + SPF50",
            "Ton eşitsizliği → Kojik asit + peptid kremi",
            "Elastik doku → PHA %4 tonik + niasinamid %10"
        ]
    }
};

export default function SkinAI() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const landmarkerRef = useRef(null);
    const rafRef = useRef(null);
    const [status, setStatus] = useState("İzin bekleniyor");
    const [result, setResult] = useState(null);

    // ---------- setup camera + model ----------
    useEffect(() => {
        let stream;
        (async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
                const fr = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
                );
                landmarkerRef.current = await FaceLandmarker.createFromOptions(fr, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    },
                    runningMode: "VIDEO",
                    numFaces: 1,
                });
                setStatus("Hazır");
                loop();
            } catch (err) {
                console.error(err);
                setStatus("Kamera / model hatası");
            }
        })();

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (stream) stream.getTracks().forEach((t) => t.stop());
        };
    }, []);

    // ---------- per‑frame analysis ----------
    function loop() {
        rafRef.current = requestAnimationFrame(loop);
        const v = videoRef.current,
            c = canvasRef.current;
        if (!v.videoWidth) return;
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        ctx.drawImage(v, 0, 0, c.width, c.height);

        const lm = landmarkerRef.current?.detectForVideo(v, performance.now());
        if (!lm?.faceLandmarks?.length) {
            setResult(null);
            return;
        }

        // bounding box of the first face
        const pts = lm.faceLandmarks[0];
        let minX = 1e9,
            minY = 1e9,
            maxX = -1e9,
            maxY = -1e9;
        for (const p of pts) {
            const x = p.x * c.width,
                y = p.y * c.height;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        const w = maxX - minX,
            h = maxY - minY;

        // regions of interest
        const forehead = { x: minX + 0.25 * w, y: minY + 0.05 * h, w: 0.5 * w, h: 0.18 * h };
        const nose = { x: minX + 0.38 * w, y: minY + 0.3 * h, w: 0.24 * w, h: 0.22 * h };
        const tZone = {
            x: Math.min(forehead.x, nose.x),
            y: forehead.y,
            w: Math.max(forehead.x + forehead.w, nose.x + nose.w) - Math.min(forehead.x, nose.x),
            h: nose.y + nose.h - forehead.y,
        };
        const cheekL = { x: minX + 0.08 * w, y: minY + 0.45 * h, w: 0.22 * w, h: 0.22 * h };
        const cheekR = { x: minX + 0.7 * w, y: minY + 0.45 * h, w: 0.22 * w, h: 0.22 * h };

        // metrics
        const tStats = roiStats(ctx, tZone.x, tZone.y, tZone.w, tZone.h);
        const cLeft = roiStats(ctx, cheekL.x, cheekL.y, cheekL.w, cheekL.h);
        const cRight = roiStats(ctx, cheekR.x, cheekR.y, cheekR.w, cheekR.h);
        const overall = roiStats(ctx, minX, minY, w, h);

        const cls = classify({ tStats, cLeft, cRight, overall });
        setResult(cls);

        // draw debug rectangles
        ctx.strokeStyle = "rgba(255,255,255,.7)";
        [tZone, cheekL, cheekR].forEach((r) => ctx.strokeRect(r.x, r.y, r.w, r.h));
        ctx.fillStyle = "rgba(0,0,0,.5)";
        ctx.fillRect(8, 8, 200, 30);
        ctx.fillStyle = "#fff";
        ctx.font = "16px system-ui";
        ctx.fillText(`Tahmin: ${cls.label}`, 16, 30);
    }

    // ---------- ui ----------
    return (
        <section id="skin-ai" className="w-full max-w-4xl mx-auto">
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-1">Yapay Zeka Cilt Analizi</h3>
                <p className="text-xs text-stone-600">
                    Kamera verisi cihazınızda işlenir, kaydedilmez. Profesyonel teşhis değildir, bilgi amaçlıdır.
                </p>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-black">
                <video ref={videoRef} className="w-full aspect-[4/3]" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            </div>

            <div className="mt-3 p-4 rounded-lg border bg-white shadow-sm">
                <div className="flex items-center gap-4 mb-3">
                    <div className="text-sm">
                        <b>Durum:</b> <span className={status === "Hazır" ? "text-green-600" : "text-amber-600"}>{status}</span>
                    </div>
                    <div className="text-sm">
                        <b>Cilt Tipi:</b> <span className="font-medium">{result?.label ?? "—"}</span>
                    </div>
                </div>

                {result?.why && (
                    <div className="text-xs text-stone-600 mb-4 p-2 bg-stone-50 rounded">
                        <b>Analiz:</b> {result.why}
                    </div>
                )}

                {result && suggestionsMap[result.label] && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-stone-800 mb-2">📋 Evde Bakım</h4>
                            <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside pl-2">
                                {suggestionsMap[result.label].evdeBakim.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-stone-800 mb-2">🏥 Salon Uygulaması</h4>
                            <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside pl-2">
                                {suggestionsMap[result.label].salonUygulamasi.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-stone-800 mb-2">⚡ Özel Sorunlar & Çözümler</h4>
                            <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside pl-2">
                                {suggestionsMap[result.label].ozelSorunlar.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-2 mt-4 border-t border-stone-200 text-xs text-stone-500">
                            💡 Bu öneriler genel bilgi amaçlıdır. Detaylı analiz için profesyonel konsültasyon önerilir.
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}