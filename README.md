# 📊 Satker Reminder - Sistem Pengingat Sisa Kas Kemhan

Aplikasi web modern untuk mengelola dan mengirim pengingat sisa kas satuan kerja dengan UI profesional, role-based access, dan fitur laporan lengkap.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```
Akses: http://localhost:3000

### 3. Login dengan Role
- **Super Admin**: `superadmin` / `super123`
- **Admin**: `admin` / `admin123`  
- **User**: `user` / `user123`

## ✨ Fitur Utama

- 🎨 **UI Profesional** - Tema coklat muda dengan background Kemhan
- 👥 **Role-Based Access** - Super Admin, Admin, dan User
- 📊 **Dashboard Statistik** - Overview status pengiriman dan laporan
- 📧 **Email Otomatis** - Pengiriman reminder via SMTP (Gmail)
- 📅 **Scheduler Otomatis** - Pengingat H-3 dan H-1 deadline
- 📁 **Import/Export** - CSV, Excel, dan PDF
- 📋 **Sistem Laporan** - User kirim laporan, Admin approve/reject
- 📄 **PDF Viewer** - Preview PDF sebelum download
- 🔐 **Authentication** - Login dengan username/password

## 👥 Role & Permissions

### 🔴 Super Admin
- ✅ Kelola data satker
- ✅ Konfigurasi SMTP
- ✅ Monitor semua laporan
- ✅ Approve/reject laporan
- ✅ Export Excel/PDF
- ✅ Jalankan scheduler

### 🟡 Admin
- ✅ Kelola data satker
- ✅ Konfigurasi SMTP
- ✅ Monitor semua laporan
- ✅ Approve/reject laporan
- ✅ Export Excel/PDF
- ✅ Jalankan scheduler

### 🟢 User
- ✅ Kirim laporan (Sisa Kas, Realisasi, Anggaran)
- ✅ Lihat status laporan sendiri
- ❌ Tidak bisa konfigurasi
- ❌ Tidak bisa kelola data satker

## 📋 Cara Penggunaan

### User - Kirim Laporan
1. Login sebagai User
2. Klik "Buat Laporan"
3. Isi form laporan
4. Klik "Kirim Laporan"

### Admin - Monitor Laporan
1. Login sebagai Admin/Super Admin
2. Lihat tabel "Monitor Laporan"
3. Approve/reject laporan
4. Export ke Excel/PDF

## ⚙️ Konfigurasi SMTP (Gmail)

1. Login sebagai Admin/Super Admin
2. Isi konfigurasi SMTP:
   ```
   Host: smtp.gmail.com
   Port: 587
   Email: your-email@gmail.com
   App Password: [Gmail App Password]
   ```

## 📅 Scheduler Otomatis

### Manual Test
```bash
npm run scheduler
```

### Windows Task Scheduler
```powershell
.\register_task.ps1
```

## 🛠️ Production Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy ke Vercel
```

### Manual Deployment
```bash
npm run build
npm start
```

## 📁 Struktur Proyek

```
├── pages/
│   ├── api/          # API endpoints
│   ├── index.js      # Dashboard utama
│   ├── login.js      # Halaman login
│   └── _app.js       # App wrapper
├── styles/
│   └── globals.css   # CSS global
├── data/             # Database files
├── lib.js            # Utility functions
├── scheduler.js      # Email scheduler
└── package.json      # Dependencies
```

## 🔍 Troubleshooting

### Error Login
- Clear browser localStorage
- Restart aplikasi: `npm run dev`

### Error SMTP
- Pastikan App Password Gmail benar
- Cek konfigurasi SMTP

### Error Export
- Pastikan dependencies terinstall
- Restart browser

## 📞 Support

1. Restart aplikasi: `npm run dev`
2. Clear browser cache
3. Cek browser console untuk error

---

**🏛️ Kementerian Pertahanan Republik Indonesia**  
**Dibuat dengan Next.js Full Stack**