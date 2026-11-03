# 🌿 Flora & Object Lens

**Versi Fullstack** — Web app deteksi tumbuhan dan objek menggunakan kamera perangkat, TensorFlow.js, Express.js, dan SQLite.

![Versi](https://img.shields.io/badge/versi-2.0.0-blue) ![Ekosistem](https://img.shields.io/badge/ekosistem-Web%20AI-orange)

## 🚀 Fitur

- 🎥 **Akses kamera** — Ambil gambar live dari kamera perangkat
- 🌱 **Deteksi tumbuhan** — Klasifikasi objek dan tumbuhan
- 📦 **Deteksi benda umum** — MobileNet untuk objek harian
- 📊 **Detail spesifikasi** — Tampilkan nama, jenis, kelas, dan tingkat kepercayaan
- ⭐ **Favorit** — Simpan hasil yang disukai
- 🖼️ **Galeri** — Kumpulkan semua hasil deteksi (server-side)
- 🌙 **Tema** — 4 tema (Hutan, Laut, Sunset, Minimalis)
- 🔊 **TTS** — Baca hasil deteksi dengan suara
- ⌨️ **Pintasan keyboard** — Spasi untuk ambil, Escape untuk tutup modal
- 📱 **Responsif** — Tampilkan di desktop dan HP
- 🗄️ **Database** — SQLite untuk menyimpan galeri server-side

## 📋 Prasyarat

- Node.js >= 18.0.0
- Browser modern (Chrome, Firefox, Edge, Safari)
- Akses kamera perangkat (perizinan akan diminta)
- Koneksi internet (untuk memuat model TensorFlow.js dari CDN)

## 📁 Struktur File

```
plant-detector/
├── backend/
│   ├── server.js          # Express.js server + API
│   ├── db.js              # SQLite database init
│   └── routes/
│       └── gallery.js     # CRUD gallery API
├── frontend/
│   ├── index.html         # Halaman utama + UI
│   ├── styles.css         # Seluruh gaya (sleek + responsive)
│   └── app.js             # Logika kamera + deteksi + API
├── package.json           # Manifest Node.js
└── README.md              # Dokumentasi
```

## 🏗️ Arsitektur

```
Browser (WebRTC) → MediaDevices API → Canvas → TensorFlow.js → MobileNet
        ↓
   Fetch → Express.js → SQLite
        ↓
   Galeri (server-side storage)
```

- **Frontend:** HTML5, CSS3, Vanilla JS + TensorFlow.js
- **Backend:** Express.js (Node.js)
- **Database:** SQLite (built-in `node:sqlite`)
- **Camera:** `navigator.mediaDevices.getUserMedia`
- **Storage:** SQLite server-side (gallery data)

## 🏃 Cara Menjalankan

### 1. Install dependencies

```bash
cd plant-detector
npm install
```

### 2. Jalankan server

```bash
npm start
# atau development mode
npm run dev
```

Server akan berjalan di `http://localhost:3000`.

### 3. Buka di browser

Buka `http://localhost:3000` di browser.

### 4. Gunakan aplikasi

1. **Klik "Mulai Kamera"** — izinkan akses kamera saat diminta
2. **Arahkan objek/tumbuhan** ke kamera
3. **Klik "Ambil Gambar"** atau tekan **spasi**
4. **Tunggu deteksi** — hasil akan tampil
5. **Simpan favorit** — klik bintang
6. **Lihat galeri** — klik "Galeri" untuk melihat semua hasil (tersimpan server-side)

## 📡 API Reference

### GET `/api/gallery`
**Mengembalikan:** Semua item galeri (terbaru duluan)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Apple",
    "type": "Buah",
    "cls": "Umum",
    "confidence": 0.87,
    "imageData": "data:image/jpeg;base64,...",
    "timestamp": "2026-11-03 09:30:00",
    "favourite": 0
  }
]
```

### POST `/api/gallery`
**Body:**
```json
{
  "name": "Apple",
  "type": "Buah",
  "cls": "Umum",
  "confidence": 0.87,
  "imageData": "data:image/jpeg;base64,...",
  "timestamp": "2026-11-03 09:30:00"
}
```

**Response:** 201 Created, item baru

### PUT `/api/gallery/:id`
**Body:**
```json
{ "favourite": true }
```

### DELETE `/api/gallery/:id`
**Response:** 200 OK, `{ success: true }`

## ⚙️ Pengaturan

Klik **⚙️ Pengaturan** untuk:
- **Tema** — Hutan, Laut, Sunset, Minimalis
- **Suara pembaca (TTS)** — Aktifkan baca hasil
- **Sensitivitas deteksi** — 1–10
- **Tampilkan spesifikasi detail** — On/Off
- **Tingkat log** — Debug, Info, Warning

## 🛠️ Teknis

### Backend Dependencies
- `express` — Web framework
- `cors` — Cross-Origin Resource Sharing

### Frontend Dependencies
- `@tensorflow/tfjs` — TensorFlow.js runtime
- `@tensorflow-models/mobilenet` — Object detection model

### Model
- **Framework:** TensorFlow.js
- **Model:** MobileNet (v2/v3)
- **Dataset:** ImageNet
- **Output:** Top-5 klasifikasi dengan confidence score

### Keterbatasan
- Model MobileNet dilatih pada ImageNet (bukan spesifik tumbuhan)
- Akurasi tergantung kualitas gambar
- Latar belakang yang kompleks bisa mempengaruhi hasil
- Deteksi tumbuhan spesifik butuh model custom

## 🔒 Privasi & Keamanan

- Semua processing **berjalan di browser** (client-side)
- Deteksi menggunakan model lokal di browser
- Galeri tersimpan di **SQLite server** (localhost)
- Tidak ada data terkirim ke third-party server
- **Saran keamanan:** Jangan expose port 3000 ke internet tanpa firewall

## 📄 Lisensi

MIT — bebas digunakan untuk kepentingan pribadi maupun komersial.

---

**Dibuat dengan ❤️ untuk pelestarian tumbuhan & deduksi objek oleh manusia.**

> ⚠️ **Disclaimer**: Deteksi dilakukan oleh model MobileNet yang terlatih pada ImageNet. Akurasi hasil tidak menjamin 100%. Untuk aplikasi komersial, gunakan model bespoke yang dilatih pada data spesifik.
