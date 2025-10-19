import React, { useState } from "react";
import styles from "./Booking.module.css";
import GradualBlur from "../../shared/ui/GradualBlur";

/* Turn blur strips on by toggling this flag */
const ENABLE_GRADUAL_BLUR = false;

/* ------------------------------------------------------------------ */
/* 1 ▪ DATA (could be fetched from CMS / API in the future)           */
/* ------------------------------------------------------------------ */

const serviceCategories = [
    /* Turkish label • English label */
    {
        id: "cilt",
        title: "Cilt Bakımı / Skin Care",
        services: [
            { id: "cilt_pro", name: "Profesyonel Cilt Bakımı / Pro Facial", duration: 60 },
            { id: "cilt_hydra", name: "Hydrafacial Cilt Bakımı / Hydrafacial", duration: 60 }
        ]
    },
    {
        id: "makyaj",
        title: "Kalıcı Makyaj / Permanent Makeup",
        services: [
            { id: "makyaj_dudak", name: "Dudak Renklendirme / Lip Blush", duration: 90 },
            { id: "makyaj_dipliner", name: "Dip- / Babyliner", duration: 90 },
            { id: "makyaj_kas", name: "Microblading Kaş / Brows", duration: 120 },
            { id: "makyaj_ipek", name: "İpek Kirpik / Silk Lashes", duration: 60 },
            { id: "makyaj_lifting", name: "Kirpik-Kaş Lifting / Lash-Brow Lift", duration: 45 }
        ]
    },
    {
        id: "manikur",
        title: "Manikür / Pedikür  •  Mani-Pedi",
        services: [
            { id: "manikur_islak", name: "Islak Manikür / Wet Mani", duration: 45 },
            { id: "manikur_kuru", name: "Kuru Manikür / Dry Mani", duration: 45 },
            { id: "pedikur_islak", name: "Islak Pedikür / Wet Pedi", duration: 60 }
        ]
    },
    {
        id: "kalicioje",
        title: "Kalıcı Oje / Gel Polish",
        services: [
            { id: "oje_nailart", name: "Nail Art", duration: 60 },
            { id: "oje_french", name: "French", duration: 60 }
        ]
    },
    {
        id: "protez",
        title: "Protez Tırnak / Nail Extensions",
        services: [
            { id: "protez_tirnak", name: "Protez (Sade) / Classic Extension", duration: 180 },
            { id: "protez_nailart", name: "Protez + Nail Art", duration: 240 },
            { id: "protez_cikarma", name: "Çıkarma / Removal", duration: 45 },
            { id: "protez_jel", name: "Jel Güçlendirme / Gel Overlay", duration: 60 },
            { id: "protez_form", name: "Alt-Üst Form / Sculpting", duration: 60 },
            { id: "protez_tips", name: "Tips Tekniği / Tips", duration: 90 }
        ]
    },
    {
        id: "g5",
        title: "G5 – Bölgesel / Body Shaping",
        services: [
            { id: "g5_zayiflama", name: "Zayıflama / Slimming", duration: 60 },
            { id: "g5_sikilasma", name: "Sıkılaşma / Firming", duration: 60 },
            { id: "g5_masaj", name: "G5 Masaj / Massage", duration: 45 }
        ]
    },
    {
        id: "lazer",
        title: "Lazer / Laser",
        services: [
            { id: "lazer_igne", name: "İğneli Epilasyon / Electrolysis", duration: 45 },
            { id: "lazer_buz", name: "Buz Lazer / Ice Laser", duration: 45 }
        ]
    }
];

const employees = [
    {
        id: "selin",
        name: "Selin Kahraman",
        canDo: ["cilt", "makyaj", "manikur", "kalicioje", "protez", "g5", "lazer"]
    },
    {
        id: "derya",
        name: "Derya Bozkurt",
        canDo: ["cilt", "makyaj", "manikur", "kalicioje", "protez", "g5", "lazer"]
    },
    {
        id: "aleyna",
        name: "Aleyna Selçuk",
        canDo: ["cilt", "makyaj", "manikur", "kalicioje", "g5", "lazer"] // no protez
    }
];

/* opening hours in minutes */
const businessHours = {
    weekday: { open: 10 * 60, close: 21 * 60, lastAppointment: 19 * 60 },
    saturday: { open: 10 * 60, close: 18 * 60, lastAppointment: 17 * 60 },
    sunday: null
};

/* ------------------------------------------------------------------ */
/* 2 ▪ HELPERS                                                        */
/* ------------------------------------------------------------------ */

function getDayKey(dateString) {
    const d = new Date(dateString);
    return ["sunday", "weekday", "weekday", "weekday", "weekday", "weekday", "saturday"][d.getDay()];
}

function generateTimeSlots(dateString, duration) {
    const cfg = businessHours[getDayKey(dateString)];
    if (!cfg) return [];
    const slots = [];
    for (let t = cfg.open; t <= cfg.lastAppointment - duration; t += 30) {
        const hh = String(Math.floor(t / 60)).padStart(2, "0");
        const mm = String(t % 60).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
    }
    return slots;
}

function minutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

/* ------------------------------------------------------------------ */
/* 3 ▪ COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function Booking() {
    const [categoryId, setCategoryId] = useState(null);
    const [serviceId, setServiceId] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const category = serviceCategories.find(c => c.id === categoryId);
    const service = category?.services.find(s => s.id === serviceId) || null;
    const availableStaff = employees.filter(e =>
        categoryId
            ? categoryId === "protez"
                ? e.id !== "aleyna"
                : e.canDo.includes(categoryId)
            : true
    );

    async function confirmBooking() {
        setError(null);
        setSaving(true);
        try {
            if (!service) throw new Error("Hizmet seçin / Choose a service");

            const payload = {
                serviceName: service.name,
                durationMin: service.duration,
                staffName: employees.find(e => e.id === employeeId)?.name || "",
                customer,
                date,
                time,
                notes: "web"
            };

            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
            let ok = false;
            let id = null;
            let conflict = false;
            try {
                const res = await fetch(`${API_BASE}/api/bookings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.status === 409) conflict = true;
                if (res.ok) {
                    const data = await res.json();
                    ok = true;
                    id = data?.id || null;
                }
            } catch { /* offline */ }

            if (conflict) throw new Error("Bu saatte doluyuz / Slot already booked");

            if (!ok) {
                id = (crypto.randomUUID?.() ?? `bk_${Date.now()}`);
                try {
                    const list = JSON.parse(localStorage.getItem("vivre.bookings.v1") || "[]");
                    list.push({ id, ...payload, createdAt: new Date().toISOString() });
                    localStorage.setItem("vivre.bookings.v1", JSON.stringify(list));
                } catch {/* ignore */ }
            }

            alert(`Randevu oluşturuldu! / Booking created! ID: ${id}`);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    /* ------------------------------------------------------------------ */
    /* RENDER                                                             */
    /* ------------------------------------------------------------------ */
    return (
        <div className="space-y-6 text-stone-900">
            <h3 className="text-lg font-medium mb-2 text-stone-900">Randevu Formu / Booking Form</h3>

            {/* Hizmet Seçimi */}
            <div>
                <label className="block text-sm font-medium mb-1 text-stone-900">Kategori / Category</label>
                <select
                    className="border rounded px-3 py-2 w-full"
                    value={categoryId || ""}
                    onChange={e => {
                        setCategoryId(e.target.value);
                        setServiceId(null);
                        setEmployeeId(null);
                    }}
                >
                    <option value="">--</option>
                    {serviceCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                </select>
            </div>

            {category && (
                <div>
                    <label className="block text-sm font-medium mb-1 text-stone-900">Hizmet / Service</label>
                    <select
                        className="border rounded px-3 py-2 w-full"
                        value={serviceId || ""}
                        onChange={e => setServiceId(e.target.value)}
                    >
                        <option value="">--</option>
                        {category.services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({Math.floor(s.duration / 60)}h {s.duration % 60 || ""}m)</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Zaman Seçimi */}
            {service && (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-stone-900">Tarih / Date</label>
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
                        <div>
                            <label className="block text-sm font-medium mb-1 text-stone-900">Saat / Time</label>
                            <select
                                className="border rounded px-3 py-2 w-full"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                            >
                                <option value="">--</option>
                                {generateTimeSlots(date, service.duration).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 text-stone-900">Personel / Staff</label>
                        <select
                            className="border rounded px-3 py-2 w-full"
                            value={employeeId || ""}
                            onChange={e => setEmployeeId(e.target.value)}
                        >
                            <option value="">--</option>
                            {availableStaff.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {/* Müşteri Bilgileri */}
            {service && date && time && employeeId && (
                <>
                    {["name:Ad Soyad / Full Name", "email:E-posta / Email", "phone:Telefon / Phone"].map(
                        field => {
                            const [key, label] = field.split(":");
                            return (
                                <div key={key}>
                                    <label className="block text-sm font-medium mb-1 text-stone-900">{label}</label>
                                    <input
                                        type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                                        className="border rounded px-3 py-2 w-full"
                                        value={customer[key]}
                                        onChange={e => setCustomer({ ...customer, [key]: e.target.value })}
                                    />
                                </div>
                            );
                        }
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        className="px-4 py-2 rounded bg-stone-900 text-white disabled:bg-stone-400"
                        disabled={!customer.name || !customer.email || !customer.phone || saving}
                        onClick={confirmBooking}
                    >
                        {saving ? "Kaydediliyor… / Saving…" : "Onayla / Confirm"}
                    </button>
                </>
            )}

            {/* optional blur overlay */}
            {ENABLE_GRADUAL_BLUR && (
                <GradualBlur
                    target="page"
                    position="bottom"
                    height="7rem"
                    strength={2}
                    divCount={6}
                    curve="bezier"
                    exponential
                    opacity={1}
                    offsetBottom="96px"
                />
            )}
        </div>
    );
}
