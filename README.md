# FinPulse — Smart Financial & Savings Goal Manager

Aplikasi Web Pengatur Keuangan Harian, Rekap Mingguan/Bulanan, & Target Tabungan Interaktif (React + TypeScript + Express + SQLite Database).

---

## 🚀 Panduan Deployment Gratis ke Render.com

Render.com menyediakan **Free Web Service** yang 100% mendukung Node.js, Express, dan Database SQLite secara permanen.

### Langkah-Langkah Deployment:

1. **Upload Kode ke GitHub**:
   - Buat repository baru di [GitHub](https://github.com/new) (misal: `web-pengatur-keuangan`).
   - Buka terminal di folder ini dan jalankan:
     ```bash
     git init
     git add .
     git commit -m "Initial commit FinPulse"
     git branch -M main
     git remote add origin https://github.com/USERNAME_ANDA/web-pengatur-keuangan.git
     git push -u origin main
     ```

2. **Daftar & Login di Render.com**:
   - Buka [https://render.com](https://render.com/) dan login menggunakan akun GitHub Anda.

3. **Buat Web Service Baru**:
   - Di dashboard Render, klik tombol **New +** ➔ pilih **Web Service**.
   - Hubungkan (*Connect*) ke repository `web-pengatur-keuangan` Anda.

4. **Konfigurasi Web Service**:
    Render akan otomatis membaca file `render.yaml`, namun pastikan isinya sebagai berikut:
   - **Name**: `finpulse-pengatur-keuangan`
   - **Environment**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Deploy!**:
   - Klik **Create Web Service**.
   - Tunggu proses build 1–2 menit. Website dan Backend Database SQLite Anda akan langsung **LIVE** di alamat HTTPS Render (contoh: `https://finpulse-pengatur-keuangan.onrender.com`).
