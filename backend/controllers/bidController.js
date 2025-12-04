const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

// @desc    Place a bid on an auction
// @route   POST /api/bids/:auctionId
// @access  Private
exports.placeBid = async (req, res) => {
  try {
    const { amount, maxAutoBid } = req.body;
    const auctionId = req.params.auctionId;
    const bidderId = req.user._id;

    // Get auction
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Validate auction status
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    // Check if auction has ended
    if (auction.hasEnded()) {
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Check if user is the seller
    if (auction.seller.toString() === bidderId.toString()) {
      return res.status(400).json({ message: 'Cannot bid on your own auction' });
    }

    // Validate bid amount
    const minimumBid = auction.currentBid + auction.minimumIncrement;
    if (amount < minimumBid) {
      return res.status(400).json({
        message: `Bid must be at least ₹${minimumBid.toFixed(2)}`,
        minimumBid,
      });
    }

    // Check if bid exceeds buy now price
    if (auction.buyNowPrice && amount >= auction.buyNowPrice) {
      return res.status(400).json({
        message: 'Bid exceeds buy now price. Use buy now instead.',
      });
    }

    // Create bid
    const bid = await Bid.create({
      auction: auctionId,
      bidder: bidderId,
      amount,
      isWinning: true,
      isAutomatic: !!maxAutoBid,
      maxAutoBid: maxAutoBid || null,
    });

    // Mark previous winning bids as not winning
    await Bid.updateMany(
      {
        auction: auctionId,
        _id: { $ne: bid._id },
        isWinning: true,
      },
      { isWinning: false }
    );

    // Update auction
    auction.currentBid = amount;
    auction.currentWinner = bidderId;
    auction.totalBids += 1;
    await auction.save();

    // Populate bid details
    const populatedBid = await Bid.findById(bid._id)
      .populate('bidder', 'username')
      .populate('auction', 'title');

    res.status(201).json({
      message: 'Bid placed successfully',
      bid: populatedBid,
      auction: {
        _id: auction._id,
        currentBid: auction.currentBid,
        // return populated bidder object so clients can read username immediately
        currentWinner: populatedBid.bidder,
        totalBids: auction.totalBids,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buy now
// @route   POST /api/bids/:auctionId/buynow
// @access  Private
exports.buyNow = async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    const bidderId = req.user._id;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (!auction.buyNowPrice) {
      return res.status(400).json({ message: 'Buy now not available for this auction' });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    if (auction.seller.toString() === bidderId.toString()) {
      return res.status(400).json({ message: 'Cannot buy your own auction' });
    }

    // Create final bid
    const bid = await Bid.create({
      auction: auctionId,
      bidder: bidderId,
      amount: auction.buyNowPrice,
      isWinning: true,
    });

    // Update auction to ended
    auction.currentBid = auction.buyNowPrice;
    auction.currentWinner = bidderId;
    auction.status = 'ended';
    auction.totalBids += 1;
    await auction.save();

    // populate bid bidder for client convenience
    const populatedBid = await Bid.findById(bid._id).populate('bidder', 'username');

    res.json({
      message: 'Item purchased successfully',
      bid: populatedBid,
      auction: {
        _id: auction._id,
        currentBid: auction.currentBid,
        currentWinner: populatedBid.bidder,
        status: auction.status,
        totalBids: auction.totalBids,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bids for an auction
// @route   GET /api/bids/auction/:auctionId
// @access  Public
exports.getAuctionBids = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's bids
// @route   GET /api/bids/user/mybids
// @access  Private
exports.getUserBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate('auction', 'title images currentBid status endTime')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's winning bids
// @route   GET /api/bids/user/winning
// @access  Private
exports.getUserWinningBids = async (req, res) => {
  try {
    const bids = await Bid.find({
      bidder: req.user._id,
      isWinning: true,
    })
      .populate('auction', 'title images currentBid status endTime')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's won auctions
// @route   GET /api/bids/user/won
// @access  Private
exports.getUserWonAuctions = async (req, res) => {
  try {
    const wonAuctions = await Auction.find({
      currentWinner: req.user._id,
      status: 'ended',
    })
      .populate('seller', 'username email phone')
      .sort({ endTime: -1 });

    res.json(wonAuctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
