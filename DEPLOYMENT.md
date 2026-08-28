# 🚀 Panduan Deployment & Migrasi Custom Domain (`https://hunters.biz.id/`)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk melakukan build, konfigurasi environment, pendaftaran DNS, dan deployment aplikasi **Hunters Esports Tournament Portal** ke domain kustom **`https://hunters.biz.id/`**.

---

## 📋 Ringkasan Arsitektur & Persyaratan Build

- **Framework**: React 19 + Vite + Tailwind CSS
- **Output Build**: Static Assets SPA (`dist/`)
- **Port Default Dev**: 3000
- **Base Domain**: `https://hunters.biz.id/`

---

## 🛠️ Langkah 1: Persiapan Build Production

### 1. Konfigurasi Environment Variable (`.env.production`)
Buat atau atur file `.env.production` pada server hosting Anda:

```env
# Domain Utama
VITE_APP_URL="https://hunters.biz.id"
APP_URL="https://hunters.biz.id"

# Gemini AI (opsional jika menggunakan fitur AI Server-Side)
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 2. Jalankan Command Build
Jalankan perintah berikut di terminal local/CI-CD untuk memproduksi bundel akhir:

```bash
npm run build
```

Perintah ini akan merilis folder `dist/` yang berisi file HTML, JS, CSS, dan aset gambar yang sudah terkompresi.

---

## 🌐 Langkah 2: Pengaturan DNS Domain `hunters.biz.id`

Buka panel penyedia domain Anda (misal: Cloudflare, Niagahoster, Rumahweb, Dewaweb, dll.), lalu arahkan DNS Records sebagai berikut:

### Opsi A: Menggunakan Cloudflare (Direkomendasikan)
1. Ubah Nameserver domain `hunters.biz.id` ke Nameserver Cloudflare.
2. Tambahkan DNS Records:
   - **Type**: `A` | **Name**: `@` | **IPv4**: *(IP Public VPS / Server Anda)* | **Proxy Status**: Proxied (Awan Oranye)
   - **Type**: `CNAME` | **Name**: `www` | **Target**: `hunters.biz.id` | **Proxy Status**: Proxied

### Opsi B: Vercel / Netlify
- **Type**: `CNAME` | **Name**: `@` / `www` | **Target**: `cname.vercel-dns.com` (atau URL target Netlify)

---

## 💻 Langkah 3: Pilihan Metode Hosting & Server Configuration

### 🔴 Metode 1: cPanel / Shared Hosting (Sangat Populer untuk `.biz.id`)
1. Jalankan `npm run build` di lokal.
2. Kompres seluruh file dalam folder `dist/` menjadi `dist.zip`.
3. Buka **cPanel File Manager** -> navigasi ke folder `public_html/`.
4. Upload `dist.zip` lalu **Extract**.
5. Tambahkan file `.htaccess` di dalam `public_html/` untuk menangani **SPA Single Page Application Client Routing** agar URL tidak 404 saat direfresh:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

### 🟢 Metode 2: Vercel / Netlify (Otomatis & Gratis HTTPS)
1. Push repositori ke **GitHub / GitLab**.
2. Hubungkan akun Vercel/Netlify ke repositori ini.
3. Atur **Build Command**: `npm run build`
4. Atur **Output Directory**: `dist`
5. Pada menu **Domains**, tambahkan `hunters.biz.id` dan ikuti instruksi CNAME/A Record.
6. Buat file `vercel.json` di root proyek untuk fallback SPA route:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 🔵 Metode 3: VPS Ubuntu + Nginx (Untuk Performa Maksimal)
1. Clone repositori ke VPS Ubuntu.
2. Install Node.js v20+ & Nginx.
3. Jalankan `npm install` dan `npm run build`.
4. Konfigurasi blok server Nginx `/etc/nginx/sites-available/hunters.biz.id`:

```nginx
server {
    listen 80;
    server_name hunters.biz.id www.hunters.biz.id;

    root /var/www/hunters-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caching Aset Statis
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```
5. Aktifkan SSL Sertifikat Gratis dengan Certbot Let's Encrypt:
```bash
sudo certbot --nginx -d hunters.biz.id -d www.hunters.biz.id
```

---

## ✅ Langkah 4: Verifikasi & Uji Coba

Setelah domain terpasang dan propaganda DNS selesai (1-15 menit):
1. **Buka**: `https://hunters.biz.id` di browser.
2. **Cek SSL**: Pastikan gembok HTTPS aktif.
3. **Cek Navigasi**: Navigasi ke menu Tim Terdaftar, Informasi Pertandingan, Aturan, dan Admin untuk memastikan Single Page Routing berjalan mulus tanpa error 404.
4. **Cek Console Browser**: Buka F12 Developer Tools untuk memastikan tidak ada error CORS atau missing assets.

---

### 📞 Kontak & Bantuan
Jika memerlukan penyesuaian API backend Express atau setup Docker container khusus untuk domain `hunters.biz.id`, dokumentasi ini dapat disesuaikan kembali.
