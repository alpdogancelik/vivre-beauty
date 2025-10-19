# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Google Maps Kullanımı

İletişim sayfasındaki harita için bir API anahtarı gerekir.

1. Google Cloud Console > Maps JavaScript API etkinleştir.
2. Credentials bölümünden bir Browser (API) Key oluştur ve domain kısıtlaması ekle.
3. Proje köküne `.env` dosyası ekle:

```
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

4. `npm run dev` sürecini yeniden başlat.

Kod: `src/components/GoogleMap.jsx`. Varsayılan koordinatlar Nişantaşı civarı örneğidir (`lat:41.0369, lng:28.9850`). Değiştirmek için bileşeni kullandığın yerde yeni değerleri geçir.
