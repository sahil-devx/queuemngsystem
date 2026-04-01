# 🚀 Queue System - Complete GitHub & Render Setup Guide

## 📋 Project Structure (Clean & Ready)

```
queue-system/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   │   └── .gitkeep
│   ├── config.env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   └── vite-project/
│       ├── src/
│       ├── public/
│       ├── .env.example
│       ├── package.json
│       └── vite.config.js
├── render.yaml
├── .gitignore
└── README.md
```

## 🎯 Step-by-Step Deployment Process

### **Step 1: Prepare Local Environment**

1. **Copy environment templates:**
```bash
# Backend environment
cp backend/config.env.example backend/config.env

# Frontend environment
cp frontend/vite-project/.env.example frontend/vite-project/.env
```

2. **Fill in your actual values in `backend/config.env`:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://satputesahil8186_db_user:2MSaBOA2RVtmkB0s@cluster0.wbvxrek.mongodb.net/queue_system?retryWrites=true&w=majority
JWT_SECRET=your_super_long_random_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=satputesahil8186@gmail.com
SMTP_PASS=vlec ipqm cmdd mcnv
SMTP_FROM=Queue System <noreply@queuesystem.dev>
FRONTEND_URL=https://your-frontend-name.onrender.com
```

3. **Fill in frontend environment (.env):**
```env
VITE_API_URL=http://localhost:5000
```

### **Step 2: Test Locally**

```bash
# Start backend
cd backend
npm install
npm run dev

# Start frontend (new terminal)
cd frontend/vite-project
npm install
npm run dev
```

### **Step 3: Setup GitHub Repository**

1. **Initialize Git:**
```bash
git init
git add .
git commit -m "Initial commit - Queue System with OTP"
```

2. **Create GitHub Repository:**
   - Go to https://github.com
   - Click "New repository"
   - Name: `queue-system`
   - Public (recommended for free hosting)
   - Don't initialize with README (we already have one)

3. **Push to GitHub:**
```bash
git remote add origin https://github.com/sahil-devx/queue-system.git
git branch -M main
git push -u origin main
```

### **Step 4: Deploy to Render**

#### **4.1 Create Render Account**
1. Go to [https://render.com](https://render.com)
2. Sign up (free tier)
3. Connect your GitHub account

#### **4.2 Deploy Backend**
1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Choose your `queue-system` repository
   - **Name**: `queue-system-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

2. **Add Environment Variables** (in Render Dashboard):
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://satputesahil8186_db_user:2MSaBOA2RVtmkB0s@cluster0.wbvxrek.mongodb.net/queue_system?retryWrites=true&w=majority
JWT_SECRET=your_super_long_random_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=satputesahil8186@gmail.com
SMTP_PASS=vlec ipqm cmdd mcnv
SMTP_FROM=Queue System <noreply@render-app.com>
FRONTEND_URL=https://queue-system-frontend.onrender.com
```

3. **Click "Create Web Service"**

#### **4.3 Deploy Frontend**
1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Choose same repository
   - **Name**: `queue-system-frontend`
   - **Root Directory**: `frontend/vite-project`
   - **Runtime**: `Static`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Instance Type**: `Free`

2. **Add Environment Variable:**
```
VITE_API_URL=https://queue-system-api.onrender.com
```

3. **Click "Create Web Service"**

### **Step 5: Configure CORS & Final Setup**

1. **Update Backend CORS in Render:**
   - Go to `queue-system-api` service
   - Environment tab
   - Update `FRONTEND_URL` to: `https://queue-system-frontend.onrender.com`

2. **Update Frontend API URL:**
   - Go to `queue-system-frontend` service
   - Environment tab
   - Update `VITE_API_URL` to: `https://queue-system-api.onrender.com`

3. **Redeploy both services**

## 🎯 Expected URLs After Deployment

- **Backend API**: `https://queue-system-api.onrender.com`
- **Frontend App**: `https://queue-system-frontend.onrender.com`
- **Health Check**: `https://queue-system-api.onrender.com/health`

## 🧪 Testing Your Deployment

1. **Test Backend Health:**
```bash
curl https://queue-system-api.onrender.com/health
```

2. **Test Frontend:**
   - Open `https://queue-system-frontend.onrender.com`
   - Try user registration with OTP
   - Test login functionality

## 🔧 Troubleshooting

### **Common Issues & Solutions:**

#### **Issue: Backend deployment fails**
**Solution**: Check environment variables in Render dashboard
- Ensure `MONGODB_URI` is correct
- Ensure `JWT_SECRET` is set and long enough

#### **Issue: Frontend can't connect to backend**
**Solution**: CORS configuration
- Check `FRONTEND_URL` in backend environment
- Check `VITE_API_URL` in frontend environment

#### **Issue: OTP emails not sending**
**Solution**: SMTP configuration
- Verify Gmail app password
- Check SMTP credentials format

#### **Issue: MongoDB connection failed**
**Solution**: Database configuration
- Ensure MongoDB Atlas allows access from anywhere (0.0.0.0/0)
- Check connection string format

## 🎉 Success Checklist

- [ ] Backend health endpoint works
- [ ] Environment variables loaded correctly
- [ ] MongoDB connection successful
- [ ] Email OTP sending works
- [ ] User registration works
- [ ] Login functionality works
- [ ] Frontend loads properly
- [ ] No CORS errors in browser console
- [ ] Password reset works

## 📁 Files Created/Modified

- ✅ `backend/config.env.example` - Environment template
- ✅ `frontend/vite-project/.env.example` - Frontend env template
- ✅ `render.yaml` - Render configuration
- ✅ `.gitignore` - Updated for production
- ✅ `backend/uploads/.gitkeep` - Keep uploads directory
- ✅ `backend/server.js` - Cleaned and production-ready
- ✅ This deployment guide

## 🚀 Next Steps

1. **Deploy using this guide**
2. **Test all functionality**
3. **Set up custom domain (optional)**
4. **Monitor performance**
5. **Scale if needed**

Your Queue System is now ready for production deployment! 🎉
