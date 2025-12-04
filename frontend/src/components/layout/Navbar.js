import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../utils/socket';
import { useNotificationDispatch, addNotification } from '../../context/NotificationContext';
import NotificationIcon from '../notifications/NotificationIcon';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Internal manager to wire socket events into notifications
  const NotificationManager = () => {
    const dispatch = useNotificationDispatch();

    useEffect(() => {
      if (!isAuthenticated || !user) return;

      const token = user.token;
      socketService.connect(token);

      const onAuctionEnded = (payload) => {
        addNotification(dispatch, {
          type: 'auction',
          title: 'Auction Ended',
          message: payload?.title || 'An auction has ended',
          data: payload,
        });
      };

      const onAuctionWon = (payload) => {
        addNotification(dispatch, {
          type: 'order',
          title: 'You Won an Auction',
          message: payload?.title || 'You won an auction. Check your orders.',
          data: payload,
        });
      };

      const onUserInterested = (payload) => {
        addNotification(dispatch, {
          type: 'interest',
          title: 'Someone is Interested',
          message: payload?.message || 'A user showed interest in your item',
          data: payload,
        });
      };

      const onPrivateMessage = (payload) => {
        addNotification(dispatch, {
          type: 'message',
          title: payload?.fromName ? `Message from ${payload.fromName}` : 'New message',
          message: payload?.text || 'You have a new message',
          data: payload,
        });
      };

      socketService.onAuctionEnded(onAuctionEnded);
      socketService.onAuctionWon(onAuctionWon);
      socketService.onUserInterested(onUserInterested);
      socketService.onNewPrivateMessage(onPrivateMessage);
      socketService.onOrderOfferedToNext((payload) => {
        addNotification(dispatch, {
          type: 'order',
          title: 'Order Offered To You',
          message: payload?.message || 'An order was offered to the next bidder',
          data: payload,
        });
      });

      socketService.onAuctionUnsold((payload) => {
        addNotification(dispatch, {
          type: 'auction',
          title: 'Auction Unsold',
          message: payload?.message || 'An auction finished without a sale',
          data: payload,
        });
      });

      return () => {
        socketService.offAuctionEnded && socketService.offAuctionEnded();
        socketService.offAuctionUpdated && socketService.offAuctionUpdated();
        socketService.offBidPlaced && socketService.offBidPlaced();
        socketService.offNewPrivateMessage && socketService.offNewPrivateMessage();
        socketService.offUserInterested && socketService.offUserInterested();
        socketService.offOrderOfferedToNext && socketService.offOrderOfferedToNext();
        socketService.offAuctionUnsold && socketService.offAuctionUnsold();
      };
    }, [isAuthenticated, user, addNotification]);

    return null;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">BidBazaar</span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-primary-600 font-medium"
              >
                Auctions
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-primary-600 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create-auction"
                    className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-primary-600 font-medium"
                  >
                    Sell
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side nav */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <>
                  <NotificationManager />
                  <span className="text-gray-700">Hello, {user?.username}</span>
                  <NotificationIcon />
                  <Link to="/profile" className="btn-secondary">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="btn-primary">
                    Logout
                  </button>
                </>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Auctions
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-auction"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sell
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
