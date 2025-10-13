# 🏗️ Arsitektur Sistem Satker Reminder

## 📋 Overview Sistem

Satker Reminder adalah aplikasi web full-stack untuk mengelola pengingat sisa kas satuan kerja Kemhan dengan fitur role-based access, email otomatis, dan sistem laporan terintegrasi.

## 🎯 Tujuan Sistem

- **Otomatisasi** pengingat deadline sisa kas
- **Monitoring** status pengiriman laporan
- **Manajemen** data satker terpusat
- **Pelaporan** dengan file attachment
- **Audit trail** aktivitas sistem

## 🏛️ Arsitektur High-Level

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PRESENTATION  │    │    BUSINESS     │    │      DATA       │
│     LAYER       │    │     LAYER       │    │     LAYER       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React UI      │◄──►│ • Next.js API   │◄──►│ • CSV Files     │
│ • Login Pages   │    │ • Authentication│    │ • JSON Config   │
│ • Dashboard     │    │ • Email Service │    │ • File Storage  │
│ • Admin Panel   │    │ • Scheduler     │    │ • Logs          │
│ • Support       │    │ • File Upload   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: CSS Modules + Custom CSS
- **State Management**: React Hooks (useState, useEffect)
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **PDF Viewer**: react-pdf
- **File Upload**: HTML5 File API

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Email**: Nodemailer (SMTP)
- **File Processing**: Multer
- **CSV Processing**: csv-parse/csv-stringify
- **Excel Export**: xlsx
- **Scheduler**: node-cron

### Data Storage
- **User Data**: JSON files
- **Satker Data**: CSV files
- **Reports**: CSV files
- **Config**: JSON files
- **File Uploads**: Local filesystem
- **Logs**: Text files

## 📊 Database Schema

### Users (users.json)
```json
{
  "username": "string",
  "password": "string", 
  "role": "super_admin|admin|user",
  "name": "string"
}
```

### Satkers (satkers.csv)
```csv
nama,email,deadline,status
```

### Reports (reports.csv)
```csv
id,satker_name,user_email,report_type,amount,description,file_path,file_name,status,submitted_at,reviewed_by
```

### Support Tickets (tickets.csv)
```csv
id,subject,category,priority,description,user,user_name,status,created_at,updated_at
```

## 🔐 Security Architecture

### Authentication
- **Session-based**: localStorage untuk client-side
- **Role-based Access Control**: 3 level (Super Admin, Admin, User)
- **Route Protection**: Middleware di setiap halaman

### Authorization Matrix
```
Feature                 │ Super Admin │ Admin │ User
─────────────────────────┼─────────────┼───────┼─────
Dashboard               │      ✅     │   ✅  │  ✅
Kelola Satker          │      ✅     │   ✅  │  ❌
Konfigurasi SMTP       │      ✅     │   ✅  │  ❌
Monitor Laporan        │      ✅     │   ✅  │  ✅*
Approve/Reject         │      ✅     │   ✅  │  ❌
Export Data            │      ✅     │   ✅  │  ❌
Admin Panel            │      ✅     │   ✅  │  ❌
Support Center         │      ✅     │   ✅  │  ✅
Kirim Laporan          │      ✅     │   ✅  │  ✅
```
*User hanya bisa lihat laporan sendiri

### File Security
- **Upload Validation**: Tipe file dan ukuran
- **Path Traversal Protection**: Validasi path file
- **Access Control**: API endpoint untuk file access

## 📡 API Architecture

### REST Endpoints
```
Authentication
POST /api/auth                 # Login user

Satkers Management
GET  /api/satkers             # Get all satkers
POST /api/satkers             # Update satkers

Configuration
GET  /api/config              # Get SMTP config
POST /api/config              # Update SMTP config

Reports Management
GET  /api/reports             # Get all reports
POST /api/reports             # Create new report
PUT  /api/reports             # Update report status

File Management
POST /api/upload              # Upload file
GET  /api/files/[...path]     # Serve uploaded files

Email Service
POST /api/send                # Send single email
POST /api/run-scheduler       # Run email scheduler

Import/Export
POST /api/import              # Import CSV data
GET  /api/export              # Export to Excel

Admin Functions
GET  /api/admin/users         # Get all users
DELETE /api/admin/users       # Delete user
GET  /api/admin/logs          # Get system logs
DELETE /api/admin/logs        # Clear logs
GET  /api/admin/stats         # Get system statistics

Support System
GET  /api/support/tickets     # Get support tickets
POST /api/support/tickets     # Create support ticket
```

## 🔄 Data Flow Architecture

### 1. User Authentication Flow
```
User Input → Login Page → API Auth → Validate Credentials → Set Session → Redirect Dashboard
```

### 2. Report Submission Flow
```
User Form → File Upload → API Upload → Store File → Create Report → Update CSV → Send Notification
```

