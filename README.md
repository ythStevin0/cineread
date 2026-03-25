# 🎬 CineRead

Platform katalog premium untuk trailer film dan sinopsis buku.

## Struktur Project

| Folder | Teknologi | Hosting |
|---|---|---|
| `/backend` | Node.js + Express + MongoDB | Railway |
| `/frontend` | React + Vite + Tailwind | Netlify |

## Sprint Progress

- [x] Sprint 1 — Backend Foundation
- [x] Sprint 2 — Authentication
- [x] Sprint 3 — Frontend UI & Vidbox Integration 🎬
- [x] Sprint 4 — Deployment

## Kontribusi & Perbaikan (Update 24 Maret 2026) 🚀

### 📺 Fitur Utama & Integrasi
- **Official Trailer Embeds**: Implementasi pemutar YouTube official (via API TMDB) langsung di dalam modal Film dan Series untuk menjaga kepatuhan Hak Cipta dan Terms of Service platform.
- **TV & Series Support**: Penambahan fitur penemuan Serial TV (Trending & Popular) dengan modal khusus (`TvModal.jsx`) dan presentasi kartu visual (`TvCard.jsx`) yang dilengkapi Badge label \"TV\".
- **Dynamic Content Discovery**: Fitur sinkronisasi data detail secara real-time saat klik pada kartu, memastikan genre, musim penayangan, dan status selalu mutakhir.

### 🛠 Perbaikan Teknis & Stabilitas
- **Fallback Content**: Logika mitigasi cerdas untuk rilis film terbaru (seperti Scream 7) apabila trailer TMDB belum rilis atau id tidak tersedia, layar dialihkan ke status \"Trailer tidak tersedia\" dengan estetika gelap yang elegan.
- **Backend Recovery**: Perbaikan pada `server.js` terkait instruksi proses lingkungan dan penyelesaian syntax node-modules yang sempat menimbulkan potensi crash API.
- **Security Audit**: Pembersihan dan penghapusan riwayat file `.env` dari *git tracking* serta pembaruan `.gitignore` untuk mencegah kebocoran secret API Key VITE maupun JWT.

### 🎨 UI/UX Enhancement
- **Premium Immersive Modal**: Desain ulang bagian *header* modal menjadi ruang putar video layar lebar (*aspect-video*) dengan gradien hitam bayangan tanpa bezel yang kaku.
- **Micro-Interaction Polish**: Penyederhanaan efek hover pada direktori Home untuk meminimalisasi *jello-effect*, mempertahankan gaya visual batas yang menyorot (*accent border*).

### 🚀 Deployment Update
- Frontend successfully deployed to Netlify.

---
*CineRead v2.0-beta — Dikembangkan dengan ❤️*
