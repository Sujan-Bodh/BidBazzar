const Order = require('../models/Order');
const Auction = require('../models/Auction');

// @desc Mark order as paid
// @route POST /api/orders/:orderId/pay
// @access Private
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only buyer can mark paid
    if (String(order.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = 'paid';
    await order.save();

    // Update auction status
    const auction = await Auction.findById(order.auction);
    if (auction) {
      auction.status = 'ended';
      await auction.save();
    }

    res.json({ message: 'Order marked as paid', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get orders for current user
// @route GET /api/orders/my
// @access Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ $or: [{ buyer: req.user._id }, { seller: req.user._id }] })
      .populate('auction', 'title images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
