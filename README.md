# 🚀 Queue System

A modern queue management system with email OTP verification for registration and password reset.

## ✨ Features

- **User Authentication** with email OTP verification
- **Role-based Access** (Customer/Admin)
- **Password Reset** with email OTP
- **Queue Management** system
- **File Upload** support
- **Responsive Design** with modern UI

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email OTP
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** with TypeScript
- **Vite** for build tool
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Gmail account (for email OTP)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sahil-devx/queue-system.git
cd queue-system
```

2. **Backend Setup**
```bash
cd backend
npm install
cp config.env.example config.env
# Edit config.env with your credentials
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend/vite-project
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

## 📁 Project Structure

```
queue-system/
├── backend/
│   ├── controllers/          # API controllers
│   ├── middleware/           # Express middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── uploads/             # File uploads
│   ├── config.env.example    # Environment template
│   ├── package.json
│   └── server.js            # Main server file
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── pages/      # React pages
│       │   ├── context/    # React context
│       │   ├── api/        # API client
│       │   └── components/ # React components
│       ├── public/
│       ├── .env.example
│       ├── package.json
│       └── vite.config.js
├── render.yaml              # Render deployment config
├── .gitignore
├── GITHUB_RENDER_SETUP.md   # Deployment guide
└── README.md
```

## 🔐 Environment Variables

### Backend (config.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/queue_system
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Queue System <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Queue System
```

## 🌐 Deployment

### Render (Recommended)
See [GITHUB_RENDER_SETUP.md](./GITHUB_RENDER_SETUP.md) for complete step-by-step deployment guide.

### Quick Deploy
1. **Push to GitHub**
2. **Create Render account**
3. **Connect repository**
4. **Configure environment variables**
5. **Deploy**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/register/send-otp` - Send registration OTP
- `POST /api/auth/register/verify-otp` - Verify registration OTP
- `POST /api/auth/register/complete` - Complete registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password/send-otp` - Send password reset OTP
- `POST /api/auth/forgot-password/verify-otp` - Verify password reset OTP
- `POST /api/auth/forgot-password/reset` - Reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `GET /api/auth/users` - List users (admin only)

### Queue Management
- Queue endpoints for managing queues (implementation depends on your specific requirements)

## 🔧 Development

### Running Locally
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend/vite-project
npm run dev
```

### Access URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🧪 Testing

### Test Features
1. **User Registration** with email OTP
2. **User Login** with JWT tokens
3. **Password Reset** with email OTP
4. **Role-based Access** (Customer/Admin)
5. **File Uploads** and profile pictures
6. **Queue Operations** (when implemented)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For support and questions:
- Create an issue in GitHub
- Check the deployment guide
- Review the API documentation

---

**Built with ❤️ using modern web technologies**
