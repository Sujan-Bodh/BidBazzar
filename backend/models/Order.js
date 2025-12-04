const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be non-negative'],
    },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'cancelled', 'shipped', 'delivered'],
      default: 'pending_payment',
    },
    paymentDeadline: {
      type: Date,
    },
    trackingNumber: {
      type: String,
    },
    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
