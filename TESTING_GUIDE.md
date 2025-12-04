# 🧪 Testing Guide - OTP Authentication & Registration

## Quick Start Testing

### 1. Frontend Registration Test

**URL:** `http://localhost:3000/register`

**Test Data:**
```
Username: testuser123
Email: test@example.com
First Name: John
Last Name: Doe
Phone: 9876543210
Street: 123 Main St
City: New York
State: NY
ZIP: 10001
Country: USA
Password: Test@1234
Confirm Password: Test@1234
```

**Expected Flow:**
1. Form validates all fields ✓
2. Submit → "Registration successful! Please verify your email and phone."
3. See dual OTP verification screen
4. Check browser console or server logs for OTP codes
5. Enter email OTP → "Email verified successfully!"
6. Enter phone OTP → "Phone verified successfully!"
7. Auto-redirect to login or home page

---

### 2. Frontend Login Test

**URL:** `http://localhost:3000/login`

**Test with Previously Registered Account:**
```
Email: test@example.com
Password: Test@1234
```

**Expected Flow:**
1. Enter credentials
2. Click "Sign in"
3. See OTP verification screen: "Enter the OTP sent to 9876543210"
4. Check server logs for OTP
5. Enter OTP (6 digits)
6. "Login successful!"
7. Redirected to home page

---

### 3. Backend API Testing (Using curl or Postman)

#### Register Endpoint
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser123",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "password": "Test@1234",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "termsAccepted": true
}
```

**Expected Response (201):**
```json
{
  "_id": "user_id_here",
  "username": "testuser123",
  "email": "test@example.com",
  "phone": "9876543210",
  "message": "Registration successful! Please verify your email and phone number to activate your account.",
  "verificationRequired": true,
  "requiresEmailVerification": true,
  "requiresPhoneVerification": true
}
```

#### Verify Email OTP
```bash
POST http://localhost:5000/api/auth/verify-email
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "message": "Email verified successfully!",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "accountActive": false
}
```

#### Verify Phone OTP
```bash
POST http://localhost:5000/api/auth/verify-phone
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "654321"
}
```

**Expected Response (200):**
```json
{
  "message": "Phone verified successfully!",
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "accountActive": true
}
```

#### Login Endpoint
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@1234"
}
```

**Expected Response (200):**
```json
{
  "_id": "user_id_here",
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

#### Verify Login OTP
```bash
POST http://localhost:5000/api/auth/verify-login-otp
Content-Type: application/json

{
  "userId": "user_id_here",
  "otp": "987654"
}
```

**Expected Response (200):**
```json
{
  "_id": "user_id_here",
  "username": "testuser123",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful!"
}
```

#### Resend OTP
```bash
POST http://localhost:5000/api/auth/resend-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "type": "email"
}
```

---

## 🔍 Debug: Finding OTP Codes

### Option 1: Server Console Logs
When running backend with `npm run dev`, OTP codes are logged:
```
📧 Email OTP sent to test@example.com: 123456
📱 SMS OTP sent to 9876543210: 654321
```

### Option 2: Check MongoDB
```javascript
// Connect to MongoDB and find user
db.users.findOne({ email: "test@example.com" })

// Look for:
{
  emailOTP: { code: "123456", expiresAt: ISODate(...) },
  phoneOTP: { code: "654321", expiresAt: ISODate(...) }
}
```

### Option 3: Browser DevTools
Open browser console (F12) → Look for any log statements or check network tab

---

## ⚠️ Error Scenarios to Test

### 1. Invalid Email OTP
```bash
POST http://localhost:5000/api/auth/verify-email
{
  "email": "test@example.com",
  "otp": "000000"
}
```
Expected: 400 - "Invalid OTP. Please try again."

### 2. Expired OTP
Wait 5+ minutes after generation, then try to verify
Expected: 400 - "OTP has expired. Please request a new one."

### 3. Missing Terms Acceptance
```bash
POST http://localhost:5000/api/auth/register
{
  ...all fields...,
  "termsAccepted": false
}
```
Expected: 400 - "You must agree to the Terms & Conditions to register"

### 4. Unverified Account Login
Try to login before verifying both email and phone
Expected: 403 - "Your account is not activated. Please verify your email and phone number."

### 5. Duplicate Email
```bash
POST http://localhost:5000/api/auth/register
{
  "email": "existing@example.com",
  ...
}
```
Expected: 400 - "Email already exists"

### 6. Weak Password
```bash
POST http://localhost:5000/api/auth/register
{
  "password": "123",
  ...
}
```
Expected: 400 - "Password must be at least 6 characters"

---

## 📱 Mobile/Responsive Testing

1. Open `/register` on mobile device or browser mobile view
2. Form should stack vertically
3. OTP input should be centered and easy to tap
4. Buttons should be full-width
5. Text should be readable

---

## 🔐 Security Testing

### 1. Rate Limiting (Future Enhancement)
- Test multiple rapid OTP requests (should be rate-limited)

### 2. Session Management
- After login, token should be stored
- Subsequent API calls should use token
- Profile should be accessible with token

### 3. Password Security
- Check server logs - passwords should NOT be logged
- Check database - passwords should be hashed (bcrypt)

---

## ✅ Checklist

- [ ] Registration form validation works
- [ ] Email OTP verification works
- [ ] Phone OTP verification works
- [ ] Account activates after both verifications
- [ ] Login OTP required after password verification
- [ ] Login OTP verification works
- [ ] Unverified accounts cannot login
- [ ] Resend OTP works with countdown
- [ ] Expired OTP rejected
- [ ] Invalid OTP rejected
- [ ] Error messages clear and helpful
- [ ] Mobile responsive
- [ ] API endpoints respond correctly
- [ ] Database stores data correctly
- [ ] Terms & Conditions required

---

## 🚀 Next Steps

1. **Integrate Real Email Service**
   - SendGrid, Mailgun, or AWS SES
   - Update `sendOTPviaEmail()` in `otpService.js`

2. **Integrate Real SMS Service**
   - Twilio or AWS SNS
   - Update `sendOTPviaSMS()` in `otpService.js`

3. **Add Rate Limiting**
   - Prevent OTP brute force attempts
   - Limit registration attempts per IP

4. **Add Monitoring**
   - Log failed verification attempts
   - Alert on suspicious activities
   - Track OTP request patterns

5. **User Communication**
   - Email confirmation after registration
   - OTP expiry warnings
   - Suspicious login attempts notification

