const express = require('express');
const router = express.Router();
const {
  placeBid,
  buyNow,
  getAuctionBids,
  getUserBids,
  getUserWinningBids,
  getUserWonAuctions,
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

// Bid validation
const bidValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Bid amount must be positive'),
];

// Public routes
router.get('/auction/:auctionId', getAuctionBids);

// Protected routes
router.post('/:auctionId', protect, bidValidation, placeBid);
router.post('/:auctionId/buynow', protect, buyNow);
router.get('/user/mybids', protect, getUserBids);
router.get('/user/winning', protect, getUserWinningBids);
router.get('/user/won', protect, getUserWonAuctions);

module.exports = router;
