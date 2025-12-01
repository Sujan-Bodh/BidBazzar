import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionAPI, bidAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import CountdownTimer from '../common/CountdownTimer';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
    fetchBidHistory();

    // Join auction room via socket
    const socket = socketService.getSocket();
    if (socket) {
      socketService.joinAuction(id);

      // Listen for real-time updates
      socketService.onBidPlaced(handleBidPlaced);
      socketService.onAuctionEnded(handleAuctionEnded);
      socketService.onViewerCount(setViewerCount);

      return () => {
        socketService.leaveAuction(id);
        socketService.offBidPlaced();
        socketService.offAuctionEnded();
        socketService.offViewerCount();
      };
    }
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await auctionAPI.getAuctionById(id);
      setAuction(response.data);
      setIsWatching(response.data.watchers?.includes(user?._id));

      // Set initial bid amount to minimum bid
      const minBid = response.data.currentBid + response.data.minimumIncrement;
      setBidAmount(minBid.toFixed(2));
    } catch (error) {
      toast.error('Failed to load auction details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchBidHistory = async () => {
    try {
      const response = await bidAPI.getAuctionBids(id);
      setBids(response.data);
    } catch (error) {
      console.error('Failed to fetch bid history:', error);
    }
  };

  const handleBidPlaced = (data) => {
    // Update auction with new bid
    setAuction((prev) => ({
      ...prev,
      currentBid: data.auction.currentBid,
      currentWinner: data.auction.currentWinner,
      totalBids: data.auction.totalBids,
    }));

    // Add bid to history
    setBids((prev) => [data.bid, ...prev]);

    // Update minimum bid amount
    const minBid = data.auction.currentBid + auction.minimumIncrement;
    setBidAmount(minBid.toFixed(2));

    // Show notification if not the bidder
    if (data.bid.bidder._id !== user?._id) {
      toast.info(`New bid: rs${data.bid.amount.toFixed(2)} by ${data.bid.bidder.username}`);
    }
  };

  const handleAuctionEnded = (data) => {
    setAuction((prev) => ({
      ...prev,
      status: 'ended',
    }));
    toast.info('This auction has ended!');
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = auction.currentBid + auction.minimumIncrement;

    if (amount < minBid) {
      toast.error(`Minimum bid is rs${minBid.toFixed(2)}`);
      return;
    }

    try {
      setPlacingBid(true);
      const response = await bidAPI.placeBid(id, { amount });

      // Emit socket event
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('newBid', {
          auctionId: id,
          bid: response.data.bid,
          auction: response.data.auction,
        });
      }

      toast.success('Bid placed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place bid';
      toast.error(message);
    } finally {
      setPlacingBid(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to buy now');
      navigate('/login');
      return;
    }

    if (window.confirm(`Buy this item now for $${auction.buyNowPrice.toFixed(2)}?`)) {
      try {
        await bidAPI.buyNow(id);
        toast.success('Purchase successful! Check your dashboard.');
        fetchAuctionDetails();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to complete purchase';
        toast.error(message);
      }
    }
  };

  const handleToggleWatch = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to watch auctions');
      navigate('/login');
      return;
    }

    try {
      const response = await auctionAPI.toggleWatch(id);
      setIsWatching(response.data.isWatching);
      toast.success(response.data.isWatching ? 'Added to watchlist' : 'Removed from watchlist');
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!auction) {
    return null;
  }

  const isOwner = user?._id === auction.seller?._id;
  const canBid = isAuthenticated && !isOwner && auction.status === 'active';
  const imageUrl = auction.images?.[0]
    ? `http://localhost:5000${auction.images[0]}`
    : 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card">
              <img
                src={imageUrl}
                alt={auction.title}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                }}
              />
              {auction.images?.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {auction.images.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${img}`}
                      alt={`${auction.title} ${index + 1}`}
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>

              <div className="flex items-center gap-4 mb-4">
                <span className="badge-info">{auction.category}</span>
                <span className="badge-info">{auction.condition}</span>
                {auction.status === 'active' && (
                  <span className="flex items-center text-green-600">
                    <span className="animate-pulse mr-2">●</span> Live Auction
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
                </span>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">{auction.description}</p>

              {/* Auction Details */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium">{auction.seller?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">
                    {auction.location?.city || 'N/A'}, {auction.location?.country || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shipping Cost</p>
                  <p className="font-medium">${auction.shippingCost?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Bids</p>
                  <p className="font-medium">{auction.totalBids}</p>
                </div>
              </div>
            </div>

            {/* Bid History */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Bid History</h2>
              {bids.length === 0 ? (
                <p className="text-gray-500">No bids yet. Be the first to bid!</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bids.map((bid) => (
                    <div
                      key={bid._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{bid.bidder?.username || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">
                          ${bid.amount.toFixed(2)}
                        </p>
                        {bid.isWinning && (
                          <span className="text-xs text-green-600 font-medium">Winning</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Bidding Card */}
            <div className="card sticky top-20">
              <div className="mb-4">
                {auction.status === 'active' && (
                  <CountdownTimer endTime={auction.endTime} />
                )}
                {auction.status === 'ended' && (
                  <p className="text-red-600 font-bold">Auction Ended</p>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Current Bid</p>
                <p className="text-4xl font-bold text-primary-600">
                  ${auction.currentBid?.toFixed(2)}
                </p>
                {auction.currentWinner && (
                  <p className="text-sm text-gray-600 mt-1">
                    Leading: {auction.currentWinner.username || 'Anonymous'}
                  </p>
                )}
              </div>

              {canBid && (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Bid Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="input-field pl-8"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: ${(auction.currentBid + auction.minimumIncrement).toFixed(2)}
                    </p>
                  </div>

                  <button type="submit" disabled={placingBid} className="btn-primary w-full">
                    {placingBid ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </form>
              )}

              {auction.buyNowPrice && auction.status === 'active' && !isOwner && (
                <button onClick={handleBuyNow} className="btn-secondary w-full mt-4">
                  Buy Now - ${auction.buyNowPrice.toFixed(2)}
                </button>
              )}

              {isAuthenticated && !isOwner && (
                <button onClick={handleToggleWatch} className="btn-secondary w-full mt-4">
                  {isWatching ? '★ Watching' : '☆ Watch This Auction'}
                </button>
              )}

              {!isAuthenticated && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please <button onClick={() => navigate('/login')} className="font-medium underline">login</button> to place bids
                  </p>
                </div>
              )}

              {isOwner && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">You are the seller</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
