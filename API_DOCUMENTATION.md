# BidBazaar API Documentation

Complete API reference for the BidBazaar auction platform.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Validation Rules:**
- username: 3-30 characters, unique
- email: Valid email format, unique
- password: Minimum 6 characters

**Response (201):**
```json
{
  "_id": "64abc123...",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Email or username already exists
- 400: Invalid user data
- 500: Server error

---

### Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "_id": "64abc123...",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 401: Invalid email or password
- 401: Account is deactivated
- 500: Server error

---

### Get Profile

Get the current user's profile.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Response (200):**
```json
{
  "_id": "64abc123...",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "isAdmin": false,
  "avatar": "",
  "balance": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- 401: Not authorized
- 404: User not found
- 500: Server error

---

### Update Profile

Update the current user's profile.

**Endpoint:** `PUT /auth/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  },
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "_id": "64abc123...",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": {...},
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Email or username already exists
- 401: Not authorized
- 404: User not found
- 500: Server error

---

## Auction Endpoints

### Get All Auctions

Retrieve a paginated list of auctions with optional filtering and sorting.

**Endpoint:** `GET /auctions`

**Query Parameters:**
- `status` (string): Filter by status (active, pending, ended)
- `category` (string): Filter by category
- `search` (string): Search in title and description
- `sortBy` (string): Sort field (createdAt, endTime, currentBid, totalBids)
- `order` (string): Sort order (asc, desc)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)

**Example:**
```
GET /auctions?category=Electronics&search=laptop&sortBy=currentBid&order=desc&page=1&limit=12
```

**Response (200):**
```json
{
  "auctions": [
    {
      "_id": "64abc123...",
      "title": "MacBook Pro 2023",
      "description": "Excellent condition laptop...",
      "category": "Electronics",
      "images": ["/uploads/auctions/auction-123.jpg"],
      "startingBid": 500,
      "currentBid": 750,
      "minimumIncrement": 10,
      "buyNowPrice": 1200,
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-10T00:00:00.000Z",
      "seller": {
        "_id": "64abc456...",
        "username": "seller123",
        "email": "seller@example.com"
      },
      "currentWinner": {
        "_id": "64abc789...",
        "username": "buyer456"
      },
      "status": "active",
      "totalBids": 15,
      "condition": "Like New",
      "shippingCost": 25,
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-05T12:30:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalAuctions": 58
}
```

---

### Get Single Auction

Retrieve details of a specific auction.

**Endpoint:** `GET /auctions/:id`

**Response (200):**
```json
{
  "_id": "64abc123...",
  "title": "MacBook Pro 2023",
  "description": "Detailed description...",
  "category": "Electronics",
  "images": ["/uploads/auctions/auction-123.jpg"],
  "startingBid": 500,
  "currentBid": 750,
  "minimumIncrement": 10,
  "buyNowPrice": 1200,
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-01-10T00:00:00.000Z",
  "seller": {
    "_id": "64abc456...",
    "username": "seller123",
    "email": "seller@example.com",
    "phone": "+1234567890",
    "firstName": "John",
    "lastName": "Doe"
  },
  "currentWinner": {
    "_id": "64abc789...",
    "username": "buyer456"
  },
  "status": "active",
  "totalBids": 15,
  "watchers": ["64abc111...", "64abc222..."],
  "condition": "Like New",
  "shippingCost": 25,
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-05T12:30:00.000Z"
}
```

**Error Responses:**
- 404: Auction not found
- 500: Server error

---

### Create Auction

Create a new auction listing.

**Endpoint:** `POST /auctions`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `title` (string, required): Auction title (max 100 chars)
- `description` (string, required): Item description (max 2000 chars)
- `category` (string, required): Category (Electronics, Fashion, etc.)
- `condition` (string, required): Item condition (New, Like New, Good, Fair, Poor)
- `startingBid` (number, required): Starting bid amount (> 0)
- `minimumIncrement` (number, required): Minimum bid increment (> 0)
- `buyNowPrice` (number, optional): Buy now price
- `endTime` (datetime, required): Auction end time (future date)
- `shippingCost` (number, optional): Shipping cost
- `location` (JSON string, optional): Location object
- `images` (files, optional): Up to 5 image files

**Example:**
```javascript
const formData = new FormData();
formData.append('title', 'MacBook Pro 2023');
formData.append('description', 'Excellent condition...');
formData.append('category', 'Electronics');
formData.append('condition', 'Like New');
formData.append('startingBid', 500);
formData.append('minimumIncrement', 10);
formData.append('buyNowPrice', 1200);
formData.append('endTime', '2024-01-10T00:00:00.000Z');
formData.append('shippingCost', 25);
formData.append('location', JSON.stringify({city: 'SF', state: 'CA', country: 'USA'}));
formData.append('images', imageFile1);
formData.append('images', imageFile2);
```

**Response (201):**
```json
{
  "_id": "64abc123...",
  "title": "MacBook Pro 2023",
  "description": "Excellent condition...",
  "category": "Electronics",
  "images": ["/uploads/auctions/auction-123.jpg"],
  "startingBid": 500,
  "currentBid": 500,
  "minimumIncrement": 10,
  "buyNowPrice": 1200,
  "endTime": "2024-01-10T00:00:00.000Z",
  "seller": "64abc456...",
  "status": "active",
  "totalBids": 0,
  "condition": "Like New",
  "shippingCost": 25,
  "location": {...},
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- 400: Invalid auction data
- 401: Not authorized
- 500: Server error

---

### Update Auction

Update an existing auction (only allowed if no bids placed).

**Endpoint:** `PUT /auctions/:id`

**Authentication:** Required (must be seller or admin)

**Content-Type:** `multipart/form-data`

**Response (200):** Updated auction object

**Error Responses:**
- 400: Cannot update auction with existing bids
- 401: Not authorized
- 403: Not authorized to update this auction
- 404: Auction not found
- 500: Server error

---

### Delete Auction

Delete an auction (only allowed if no bids placed).

**Endpoint:** `DELETE /auctions/:id`

**Authentication:** Required (must be seller or admin)

**Response (200):**
```json
{
  "message": "Auction deleted successfully"
}
```

**Error Responses:**
- 400: Cannot delete auction with existing bids
- 401: Not authorized
- 403: Not authorized to delete this auction
- 404: Auction not found
- 500: Server error

---

### Get User's Auctions

Get all auctions created by the current user.

**Endpoint:** `GET /auctions/user/selling`

**Authentication:** Required

**Response (200):** Array of auction objects

---

### Toggle Watch Auction

Add or remove auction from user's watchlist.

**Endpoint:** `POST /auctions/:id/watch`

**Authentication:** Required

**Response (200):**
```json
{
  "isWatching": true,
  "watchCount": 5
}
```

---

### Get Watched Auctions

Get all auctions in user's watchlist.

**Endpoint:** `GET /auctions/user/watching`

**Authentication:** Required

**Response (200):** Array of auction objects

---

## Bid Endpoints

### Place Bid

Place a bid on an auction.

**Endpoint:** `POST /bids/:auctionId`

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 800,
  "maxAutoBid": 1000
}
```

**Validation:**
- Amount must be >= currentBid + minimumIncrement
- Cannot bid on own auction
- Auction must be active
- Amount must not exceed buyNowPrice

**Response (201):**
```json
{
  "message": "Bid placed successfully",
  "bid": {
    "_id": "64abc123...",
    "auction": {
      "_id": "64abc456...",
      "title": "MacBook Pro 2023"
    },
    "bidder": {
      "_id": "64abc789...",
      "username": "buyer456"
    },
    "amount": 800,
    "isWinning": true,
    "createdAt": "2024-01-05T12:30:00.000Z"
  },
  "auction": {
    "_id": "64abc456...",
    "currentBid": 800,
    "currentWinner": "64abc789...",
    "totalBids": 16
  }
}
```

**Error Responses:**
- 400: Bid amount too low
- 400: Auction not active or ended
- 400: Cannot bid on own auction
- 401: Not authorized
- 404: Auction not found
- 500: Server error

---

### Buy Now

Purchase an item immediately at the buy now price.

**Endpoint:** `POST /bids/:auctionId/buynow`

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Item purchased successfully",
  "bid": {...},
  "auction": {...}
}
```

**Error Responses:**
- 400: Buy now not available
- 400: Auction not active
- 400: Cannot buy own auction
- 401: Not authorized
- 404: Auction not found
- 500: Server error

---

### Get Auction Bids

Get all bids for a specific auction.

**Endpoint:** `GET /bids/auction/:auctionId`

**Response (200):**
```json
[
  {
    "_id": "64abc123...",
    "auction": "64abc456...",
    "bidder": {
      "_id": "64abc789...",
      "username": "buyer456"
    },
    "amount": 800,
    "isWinning": true,
    "createdAt": "2024-01-05T12:30:00.000Z"
  }
]
```

---

### Get User's Bids

Get all bids placed by the current user.

**Endpoint:** `GET /bids/user/mybids`

**Authentication:** Required

**Response (200):** Array of bid objects with populated auction details

---

### Get User's Winning Bids

Get all currently winning bids by the user.

**Endpoint:** `GET /bids/user/winning`

**Authentication:** Required

**Response (200):** Array of winning bid objects

---

### Get User's Won Auctions

Get all auctions won by the user.

**Endpoint:** `GET /bids/user/won`

**Authentication:** Required

**Response (200):** Array of won auction objects with seller contact info

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description",
  "stack": "Error stack trace (only in development)"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding:
- Authentication: 5 requests per minute
- General API: 100 requests per minute
- Bidding: 10 bids per minute per user

---

## WebSocket Events

See main README.md for Socket.io event documentation.

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get auctions
curl http://localhost:5000/api/auctions

# Place bid (requires token)
curl -X POST http://localhost:5000/api/bids/AUCTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":100}'
```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and token
3. Use Collection Runner for automated testing

---

## Support

For issues or questions about the API, please refer to the main README.md or create an issue in the repository.
