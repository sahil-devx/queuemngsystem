# Queue System - Complete Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure Overview](#project-structure-overview)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Domain & SSL Setup](#domain--ssl-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Prerequisites

### Required Accounts & Services
1. **Domain Name** (from Namecheap, GoDaddy, etc.)
2. **Cloud Server** (AWS EC2, DigitalOcean, Vultr, etc.)
3. **Email Service** (Gmail, SendGrid, Mailgun)
4. **Database** (MongoDB Atlas or self-hosted)
5. **Version Control** (GitHub/GitLab account)

### Required Tools (Install locally)
```bash
# Node.js & npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt update
sudo apt install git

# PM2 (Process Manager)
sudo npm install -g pm2

# Nginx (Web Server)
sudo apt update
sudo apt install nginx
```

---

## 📁 Project Structure Overview

```
queue-system/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── config.env
│   ├── package.json
│   └── server.js
├── frontend/
│   └── vite-project/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.js
└── README.md
```

---

## ⚙️ Environment Configuration

### 1. Backend Environment Variables

Create production environment file:

```bash
# On your server
cd /var/www/queue-system/backend
nano config.env
```

**Production config.env:**
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Connection (Use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/queue_system?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_long_random_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10

# SMTP Configuration (Production Email Service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-verified-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Queue System <noreply@yourdomain.com>

# File Upload Configuration
UPLOAD_PATH=/var/www/queue-system/backend/uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL=https://yourdomain.com

# Admin Setup
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
```

### 2. Frontend Environment Variables

```bash
cd /var/www/queue-system/frontend/vite-project
nano .env.production
```

**Frontend .env.production:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Queue System
```

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended for Beginners)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (free)
   - Select a cloud provider and region
   - Cluster name: `queue-system`

3. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)

4. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Username: `queue_system_user`
   - Password: Generate strong password
   - Permissions: "Read and write to any database"

5. **Get Connection String**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace password with your user password

### Option 2: Self-Hosted MongoDB

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongo
> use queue_system
> db.createUser({
    user: "queue_system_user",
    pwd: "your_password",
    roles: ["readWrite"]
  })
> exit
```

---

## 🔧 Backend Deployment

### 1. Server Setup

```bash
# Create project directory
sudo mkdir -p /var/www/queue-system
cd /var/www/queue-system

# Clone your project
git clone https://github.com/yourusername/queue-system.git .

# Install dependencies
cd backend
npm install --production

# Create uploads directory
mkdir uploads
chmod 755 uploads
```

### 2. Build and Start Backend

```bash
# Install PM2 globally if not already installed
sudo npm install -g pm2

# Create PM2 configuration file
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'queue-system-api',
    script: 'server.js',
    cwd: '/var/www/queue-system/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/queue-system/error.log',
    out_file: '/var/log/queue-system/out.log',
    log_file: '/var/log/queue-system/combined.log',
    time: true
  }]
};
```

### 3. Start Backend with PM2

```bash
# Create log directory
sudo mkdir -p /var/log/queue-system

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command output (usually: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu)
```

### 4. Test Backend

```bash
# Check if backend is running
pm2 status

# Test API endpoint
curl http://localhost:5000/health
```

---

## 🎨 Frontend Deployment

### 1. Build Frontend

```bash
cd /var/www/queue-system/frontend/vite-project

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Setup Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/queue-system
```

**Nginx configuration:**
```nginx
# Frontend (Main Domain)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:+aECDSA:+AES256:+GCM:+SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend Static Files
    root /var/www/queue-system/frontend/vite-project/dist;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend (API Subdomain)
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:+aECDSA:+AES256:+GCM:+SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Backend Proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout Settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File Uploads
    location /uploads/ {
        alias /var/www/queue-system/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 3. Enable Site and Configure SSL

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/queue-system /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx

# Get SSL Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Setup auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🌐 Domain & SSL Setup

### 1. DNS Configuration

In your domain registrar's DNS settings:

```
Type: A Record
Name: @
Value: YOUR_SERVER_IP
TTL: 300

Type: A Record  
Name: www
Value: YOUR_SERVER_IP
TTL: 300

Type: A Record
Name: api
Value: YOUR_SERVER_IP
TTL: 300
```

### 2. Email Service Setup

#### Gmail SMTP (Free Option):
1. Enable 2-factor authentication
2. Go to Google Account → Security → App passwords
3. Generate new app password
4. Use app password in `SMTP_PASS`

#### SendGrid (Recommended for Production):
```bash
# Sign up at https://sendgrid.com
# Verify your domain
# Get API key
# Update config.env:
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
```

---

## 📊 Monitoring & Maintenance

### 1. Setup Monitoring

```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate
pm2 install pm2-server-monit

# Setup log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 2. Create Maintenance Scripts

```bash
# Create backup script
sudo nano /var/www/queue-system/backup.sh
```

**backup.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/queue-system"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://username:password@cluster.mongodb.net/queue_system" --out="$BACKUP_DIR/mongodb_$DATE"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/www/queue-system/backend/uploads/

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make script executable
sudo chmod +x /var/www/queue-system/backup.sh

# Setup daily backup cron job
sudo crontab -e
# Add: 0 2 * * * /var/www/queue-system/backup.sh
```

### 3. Performance Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Monitor system resources
pm2 monit

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Backend Not Starting
```bash
# Check PM2 logs
pm2 logs queue-system-api

# Check if port is in use
sudo netstat -tlnp | grep :5000

# Restart PM2
pm2 restart queue-system-api
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
mongo "mongodb://username:password@cluster.mongodb.net/queue_system"

# Check network connectivity
ping cluster.mongodb.net
```

#### 3. Email Not Sending
```bash
# Check SMTP credentials
# Verify app password for Gmail
# Check SMTP logs in PM2
pm2 logs queue-system-api --err
```

#### 4. Frontend Not Loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Rebuild frontend if needed
cd /var/www/queue-system/frontend/vite-project
npm run build
```

#### 5. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### Emergency Commands

```bash
# Restart all services
sudo systemctl restart nginx
pm2 restart all

# Clear PM2 logs
pm2 flush

# Update application
cd /var/www/queue-system
git pull origin main
cd backend && npm install
pm2 restart queue-system-api
cd ../frontend/vite-project && npm run build
```

---

## 📋 Pre-Deployment Checklist

- [ ] Domain DNS configured
- [ ] SSL certificates installed
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Backend running on PM2
- [ ] Frontend built and served by Nginx
- [ ] Email service tested
- [ ] File uploads working
- [ ] Security headers configured
- [ ] Backup scripts created
- [ ] Monitoring setup
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] API endpoints tested
- [ ] User registration flow tested
- [ ] Password reset flow tested

---

## 🎉 Deployment Complete!

Your Queue System is now live! 

**Access URLs:**
- **Frontend**: https://yourdomain.com
- **Backend API**: https://api.yourdomain.com
- **Health Check**: https://api.yourdomain.com/health

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring alerts
3. Configure regular backups
4. Document your deployment process
5. Plan for scaling (load balancers, CDNs)

For ongoing maintenance, regularly check:
- Server resource usage
- Application logs
- SSL certificate expiry
- Database performance
- Email deliverability

Good luck with your deployed application! 🚀
