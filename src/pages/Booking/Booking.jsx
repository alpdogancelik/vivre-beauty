import React, { useState } from "react";
import GradualBlur from '../../shared/ui/GradualBlur';
const ENABLE_GRADUAL_BLUR = false;

// Basit hizmet ve çalışan verileri. İleride backend'den veya CMS'den alınabilir.
const serviceCategories = [
    {
        id: "cilt",
        title: "Cilt Bakımı",
        services: [
            { id: "cilt_pro", name: "Profesyonel Cilt Bakımı", duration: 60 },
            { id: "cilt_hydra", name: "Hydrafacial Cilt Bakımı", duration: 60 }
        ]
    },
    {
        id: "makyaj",
        title: "Kalıcı Makyaj",
        services: [
            { id: "makyaj_dudak", name: "Dudak Renklendirme", duration: 90 },
            { id: "makyaj_dipliner", name: "Dip Liner / Babyliner", duration: 90 },
            { id: "makyaj_kas", name: "Microblading Kaş Uygulaması", duration: 120 },
            { id: "makyaj_ipek", name: "İpek Kirpik", duration: 60 },
            { id: "makyaj_lifting", name: "Kirpik-Kaş Lifting", duration: 45 }
        ]
    },
    {
        id: "manikur",
        title: "Manikür / Pedikür",
        services: [
            { id: "manikur_islak", name: "Islak Manikür", duration: 45 },
            { id: "manikur_kuru", name: "Kuru Manikür", duration: 45 },
            { id: "pedikur_islak", name: "Islak Pedikür", duration: 60 }
        ]
    },
    {
        id: "kalicioje",
        title: "Kalıcı Oje",
        services: [
            { id: "oje_nailart", name: "Nail Art", duration: 60 },
            { id: "oje_french", name: "French", duration: 60 }
        ]
    },
    {
        id: "protez",
        title: "Protez Tırnak",
        services: [
            { id: "protez_tirnak", name: "Protez Tırnak (sade)", duration: 180 },
            { id: "protez_nailart", name: "Protez Tırnak + Nail Art", duration: 240 },
            { id: "protez_cikarma", name: "Protez Tırnak Çıkarma", duration: 45 },
            { id: "protez_jel", name: "Jel Güçlendirme", duration: 60 },
            { id: "protez_form", name: "Alt Form / Üst Form", duration: 60 },
            { id: "protez_tips", name: "Tips Tekniği", duration: 90 }
        ]
    },
    {
        id: "g5",
        title: "G5 / Bölgesel Zayıflama",
        services: [
            { id: "g5_zayiflama", name: "Bölgesel Zayıflama", duration: 60 },
            { id: "g5_sikilasma", name: "Sıkılaşma", duration: 60 },
            { id: "g5_masaj", name: "G5 Masaj", duration: 45 }
        ]
    },
    {
        id: "lazer",
        title: "Lazer",
        services: [
            { id: "lazer_igne", name: "İğneli Epilasyon", duration: 45 },
            { id: "lazer_buz", name: "Buz Lazer", duration: 45 }
        ]
    }
];

const employees = [
    {
        id: "selin",
        name: "Selin Kahraman",
        canDo: [
            "cilt",
            "makyaj",
            "manikur",
            "kalicioje",
            "protez",
            "g5",
            "lazer"
        ]
    },
    {
        id: "derya",
        name: "Derya Bozkurt",
        canDo: [
            "cilt",
            "makyaj",
            "manikur",
            "kalicioje",
            "protez",
            "g5",
            "lazer"
        ]
    },
    {
        id: "aleyna",
        name: "Aleyna Selçuk",
        canDo: [
            "cilt",
            "makyaj",
            "manikur",
            "kalicioje",
            // dikkat: Aleyna protez tırnak yapmıyor
            "g5",
            "lazer"
        ]
    }
];

// Basit çalışma saatleri tanımı (dakika cinsinden). Gelişmiş sürümde backend'e taşınabilir.
// lastAppointment: son randevunun başlanabileceği saat (örneğin 19:00 -> 19*60).
const businessHours = {
    weekday: { open: 10 * 60, close: 21 * 60, lastAppointment: 19 * 60 },
    saturday: { open: 10 * 60, close: 18 * 60, lastAppointment: 17 * 60 },
    sunday: null
};

// Yardımcı: gün adını al (0=Sunday)
function getDayKey(dateString) {
    const d = new Date(dateString);
    const day = d.getDay();
    if (day === 0) return "sunday";
    if (day === 6) return "saturday";
    return "weekday";
}

