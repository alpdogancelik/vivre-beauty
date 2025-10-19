import React, { useState, useMemo } from "react";
import servicesData from "../data/services.json";

const employees = [
  { id: "selin", name: "Selin Kahraman", canDo: ["nails", "haircare"] },
  { id: "derya", name: "Derya Bozkurt", canDo: ["nails", "haircare"] },
  { id: "aleyna", name: "Aleyna Selçuk", canDo: ["nails"] },
  { id: "ayse", name: "Ayşe Yılmaz", canDo: ["haircare"] },
  { id: "zeynep", name: "Zeynep Kaya", canDo: ["haircare"] }
];

const businessHours = {
  weekday: { open: 10 * 60, close: 21 * 60, lastAppointment: 19 * 60 },
  saturday: { open: 10 * 60, close: 18 * 60, lastAppointment: 17 * 60 },
  sunday: null
};

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

export default function Booking2() {
  const [categoryKey, setCategoryKey] = useState(null);
  const [subcategoryKey, setSubcategoryKey] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [modifierSelections, setModifierSelections] = useState({});
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const category = useMemo(
    () => servicesData.categories.find(c => c.key === categoryKey),
    [categoryKey]
  );
  const subcategory = useMemo(
    () => category?.subcategories.find(sc => sc.key === subcategoryKey),
    [category, subcategoryKey]
  );
  const service = useMemo(
    () => subcategory?.services.find(s => s.id === serviceId),
    [subcategory, serviceId]
  );
  const variant = useMemo(
    () => service?.variants?.find(v => v.id === variantId),
    [service, variantId]
  );

  const duration = variant?.duration || service?.duration || 60;
  const basePrice = variant?.price || service?.price || 0;

  const modifierPrice = useMemo(() => {
    let sum = 0;
    if (service?.modifiers) {
      for (const mod of service.modifiers) {
        const sel = modifierSelections[mod.id];
        if (sel) {
          const opt = mod.options.find(o => o.id === sel);
          if (opt && opt.priceAdjustment) sum += opt.priceAdjustment;
        }
      }
    }
    return sum;
  }, [service, modifierSelections]);

  const addOnsPrice = useMemo(() => {
    if (!service?.addOns) return 0;
    return selectedAddOns.reduce((acc, id) => {
      const addon = service.addOns.find(a => a.id === id);
      return acc + (addon?.price || 0);
    }, 0);
  }, [service, selectedAddOns]);

  const totalPrice = basePrice + modifierPrice + addOnsPrice;

  const timeSlots = useMemo(() => (date ? generateTimeSlots(date, duration) : []), [date, duration]);

  const eligibleEmployees = useMemo(() => {
    const reqTag = service?.requiredSkill;
    if (!reqTag) return employees;
    return employees.filter(e => e.canDo.includes(reqTag));
  }, [service]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!categoryKey || !serviceId || !date || !time || !employeeId) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    if (!customer.name || !customer.email || !customer.phone) {
      setError("Lütfen iletişim bilgilerinizi doldurun.");
      return;
    }

    const payload = {
      categoryKey,
      subcategoryKey,
      serviceId,
      variantId,
      modifierSelections,
      addOns: selectedAddOns,
      employeeId,
      date,
      time,
      duration,
      totalPrice,
      customer
    };

    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Randevu oluşturulamadı");
      alert("Randevunuz başarıyla oluşturuldu!");
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Randevu Oluştur</h2>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium mb-2">Kategori</label>
          <select
            value={categoryKey || ""}
            onChange={e => {
              setCategoryKey(e.target.value);
              setSubcategoryKey(null);
              setServiceId(null);
              setVariantId(null);
            }}
            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
          >
            <option value="">Seçiniz</option>
            {servicesData.categories.map(cat => (
              <option key={cat.key} value={cat.key}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Alt Kategori */}
        {category?.subcategories && (
          <div>
            <label className="block text-sm font-medium mb-2">Alt Kategori</label>
            <select
              value={subcategoryKey || ""}
              onChange={e => {
                setSubcategoryKey(e.target.value);
                setServiceId(null);
                setVariantId(null);
              }}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
            >
              <option value="">Seçiniz</option>
              {category.subcategories.map(sub => (
                <option key={sub.key} value={sub.key}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hizmet */}
        {subcategory?.services && (
          <div>
            <label className="block text-sm font-medium mb-2">Hizmet</label>
            <select
              value={serviceId || ""}
              onChange={e => {
                setServiceId(e.target.value);
                setVariantId(null);
                setModifierSelections({});
                setSelectedAddOns([]);
              }}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
            >
              <option value="">Seçiniz</option>
              {subcategory.services.map(svc => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} - {svc.price}₺
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Varyant */}
        {service?.variants && (
          <div>
            <label className="block text-sm font-medium mb-2">Varyant</label>
            <select
              value={variantId || ""}
              onChange={e => setVariantId(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
            >
              <option value="">Seçiniz</option>
              {service.variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} - {v.price}₺
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Modifiers */}
        {service?.modifiers?.map(mod => (
          <div key={mod.id}>
            <label className="block text-sm font-medium mb-2">{mod.name}</label>
            <select
              value={modifierSelections[mod.id] || ""}
              onChange={e => setModifierSelections({ ...modifierSelections, [mod.id]: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
            >
              <option value="">Seçiniz</option>
              {mod.options.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} {opt.priceAdjustment ? `(+${opt.priceAdjustment}₺)` : ""}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Add-ons */}
        {service?.addOns && (
          <div>
            <label className="block text-sm font-medium mb-2">Ekstra Hizmetler</label>
            {service.addOns.map(addon => (
              <label key={addon.id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedAddOns.includes(addon.id)}
                  onChange={e => {
                    setSelectedAddOns(
                      e.target.checked
                        ? [...selectedAddOns, addon.id]
                        : selectedAddOns.filter(id => id !== addon.id)
                    );
                  }}
                />
                <span className="text-sm">
                  {addon.name} (+{addon.price}₺)
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Personel */}
        {service && (
          <div>
            <label className="block text-sm font-medium mb-2">Personel</label>
            <select
              value={employeeId || ""}
              onChange={e => setEmployeeId(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
            >
              <option value="">Seçiniz</option>
              {eligibleEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tarih */}
        {service && (
          <div>
            <label className="block text-sm font-medium mb-2">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                setTime("");
              }}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
            />
          </div>
        )}

        {/* Saat */}
        {date && (
          <div>
            <label className="block text-sm font-medium mb-2">Saat</label>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
            >
              <option value="">Seçiniz</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* İletişim Bilgileri */}
        {service && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Adınız</label>
              <input
                type="text"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <input
                type="email"
                value={customer.email}
                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefon</label>
              <input
                type="tel"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-stone-400 outline-none"
              />
            </div>
          </>
        )}

        {/* Özet */}
        {service && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <h3 className="font-medium mb-2">Randevu Özeti</h3>
            <p className="text-sm text-stone-600">
              Hizmet: {service.name} {variant && `(${variant.name})`}
            </p>
            <p className="text-sm text-stone-600">Süre: {duration} dakika</p>
            <p className="text-sm text-stone-600">
              Toplam Tutar: <span className="font-semibold">{totalPrice}₺</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 rounded-xl bg-stone-900 text-stone-50 font-medium hover:bg-stone-800 disabled:opacity-50 transition"
        >
          {saving ? "Kaydediliyor..." : "Randevu Oluştur"}
        </button>
      </form>
    </div>
  );
}
