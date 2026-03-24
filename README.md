# 🎬 CineRead

Platform katalog premium untuk trailer film dan sinopsis buku.

## Struktur Project

| Folder | Teknologi | Hosting |
|---|---|---|
| `/backend` | Node.js + Express + MongoDB | Railway |
| `/frontend` | React + Vite + Tailwind | Vercel |

## Sprint Progress

- [x] Sprint 1 — Backend Foundation
- [x] Sprint 2 — Authentication
- [x] Sprint 3 — Frontend UI & Vidbox Integration 🎬
- [ ] Sprint 4 — Deployment

## Kontribusi & Perbaikan (Update 24 Maret 2026) 🚀

### 📺 Fitur Utama & Integrasi
- **Full Vidbox Integration**: Mengganti pemutar trailer YouTube yang tidak stabil dengan pemutar film/series langsung dari `vidboxto.com` yang terintegrasi (Embedded Iframe).
- **Dual Content Toggle**: Implementasi tombol navigasi di dalam modal untuk beralih secara instan antara pemutar konten utama (Movie/Series) dan konten Trailer menggunakan parameter Vidbox.
- **Direct Card Actions**: Penambahan tombol **▶ Nonton** dan **🎬 Trailer** pada kartu film/series di halaman beranda (Hover State) untuk akses instan tanpa melalui banyak klik.

### 🛠 Perbaikan Teknis & Stabilitas
- **SSL Certificate Fix**: Migrasi domain dari `.to` ke `.com` untuk menyelesaikan masalah koneksi "Not Private" dan memastikan keamanan pemutar video.
- **Handling 404 Content**: Logika cerdas untuk menangani konten yang belum rilis (seperti Scream 7) dengan fallback poster berkualitas tinggi untuk menjaga estetika UI.
- **Backend Recovery**: Perbaikan pada `server.js` terkait masalah encoding dan pembersihan syntax error yang sempat menyebabkan aplikasi blank.
- **Automated Detail Fetching**: Sinkronisasi otomatis data TMDB (Rating, Year, Genre, Overview) setiap kali modal dibuka untuk memastikan informasi selalu mutakhir.

### 🎨 UI/UX Enhancement
- **Clean Modal Layout**: Desain ulang bagian atas modal menjadi area pemutar yang luas dan imersif, serta menghapus elemen "berat" yang tidak perlu.
- **Simplified Hover Effects**: Menghapus efek `scale-up` pada kartu untuk mencegah layout berantakan, namun tetap mempertahankan indikator `ring-accent` yang elegan.
- **YouTube Dependency Cleanup**: Penghapusan total semua sisa-sisa API YouTube untuk performa load aplikasi yang lebih cepat dan ringan.

---
*CineRead v2.0-beta — Dikembangkan dengan ❤️*