# 🎨 Frontend - Satker Reminder

Frontend Next.js untuk aplikasi Satker Reminder dengan UI profesional dan fitur lengkap.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Akses: http://localhost:3000

## 📁 Struktur

```
frontend/
├── pages/
│   ├── api/          # API routes (proxy ke backend)
│   ├── index.js      # Halaman utama
│   ├── login.js      # Halaman login
│   └── _app.js       # App wrapper
├── styles/
│   └── globals.css   # CSS global
├── public/           # Static assets
└── package.json      # Dependencies
```

## 🎨 Features

- **Modern UI** dengan tema coklat profesional
- **Responsive Design** untuk desktop dan mobile
- **Role-based Interface** sesuai permission user
- **PDF Viewer** untuk preview laporan
- **Export Functions** Excel dan PDF
- **Real-time Toast** notifications

## 🔧 Scripts

- `npm run dev` - Development server
- `npm run build` - Production build  
- `npm start` - Production server

## 📱 Pages

- `/` - Dashboard utama
- `/login` - Halaman login

## 🎯 Backend Connection

Frontend terhubung ke backend di `http://localhost:8000`