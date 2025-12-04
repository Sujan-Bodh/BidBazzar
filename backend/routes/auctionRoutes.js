const express = require('express');
const router = express.Router();
const {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  getUserAuctions,
  toggleWatch,
  toggleInterest,
  getWatchedAuctions,
} = require('../controllers/auctionController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAuctions);
router.get('/:id', getAuctionById);

// Protected routes
router.post('/', protect, upload.array('images', 5), createAuction);
router.put('/:id', protect, upload.array('images', 5), updateAuction);
router.delete('/:id', protect, deleteAuction);
router.get('/user/selling', protect, getUserAuctions);
router.get('/user/watching', protect, getWatchedAuctions);
router.post('/:id/watch', protect, toggleWatch);
router.post('/:id/interest', protect, toggleInterest);

module.exports = router;
