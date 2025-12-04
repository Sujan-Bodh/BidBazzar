const express = require('express');
const router = express.Router();
const { getAuctionMessages, createMessage, getPrivateMessages, getConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/auction/:auctionId', protect, getAuctionMessages);
router.post('/auction/:auctionId', protect, createMessage);
// Private messages between users
router.get('/conversations', protect, getConversations);
router.get('/private/:userId', protect, getPrivateMessages);
router.post('/private/:userId', protect, createMessage);

module.exports = router;
