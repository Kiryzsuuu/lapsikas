# 📊 Satker Reminder - Sistem Pengingat Sisa Kas Kemhan

> **Version 2.0** - Now with MongoDB, User Registration, Email Verification & Complete User Management! 🚀

Aplikasi web modern untuk mengelola dan mengirim pengingat sisa kas satuan kerja dengan UI profesional, role-based access, MongoDB database, dan fitur autentikasi lengkap.

---

## 🆕 What's New in V2.0

- ✅ **MongoDB Integration** - Scalable database untuk production
- ✅ **User Registration** - Self-service registration dengan email verification
- ✅ **Email Verification** - Verify email sebelum bisa login
- ✅ **Forgot Password** - Reset password via email
- ✅ **User Management** - Super admin bisa manage roles & delete users
- ✅ **JWT Authentication** - Secure authentication dengan httpOnly cookies
- ✅ **Bcrypt Password** - Password hashing untuk security
- ✅ **Ready for Vercel** - Optimized untuk serverless deployment

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB (Atlas atau Local)
- Gmail account untuk SMTP

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Edit file `.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/satker-reminder
JWT_SECRET=your-random-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
BASE_URL=http://localhost:3000
```

📖 **Detailed Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### 3. Test MongoDB Connection
```bash
npm run test:mongodb
```

### 4. Import Existing Data (Optional)
```bash
npm run migrate
```

### 5. Run Development Server
```bash
npm run dev
```
Akses: http://localhost:3000

---

## 🔐 Default Credentials

**Super Admin:**
- Email: `maskiryz23@gmail.com`
- Password: `password`

⚠️ **IMPORTANT**: Change password setelah login pertama!

---

## ✨ Fitur Utama

### 🎨 User Interface
- UI Profesional dengan tema Kemhan
- Responsive design untuk mobile & desktop
- Dark mode ready
- Loading states & toast notifications

### 👥 User Management
- Self-registration dengan email verification
- Forgot password & reset via email
- Role management (User/Admin/Super Admin)
- User profile dengan last login tracking

### 📊 Dashboard & Reports
- Statistics overview
- Real-time status tracking
- PDF viewer untuk laporan
- Export Excel & PDF

### 📧 Email System
- Verification email setelah registrasi
- Password reset email
- Reminder email untuk deadline (H-3 & H-1)
- Custom HTML email templates

### 🗄️ Database (MongoDB)
- Scalable NoSQL database
- User authentication & authorization
- Satker (work units) management
- Reports tracking & approval

---

## 👥 Role & Permissions

### 🔴 Super Admin
- ✅ Manage all users (view, change roles, delete)
- ✅ Kelola data satker
- ✅ Konfigurasi SMTP
- ✅ Monitor & approve semua laporan
- ✅ Export Excel/PDF
- ✅ Jalankan scheduler
- ✅ Access admin panel & system logs

### 🟡 Admin
- ✅ Kelola data satker
- ✅ Monitor semua laporan
- ✅ Approve/reject laporan
- ✅ Export Excel/PDF
- ✅ Jalankan scheduler

### 🟢 User
- ✅ Register account sendiri
- ✅ Kirim laporan (Sisa Kas, Realisasi, Anggaran)
- ✅ Lihat status laporan sendiri
- ✅ Upload dokumen pendukung
- ❌ Tidak bisa konfigurasi
- ❌ Tidak bisa kelola data satker

---

## 📋 Cara Penggunaan

### Registrasi User Baru
1. Buka `/register`
2. Isi form: Email, Nama, Telepon, Satker, Password
3. Klik "Daftar"
4. Check email untuk link verification
5. Click link verification
6. Login dengan kredensial baru

### Login
1. Buka `/login`
2. Masukkan email & password
3. Klik "Masuk"

### Forgot Password
1. Di halaman login, klik "Lupa Password?"
2. Masukkan email
3. Check email untuk reset link
4. Set password baru
5. Login dengan password baru

### Super Admin - User Management
1. Login sebagai Super Admin
2. Klik tombol Admin di header
3. Scroll ke "Manajemen User"
4. Lihat list users dengan:
   - Email, nama, phone, satker
   - Role dropdown untuk change role
   - Verified status
   - Last login
   - Tombol hapus
5. Ubah role user dengan dropdown
6. Hapus user dengan tombol "Hapus"

### User - Kirim Laporan
1. Login sebagai User
2. Klik "Buat Laporan"
3. Isi form laporan
4. Upload dokumen (optional)
5. Klik "Kirim Laporan"

### Admin - Monitor Laporan
1. Login sebagai Admin/Super Admin
2. Lihat tabel "Monitor Laporan"
3. Review laporan yang masuk
4. Approve/reject laporan
5. Export ke Excel/PDF

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + httpOnly cookies
- **Password**: bcrypt hashing
- **Email**: Nodemailer with HTML templates
- **File Upload**: Multer
- **Export**: XLSX, jsPDF
- **PDF Viewer**: react-pdf
- **Scheduler**: node-cron
- **Deployment**: Vercel-ready

---

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md) - Migration guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick commands & API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

## ⚙️ Environment Variables

Create `.env` file in root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/satker-reminder

# JWT
JWT_SECRET=your-random-64-char-hex-string

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# App
BASE_URL=http://localhost:3000
NODE_ENV=development
```

See `.env.example` for template.

---

## 📦 NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test:mongodb # Test MongoDB connection
npm run migrate      # Import existing data to MongoDB
npm run scheduler    # Run email scheduler manually
```

---

## ⚙️ Gmail SMTP Setup (Old Method - Optional)

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