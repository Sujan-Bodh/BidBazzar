const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Sports',
        'Collectibles',
        'Art',
        'Automotive',
        'Books',
        'Jewelry',
        'Other',
      ],
    },
    images: [
      {
        type: String,
      },
    ],
    startingBid: {
      type: Number,
      required: [true, 'Please add a starting bid'],
      min: [0, 'Starting bid must be positive'],
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    minimumIncrement: {
      type: Number,
      default: 1,
      min: [0.01, 'Minimum increment must be at least 0.01'],
    },
    buyNowPrice: {
      type: Number,
      default: null,
    },
    // Optional reserve price (hidden minimum seller will accept)
    reservePrice: {
      type: Number,
      default: 0,
      min: [0, 'Reserve price must be non-negative'],
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, 'Please add an end time'],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'ended', 'cancelled'],
      default: 'pending',
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    interestedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      default: 'Good',
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ category: 1, status: 1 });
auctionSchema.index({ title: 'text', description: 'text' });

// Virtual for checking if auction is active
auctionSchema.virtual('isActive').get(function () {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.startTime <= now &&
    this.endTime > now
  );
});

// Method to check if auction has ended
auctionSchema.methods.hasEnded = function () {
  return new Date() > this.endTime;
};

module.exports = mongoose.model('Auction', auctionSchema);
