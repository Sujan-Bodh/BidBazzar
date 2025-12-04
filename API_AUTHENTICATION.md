# 🔐 Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

---

## 📝 Endpoints

### 1. Register User
**POST** `/register`

**Access:** Public

**Request Body:**
```json
{
  "username": "string (required, 3-30 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "phone": "string (required)",
  "address": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (optional)",
    "zipCode": "string (optional)",
    "country": "string (required)"
  },
  "termsAccepted": "boolean (required, must be true)"
}
```

**Success Response:** `201 Created`
```json
{
  "_id": "user_id",
  "username": "testuser123",
  "email": "test@example.com",
  "phone": "9876543210",
  "message": "Registration successful! Please verify your email and phone number to activate your account.",
  "verificationRequired": true,
  "requiresEmailVerification": true,
  "requiresPhoneVerification": true
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed
- `400 Bad Request` - "Email already exists"
- `400 Bad Request` - "Username already exists"
- `400 Bad Request` - "You must agree to the Terms & Conditions to register"

**Notes:**
- OTP codes generated and sent immediately after registration
- User account not active until both email and phone verified
- Check console/logs for OTP codes in development

---

### 2. Verify Email OTP
**POST** `/verify-email`

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required)",
  "otp": "string (required, 6 digits)"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Email verified successfully!",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "accountActive": false
}
```

**Error Responses:**
- `400 Bad Request` - "Email and OTP are required"
- `404 Not Found` - "User not found"
- `400 Bad Request` - "No OTP found for this email. Please request a new one."
- `400 Bad Request` - "Invalid OTP. Please try again."
- `400 Bad Request` - "OTP has expired. Please request a new one."

**Notes:**
- OTP valid for 5 minutes
- Both email and phone must be verified for account activation
- If both verified, `accountActive` becomes `true`

---

### 3. Verify Phone OTP
**POST** `/verify-phone`

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required)",
  "otp": "string (required, 6 digits)"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Phone verified successfully!",
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "accountActive": true
}
```

**Error Responses:**
- Same as verify-email endpoint

**Notes:**
- Final verification step
- Once both verified, account is immediately active
- User can now login

---

### 4. Resend OTP (Registration)
**POST** `/resend-otp`

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required)",
  "type": "string (required, 'email' or 'phone')"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "OTP resent to test@example.com",
  "otp": "123456"
}
```

**Error Responses:**
- `400 Bad Request` - "Email and type are required"
- `404 Not Found` - "User not found"
- `400 Bad Request` - "Email is already verified"
- `400 Bad Request` - "Phone is already verified"
- `400 Bad Request` - "Invalid OTP type. Use 'email' or 'phone'"

**Notes:**
- Can resend unlimited times
- New OTP replaces previous one
- Only available for unverified channels

---

### 5. Login User
**POST** `/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response:** `200 OK`
```json
{
  "_id": "user_id",
  "username": "testuser123",
  "email": "test@example.com",
  "phone": "9876543210",
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": false,
  "message": "Password verified. OTP sent to your phone for login verification.",
  "otpRequired": true,
  "otp": "987654"
}
```

**Error Responses:**
- `401 Unauthorized` - "Invalid email or password"
- `401 Unauthorized` - "Account is deactivated"
- `403 Forbidden` - "Your account is not activated..."

**Notes:**
- OTP sent to registered phone number
- OTP valid for 5 minutes
- Must verify OTP to receive JWT token
- If account not verified, user cannot login

---

### 6. Verify Login OTP
**POST** `/verify-login-otp`

**Access:** Public

**Request Body:**
```json
{
  "userId": "string (required)",
  "otp": "string (required, 6 digits)"
}
```

**Success Response:** `200 OK`
```json
{
  "_id": "user_id",
  "username": "testuser123",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful!"
}
```

**Error Responses:**
- `400 Bad Request` - "User ID and OTP are required"
- `404 Not Found` - "User not found"
- `400 Bad Request` - "No OTP found. Please login again."
- `400 Bad Request` - "Invalid OTP. Please try again."
- `400 Bad Request` - "OTP has expired. Please request a new one."

**Notes:**
- User receives JWT token upon successful verification
- Token should be stored in localStorage
- Use token for authenticated requests
- Token format: `Authorization: Bearer {token}`

---

### 7. Resend Login OTP
**POST** `/resend-login-otp`

**Access:** Public

**Request Body:**
```json
{
  "userId": "string (required)"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "OTP resent to 9876543210",
  "otp": "654321"
}
```

**Error Responses:**
- `400 Bad Request` - "User ID is required"
- `404 Not Found` - "User not found"

**Notes:**
- Can resend unlimited times during login
- New OTP replaces previous one
- 5-minute validity

---

### 8. Get User Profile
**GET** `/profile`

**Access:** Protected (requires valid JWT token)

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response:** `200 OK`
```json
{
  "_id": "user_id",
  "username": "testuser123",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
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
  "createdAt": "2025-12-03T10:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - "User not found"

---

### 9. Update User Profile
**PUT** `/profile`

**Access:** Protected (requires valid JWT token)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "address": {
    "street": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "zipCode": "string (optional)",
    "country": "string (optional)"
  },
  "currentPassword": "string (required if changing password)",
  "password": "string (optional, new password)"
}
```

**Success Response:** `200 OK`
```json
{
  "_id": "user_id",
  "username": "testuser123",
  "email": "test@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543210",
  "address": {...},
  "isAdmin": false,
  "avatar": "",
  "balance": 0,
  "createdAt": "2025-12-03T10:00:00.000Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - "Current password is required to change password"
- `401 Unauthorized` - "Current password is incorrect"
- `404 Not Found` - "User not found"
- `401 Unauthorized` - Invalid token

**Notes:**
- Email, phone, username are NOT editable (verified fields)
- Password change requires current password verification
- Returns new token after update

---

## 🔒 Authentication Headers

For protected endpoints, include JWT token in header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔄 Complete User Journey

### Registration Journey
```
1. POST /register 
   → Receive: userId, verification required message
   → OTP sent to email and phone
   
2. POST /verify-email 
   → Verify email OTP
   
3. POST /verify-phone 
   → Verify phone OTP
   → Account becomes active
   
4. Can now proceed to login
```

### Login Journey
```
1. POST /login 
   → Provide: email, password
   → Receive: userId, message about OTP
   → OTP sent to phone
   
2. POST /verify-login-otp 
   → Provide: userId, OTP
   → Receive: JWT token
   → Store token
   
3. Use token in Authorization header for protected routes
```

---

## 📊 Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials/token |
| 403 | Forbidden - Account not activated |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error |

---

## ⚙️ Configuration

OTP Configuration (in code):
- **OTP Length:** 6 digits
- **OTP Validity:** 5 minutes (300 seconds)
- **OTP Format:** Numeric only
- **Resend Limit:** Unlimited (in development)

---

## 🔐 Security Best Practices

1. **Always use HTTPS** in production
2. **Store token securely** - Use httpOnly cookies or secure localStorage
3. **Never log sensitive data** - Passwords should never be logged
4. **Validate on both sides** - Client and server validation
5. **Implement rate limiting** - Prevent OTP brute force
6. **Set short OTP validity** - 5 minutes is recommended
7. **Monitor failed attempts** - Log suspicious activities
8. **Use strong passwords** - Enforce complexity requirements
9. **Refresh tokens regularly** - Implement token rotation
10. **Clear OTP after use** - Don't reuse OTP codes

