# BidBazaar - Real-time Auction Platform

A full-stack, production-ready real-time auction application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for real-time bidding.

## Features

### Core Functionality
- **User Authentication & Authorization**: Secure JWT-based authentication with registration, login, and profile management
- **Real-time Bidding System**: Live bid updates across all connected clients using Socket.io
- **Auction Management**: Create, update, and delete auctions with image uploads
- **Advanced Search & Filtering**: Search auctions by keyword, category, and multiple sorting options
- **Bid History & Tracking**: Complete bid history with winner notifications
- **Automatic Auction Ending**: Cron job automatically ends auctions and notifies winners
- **User Dashboard**: Comprehensive dashboard showing active bids, won auctions, selling history, and watchlist
- **Buy Now Option**: Instant purchase functionality for fixed-price sales
- **Watchlist**: Save favorite auctions for quick access
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Technical Features
- Real-time viewer count for active auctions
- Input validation on both frontend and backend
- Comprehensive error handling and loading states
- Image upload with file size and type validation
- Secure password hashing with bcrypt
- Protected API routes with JWT middleware
- Database indexing for optimized queries
- RESTful API architecture

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **Node-cron** - Scheduled tasks for auction ending

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Socket.io Client** - Real-time updates
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **React Toastify** - Notifications
- **date-fns** - Date formatting

## Project Structure

```
BidBazaar/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── auctionController.js  # Auction CRUD operations
│   │   └── bidController.js      # Bidding logic
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   └── upload.js             # File upload configuration
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Auction.js            # Auction schema
│   │   └── Bid.js                # Bid schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── auctionRoutes.js      # Auction endpoints
│   │   └── bidRoutes.js          # Bid endpoints
│   ├── socket/
│   │   └── socketHandler.js      # Socket.io event handlers
│   ├── utils/
│   │   └── auctionScheduler.js   # Cron job for ending auctions
│   ├── uploads/                  # Uploaded images
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── server.js                 # Main server file
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.js
    │   │   │   └── Register.js
    │   │   ├── auctions/
    │   │   │   ├── AuctionCard.js
    │   │   │   ├── AuctionList.js
    │   │   │   ├── AuctionDetail.js
    │   │   │   └── CreateAuction.js
    │   │   ├── common/
    │   │   │   ├── CountdownTimer.js
    │   │   │   ├── LoadingSpinner.js
    │   │   │   └── PrivateRoute.js
    │   │   ├── dashboard/
    │   │   │   └── Dashboard.js
    │   │   └── layout/
    │   │       └── Navbar.js
    │   ├── context/
    │   │   └── AuthContext.js        # Global auth state
    │   ├── utils/
    │   │   ├── api.js                # API client
    │   │   └── socket.js             # Socket.io service
    │   ├── App.js                    # Main app component
    │   ├── index.js                  # React entry point
    │   └── index.css                 # Global styles
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd BidBazaar/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/bidbazaar
     JWT_SECRET=your_super_secret_jwt_key_here
     JWT_EXPIRE=7d
     NODE_ENV=development
     CLIENT_URL=http://localhost:3000
     ```

4. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud database)
   # Update MONGODB_URI in .env with your Atlas connection string
   ```

5. **Start the backend server:**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd BidBazaar/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

### Running the Complete Application

1. Start MongoDB (if using local installation)
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend server: `cd frontend && npm start`
4. Open `http://localhost:3000` in your browser

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string" (optional),
  "lastName": "string" (optional)
}

Response: User object with JWT token
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "string",
  "password": "string"
}

Response: User object with JWT token
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response: User profile object
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

Body: User fields to update

Response: Updated user object
```

### Auction Endpoints

#### Get All Auctions
```
GET /api/auctions?category=Electronics&search=phone&sortBy=createdAt&order=desc&page=1&limit=12

Response:
{
  "auctions": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalAuctions": 50
}
```

#### Get Single Auction
```
GET /api/auctions/:id

Response: Auction object with populated seller and winner
```

#### Create Auction
```
POST /api/auctions
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: string
- description: string
- category: string
- condition: string
- startingBid: number
- minimumIncrement: number
- buyNowPrice: number (optional)
- endTime: datetime
- shippingCost: number
- location: object
- images: files (max 5)

Response: Created auction object
```

#### Update Auction
```
PUT /api/auctions/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Response: Updated auction object
```

#### Delete Auction
```
DELETE /api/auctions/:id
Authorization: Bearer <token>

Response: Success message
```

#### Get User's Auctions
```
GET /api/auctions/user/selling
Authorization: Bearer <token>

Response: Array of user's auctions
```

#### Toggle Watch
```
POST /api/auctions/:id/watch
Authorization: Bearer <token>

Response:
{
  "isWatching": boolean,
  "watchCount": number
}
```

#### Get Watched Auctions
```
GET /api/auctions/user/watching
Authorization: Bearer <token>

Response: Array of watched auctions
```

### Bid Endpoints

#### Place Bid
```
POST /api/bids/:auctionId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": number,
  "maxAutoBid": number (optional)
}

