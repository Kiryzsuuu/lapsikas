# ⚙️ Backend - Satker Reminder

Backend Express.js untuk aplikasi Satker Reminder dengan API lengkap dan scheduler otomatis.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Server berjalan di: http://localhost:8000

## 📁 Struktur

```
backend/
├── data/
│   ├── users.json    # User accounts
│   ├── satkers.csv   # Data satker
│   ├── reports.csv   # Data laporan
│   ├── config.json   # SMTP config
│   └── send.log      # Email log
├── lib.js            # Utility functions
├── scheduler.js      # Email scheduler
├── server.js         # Express server
└── package.json      # Dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth` - Login user

### Satkers
- `GET /api/satkers` - Get all satkers
- `POST /api/satkers` - Update satkers

### Config
- `GET /api/config` - Get SMTP config
- `POST /api/config` - Update SMTP config

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create report
- `PUT /api/reports` - Update report status

### Utils
- `POST /api/send` - Send email
- `POST /api/import` - Import CSV
- `GET /api/export` - Export Excel
- `POST /api/run-scheduler` - Run scheduler

## 🔧 Scripts

- `npm run dev` - Development dengan nodemon
- `npm start` - Production server
- `npm run scheduler` - Jalankan scheduler manual

## 📧 Scheduler

Scheduler otomatis mengirim email reminder:
- H-3 dan H-1 sebelum deadline
- Baca config dari `data/config.json`
- Log ke `data/send.log`

## 💾 Data Storage

- **JSON Files**: users.json, config.json
- **CSV Files**: satkers.csv, reports.csv
- **Log Files**: send.log