### 3. Email Scheduler Flow
```
Cron Job → Read Satkers → Check Deadlines → Generate Email → SMTP Send → Log Result
```

### 4. Admin Approval Flow
```
Admin Action → API Request → Update Status → Log Activity → Notify User
```

## 🎨 UI/UX Architecture

### Design System
- **Color Scheme**: Coklat profesional (#8b7355, #a0896b)
- **Typography**: Segoe UI font family
- **Layout**: Card-based design dengan grid system
- **Responsive**: Mobile-first approach
- **Icons**: Emoji-based untuk konsistensi

### Component Structure
```
App
├── Header (Logo, Navigation, User Info)
├── Dashboard (Statistics, Quick Actions)
├── Data Management (CRUD Operations)
├── Reports (Submission, Monitoring)
├── Admin Panel (System Management)
├── Support Center (Help & Tickets)
└── Footer (Copyright, Links)
```

## 📧 Email Architecture

### SMTP Configuration
- **Provider**: Gmail SMTP
- **Security**: TLS/STARTTLS (Port 587)
- **Authentication**: App Password
- **Templates**: Dynamic email generation

### Email Types
1. **Reminder H-3**: 3 hari sebelum deadline
2. **Reminder H-1**: 1 hari sebelum deadline
3. **Manual Send**: Admin trigger
4. **Status Notification**: Approval/rejection

## 📅 Scheduler Architecture

### Windows Task Scheduler
```powershell
# Registered Task
Task Name: SatkerReminderDaily
Trigger: Daily at 07:00 AM
Action: node scheduler.js
```

### Scheduler Logic
1. **Read Configuration**: SMTP settings
2. **Load Satker Data**: CSV file
3. **Calculate Days**: Deadline difference
4. **Filter Recipients**: H-3 dan H-1
5. **Send Emails**: Batch processing
6. **Log Results**: Success/failure tracking

## 📁 File System Architecture

```
Aktualisasi/
├── pages/                    # Next.js Pages
│   ├── api/                 # API Routes
│   │   ├── admin/          # Admin endpoints
│   │   ├── files/          # File serving
│   │   └── support/        # Support endpoints
│   ├── index.js            # Main dashboard
│   ├── login.js            # Authentication
│   ├── admin.js            # Admin panel
│   └── support.js          # Support center
├── styles/
│   └── globals.css         # Global styling
├── data/                   # Data storage
│   ├── uploads/           # File uploads
│   ├── users.json         # User accounts
│   ├── satkers.csv        # Satker data
│   ├── reports.csv        # Report data
│   ├── tickets.csv        # Support tickets
│   ├── config.json        # SMTP config
│   └── send.log          # Email logs
├── lib.js                 # Utility functions
├── scheduler.js           # Email scheduler
└── package.json          # Dependencies
```

## 🚀 Deployment Architecture

### Development
```
Local Machine → npm run dev → http://localhost:3000
```

### Production Options

#### Option 1: Vercel (Recommended)
```
GitHub Repo → Vercel Deploy → CDN Distribution → Global Access
```

#### Option 2: VPS/Server
```
Server → npm run build → npm start → Reverse Proxy (Nginx) → Domain
```

#### Option 3: Docker
```
Dockerfile → Docker Build → Container Deploy → Load Balancer
```

## 📊 Monitoring & Logging

### System Logs
- **Email Logs**: `data/send.log`
- **Error Logs**: Console output
- **Access Logs**: API request tracking
- **Admin Logs**: User management activities

### Metrics Tracking
- Total users, reports, emails sent
- Success/failure rates
- Response times
- File upload statistics

## 🔧 Maintenance Architecture

### Backup Strategy
- **Daily**: Automated data backup
- **Weekly**: Full system backup
- **Monthly**: Archive old logs

### Update Process
1. **Development**: Local testing
2. **Staging**: Pre-production testing
3. **Production**: Gradual rollout
4. **Rollback**: Quick revert capability

## 🛡️ Disaster Recovery

### Data Recovery
- **File Backup**: Regular CSV/JSON backup
- **Version Control**: Git repository
- **Cloud Storage**: Optional cloud backup

### System Recovery
- **Health Checks**: Automated monitoring
- **Failover**: Backup server ready
- **Documentation**: Recovery procedures

## 📈 Scalability Considerations

### Horizontal Scaling
- **Load Balancer**: Multiple app instances
- **Database**: Migrate to PostgreSQL/MySQL
- **File Storage**: Cloud storage (AWS S3)
- **Email Service**: External provider (SendGrid)

### Performance Optimization
- **Caching**: Redis for session storage
- **CDN**: Static asset delivery
- **Database Indexing**: Query optimization
- **Code Splitting**: Lazy loading components

---

**Arsitektur ini dirancang untuk mendukung pertumbuhan sistem dan memastikan reliability, security, dan maintainability jangka panjang.**