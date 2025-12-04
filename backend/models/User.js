const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOTP: {
      code: String,
      expiresAt: Date,
    },
    accountActive: {
      type: Boolean,
      default: false,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: Date,

    // Profile photo
    profilePhoto: {
      type: String,
      default: '',
    },

    // Account Status & Verification
    idVerified: {
      type: Boolean,
      default: false,
    },
    kycVerified: {
      type: Boolean,
      default: false,
    },
    membershipLevel: {
      type: String,
      enum: ['basic', 'premium'],
      default: 'basic',
    },

    // Buying Information
    watchlist: [
      {
        auctionId: mongoose.Schema.Types.ObjectId,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    savedSearches: [
      {
        query: String,
        category: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ['card', 'paypal', 'bank'],
        },
        isPrimary: Boolean,
        details: String, // Encrypted in production
        addedAt: Date,
      },
    ],

    // Seller Information
    sellerRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    sellerVerified: {
      type: Boolean,
      default: false,
    },
    sellerLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
    },
    totalItemsSold: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    shippingPreferences: {
      domesticShipping: Boolean,
      internationalShipping: Boolean,
      preferredCarriers: [String],
      packagingStyle: String,
    },

    // Reputation & Feedback
    buyerRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    badges: [
      {
        type: String,
        enum: ['topSeller', 'trustedBuyer', 'powerBuyer', 'fastShipper', 'responsive'],
      },
    ],
    reviewCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Financial Information
    payoutMethods: [
      {
        type: {
          type: String,
          enum: ['paypal', 'bank', 'stripe'],
        },
        isPrimary: Boolean,
        details: String, // Encrypted in production
        addedAt: Date,
      },
    ],
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    taxId: String, // For sellers requiring tax information
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingPayouts: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Settings & Preferences
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      auctionUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'buyers-only'],
        default: 'public',
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showAddress: { type: Boolean, default: false },
      allowMessages: { type: Boolean, default: true },
    },
    language: {
      type: String,
      default: 'en',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    loginHistory: [
      {
        ip: String,
        device: String,
        loginTime: Date,
        logoutTime: Date,
      },
    ],

    // Legal & Safety
    identityVerificationDocuments: [
      {
        type: {
          type: String,
          enum: ['passport', 'license', 'national-id'],
        },
        url: String,
        verified: Boolean,
        verifiedAt: Date,
      },
    ],
    blockedUsers: [mongoose.Schema.Types.ObjectId],
    reportedUsers: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        reason: String,
        reportedAt: Date,
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'resolved'],
          default: 'pending',
        },
      },
    ],
    disputes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dispute',
      },
    ],
    suspensionStatus: {
      suspended: Boolean,
      reason: String,
      suspendedUntil: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
