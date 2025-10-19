import React, { useEffect, useRef, useState } from 'react';

export default function GoogleMap({ lat, lng, zoom = 16, markerTitle = 'Konum', className = '', style }) {
    const mapRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!key) { setError('API anahtarı yok (.env)'); return; }
        const existing = document.querySelector('script[data-gmaps]');
        if (existing && window.google?.maps) init();
        else if (!existing) {
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`; s.async = true; s.defer = true; s.dataset.gmaps = '1';
            s.onload = () => !cancelled && init();
            s.onerror = () => !cancelled && setError('Harita yüklenemedi');
            document.head.appendChild(s);
        } else {
            existing.addEventListener('load', () => !cancelled && init(), { once: true });
            existing.addEventListener('error', () => !cancelled && setError('Harita yüklenemedi'), { once: true });
        }
        function init() {
            try {
                if (!mapRef.current || !window.google?.maps) return;
                const center = { lat: Number(lat), lng: Number(lng) };
                const map = new window.google.maps.Map(mapRef.current, { center, zoom, disableDefaultUI: true });
                new window.google.maps.Marker({ position: center, map, title: markerTitle });
            } catch { setError('Harita oluşturulamadı'); }
        }
        return () => { cancelled = true; };
    }, [lat, lng, zoom, markerTitle]);

    if (error) return <div className={`p-3 text-xs rounded border bg-rose-50/70 text-stone-600 ${className}`}>{error}</div>;
    return <div ref={mapRef} className={className} style={{ minHeight: 260, borderRadius: 16, background: 'rgba(255,255,255,0.5)', overflow: 'hidden', ...style }} />;
}
