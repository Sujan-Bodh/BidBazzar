# BidBazaar - Complete Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Method 1: Manual Installation](#method-1-manual-installation)
4. [Method 2: Docker Installation](#method-2-docker-installation)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **OS:** Windows 10, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Node.js:** v14.0 or higher
- **MongoDB:** v4.4 or higher
- **npm:** v6.0 or higher

### Recommended Setup
- Node.js v18+ LTS
- MongoDB v6.0+
- 8GB+ RAM
- SSD storage
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## Installation Methods

Choose one of the following installation methods:

### Quick Comparison

| Feature | Manual Installation | Docker Installation |
|---------|-------------------|-------------------|
| Setup Time | 10-15 minutes | 5 minutes |
| Difficulty | Medium | Easy |
| Customization | High | Medium |
| Best For | Development | Quick Testing |

---

## Method 1: Manual Installation

### Step 1: Install Prerequisites

#### Node.js Installation

**Windows:**
1. Download from https://nodejs.org/
2. Run installer
3. Verify: `node --version` and `npm --version`

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### MongoDB Installation

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Run installer (choose "Complete" installation)
3. Install as Windows Service (checked by default)
4. MongoDB Compass will be installed automatically

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongo --version
```

**Linux (Ubuntu):**
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongod --version
```

### Step 2: Clone or Download Project

```bash
# If using Git
git clone <repository-url> BidBazaar
cd BidBazaar

# Or extract the ZIP file if downloaded
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# This will install:
# - express, mongoose, socket.io
# - jsonwebtoken, bcryptjs
# - multer, cors, dotenv
# - express-validator, node-cron
# - nodemon (dev dependency)
```

**Expected Installation Time:** 2-3 minutes

**If Installation Fails:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# This will install:
# - react, react-dom, react-router-dom
# - axios, socket.io-client
# - tailwindcss, postcss, autoprefixer
# - react-toastify, date-fns
# - react-scripts
```

**Expected Installation Time:** 3-5 minutes

### Step 5: Environment Configuration

#### Backend Environment

```bash
# In backend directory
cd backend

# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
```

**Required .env Configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bidbazaar
JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Generate Secure JWT Secret:**
```bash
# Node.js command
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend Environment (Optional)

```bash
# In frontend directory
cd ../frontend

# Create .env file
touch .env
```

**Add to .env:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 6: Database Setup

#### Start MongoDB

**Windows:**
```bash
# If installed as service, it should already be running
# To manually start:
net start MongoDB

# To check status:
sc query MongoDB
```

**macOS:**
```bash
# Start MongoDB
brew services start mongodb-community

# Check status
brew services list
```

**Linux:**
```bash
# Start MongoDB
sudo systemctl start mongod

# Check status
sudo systemctl status mongod

# Enable auto-start on boot
sudo systemctl enable mongod
```

#### Create Database (Optional)

MongoDB will automatically create the database when you first connect, but you can create it manually:

```bash
# Open MongoDB shell
mongo

# Switch to database
use bidbazaar

# Verify
show dbs
exit
```

### Step 7: Create Upload Directories

```bash
# In backend directory
mkdir -p uploads/auctions

# Set permissions (Linux/macOS)
chmod -R 755 uploads
```

---

## Method 2: Docker Installation

### Prerequisites
- Docker Desktop installed
- Docker Compose installed (included with Docker Desktop)

### Step 1: Install Docker

**Windows:**
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and restart
3. Verify: `docker --version` and `docker-compose --version`

**macOS:**
```bash
# Using Homebrew
brew install --cask docker

# Or download from docker.com
```

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Step 2: Configure Environment

Edit `docker-compose.yml` and update environment variables:

```yaml
backend:
  environment:
    - JWT_SECRET=your_production_secret_here
    - NODE_ENV=production
```

### Step 3: Build and Run

```bash
# From project root directory
docker-compose up -d

# This will:
# 1. Build backend image
# 2. Build frontend image
# 3. Pull MongoDB image
# 4. Create network
# 5. Start all containers
```

**First Build Time:** 10-15 minutes

**Subsequent Starts:** < 1 minute

### Step 4: Verify Docker Containers

```bash
# Check running containers
docker-compose ps

# Should show:
# - bidbazaar-mongodb (running)
# - bidbazaar-backend (running)
# - bidbazaar-frontend (running)

# View logs
docker-compose logs -f
```

---

## Database Setup

### MongoDB Atlas (Cloud Alternative)

If you don't want to run MongoDB locally:

1. **Create Free Account:**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster:**
   - Choose free tier (M0)
   - Select region closest to you
   - Create cluster (takes 5-10 minutes)

3. **Configure Access:**
   - Add IP address (use 0.0.0.0/0 for testing)
   - Create database user with password

4. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Update MONGODB_URI in .env:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bidbazaar?retryWrites=true&w=majority
   ```

### Database Seeding (Optional)

Create sample data for testing:

```bash
# In backend directory
node scripts/seed.js

# This will create:
# - Sample users
# - Sample auctions
# - Sample bids
```

---

## Running the Application

### Development Mode

#### Start Backend

```bash
cd backend

# Development mode (auto-reload)
npm run dev

# You should see:
# ╔═══════════════════════════════════════╗
# ║   BidBazaar Server Running            ║
# ║   Port: 5000                          ║
# ║   Environment: development            ║
# ╚═══════════════════════════════════════╝
# MongoDB Connected: localhost
# Auction scheduler started
```

#### Start Frontend (New Terminal)

```bash
cd frontend

# Development mode
npm start

# Browser will open automatically at http://localhost:3000
```

### Production Mode

#### Backend

```bash
cd backend

# Set NODE_ENV to production in .env
NODE_ENV=production

# Start server
npm start
```

#### Frontend

```bash
cd frontend

# Build production bundle
npm run build

# Serve with static server
npm install -g serve
serve -s build -p 3000
```

### Docker Mode

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## Verification

### 1. Check Backend Health

```bash
# Test API health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "OK",
#   "message": "BidBazaar API is running",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

### 2. Check Frontend

Open browser and navigate to http://localhost:3000

You should see:
- BidBazaar homepage
- Navigation bar
- Auction listings (empty initially)
- Login/Register buttons

### 3. Check MongoDB Connection

```bash
# Open MongoDB shell
mongo

# Check database
use bidbazaar
show collections

# Should show: auctions, bids, users
```

### 4. Test User Registration

1. Go to http://localhost:3000/register
2. Fill in registration form
3. Submit
4. Should redirect to homepage
5. Check navbar for logged-in state

### 5. Test Real-time Features

1. Create an auction (login required)
2. Open auction in two browser tabs
3. Place bid from one tab
4. See instant update in second tab

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
# Windows:
sc query MongoDB

# macOS:
brew services list

# Linux:
sudo systemctl status mongod

# If not running, start it
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

#### 2. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

#### 3. npm Install Fails

**Error:** Various npm errors during installation

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Use legacy peer deps if needed
npm install --legacy-peer-deps

# Or try yarn
npm install -g yarn
yarn install
```

#### 4. Socket.io Connection Failed

**Error:** Socket not connecting in browser console

**Solution:**
1. Check backend is running on correct port
2. Verify CORS settings in backend/server.js
3. Check CLIENT_URL in backend/.env
4. Clear browser cache
5. Try different browser

#### 5. Images Not Uploading

**Error:** File upload fails

**Solution:**
```bash
# Check uploads directory exists
cd backend
mkdir -p uploads/auctions

# Check permissions (Linux/macOS)
chmod -R 755 uploads

# Check file size limits in middleware/upload.js
```

#### 6. JWT Token Expired

**Error:** 401 Unauthorized errors

**Solution:**
1. Logout and login again
2. Check JWT_EXPIRE in .env
3. Clear localStorage in browser console:
   ```javascript
   localStorage.clear()
   ```

#### 7. Database Schema Errors

**Error:** Validation errors from MongoDB

**Solution:**
```bash
# Drop and recreate database
mongo
use bidbazaar
db.dropDatabase()
exit

# Restart backend (will recreate collections)
```

### Getting Help

If you encounter other issues:

1. **Check Logs:**
   ```bash
   # Backend logs (terminal where backend is running)
   # Frontend logs (browser console F12)
   # MongoDB logs (varies by OS)
   ```

2. **Enable Debug Mode:**
   ```bash
   # In backend/.env
   NODE_ENV=development
   DEBUG=*
   ```

3. **Check Documentation:**
   - README.md
   - API_DOCUMENTATION.md
   - QUICKSTART.md

4. **Common Solutions:**
   - Restart all services
   - Clear browser cache
   - Delete node_modules and reinstall
   - Check firewall settings
   - Verify environment variables

---

## Post-Installation Steps

### 1. Create Admin Account

```bash
# In MongoDB shell
mongo
use bidbazaar

# Set user as admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

### 2. Configure Production Settings

For production deployment:

1. Generate secure JWT_SECRET
2. Use MongoDB Atlas or managed MongoDB
3. Set NODE_ENV=production
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up environment variables on hosting platform
7. Add rate limiting
8. Set up monitoring and logging

### 3. Optional Enhancements

- Set up email notifications
- Configure payment gateway
- Add analytics
- Set up backup system
- Configure CDN for images

---

## Update Instructions

### Updating Dependencies

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update

# Check for major updates
npm outdated
```

### Pulling Latest Changes

```bash
# If using Git
git pull origin main

# Reinstall dependencies if package.json changed
npm install

# Rebuild Docker containers if needed
docker-compose up -d --build
```

---

## Uninstallation

### Remove Application

```bash
# Delete project directory
rm -rf BidBazaar
```

### Remove Database

```bash
# In MongoDB shell
mongo
use bidbazaar
db.dropDatabase()
exit
```

### Stop Services

```bash
# Docker
docker-compose down -v

# MongoDB (if not needed for other projects)
# Windows:
net stop MongoDB

# macOS:
brew services stop mongodb-community

# Linux:
sudo systemctl stop mongod
```

---

## Success Checklist

- [ ] Node.js and npm installed
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Upload directories created
- [ ] Backend starts without errors
- [ ] Frontend starts and opens in browser
- [ ] Can register new user
- [ ] Can create auction
- [ ] Can place bid
- [ ] Real-time updates working
- [ ] Dashboard displays correctly

---

## Next Steps

✅ Installation Complete!

1. Read [QUICKSTART.md](./QUICKSTART.md) for usage guide
2. Review [README.md](./README.md) for features
3. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API reference
4. Start creating auctions and bidding!

---

**Need Help?** Check the Troubleshooting section or create an issue in the repository.

**Happy Bidding!** 🎉
