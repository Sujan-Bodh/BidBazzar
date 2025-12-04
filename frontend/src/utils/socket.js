import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || null,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAuction(auctionId) {
    if (this.socket) {
      this.socket.emit('joinAuction', auctionId);
    }
  }

  leaveAuction(auctionId) {
    if (this.socket) {
      this.socket.emit('leaveAuction', auctionId);
    }
  }

  onBidPlaced(callback) {
    if (this.socket) {
      this.socket.on('bidPlaced', callback);
    }
  }

  onAuctionUpdated(callback) {
    if (this.socket) {
      this.socket.on('auctionUpdated', callback);
    }
  }

  onAuctionEnded(callback) {
    if (this.socket) {
      this.socket.on('auctionEnded', callback);
    }
  }

  onAuctionWon(callback) {
    if (this.socket) {
      this.socket.on('auctionWon', callback);
    }
  }

  onOrderOfferedToNext(callback) {
    if (this.socket) {
      this.socket.on('orderOfferedToNext', callback);
    }
  }

  onAuctionUnsold(callback) {
    if (this.socket) {
      this.socket.on('auctionUnsold', callback);
    }
  }

  onViewerCount(callback) {
    if (this.socket) {
      this.socket.on('viewerCount', callback);
    }
  }

  onUserInterested(callback) {
    if (this.socket) {
      this.socket.on('userInterested', callback);
    }
  }

  // Chat helpers
  emitChatMessage(auctionId, message) {
    if (this.socket) {
      this.socket.emit('chatMessage', { auctionId, message });
    }
  }

  onNewChatMessage(callback) {
    if (this.socket) {
      this.socket.on('newChatMessage', callback);
    }
  }

  offNewChatMessage() {
    if (this.socket) {
      this.socket.off('newChatMessage');
    }
  }

  emitTyping(auctionId) {
    if (this.socket) {
      this.socket.emit('typing', { auctionId });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('userTyping');
    }
  }

  // Private chat helpers
  emitPrivateMessage(recipientId, message) {
    if (this.socket) {
      this.socket.emit('privateMessage', { recipientId, message });
    }
  }

  onNewPrivateMessage(callback) {
    if (this.socket) {
      this.socket.on('newPrivateMessage', callback);
    }
  }

  offNewPrivateMessage() {
    if (this.socket) {
      this.socket.off('newPrivateMessage');
    }
  }

  offUserInterested() {
    if (this.socket) {
      this.socket.off('userInterested');
    }
  }

  offBidPlaced() {
    if (this.socket) {
      this.socket.off('bidPlaced');
    }
  }

  offAuctionUpdated() {
    if (this.socket) {
      this.socket.off('auctionUpdated');
    }
  }

  offOrderOfferedToNext() {
    if (this.socket) {
      this.socket.off('orderOfferedToNext');
    }
  }

  offAuctionUnsold() {
    if (this.socket) {
      this.socket.off('auctionUnsold');
    }
  }

  offAuctionEnded() {
    if (this.socket) {
      this.socket.off('auctionEnded');
    }
  }

  offViewerCount() {
    if (this.socket) {
      this.socket.off('viewerCount');
    }
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
