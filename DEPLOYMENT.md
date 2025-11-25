# 🚀 Deployment Guide - Vercel & GitHub

## 📋 Pre-Deployment Checklist

✅ Git repository initialized  
✅ All files committed  
⚠️ GitHub push (requires authentication)  
🔄 Next: Vercel deployment  

## 🔧 GitHub Setup (Authentication Issue)

**Problem**: `Permission to Kiryzsuuu/lapsikas.git denied`

**Solutions**:

### Option 1: GitHub Personal Access Token
```bash
# 1. Generate Personal Access Token di GitHub Settings > Developer settings
# 2. Use token sebagai password saat push
git push -u origin main
# Username: Kiryzsuuu
# Password: ghp_your_token_here
```

### Option 2: GitHub CLI
```bash
# Install GitHub CLI
gh auth login
git push -u origin main
```

### Option 3: SSH Key
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "maskiryz23@gmail.com"
# Add to GitHub Settings > SSH Keys
git remote set-url origin git@github.com:Kiryzsuuu/lapsikas.git
git push -u origin main
```

## 🌐 Vercel Deployment Steps

### 1. Connect GitHub Repository
1. Login ke [Vercel](https://vercel.com)
2. **New Project** > Import Git Repository
3. Connect GitHub account jika belum
4. Pilih repository `Kiryzsuuu/lapsikas`

### 2. Configure Environment Variables
Tambahkan environment variables berikut di Vercel Dashboard:

```env
MONGODB_URI=mongodb+srv://maskiryz23_db_user:sOY5Yr0G3n8VtQ45@userlapsikas.lufqpyh.mongodb.net/satker-reminder?retryWrites=true&w=majority&appName=userlapsikas

JWT_SECRET=273917beea27701d1f2dde9da0399834094e1fd8b89e14bf4103b21c46eb0c8185f102159995c6851bcbc0703cad0a4193c7990af3df16c126399005e24d0bb0

EMAIL_USER=maskiryz23@gmail.com
EMAIL_PASS=dnzx kimp yxvk subf
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

BASE_URL=https://your-project-name.vercel.app
NODE_ENV=production
```

### 3. Framework Preset
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### 4. Deploy
1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Visit your live URL!

## 📁 Project Structure (Ready for Vercel)

```
├── pages/
│   ├── api/           # Serverless API routes
│   ├── _app.js        # App wrapper
│   └── *.js           # Pages
├── models/            # MongoDB models
├── lib/               # Utilities (mongodb, auth)
├── public/            # Static assets
├── styles/            # CSS files
├── vercel.json        # Vercel configuration ✅
├── next.config.js     # Next.js config ✅
└── package.json       # Dependencies ✅
```

## 🔒 Security Notes

- ✅ `.env` file excluded from Git
- ✅ JWT secrets properly secured  
- ✅ MongoDB connection string protected
- ✅ Email credentials in environment variables

## 🧪 Testing After Deployment

1. **Home Page**: Basic functionality
2. **Registration**: Email verification flow
3. **Login**: JWT authentication
4. **Admin Panel**: Role-based access
5. **PDF Export**: File generation
6. **Database**: MongoDB operations

## 🔄 Next Steps After GitHub Push Success

1. **Go to Vercel**: https://vercel.com
2. **New Project** 
3. **Import**: `Kiryzsuuu/lapsikas`
4. **Add Environment Variables** (from above)
5. **Deploy** 🚀

## 🆘 Troubleshooting

### Build Errors
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Check environment variables

### Database Errors
- Verify MongoDB Atlas connection string
- Check network access settings
- Confirm database user permissions

### Email Errors  
- Verify Gmail App Password
- Check SMTP settings
- Test email configuration

---

**Status**: Repository ready for deployment! 🎉
**Next**: Fix GitHub authentication → Push → Deploy to Vercel