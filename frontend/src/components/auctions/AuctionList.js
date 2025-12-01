import React, { useState, useEffect } from 'react';
import { auctionAPI } from '../../utils/api';
import AuctionCard from './AuctionCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Collectibles',
  'Art',
  'Automotive',
  'Books',
  'Jewelry',
  'Other',
];

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAuctions: 0,
  });

  useEffect(() => {
    fetchAuctions();
  }, [filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        category: filters.category === 'All' ? undefined : filters.category,
      };
      const response = await auctionAPI.getAuctions(params);
      setAuctions(response.data.auctions);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalAuctions: response.data.totalAuctions,
      });
    } catch (error) {
      toast.error('Failed to fetch auctions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category, page: 1 });
  };

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Discover Unique Auctions</h1>
          <p className="text-xl">Bid on thousands of items from around the world</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search auctions..."
              value={filters.search}
              onChange={handleSearchChange}
              className="input-field flex-1"
            />
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="input-field md:w-48"
            >
              <option value="createdAt">Newest First</option>
              <option value="endTime">Ending Soon</option>
              <option value="currentBid">Highest Bid</option>
              <option value="totalBids">Most Bids</option>
            </select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.category === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          {pagination.totalAuctions} {pagination.totalAuctions === 1 ? 'auction' : 'auctions'} found
        </div>

        {/* Auction Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : auctions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No auctions found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {auctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        pagination.currentPage === index + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuctionList;
