# 🚀 Satker Reminder - MongoDB Migration Guide

## ⚠️ IMPORTANT: Read Before Deployment

Aplikasi ini telah diupgrade untuk menggunakan **MongoDB** sebagai database, menggantikan file JSON/CSV. Fitur baru termasuk:

✅ **Sistem Autentikasi Lengkap dengan JWT**
✅ **Registrasi User dengan Email Verification**
✅ **Forgot Password & Reset Password**
✅ **User Management untuk Super Admin**
✅ **MongoDB untuk storage yang scalable**
✅ **Ready untuk deploy di Vercel**

---

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended for Vercel)

1. Buat account di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Buat cluster baru (Free tier available)
3. Klik "Connect" dan pilih "Connect your application"
4. Copy connection string

#### Option B: MongoDB Local

```bash
# Install MongoDB di Windows
# Download dari: https://www.mongodb.com/try/download/community

# Atau gunakan Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 3. Setup Environment Variables

Copy `.env.example` ke `.env` dan isi dengan nilai yang benar:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB (WAJIB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/satker-reminder?retryWrites=true&w=majority

# JWT Secret (WAJIB - gunakan string random yang kuat)
JWT_SECRET=ganti_dengan_string_random_yang_sangat_panjang_dan_aman

# Email Configuration (WAJIB untuk fitur register & forgot password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Application
BASE_URL=http://localhost:3000
NODE_ENV=development
```

#### 📧 Setup Gmail untuk Email

1. Login ke Gmail
2. Buka [Google Account Security](https://myaccount.google.com/security)
3. Enable "2-Step Verification"
4. Buat "App Password":
   - Pilih "Mail" sebagai app
   - Pilih "Other" sebagai device
   - Copy password yang dihasilkan
   - Paste ke `EMAIL_PASS` di `.env`

### 4. Migrate Data Existing ke MongoDB

Jika Anda punya data di `data/users.json`, `data/satkers.csv`, dan `data/reports.csv`:

```bash
node migrate.js
```

Script ini akan:
- Import semua users dengan password yang sudah di-hash
- Import satkers dan reports
- Set existing users sebagai "verified"

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🔐 User Accounts

### Super Admin Default
- **Email**: maskiryz23@gmail.com
- **Password**: password

⚠️ **PENTING**: Ganti password setelah login pertama kali!

### Test Accounts (jika ada)
Cek di MongoDB setelah migration atau buat via `/register`

---

## 🎯 Fitur Baru

### 1. **Registrasi User**
- URL: `/register`
- Form lengkap: Email, Nama, Telepon, Satker, Password
- Email verification otomatis terkirim
- User tidak bisa login sampai verify email

### 2. **Email Verification**
- Link dikirim ke email setelah registrasi
- Format: `/api/auth/verify-email?token=xxx`
- Token valid 24 jam
- Setelah verify, redirect ke login

### 3. **Forgot Password**
- URL: `/forgot-password`
- Masukkan email, sistem kirim reset link
- Link valid 1 jam

### 4. **Reset Password**
- URL: `/reset-password?token=xxx`
- User set password baru
- Token di-clear setelah reset

### 5. **User Management (Super Admin)**
- Akses via Admin Panel → User Management
- Lihat semua users: email, nama, role, last login
- Change role: User ↔ Admin ↔ Super Admin
- Delete user (tidak bisa delete diri sendiri)

---

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "MongoDB migration dengan auth features"
git push origin main
```

### 2. Import ke Vercel

1. Login ke [Vercel](https://vercel.com)
2. Click "New Project"
3. Import repository dari GitHub
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./`

### 3. Setup Environment Variables di Vercel

Di Vercel dashboard, masukkan environment variables:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
BASE_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 4. Deploy!

Vercel akan otomatis build dan deploy. Setelah deploy:

1. Buka URL production
2. Login dengan super admin
3. Test semua fitur

---

## 📁 Struktur File Baru

```
├── lib/
│   ├── mongodb.js          # MongoDB connection
│   ├── emailService.js     # Email templates & sender
│   └── serverAuth.js       # JWT verification
├── models/
│   ├── User.js            # User schema dengan bcrypt
│   ├── Satker.js          # Satker schema
│   └── Report.js          # Report schema
├── pages/
│   ├── register.js        # Halaman registrasi
│   ├── forgot-password.js # Forgot password
│   ├── reset-password.js  # Reset password
│   └── api/
│       └── auth/
│           ├── login.js           # Login endpoint (updated)
│           ├── register.js        # Registrasi
│           ├── verify-email.js    # Email verification
│           ├── forgot-password.js # Request reset
│           └── reset-password.js  # Reset password
├── migrate.js             # Migration script
└── .env.example          # Template environment variables
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Cek `MONGODB_URI` di `.env`
- Pastikan IP address Anda di-whitelist di MongoDB Atlas
- Test connection: `node -e "require('./lib/mongodb')()"`

### Error: "Email not sent"
- Cek `EMAIL_USER` dan `EMAIL_PASS`
- Pastikan menggunakan App Password, bukan password Gmail biasa
- Cek less secure apps setting (jika tidak pakai App Password)

### Error: "JWT must be provided"
- Pastikan `JWT_SECRET` sudah di-set di `.env`
- Gunakan string yang panjang dan random

### Migration error
- Pastikan file `data/*.json` dan `data/*.csv` ada
- Cek format file (encoding UTF-8)
- Jalankan dengan: `node migrate.js`

---

## 🎨 Customize

### Email Templates
Edit `lib/emailService.js` untuk customize:
- Email verification template
- Password reset template
- Welcome email, dll

### User Roles
Edit di `models/User.js`:
```javascript
role: {
  type: String,
  enum: ['user', 'admin', 'super_admin', 'your_custom_role'],
  default: 'user'
}
```

---

## 📞 Support

Jika ada masalah:
1. Cek logs di terminal
2. Cek Vercel logs (jika deployed)
3. Buka issue di GitHub repo

---

## ✅ Checklist Deploy

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set di Vercel
- [ ] Gmail App Password created
- [ ] Data migrated ke MongoDB
- [ ] Super admin password changed
- [ ] Test registrasi flow
- [ ] Test email verification
- [ ] Test forgot password
- [ ] Test user management
- [ ] Production URL working

---

**Happy Deploying! 🚀**
