# 🎯 Quick Commands Reference

## Setup & Testing

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
# Edit .env file with your MongoDB URI, JWT secret, and email credentials

# 3. Test MongoDB connection
npm run test:mongodb

# 4. Run migration (import existing data)
npm run migrate

# 5. Start development server
npm run dev
```

## Environment Variables Required

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/satker-reminder
JWT_SECRET=random-64-char-hex-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Default Credentials

**Super Admin:**
- Email: `maskiryz23@gmail.com`
- Password: `password`

⚠️ Change password after first login!

## New Features

### 🔐 Authentication
- `/register` - User registration with email verification
- `/login` - Email-based login
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token

### 👥 User Management (Super Admin Only)
- View all users
- Change user roles (user/admin/super_admin)
- Delete users
- See email verification status

### 📧 Email Notifications
- Registration verification email
- Password reset email
- Custom email templates

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify-email?token=xxx` - Verify email
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify current session

### Admin
- `GET /api/admin/users-new` - List all users
- `PUT /api/admin/users-new` - Update user role
- `DELETE /api/admin/users-new` - Delete user

### Data (MongoDB)
- `GET /api/satkers` - List satkers
- `POST /api/satkers` - Update satkers
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `PUT /api/reports` - Update report status

## Database Models

### User Schema
```javascript
{
  email: String (unique),
  name: String,
  phone: String,
  satker: String,
  password: String (bcrypt hashed),
  role: 'user' | 'admin' | 'super_admin',
  emailVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: Date
}
```

### Satker Schema
```javascript
{
  nama: String (unique),
  email: String,
  deadline: String,
  status: String
}
```

### Report Schema
```javascript
{
  satker_name: String,
  user_email: String,
  report_type: String,
  amount: Number,
  description: String,
  file_path: String,
  file_name: String,
  status: String,
  submitted_at: Date,
  reviewed_by: String
}
```

## Testing Checklist

- [ ] MongoDB connection test passes
- [ ] Migration imports all data
- [ ] Login as super admin works
- [ ] User list shows in admin panel
- [ ] Can change user roles
- [ ] Can delete users
- [ ] Registration creates new user
- [ ] Verification email sent (if SMTP configured)
- [ ] Email verification link works
- [ ] Forgot password sends email
- [ ] Reset password link works
- [ ] Can login with new password
- [ ] Satkers CRUD works
- [ ] Reports CRUD works

## Deployment

```bash
# 1. Push to GitHub
git add .
git commit -m "MongoDB migration"
git push origin main

# 2. Deploy to Vercel
vercel --prod

# 3. Set environment variables in Vercel dashboard
# 4. Test production deployment
```

## Troubleshooting

### MongoDB won't connect
```bash
# Check if MongoDB is running (local)
net start MongoDB

# Or use MongoDB Atlas (cloud)
# Make sure IP is whitelisted
```

### Email not sending
```bash
# Make sure using Gmail App Password
# Not regular Gmail password
# Get it from: https://myaccount.google.com/apppasswords
```

### JWT errors
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Documentation Files

- `README.md` - Project overview
- `MONGODB_MIGRATION.md` - Complete migration guide
- `SETUP_GUIDE.md` - Detailed setup instructions
- `QUICK_REFERENCE.md` - This file
- `.env.example` - Environment variables template

## Support

Check logs:
```bash
# Development
npm run dev

# Check Vercel logs (production)
vercel logs
```

---

**Last Updated:** November 25, 2025
**Version:** 2.0.0 (MongoDB Migration)
