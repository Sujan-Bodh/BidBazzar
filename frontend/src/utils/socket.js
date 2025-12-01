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

  onViewerCount(callback) {
    if (this.socket) {
      this.socket.on('viewerCount', callback);
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
