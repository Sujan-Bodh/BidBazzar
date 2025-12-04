const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateOTP, getOTPExpiry, verifyOTP, sendOTPviaEmail } = require('../utils/otpService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, phone, address, termsAccepted } = req.body;

    // Check if terms are accepted
    if (!termsAccepted) {
      return res.status(400).json({
        message: 'You must agree to the Terms & Conditions to register',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        message: userExists.email === email ? 'Email already exists' : 'Username already exists',
      });
    }

    // Create user (not activated yet - pending email verification)
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      termsAccepted,
      termsAcceptedAt: new Date(),
      isEmailVerified: false,
      isPhoneVerified: false,
      accountActive: false,
    });

    // Generate and send email OTP
    const emailOTP = generateOTP();
    const emailOTPExpiry = getOTPExpiry();

    user.emailOTP = {
      code: emailOTP,
      expiresAt: emailOTPExpiry,
    };

    await user.save();

    // Send OTP via email (don't fail registration if email sending fails)
    let emailSent = true;
    try {
      await sendOTPviaEmail(email, emailOTP);
    } catch (err) {
      emailSent = false;
      console.error('Error sending OTP email during registration:', err.message || err);
    }

    const resp = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      message: 'Registration successful! Please verify your email to activate your account.',
      verificationRequired: true,
      requiresEmailVerification: true,
    };

    if (!emailSent) {
      resp.warning = 'OTP email could not be sent. You can request a resend.';
    }

    res.status(201).json(resp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.emailOTP || !user.emailOTP.code) {
      return res.status(400).json({
        message: 'No OTP found for this email. Please request a new one.',
      });
    }

    // Verify OTP
    const verification = verifyOTP(user.emailOTP.code, otp, user.emailOTP.expiresAt);

    if (!verification.valid) {
      return res.status(400).json({
        message: verification.message,
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailOTP = undefined;

    // Account is active once email is verified
    user.accountActive = true;

    await user.save();

    res.json({
      message: 'Email verified successfully! Your account is now active.',
      isEmailVerified: user.isEmailVerified,
      accountActive: user.accountActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Resend email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified',
      });
    }

    const emailOTP = generateOTP();
    const emailOTPExpiry = getOTPExpiry();

    user.emailOTP = {
      code: emailOTP,
      expiresAt: emailOTPExpiry,
    };

    await user.save();

    let emailSent = true;
    try {
      await sendOTPviaEmail(email, emailOTP);
    } catch (err) {
      emailSent = false;
      console.error('Error sending OTP email during resend:', err.message || err);
    }

    const resp = { message: `OTP resent to ${email}` };
    if (process.env.NODE_ENV === 'development') resp.otp = emailOTP; // only in dev
    if (!emailSent) {
      resp.warning = 'OTP email could not be sent. Please check email settings or try again later.';
    }

    res.json(resp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active (email verified)
    if (!user.accountActive) {
      return res.status(403).json({
        message: 'Your account is not activated. Please verify your email.',
        verificationRequired: true,
        isEmailVerified: user.isEmailVerified,
        userId: user._id,
      });
    }

    if (await user.matchPassword(password)) {
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Determine basic role: seller if sellerVerified or has sellerLevel or has sold items
      const isSeller = !!(user.sellerVerified || user.sellerLevel || (user.totalItemsSold && user.totalItemsSold > 0));

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        role: isSeller ? 'seller' : 'buyer',
        token: generateToken(user._id),
        message: 'Login successful!',
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};





// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        // Basic Details
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profilePhoto: user.profilePhoto,

        // Account Status
        isEmailVerified: user.isEmailVerified,
        accountActive: user.accountActive,
        idVerified: user.idVerified,
        kycVerified: user.kycVerified,
        membershipLevel: user.membershipLevel,

        // Address & Billing
        address: user.address,
        billingAddress: user.billingAddress,

        // Buying Information
        watchlist: user.watchlist,
        savedSearches: user.savedSearches,
        balance: user.balance,

        // Selling Information
        sellerRating: user.sellerRating,
        sellerVerified: user.sellerVerified,
        sellerLevel: user.sellerLevel,
        totalItemsSold: user.totalItemsSold,
        successRate: user.successRate,
        shippingPreferences: user.shippingPreferences,

        // Reputation & Feedback
        buyerRating: user.buyerRating,
        badges: user.badges,
        reviewCount: user.reviewCount,
        averageRating: user.averageRating,

        // Financial
        totalEarnings: user.totalEarnings,
        pendingPayouts: user.pendingPayouts,

        // Settings
        notificationPreferences: user.notificationPreferences,
        privacySettings: user.privacySettings,
        language: user.language,
        currency: user.currency,
        twoFactorEnabled: user.twoFactorEnabled,

        // Admin & Status
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        suspensionStatus: user.suspensionStatus,

        // Metadata
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If password is being changed, verify current password
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      // Verify current password
      const isPasswordValid = await user.matchPassword(req.body.currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = req.body.password;
    }

    // Update editable profile fields
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.address) user.address = req.body.address;
    if (req.body.profilePhoto) user.profilePhoto = req.body.profilePhoto;
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.billingAddress) user.billingAddress = req.body.billingAddress;

    // Update preferences
    if (req.body.notificationPreferences) {
      user.notificationPreferences = { ...user.notificationPreferences, ...req.body.notificationPreferences };
    }
    if (req.body.privacySettings) {
      user.privacySettings = { ...user.privacySettings, ...req.body.privacySettings };
    }
    if (req.body.language) user.language = req.body.language;
    if (req.body.currency) user.currency = req.body.currency;
    if (req.body.shippingPreferences) user.shippingPreferences = req.body.shippingPreferences;

    // Email and username should not be updated (they are verified fields)
    // Phone cannot be updated (verified field)

    const updatedUser = await user.save();

    res.json({
      // Basic Details
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      profilePhoto: updatedUser.profilePhoto,

      // Account Status
      isEmailVerified: updatedUser.isEmailVerified,
      accountActive: updatedUser.accountActive,
      idVerified: updatedUser.idVerified,
      kycVerified: updatedUser.kycVerified,
      membershipLevel: updatedUser.membershipLevel,

      // Address
      address: updatedUser.address,
      billingAddress: updatedUser.billingAddress,

      // Buying Information
      watchlist: updatedUser.watchlist,
      savedSearches: updatedUser.savedSearches,
      balance: updatedUser.balance,

      // Selling Information
      sellerRating: updatedUser.sellerRating,
      sellerVerified: updatedUser.sellerVerified,
      sellerLevel: updatedUser.sellerLevel,
      totalItemsSold: updatedUser.totalItemsSold,
      successRate: updatedUser.successRate,

      // Reputation
      buyerRating: updatedUser.buyerRating,
      badges: updatedUser.badges,
      reviewCount: updatedUser.reviewCount,
      averageRating: updatedUser.averageRating,

      // Financial
      totalEarnings: updatedUser.totalEarnings,
      pendingPayouts: updatedUser.pendingPayouts,

      // Settings
      notificationPreferences: updatedUser.notificationPreferences,
      privacySettings: updatedUser.privacySettings,
      language: updatedUser.language,
      currency: updatedUser.currency,

      // Admin & Status
      isAdmin: updatedUser.isAdmin,
      avatar: updatedUser.avatar,

      // Metadata
      token: generateToken(updatedUser._id),
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