Response:
{
  "message": "Bid placed successfully",
  "bid": {...},
  "auction": {...}
}
```

#### Buy Now
```
POST /api/bids/:auctionId/buynow
Authorization: Bearer <token>

Response: Purchase confirmation
```

#### Get Auction Bids
```
GET /api/bids/auction/:auctionId

Response: Array of bids for the auction
```

#### Get User's Bids
```
GET /api/bids/user/mybids
Authorization: Bearer <token>

Response: Array of user's bids
```

#### Get User's Winning Bids
```
GET /api/bids/user/winning
Authorization: Bearer <token>

Response: Array of user's currently winning bids
```

#### Get User's Won Auctions
```
GET /api/bids/user/won
Authorization: Bearer <token>

Response: Array of auctions won by user
```

## Socket.io Events

### Client Events (Emit)
- `joinAuction(auctionId)` - Join an auction room
- `leaveAuction(auctionId)` - Leave an auction room
- `newBid(data)` - Broadcast new bid
- `chatMessage(data)` - Send chat message (optional feature)

### Server Events (Listen)
- `bidPlaced` - New bid was placed
- `auctionEnded` - Auction has ended
- `auctionWon` - User won an auction
- `viewerCount` - Number of viewers updated
- `userJoined` - User joined auction room
- `userLeft` - User left auction room

## Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  address: Object,
  isAdmin: Boolean,
  isActive: Boolean,
  avatar: String,
  balance: Number,
  timestamps: true
}
```

### Auction Model
```javascript
{
  title: String,
  description: String,
  category: String (enum),
  images: [String],
  startingBid: Number,
  currentBid: Number,
  minimumIncrement: Number,
  buyNowPrice: Number,
  startTime: Date,
  endTime: Date,
  seller: ObjectId (ref: User),
  currentWinner: ObjectId (ref: User),
  status: String (enum: pending, active, ended, cancelled),
  totalBids: Number,
  watchers: [ObjectId],
  condition: String (enum),
  shippingCost: Number,
  location: Object,
  timestamps: true
}
```

### Bid Model
```javascript
{
  auction: ObjectId (ref: Auction),
  bidder: ObjectId (ref: User),
  amount: Number,
  isWinning: Boolean,
  isAutomatic: Boolean,
  maxAutoBid: Number,
  timestamps: true
}
```

## Features Guide

### For Buyers

1. **Browse Auctions**: View all active auctions with filtering and search
2. **Place Bids**: Bid on items in real-time with automatic validation
3. **Buy Now**: Purchase items instantly at fixed price
4. **Watch Auctions**: Save interesting auctions to your watchlist
5. **Track Bids**: Monitor all your active bids in the dashboard
6. **View History**: See all won auctions and contact sellers

### For Sellers

1. **Create Auctions**: List items with images, descriptions, and pricing
2. **Set Buy Now Price**: Offer instant purchase option
3. **Monitor Sales**: Track all your auctions in the dashboard
4. **View Bidders**: See bid history and current leading bidder
5. **Automatic Completion**: Auctions end automatically with winner notification

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Protected API routes with middleware
- Input validation on frontend and backend
- XSS protection through sanitization
- CORS configuration for secure cross-origin requests
- File upload validation (type and size)
- SQL injection prevention through Mongoose ODM

## Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large result sets
- Image compression and file size limits
- Lazy loading of components
- Efficient Socket.io room management
- Connection pooling for database

## Deployment

### Backend Deployment (Heroku, Railway, or VPS)

1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud hosting)
3. Update CORS settings for production domain
4. Build and deploy using Git or Docker

### Frontend Deployment (Vercel, Netlify, or VPS)

1. Update API URLs in environment configuration
2. Build the production bundle: `npm run build`
3. Deploy the `build` folder to your hosting platform
4. Configure environment variables for production

### Docker Deployment (Optional)

Create `docker-compose.yml` for containerized deployment:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/bidbazaar
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity for cloud databases

2. **Socket.io Connection Issues**
   - Check CORS settings in server.js
   - Verify CLIENT_URL in .env
   - Ensure both frontend and backend are running

3. **Image Upload Not Working**
   - Check uploads directory exists and has write permissions
   - Verify multer configuration
   - Ensure file size is within limits

4. **JWT Token Expired**
   - Login again to get a new token
   - Adjust JWT_EXPIRE in .env for longer sessions

## Future Enhancements

- [ ] Email notifications for bid updates and auction wins
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Advanced analytics dashboard for sellers
- [ ] Auction categories with custom filters
- [ ] User ratings and reviews
- [ ] Auction recommendations based on user behavior
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Live chat between buyers and sellers
- [ ] Auction scheduling and draft mode

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

## Acknowledgments

- Socket.io for real-time communication
- Tailwind CSS for responsive design
- MongoDB for flexible data storage
- React community for excellent documentation

---

**BidBazaar** - Built with ❤️ using the MERN Stack
