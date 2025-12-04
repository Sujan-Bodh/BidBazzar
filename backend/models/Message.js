const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // If the message is related to an auction chat, `auction` is set.
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },
    // For private messages between users, `recipient` and `participants` are used.
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

messageSchema.index({ auction: 1, createdAt: 1 });
messageSchema.index({ participants: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
