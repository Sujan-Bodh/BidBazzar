import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from '../common/CountdownTimer';

const AuctionCard = ({ auction }) => {
  const imageUrl = auction.images?.[0]
    ? `http://localhost:5000${auction.images[0]}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  const getStatusBadge = () => {
    switch (auction.status) {
      case 'active':
        return <span className="badge-success">Active</span>;
      case 'ended':
        return <span className="badge-danger">Ended</span>;
      case 'pending':
        return <span className="badge-warning">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <Link to={`/auction/${auction._id}`}>
      <div className="card hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={auction.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
          {auction.totalBids > 0 && (
            <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium">
              {auction.totalBids} {auction.totalBids === 1 ? 'bid' : 'bids'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="mb-2">
            <span className="text-xs text-gray-500 uppercase">{auction.category}</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {auction.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {auction.description}
          </p>

          {/* Bid Info */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs text-gray-500">Current Bid</p>
                <p className="text-2xl font-bold text-primary-600">
                  ${auction.currentBid?.toFixed(2) || auction.startingBid?.toFixed(2)}
                </p>
              </div>
              {auction.buyNowPrice && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Buy Now</p>
                  <p className="text-lg font-semibold text-gray-700">
                    ${auction.buyNowPrice.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Timer */}
            {auction.status === 'active' && (
              <div className="pt-2 border-t">
                <CountdownTimer endTime={auction.endTime} />
              </div>
            )}

            {auction.status === 'ended' && auction.currentWinner && (
              <div className="pt-2 border-t text-sm text-gray-600">
                Won by: {auction.currentWinner.username || 'Anonymous'}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
