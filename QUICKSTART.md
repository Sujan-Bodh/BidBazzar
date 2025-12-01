# BidBazaar - Quick Start Guide

Get BidBazaar up and running in 5 minutes!

## Prerequisites Check

Before you begin, ensure you have:
- ✅ Node.js v14+ installed
- ✅ MongoDB v4.4+ installed (or MongoDB Atlas account)
- ✅ npm or yarn package manager

## Quick Setup (Development)

### 1. Install Backend Dependencies

```bash
cd BidBazaar/backend
npm install
```

### 2. Configure Backend Environment

Create `.env` file in backend directory:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bidbazaar
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS/Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update MONGODB_URI in .env

### 4. Start Backend Server

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd BidBazaar/frontend
npm install
```

### 6. Start Frontend Development Server

```bash
npm start
# App opens at http://localhost:3000
```

## First Steps

### 1. Register an Account

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Fill in registration form
4. Login with your credentials

### 2. Create Your First Auction

1. Click "Sell" in navigation
2. Fill in auction details:
   - Title: "Test Auction Item"
   - Description: "This is a test item"
   - Category: Select any
   - Starting Bid: 10
   - End Time: Set to tomorrow
3. Upload an image (optional)
4. Click "Create Auction"

### 3. Place a Bid

1. Register a second account (use different browser or incognito)
2. Browse auctions
3. Click on any auction
4. Enter bid amount
5. Click "Place Bid"
6. Watch real-time updates!

## Testing Real-Time Features

### Test Socket.io Bidding

1. Open auction in two browser windows
2. Login with different accounts in each
3. Place bids from one window
4. See instant updates in both windows
5. Check viewer count updates

### Test Countdown Timer

1. Create auction ending in 5 minutes
2. Watch countdown timer update in real-time
3. Timer shows different colors based on urgency

### Test Automatic Auction Ending

1. Create auction ending in 2 minutes
2. Place some bids
3. Wait for auction to end
4. Check dashboard for winner notification

## Common Issues & Solutions

### MongoDB Connection Failed

**Problem:** Cannot connect to MongoDB

**Solution:**
```bash
# Check if MongoDB is running
# macOS/Linux:
sudo systemctl status mongod

# Windows:
sc query MongoDB

# If not running, start it
# macOS/Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### Port Already in Use

**Problem:** Port 5000 or 3000 already in use

**Solution:**
```bash
# Find and kill process using port
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies Installation Failed

**Problem:** npm install errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Socket.io Not Connecting

**Problem:** Real-time features not working

**Solution:**
1. Check backend is running on port 5000
2. Check CORS settings in backend/server.js
3. Verify CLIENT_URL in backend/.env
4. Check browser console for errors

## Project Structure Overview

```
BidBazaar/
├── backend/              # Express.js API server
│   ├── models/           # Database schemas
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth & validation
│   ├── socket/           # Socket.io handlers
│   └── server.js         # Entry point
│
└── frontend/             # React application
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # Global state
    │   ├── utils/        # API & Socket services
    │   └── App.js        # Main component
    └── public/           # Static files
```

## Quick Commands Reference

### Backend

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# View server logs
# Check terminal where backend is running
```

### Frontend

```bash
# Start development server
npm start

# Build for production
npm run build

# Serve production build
npm install -g serve
serve -s build
```

## Default Test Accounts

After running the application, create test accounts:

**Seller Account:**
- Email: seller@test.com
- Password: test123

**Buyer Account:**
- Email: buyer@test.com
- Password: test123

## Next Steps

1. ✅ Read full [README.md](./README.md) for detailed documentation
2. ✅ Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API reference
3. ✅ Explore dashboard features
4. ✅ Test real-time bidding with multiple users
5. ✅ Customize and extend features

## Production Deployment

For production deployment, see:
- [README.md - Deployment Section](./README.md#deployment)
- Use environment variables for sensitive data
- Set up SSL/TLS certificates
- Use MongoDB Atlas for database
- Deploy frontend to Vercel/Netlify
- Deploy backend to Heroku/Railway

## Getting Help

- 📖 [Full Documentation](./README.md)
- 🔧 [API Reference](./API_DOCUMENTATION.md)
- 🐛 Report issues in repository
- 💬 Check console logs for errors

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Backend: Uses nodemon (npm run dev)
- Frontend: React's built-in hot reload

### Debugging

**Backend:**
```bash
# Add console.log in controllers
console.log('Debug info:', data);

# Check MongoDB queries
mongoose.set('debug', true);
```

**Frontend:**
```javascript
// React DevTools browser extension
// Console.log in components
console.log('Component data:', state);
```

### Database Inspection

```bash
# Open MongoDB shell
mongo

# Switch to database
use bidbazaar

# View collections
show collections

# Query auctions
db.auctions.find().pretty()

# Count documents
db.auctions.countDocuments()
```

## Feature Testing Checklist

- [ ] User registration and login
- [ ] Create auction with images
- [ ] Browse and search auctions
- [ ] Place bids (minimum increment validation)
- [ ] Real-time bid updates
- [ ] Countdown timer
- [ ] Buy now functionality
- [ ] Watchlist add/remove
- [ ] Dashboard views
- [ ] Auction ending (automatic)
- [ ] Won auction notification
- [ ] Seller contact info for winners

## Performance Tips

1. **Optimize Images:**
   - Compress before upload
   - Max 5MB per image
   - Use appropriate formats (JPG for photos, PNG for graphics)

2. **Database:**
   - Indexes are already configured
   - Use pagination for large datasets
   - Archive old auctions periodically

3. **Socket.io:**
   - Rooms are automatically managed
   - Disconnect events clean up connections
   - Viewer counts update in real-time

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens for authentication
- [x] Protected API routes
- [x] Input validation (frontend & backend)
- [x] File upload restrictions
- [x] CORS configured
- [x] XSS protection
- [ ] Add rate limiting (recommended for production)
- [ ] Add HTTPS in production
- [ ] Use environment variables for secrets

## Success!

You should now have a fully functional auction platform running locally. Start creating auctions and placing bids!

Happy Bidding! 🎉
