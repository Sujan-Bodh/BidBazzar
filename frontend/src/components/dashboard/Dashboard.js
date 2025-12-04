import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auctionAPI, bidAPI } from '../../utils/api';
import AuctionCard from '../auctions/AuctionCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const Dashboard = ({ role }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(role === 'seller' ? 'selling' : 'bidding');
  const [loading, setLoading] = useState(true);

  // Data states
  const [myBids, setMyBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [watchedAuctions, setWatchedAuctions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (role === 'seller') {
        const auctionsRes = await auctionAPI.getUserAuctions();
        setMyAuctions(auctionsRes.data);
      } else {
        const [bidsRes, wonRes, watchedRes] = await Promise.all([
          bidAPI.getUserWinningBids(),
          bidAPI.getUserWonAuctions(),
          auctionAPI.getWatchedAuctions(),
        ]);
        setMyBids(bidsRes.data);
        setWonAuctions(wonRes.data);
        setWatchedAuctions(watchedRes.data);
      }
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

  const tabs = role === 'seller'
    ? [
        { id: 'selling', label: 'My Auctions', count: myAuctions.length },
        { id: 'sales', label: 'Sales Analytics', count: 0 },
      ]
    : [
        { id: 'bidding', label: 'Active Bids', count: myBids.length },
        { id: 'won', label: 'Won Auctions', count: wonAuctions.length },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {role === 'seller' ? 'Seller Dashboard' : 'Buyer Dashboard'}
          </h1>
          <p className="text-gray-600">
            {role === 'seller'
              ? 'Manage your auctions, monitor sales, and track performance'
              : 'Manage your active bids, won auctions, and watchlist'}
          </p>
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
          {role === 'seller' ? (
            <>
              {/* Seller: My Auctions */}
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

              {/* Seller: Sales Analytics */}
              {activeTab === 'sales' && (
                <div className="card">
                  <h2 className="text-2xl font-bold mb-6">Sales Analytics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Total Auctions</p>
                      <p className="text-3xl font-bold text-blue-600">{myAuctions.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Total Sales</p>
                      <p className="text-3xl font-bold text-green-600">{user?.totalItemsSold || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Total Earnings</p>
                      <p className="text-3xl font-bold text-purple-600">₹{user?.totalEarnings?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Success Rate</p>
                      <p className="text-3xl font-bold text-orange-600">{user?.successRate || 100}%</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Buyer: Active Bids */}
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

              {/* Buyer: Won Auctions */}
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

              {/* Buyer: Watchlist */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
