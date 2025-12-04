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

        const Order = require('../models/Order');

        for (const auction of endedAuctions) {
          // Update auction status tentatively to ended (we may update further)
          auction.status = 'ended';
          await auction.save();

          console.log(`Auction ended: ${auction.title} (${auction._id})`);

          // If there's no winner or the current bid doesn't meet reserve price, mark unsold
          if (!auction.currentWinner || (auction.reservePrice && auction.currentBid < auction.reservePrice)) {
            // No sale: keep currentWinner null and notify seller
            auction.currentWinner = auction.currentWinner || null;
            await auction.save();

            if (io) {
              io.to(`auction-${auction._id}`).emit('auctionEnded', {
                auction: {
                  _id: auction._id,
                  title: auction.title,
                  currentBid: auction.currentBid,
                  currentWinner: null,
                  status: auction.status,
                },
                winner: null,
                message: 'Reserve price not met or no bids',
                timestamp: new Date(),
              });
            }

            // Mark all bids as not winning
            await Bid.updateMany({ auction: auction._id }, { isWinning: false });
            continue;
          }

          // Create an order for the winning bidder with a payment deadline (48 hours)
          const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

          const order = new Order({
            auction: auction._id,
            buyer: auction.currentWinner,
            seller: auction.seller,
            amount: auction.currentBid,
            status: 'pending_payment',
            paymentDeadline,
          });

          await order.save();

          // Emit socket event for auction end and order creation
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
              orderId: order._id,
              paymentDeadline: order.paymentDeadline,
              timestamp: new Date(),
            });

            // Notify winner privately if they have a socket connection
            io.emit('auctionWon', {
              auctionId: auction._id,
              auctionTitle: auction.title,
              winningBid: auction.currentBid,
              orderId: order._id,
            });
          }

          // Mark winning bid(s) accordingly
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

      // Handle expired pending orders (payment deadline passed)
      const Order = require('../models/Order');
      const expiredOrders = await Order.find({ status: 'pending_payment', paymentDeadline: { $lte: now } });

      for (const order of expiredOrders) {
        try {
          // Cancel the order
          order.status = 'cancelled';
          await order.save();

          // Try to offer to next highest bidder for the auction
          const auction = await Auction.findById(order.auction);
          if (!auction) continue;

          // Find next highest bid excluding the cancelled buyer
          const bids = await Bid.find({ auction: auction._id, bidder: { $ne: order.buyer } }).sort({ amount: -1 });
          if (bids && bids.length > 0) {
            const next = bids[0];
            auction.currentWinner = next.bidder;
            auction.currentBid = next.amount;
            await auction.save();

            // Create new order for next bidder
            const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
            const newOrder = new Order({
              auction: auction._id,
              buyer: next.bidder,
              seller: auction.seller,
              amount: next.amount,
              status: 'pending_payment',
              paymentDeadline,
            });
            await newOrder.save();

            if (io) {
              io.to(`auction-${auction._id}`).emit('orderOfferedToNext', {
                auctionId: auction._id,
                nextBuyer: next.bidder,
                amount: next.amount,
                orderId: newOrder._id,
                paymentDeadline: newOrder.paymentDeadline,
              });
            }
          } else {
            // No next bidder - auction remains ended without sale
            auction.currentWinner = null;
            await auction.save();
            if (io) {
              io.to(`auction-${auction._id}`).emit('auctionUnsold', { auctionId: auction._id });
            }
          }
        } catch (err) {
          console.error('Error handling expired order', err);
        }
      }
    } catch (error) {
      console.error('Error in auction scheduler:', error);
    }
  });

  console.log('Auction scheduler started');
};

module.exports = startAuctionScheduler;
