const cron = require('node-cron');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// Check and end auctions every minute
const startAuctionScheduler = (io) => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find all active auctions that have ended
      const endedAuctions = await Auction.find({
        status: 'active',
        endTime: { $lte: now },
      }).populate('currentWinner', 'username email');

      if (endedAuctions.length > 0) {
        console.log(`Processing ${endedAuctions.length} ended auction(s)...`);

        for (const auction of endedAuctions) {
          // Update auction status
          auction.status = 'ended';
          await auction.save();

          console.log(`Auction ended: ${auction.title} (${auction._id})`);

          // Emit socket event for auction end
          if (io) {
            io.to(`auction-${auction._id}`).emit('auctionEnded', {
              auction: {
                _id: auction._id,
                title: auction.title,
                currentBid: auction.currentBid,
                currentWinner: auction.currentWinner,
                status: auction.status,
              },
              winner: auction.currentWinner,
              timestamp: new Date(),
            });

            // Notify winner privately if they have a socket connection
            if (auction.currentWinner) {
              io.emit('auctionWon', {
                auctionId: auction._id,
                auctionTitle: auction.title,
                winningBid: auction.currentBid,
              });
            }
          }

          // Mark winning bid
          if (auction.currentWinner) {
            await Bid.updateMany(
              {
                auction: auction._id,
                bidder: auction.currentWinner,
              },
              { isWinning: true }
            );

            // Mark all other bids as not winning
            await Bid.updateMany(
              {
                auction: auction._id,
                bidder: { $ne: auction.currentWinner },
              },
              { isWinning: false }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error in auction scheduler:', error);
    }
  });

  console.log('Auction scheduler started');
};

module.exports = startAuctionScheduler;
