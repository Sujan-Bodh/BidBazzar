const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add a bid amount'],
      min: [0, 'Bid amount must be positive'],
    },
    isWinning: {
      type: Boolean,
      default: false,
    },
    isAutomatic: {
      type: Boolean,
      default: false,
    },
    maxAutoBid: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bidSchema.index({ auction: 1, createdAt: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });
bidSchema.index({ auction: 1, amount: -1 });

module.exports = mongoose.model('Bid', bidSchema);
