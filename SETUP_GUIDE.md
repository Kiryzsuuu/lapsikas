# 🚀 Quick Start Guide - Satker Reminder MongoDB Migration

## ✅ Status Implementasi

### ✔️ Sudah Selesai:
- [x] MongoDB connection utility dengan caching
- [x] User, Satker, Report models
- [x] Registrasi dengan email verification
- [x] Forgot password & reset password
- [x] Email service dengan templates
- [x] User management di admin panel
- [x] API satkers & reports update ke MongoDB
- [x] Migration script siap digunakan
- [x] Environment variables setup
- [x] Test MongoDB script

### ⏳ Perlu Dilakukan:

1. **Setup MongoDB** (Pilih salah satu):
   - Option A: MongoDB Atlas (Recommended untuk Vercel)
   - Option B: MongoDB Lokal

2. **Run Migration**
3. **Test Aplikasi**
4. **Deploy ke Vercel**

---

## 📋 Langkah Setup

### 1️⃣ Setup MongoDB Atlas (Cloud - Recommended)

#### A. Buat Account & Cluster

1. Buka https://www.mongodb.com/cloud/atlas
2. Sign up atau login
3. Klik "Build a Database"
4. Pilih **FREE (M0)** cluster
5. Pilih region terdekat (Singapore/Jakarta)
6. Klik "Create"

#### B. Setup Database Access

1. Di menu **Database Access**, klik "Add New Database User"
2. Authentication Method: **Password**
3. Username: `satker_admin`
4. Password: `buatPasswordKuat123!` (simpan password ini!)
5. Built-in Role: **Read and write to any database**
6. Klik "Add User"

#### C. Setup Network Access

1. Di menu **Network Access**, klik "Add IP Address"
2. Klik "Allow Access from Anywhere" (untuk development)
3. IP: `0.0.0.0/0`
4. Klik "Confirm"

#### D. Get Connection String

1. Kembali ke **Database**, klik "Connect"
2. Pilih "Connect your application"
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy connection string:
   ```
   mongodb+srv://satker_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### E. Update .env File

Edit file `.env` di root folder:

```env
MONGODB_URI=mongodb+srv://satker_admin:buatPasswordKuat123!@cluster0.xxxxx.mongodb.net/satker-reminder?retryWrites=true&w=majority
```

⚠️ **PENTING**: 
- Ganti `<password>` dengan password yang Anda buat
- Ganti `cluster0.xxxxx` dengan cluster URL Anda
- Tambahkan `/satker-reminder` sebelum `?` untuk nama database

---

### 1️⃣ Setup MongoDB Lokal (Alternative)

#### A. Install MongoDB

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install dengan default settings
3. MongoDB akan jalan sebagai Windows Service

**Atau gunakan Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

#### B. Update .env File

```env
MONGODB_URI=mongodb://localhost:27017/satker-reminder
```

---

### 2️⃣ Setup Email (Untuk Verification & Reset Password)

#### A. Buat App Password di Gmail

1. Login ke Gmail
2. Buka https://myaccount.google.com/security
3. Enable **2-Step Verification** (jika belum)
4. Scroll ke bawah, klik **App passwords**
5. Select app: **Mail**
6. Select device: **Other** → ketik "Satker Reminder"
7. Klik **Generate**
8. Copy 16-digit password yang muncul

#### B. Update .env File

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

---

### 3️⃣ Generate JWT Secret

Buat random string untuk JWT:

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy hasilnya dan update `.env`:

```env
JWT_SECRET=hasil_random_string_yang_sangat_panjang_tadi
```

---

### 4️⃣ Test MongoDB Connection

```bash
npm run test:mongodb
```

Output yang diharapkan:
```
✅ MongoDB connection successful!
📊 Database: satker-reminder
📁 Collections: 0
```

---

### 5️⃣ Run Migration

Import data dari `data/users.json`, `data/satkers.csv`, `data/reports.csv` ke MongoDB:

```bash
npm run migrate
```

Output yang diharapkan:
```
✅ Migration completed successfully!

📊 Statistics:
- Users imported: X
- Satkers imported: Y
- Reports imported: Z
```

---

### 6️⃣ Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

---

## 🧪 Testing

### Test 1: Login dengan Super Admin

1. Buka http://localhost:3000/login
2. Email: `maskiryz23@gmail.com`
3. Password: `password`
4. Klik Login
5. ✅ Harus masuk ke dashboard

### Test 2: User Management

1. Login sebagai super admin
2. Klik tombol admin di header
3. Di admin panel, scroll ke "Manajemen User"
4. ✅ Harus lihat list users dengan:
   - Email
   - Nama
   - Phone
   - Satker
   - Role dropdown
   - Verified status
   - Last login
   - Tombol hapus

5. Test ubah role user:
   - Pilih user lain
   - Ubah role dari dropdown
   - ✅ Harus berhasil update

6. Test hapus user:
   - Klik tombol hapus pada user test
   - ✅ Harus terhapus dari list

### Test 3: Registrasi & Email Verification

1. Logout dari aplikasi
2. Buka http://localhost:3000/register
3. Isi form:
   - Email: test@example.com
   - Nama: Test User
   - Phone: 081234567890
   - Satuan Kerja: Satker Test
   - Password: testpassword123
   - Konfirmasi Password: testpassword123
4. Klik "Daftar"
5. ✅ Harus muncul message sukses
6. Check email (jika SMTP sudah disetup)
7. Klik link verification di email
8. ✅ Harus redirect ke login dengan message "verified=true"

### Test 4: Forgot Password

1. Di halaman login, klik "Lupa Password?"
2. Masukkan email yang terdaftar
3. Klik "Kirim Link Reset"
4. ✅ Harus muncul sukses message
5. Check email (jika SMTP sudah disetup)
6. Klik link reset password
7. Masukkan password baru
8. ✅ Harus redirect ke login
9. Login dengan password baru
10. ✅ Harus berhasil login

### Test 5: Satkers & Reports

1. Login sebagai user biasa
2. Test CRUD satkers
3. Test submit report
4. ✅ Data harus tersimpan di MongoDB

---

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "MongoDB migration complete"
git push origin main
```

