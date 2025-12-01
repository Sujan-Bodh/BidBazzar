import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI, bidAPI } from '../../utils/api';
import AuctionCard from '../auctions/AuctionCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bidding');
  const [loading, setLoading] = useState(true);

  // Data states
  const [myBids, setMyBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [watchedAuctions, setWatchedAuctions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bidsRes, wonRes, auctionsRes, watchedRes] = await Promise.all([
        bidAPI.getUserWinningBids(),
        bidAPI.getUserWonAuctions(),
        auctionAPI.getUserAuctions(),
        auctionAPI.getWatchedAuctions(),
      ]);

      setMyBids(bidsRes.data);
      setWonAuctions(wonRes.data);
      setMyAuctions(auctionsRes.data);
      setWatchedAuctions(watchedRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      try {
        await auctionAPI.deleteAuction(auctionId);
        toast.success('Auction deleted successfully');
        fetchDashboardData();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete auction';
        toast.error(message);
      }
    }
  };

  const tabs = [
    { id: 'bidding', label: 'Active Bids', count: myBids.length },
    { id: 'won', label: 'Won Auctions', count: wonAuctions.length },
    { id: 'selling', label: 'My Auctions', count: myAuctions.length },
    { id: 'watching', label: 'Watchlist', count: watchedAuctions.length },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your auctions, bids, and watchlist</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {/* Active Bids */}
          {activeTab === 'bidding' && (
            <div>
              {myBids.length === 0 ? (
                <div className="text-center py-12 card">
                  <p className="text-gray-500 mb-4">You have no active bids</p>
                  <Link to="/" className="btn-primary">
                    Browse Auctions
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBids.map((bid) => (
                    <div key={bid._id}>
                      {bid.auction && <AuctionCard auction={bid.auction} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Won Auctions */}
          {activeTab === 'won' && (
            <div>
              {wonAuctions.length === 0 ? (
                <div className="text-center py-12 card">
                  <p className="text-gray-500 mb-4">You haven't won any auctions yet</p>
                  <Link to="/" className="btn-primary">
                    Browse Auctions
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wonAuctions.map((auction) => (
                    <div key={auction._id}>
                      <AuctionCard auction={auction} />
                      <div className="mt-2 card">
                        <h4 className="font-semibold mb-2">Seller Contact</h4>
                        <p className="text-sm text-gray-600">
                          Username: {auction.seller?.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          Email: {auction.seller?.email}
                        </p>
                        {auction.seller?.phone && (
                          <p className="text-sm text-gray-600">
                            Phone: {auction.seller.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Auctions */}
          {activeTab === 'selling' && (
            <div>
              <div className="mb-6">
                <Link to="/create-auction" className="btn-primary">
                  + Create New Auction
                </Link>
              </div>

              {myAuctions.length === 0 ? (
                <div className="text-center py-12 card">
                  <p className="text-gray-500 mb-4">You haven't created any auctions yet</p>
                  <Link to="/create-auction" className="btn-primary">
                    Create Your First Auction
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAuctions.map((auction) => (
                    <div key={auction._id}>
                      <AuctionCard auction={auction} />
                      <div className="mt-2 flex gap-2">
                        {auction.totalBids === 0 && auction.status !== 'ended' && (
                          <button
                            onClick={() => handleDeleteAuction(auction._id)}
                            className="btn-danger flex-1"
                          >
                            Delete
                          </button>
                        )}
                        <Link
                          to={`/auction/${auction._id}`}
                          className="btn-secondary flex-1 text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Watchlist */}
          {activeTab === 'watching' && (
            <div>
              {watchedAuctions.length === 0 ? (
                <div className="text-center py-12 card">
                  <p className="text-gray-500 mb-4">Your watchlist is empty</p>
                  <Link to="/" className="btn-primary">
                    Browse Auctions
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {watchedAuctions.map((auction) => (
                    <AuctionCard key={auction._id} auction={auction} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
