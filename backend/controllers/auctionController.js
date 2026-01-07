const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// @desc    Get all auctions with filtering
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['active', 'pending'] };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    const auctions = await Auction.find(query)
      .populate('seller', 'username email')
      .populate('currentWinner', 'username')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Auction.countDocuments(query);

    res.json({
      auctions,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalAuctions: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single auction by ID
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'username email phone firstName lastName')
      .populate('currentWinner', 'username');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new auction
// @route   POST /api/auctions
// @access  Private
exports.createAuction = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startingBid,
      minimumIncrement,
      buyNowPrice,
      endTime,
      condition,
      shippingCost,
      location,
    } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/auctions/${file.filename}`) : [];

    const auction = await Auction.create({
      title,
      description,
      category,
      startingBid,
      currentBid: startingBid,
      minimumIncrement: minimumIncrement || 1,
      buyNowPrice,
      endTime,
      condition,
      shippingCost: shippingCost || 0,
      location,
      images,
      seller: req.user._id,
      status: 'active',
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private
exports.updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user is the seller or admin
    if (auction.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this auction' });
    }

    // Don't allow updates if auction has bids
    if (auction.totalBids > 0) {
      return res.status(400).json({ message: 'Cannot update auction with existing bids' });
    }

    const {
      title,
      description,
      category,
      startingBid,
      minimumIncrement,
      buyNowPrice,
      endTime,
      condition,
      shippingCost,
      location,
    } = req.body;

    auction.title = title || auction.title;
    auction.description = description || auction.description;
    auction.category = category || auction.category;
    auction.startingBid = startingBid || auction.startingBid;
    auction.minimumIncrement = minimumIncrement || auction.minimumIncrement;
    auction.buyNowPrice = buyNowPrice || auction.buyNowPrice;
    auction.endTime = endTime || auction.endTime;
    auction.condition = condition || auction.condition;
    auction.shippingCost = shippingCost !== undefined ? shippingCost : auction.shippingCost;
    auction.location = location || auction.location;

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/auctions/${file.filename}`);
      auction.images = [...auction.images, ...newImages];
    }

    const updatedAuction = await auction.save();

    res.json(updatedAuction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user is the seller or admin
    if (auction.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this auction' });
    }

    // Don't allow deletion if auction has bids
    if (auction.totalBids > 0) {
      return res.status(400).json({ message: 'Cannot delete auction with existing bids' });
    }

    await auction.deleteOne();

    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's auctions (selling)
// @route   GET /api/auctions/user/selling
// @access  Private
exports.getUserAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate('currentWinner', 'username')
      .sort({ createdAt: -1 });

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Watch/Unwatch auction
// @route   POST /api/auctions/:id/watch
// @access  Private
exports.toggleWatch = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const isWatching = auction.watchers.includes(req.user._id);

    if (isWatching) {
      auction.watchers = auction.watchers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      auction.watchers.push(req.user._id);
    }

    await auction.save();

    res.json({
      isWatching: !isWatching,
      watchCount: auction.watchers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get watched auctions
// @route   GET /api/auctions/user/watching
// @access  Private
exports.getWatchedAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ watchers: req.user._id })
      .populate('seller', 'username')
      .populate('currentWinner', 'username')
      .sort({ endTime: 1 });

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark/Unmark interest in an auction
// @route   POST /api/auctions/:id/interest
// @access  Private
exports.toggleInterest = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const isInterested = auction.interestedUsers.includes(req.user._id);

    if (isInterested) {
      auction.interestedUsers = auction.interestedUsers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      auction.interestedUsers.push(req.user._id);
    }

    await auction.save();

    // Emit private live notifications to seller and the acting user (buyer) so both get real-time updates
    try {
      const io = req.app.get('io');
      const payload = {
        auctionId: auction._id,
        auctionTitle: auction.title,
        userId: req.user._id,
        username: req.user.username,
        isInterested: !isInterested,
        interestCount: auction.interestedUsers.length,
        message: `${req.user.username} ${!isInterested ? 'is interested' : 'is no longer interested'} in your auction`,
        timestamp: new Date(),
      };

      if (io) {
        // Notify seller privately (works even if seller isn't viewing the auction)
        const sellerId = auction.seller && auction.seller.toString();
        if (sellerId && sellerId !== req.user._id.toString()) {
          io.to(`user-${sellerId}`).emit('userInterested', payload);
        }

        // Notify the acting user to confirm the change
        io.to(`user-${req.user._id.toString()}`).emit('userInterested', payload);
        console.log('Interest notification emitted:', payload);
      }
    } catch (emitErr) {
      console.error('Failed to emit interest notification:', emitErr);
    }

    res.json({
      isInterested: !isInterested,
      interestCount: auction.interestedUsers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