### 2. Import ke Vercel

1. Login ke https://vercel.com
2. Klik "New Project"
3. Import dari GitHub
4. Select repository: `lapsikas`
5. Framework Preset: **Next.js**
6. Root Directory: `./`

### 3. Setup Environment Variables

Di Vercel dashboard, masuk ke **Settings** → **Environment Variables**, tambahkan:

```
MONGODB_URI=mongodb+srv://satker_admin:password@cluster0.xxxxx.mongodb.net/satker-reminder?retryWrites=true&w=majority
JWT_SECRET=your_generated_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
BASE_URL=https://your-app.vercel.app
NODE_ENV=production
```

⚠️ **PENTING**: Pastikan semua environment variables di-set untuk:
- Production
- Preview
- Development

### 4. Deploy

1. Klik "Deploy"
2. Wait for build to complete
3. Buka URL production
4. Test semua fitur

---

## 📁 File Penting

```
├── .env                    # Environment variables (jangan commit!)
├── .env.example           # Template env variables
├── test-mongodb.js        # Test koneksi MongoDB
├── migrate.js             # Migration script
├── lib/
│   ├── mongodb.js         # MongoDB connection
│   ├── emailService.js    # Email sender
│   └── serverAuth.js      # JWT verification
├── models/
│   ├── User.js           # User schema
│   ├── Satker.js         # Satker schema
│   └── Report.js         # Report schema
└── pages/
    ├── register.js       # Registration page
    ├── login.js          # Login page (updated)
    ├── forgot-password.js # Forgot password
    ├── reset-password.js  # Reset password
    ├── admin.js          # Admin panel (updated)
    └── api/
        ├── auth/
        │   ├── login.js          # Login endpoint
        │   ├── register.js       # Registration
        │   ├── verify-email.js   # Email verification
        │   ├── forgot-password.js # Request reset
        │   └── reset-password.js  # Password reset
        ├── admin/
        │   └── users-new.js      # User management
        ├── satkers.js            # Satkers CRUD (updated)
        └── reports.js            # Reports CRUD (updated)
```

---

## ⚠️ Troubleshooting

### Error: "Cannot connect to MongoDB"

**Solusi:**
1. Check `.env` file - pastikan `MONGODB_URI` sudah benar
2. Untuk MongoDB Atlas:
   - Pastikan IP address sudah di-whitelist
   - Check username & password benar
   - Pastikan cluster sudah aktif
3. Untuk MongoDB lokal:
   - Pastikan MongoDB service running
   - Run: `net start MongoDB` (Windows)

### Error: "Email not sent"

**Solusi:**
1. Check `EMAIL_USER` dan `EMAIL_PASS` di `.env`
2. Pastikan menggunakan **App Password**, bukan password Gmail biasa
3. Test email dengan: `node -e "require('./lib/emailService').sendCustomEmail('test@example.com', 'Test', 'Test body')"`

### Error: "JWT must be provided"

**Solusi:**
1. Pastikan `JWT_SECRET` sudah di-set di `.env`
2. Generate JWT secret baru: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Migration Error: "File not found"

**Solusi:**
1. Pastikan file `data/users.json`, `data/satkers.csv`, `data/reports.csv` ada
2. Check encoding file (harus UTF-8)
3. Check format JSON/CSV valid

### User tidak bisa login setelah migration

**Solusi:**
1. Check apakah `emailVerified: true` di migration script
2. Manual verify via MongoDB Compass:
   ```javascript
   db.users.updateMany({}, { $set: { emailVerified: true } })
   ```

---

## 📞 Support

Jika masih ada error:
1. Check logs di terminal: `npm run dev`
2. Check Vercel logs (jika deployed)
3. Check MongoDB logs di Atlas dashboard

---

## ✅ Checklist

- [ ] MongoDB Atlas/Local sudah running
- [ ] `.env` file sudah diisi lengkap
- [ ] `npm run test:mongodb` berhasil
- [ ] `npm run migrate` berhasil
- [ ] Login dengan super admin berhasil
- [ ] User management di admin panel berfungsi
- [ ] Test registrasi flow
- [ ] Test email verification
- [ ] Test forgot password
- [ ] Test satkers CRUD
- [ ] Test reports CRUD
- [ ] Environment variables di Vercel sudah diset
- [ ] Production deployment berhasil
- [ ] Super admin password sudah diganti

---

**Good luck! 🎉**