// Belirli bir güne göre randevu için uygun saat slotlarını döndür
function generateTimeSlots(dateString, duration) {
    const key = getDayKey(dateString);
    const config = businessHours[key];
    if (!config) return [];
    const slots = [];
    // Başlangıç saatinden son randevu başlangıcına kadar 30'ar dakikalık aralıklarla listele
    for (
        let t = config.open;
        t <= config.lastAppointment - duration;
        t += 30
    ) {
        const hour = Math.floor(t / 60);
        const minute = t % 60;
        slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
    return slots;
}

export default function Booking() {
    const [step, setStep] = useState(1);
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdId, setCreatedId] = useState(null);

    const selectedCategory = serviceCategories.find(c => c.id === selectedCategoryId);
    const selectedService =
        selectedCategory?.services.find(s => s.id === selectedServiceId) || null;

    // Personel filtreleme: seçilen kategori "protez" ise Aleyna hariç, diğer kategorilerde tüm çalışanlar
    const availableEmployees = employees.filter(e =>
        selectedCategoryId
            ? // Aleyna protez tırnak kategorisini yapmıyor
            selectedCategoryId === "protez"
                ? e.id !== "aleyna"
                : e.canDo.includes(selectedCategoryId)
            : true
    );

    const goNext = () => {
        if (step === 1 && selectedService) {
            setStep(2);
        } else if (step === 2 && date && time && selectedEmployeeId) {
            setStep(3);
        } else if (step === 3 && customer.name && customer.email && customer.phone) {
            setStep(4);
        }
    };

    const goBack = () => setStep(step > 1 ? step - 1 : step);

    // ---- booking helpers (API with LocalStorage fallback) ----
    const API_BASE = (import.meta?.env?.VITE_API_URL) || "http://localhost:3001";

    function toMinutes(hhmm) {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    }

    function saveLocal(record) {
        try {
            const key = "vivre.bookings.v1";
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            list.push(record);
            localStorage.setItem(key, JSON.stringify(list));
        } catch { /* ignore */ }
    }

    async function handleConfirm() {
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            const selectedCategory = serviceCategories.find(c => c.id === selectedCategoryId);
            const selectedService = selectedCategory?.services.find(s => s.id === selectedServiceId) || null;
            if (!selectedService) throw new Error("Hizmet seçimi bulunamadı.");
            const staffName = employees.find(e => e.id === selectedEmployeeId)?.name || "";

            const payload = {
                serviceName: selectedService.name,
                durationMin: selectedService.duration,
                staffName,
                customer,
                date,
                time,
                notes: "web"
            };

            // Try API first
            let ok = false; let id = null; let conflict = false;
            try {
                const res = await fetch(`${API_BASE}/api/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.status === 409) { conflict = true; }
                if (res.ok) {
                    const data = await res.json();
                    ok = true; id = data?.id || null;
                }
            } catch (e) {
                // network or server unavailable -> fallback to local
            }

            if (conflict) {
                throw new Error("Seçtiğiniz saatte bu personelin başka randevusu var.");
            }

            if (!ok) {
                // Local fallback
                id = (typeof crypto !== 'undefined' && crypto.randomUUID?.()) || `bk_${Date.now()}`;
                saveLocal({ id, ...payload, createdAt: new Date().toISOString() });
            }

            setCreatedId(id);
            setStep(5);
        } catch (e) {
            setSubmitError(e?.message || "Randevu kaydedilemedi.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div className="space-y-6">
                {/* Adım göstergesi */}
                <div className="flex space-x-2 text-sm">
                    {[
                        "Hizmet",
                        "Zaman",
                        "Bilgiler",
                        "Onay"
                    ].map((label, idx) => (
                        <div
                            key={label}
                            className={`flex-1 py-2 text-center rounded ${step === idx + 1 ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-600"
                                }`}
                        >
                            {idx + 1}. {label}
                        </div>
                    ))}
                </div>

                {/* Adım 1: Hizmet seçimi */}
                {step === 1 && (
                    <div>
                        <p className="mb-3 text-sm text-stone-600">Kategori ve hizmet seçin.</p>
                        <div className="space-y-4">
                            {serviceCategories.map(cat => (
                                <div key={cat.id} className="border rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)
                                        }
                                        className="w-full flex justify-between items-center px-4 py-3 text-left"
                                    >
                                        <span className="font-medium">{cat.title}</span>
                                        <span>
                                            {selectedCategoryId === cat.id ? (
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 15l7-7 7 7"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                    </button>
                                    {selectedCategoryId === cat.id && (
                                        <div className="border-t divide-y">
                                            {cat.services.map(s => (
                                                <label
                                                    key={s.id}
                                                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-100"
                                                >
                                                    <span>{s.name}</span>
                                                    <span className="text-xs text-stone-500">
                                                        {Math.round(s.duration / 60)} sa {s.duration % 60 || ""} dk
                                                    </span>
                                                    <input
                                                        type="radio"
                                                        name="service"
                                                        className="ml-4"
                                                        checked={selectedServiceId === s.id}
                                                        onChange={() => setSelectedServiceId(s.id)}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                className="px-4 py-2 rounded bg-stone-900 text-white disabled:bg-stone-400"
                                onClick={goNext}
                                disabled={!selectedService}
                            >
                                Devam
                            </button>
                        </div>
                    </div>
                )}

                {/* Adım 2: Zaman ve personel seçimi */}
                {step === 2 && selectedService && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tarih seçin</label>
                            <input
                                type="date"
                                className="border rounded px-3 py-2 w-full"
                                value={date}
                                onChange={e => {
                                    setDate(e.target.value);
                                    setTime("");
                                }}
                            />
                        </div>

                        {date && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Saat seçin</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                    >
                                        <option value="">-- Seçiniz --</option>
                                        {generateTimeSlots(date, selectedService.duration).map(t => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Personel seçin</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full"
                                        value={selectedEmployeeId || ""}
                                        onChange={e => setSelectedEmployeeId(e.target.value)}
                                    >
                                        <option value="">-- Seçiniz --</option>
                                        {availableEmployees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between mt-6">
                            <button
                                className="px-4 py-2 rounded bg-stone-200 text-stone-700"
                                onClick={goBack}
                            >
                                Geri
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-stone-900 text-white disabled:bg-stone-400"
                                onClick={goNext}
                                disabled={!date || !time || !selectedEmployeeId}
                            >
                                Devam
                            </button>
                        </div>
                    </div>
                )}

                {/* Adım 3: Müşteri bilgileri */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                className="border rounded px-3 py-2 w-full"
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">E-posta</label>
                            <input
                                type="email"
                                className="border rounded px-3 py-2 w-full"
                                value={customer.email}
                                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Telefon</label>
                            <input
                                type="tel"
                                className="border rounded px-3 py-2 w-full"
                                value={customer.phone}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                className="px-4 py-2 rounded bg-stone-200 text-stone-700"
                                onClick={goBack}
                            >
                                Geri
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-stone-900 text-white disabled:bg-stone-400"
                                onClick={goNext}
                                disabled={
                                    !customer.name || !customer.email || !customer.phone
                                }
                            >
                                Devam
                            </button>
                        </div>
                    </div>
                )}

                {/* Adım 4: Özet ve onay */}
                {step === 4 && (
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium">Randevu Özeti</h4>
                        <div className="border rounded p-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Hizmet</span>
                                <span>{selectedService?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Süre</span>
                                <span>
                                    {Math.floor((selectedService?.duration || 0) / 60)} sa{" "}
                                    {selectedService?.duration % 60 || ""} dk
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tarih</span>
                                <span>{date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Saat</span>
                                <span>{time}</span>
                            </div>
                            <div className="flex justify_between">
                                <span>Personel</span>
                                <span>
                                    {employees.find(emp => emp.id === selectedEmployeeId)?.name || ""}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Müşteri</span>
                                <span>{customer.name}</span>
                            </div>
                        </div>
                        {submitError && (
                            <p className="text-sm text-red-600">{submitError}</p>
                        )}

                        <div className="flex justify-between mt-6">
                            <button
                                className="px-4 py-2 rounded bg-stone-200 text-stone-700"
                                onClick={goBack}
                            >
                                Geri
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-stone-900 text-white"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Kaydediliyor..." : "Onayla"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Adım 5: Tamamlandı */}
                {step === 5 && (
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium">Randevu Oluşturuldu</h4>
                        <div className="border rounded p-4 space-y-2">
                            <div className="flex justify-between"><span>Randevu No</span><span>{createdId}</span></div>
                            <div className="flex justify-between"><span>Tarih</span><span>{date}</span></div>
                            <div className="flex justify-between"><span>Saat</span><span>{time}</span></div>
                            <div className="flex justify-between">
                                <span>Personel</span>
                                <span>{employees.find(emp => emp.id === selectedEmployeeId)?.name || ""}</span>
                            </div>
                            <div className="flex justify-between"><span>Müşteri</span><span>{customer.name}</span></div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 rounded bg-stone-900 text-white"
                                onClick={() => {
                                    // yeni randevu için sıfırla
                                    setStep(1);
                                    setSelectedServiceId(null);
                                    setSelectedCategoryId(null);
                                    setSelectedEmployeeId(null);
                                    setDate(""); setTime("");
                                    setCustomer({ name: "", email: "", phone: "" });
                                    setSubmitError(null);
                                    setCreatedId(null);
                                }}
                            >
                                Yeni Randevu
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {ENABLE_GRADUAL_BLUR && (
                <GradualBlur
                    target="page"
                    position="bottom"
                    height="7rem"
                    strength={2}
                    divCount={6}
                    curve="bezier"
                    exponential={true}
                    opacity={1}
                    offsetBottom="96px"
                />
            )}
        </>
    );
}
