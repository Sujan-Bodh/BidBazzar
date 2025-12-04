const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store connected users
const connectedUsers = new Map();

const socketHandler = (io) => {
  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (user) {
          socket.userId = user._id.toString();
          socket.username = user.username;
          next();
        } else {
          next(new Error('User not found'));
        }
      } else {
        // Allow anonymous connections for viewing
        socket.userId = null;
        socket.username = 'Guest';
        next();
      }
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.id})`);

    // Store user connection
    if (socket.userId) {
      connectedUsers.set(socket.userId, socket.id);
    }

    // Join auction room
    socket.on('joinAuction', (auctionId) => {
      socket.join(`auction-${auctionId}`);
      console.log(`${socket.username} joined auction ${auctionId}`);

      // Notify others in the room
      socket.to(`auction-${auctionId}`).emit('userJoined', {
        username: socket.username,
        timestamp: new Date(),
      });

      // Send current viewer count
      const room = io.sockets.adapter.rooms.get(`auction-${auctionId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`auction-${auctionId}`).emit('viewerCount', viewerCount);
    });

    // Leave auction room
    socket.on('leaveAuction', (auctionId) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`${socket.username} left auction ${auctionId}`);

      // Notify others in the room
      socket.to(`auction-${auctionId}`).emit('userLeft', {
        username: socket.username,
        timestamp: new Date(),
      });

      // Update viewer count
      const room = io.sockets.adapter.rooms.get(`auction-${auctionId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`auction-${auctionId}`).emit('viewerCount', viewerCount);
    });

    // Handle new bid
    socket.on('newBid', (data) => {
      const { auctionId, bid, auction } = data;

      // Broadcast to all users in the auction room
      io.to(`auction-${auctionId}`).emit('bidPlaced', {
        bid,
        auction,
        timestamp: new Date(),
      });

      console.log(`New bid on auction ${auctionId}: ₹${bid.amount} by ${socket.username}`);
    });

    // Handle auction update
    socket.on('auctionUpdate', (data) => {
      const { auctionId, auction } = data;

      io.to(`auction-${auctionId}`).emit('auctionUpdated', {
        auction,
        timestamp: new Date(),
      });
    });

    // Handle auction end
    socket.on('auctionEnded', (data) => {
      const { auctionId, auction, winner } = data;

      io.to(`auction-${auctionId}`).emit('auctionEnded', {
        auction,
        winner,
        timestamp: new Date(),
      });

      // Notify winner privately if connected
      if (winner && connectedUsers.has(winner._id.toString())) {
        const winnerSocketId = connectedUsers.get(winner._id.toString());
        io.to(winnerSocketId).emit('auctionWon', {
          auction,
          timestamp: new Date(),
        });
      }

      console.log(`Auction ${auctionId} ended`);
    });

    // Handle chat messages (optional feature)
    socket.on('chatMessage', (data) => {
      const { auctionId, message } = data;

      // Broadcast the saved message object to the auction room
      io.to(`auction-${auctionId}`).emit('newChatMessage', {
        ...message,
        auctionId,
        timestamp: new Date(),
      });
    });

    // Handle private messages: server will relay to recipient if connected
    socket.on('privateMessage', (data) => {
      const { recipientId, message } = data;

      // Emit to recipient if they're connected
      if (recipientId && connectedUsers.has(recipientId)) {
        const recipientSocketId = connectedUsers.get(recipientId);
        io.to(recipientSocketId).emit('newPrivateMessage', {
          ...message,
          recipientId,
          timestamp: new Date(),
        });
      }

      // Also emit back to sender to confirm delivery
      socket.emit('newPrivateMessage', {
        ...message,
        recipientId,
        timestamp: new Date(),
      });
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { auctionId } = data;
      socket.to(`auction-${auctionId}`).emit('userTyping', {
        username: socket.username,
      });
    });

    // Handle user interest toggle
    socket.on('userInterested', (data) => {
      const { auctionId, userId, username, isInterested, interestCount } = data;
      io.to(`auction-${auctionId}`).emit('userInterested', {
        userId,
        username,
        isInterested,
        interestCount,
        timestamp: new Date(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username} (${socket.id})`);

      // Remove from connected users
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }

      // Update viewer counts for all rooms this socket was in
      socket.rooms.forEach((room) => {
        if (room.startsWith('auction-')) {
          const remainingRoom = io.sockets.adapter.rooms.get(room);
          const viewerCount = remainingRoom ? remainingRoom.size : 0;
          io.to(room).emit('viewerCount', viewerCount);
        }
      });
    });
  });

  return io;
};

module.exports = socketHandler;
