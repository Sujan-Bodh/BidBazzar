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

    // Create incoming bid record (manual or automatic)
    const incomingBid = await Bid.create({
      auction: auctionId,
      bidder: bidderId,
      amount,
      isWinning: false, // will set below after recalculation
      isAutomatic: !!maxAutoBid,
      maxAutoBid: maxAutoBid || null,
    });

    // Recalculate auction winner using proxy bidding rules
    // 1) Fetch highest manual bid (non-automatic)
    // 2) Fetch automatic bidders' maxAutoBid
    const allBids = await Bid.find({ auction: auctionId });

    let highestManual = { amount: auction.currentBid || auction.startingBid, bidder: auction.currentWinner };
    allBids.forEach((b) => {
      if (!b.isAutomatic && (!highestManual.amount || b.amount > highestManual.amount)) {
        highestManual = { amount: b.amount, bidder: b.bidder };
      }
    });

    // Build map of automatic bidders to their maxAutoBid (take highest per bidder)
    const autoMap = new Map();
    allBids.forEach((b) => {
      if (b.isAutomatic && b.maxAutoBid && b.maxAutoBid > 0) {
        const prev = autoMap.get(String(b.bidder));
        if (!prev || b.maxAutoBid > prev) {
          autoMap.set(String(b.bidder), b.maxAutoBid);
        }
      }
    });

    // Convert autoMap to sorted array of { bidder, max }
    const autos = Array.from(autoMap.entries()).map(([bidder, max]) => ({ bidder, max }));
    autos.sort((a, b) => b.max - a.max);

    let newCurrentBid = auction.currentBid || auction.startingBid;
    let newWinner = auction.currentWinner;

    if (autos.length === 0) {
      // No autos, highest manual wins if above current
      if (highestManual.amount > newCurrentBid) {
        newCurrentBid = highestManual.amount;
        newWinner = highestManual.bidder;
      }
    } else {
      // There are automatic bidders
      const top = autos[0];
      const second = autos[1] ? autos[1].max : Math.max(newCurrentBid, highestManual.amount || 0);

      // Candidate new bid is min(top.max, second + increment)
      const candidate = Math.min(top.max, second + auction.minimumIncrement);

      // Compare with highest manual as well
      const effectiveManual = highestManual.amount || 0;
      if (effectiveManual >= candidate) {
        // Manual bidder outbids autos
        newCurrentBid = effectiveManual;
        newWinner = highestManual.bidder;
      } else {
        // Top auto wins at candidate amount
        newCurrentBid = candidate;
        newWinner = top.bidder;

        // Create an automatic bid record representing the auto-bid if not the same as incoming
        // Only create if top bidder isn't the incoming bid or incoming didn't already set that amount
        if (String(newWinner) !== String(incomingBid.bidder) || incomingBid.amount !== newCurrentBid) {
          await Bid.create({
            auction: auctionId,
            bidder: newWinner,
            amount: newCurrentBid,
            isWinning: true,
            isAutomatic: true,
            maxAutoBid: top.max,
          });
        }
      }
    }

    // Update bids isWinning flags
    await Bid.updateMany({ auction: auctionId }, { isWinning: false });
    await Bid.updateOne({ _id: incomingBid._id }, { isWinning: true });

    // Update auction
    auction.currentBid = newCurrentBid;
    auction.currentWinner = newWinner;
    auction.totalBids = (auction.totalBids || 0) + 1;
    await auction.save();

    // Populate incoming bid for response
    const populatedBid = await Bid.findById(incomingBid._id).populate('bidder', 'username');

    res.status(201).json({
      message: 'Bid placed successfully',
      bid: populatedBid,
      auction: {
        _id: auction._id,
        currentBid: auction.currentBid,
        currentWinner: auction.currentWinner,
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
