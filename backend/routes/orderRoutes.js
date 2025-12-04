const express = require('express');
const router = express.Router();
const { payOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/:orderId/pay', protect, payOrder);
router.get('/my', protect, getMyOrders);

module.exports = router;
