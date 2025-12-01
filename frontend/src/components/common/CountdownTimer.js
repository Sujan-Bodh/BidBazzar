import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const CountdownTimer = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime);
      const now = new Date();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Ended');
        if (onExpire) {
          onExpire();
        }
        return;
      }

      // Calculate time components
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Format display
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  const getColorClass = () => {
    if (isExpired) return 'text-red-600';

    const end = new Date(endTime);
    const now = new Date();
    const hoursLeft = (end - now) / (1000 * 60 * 60);

    if (hoursLeft < 1) return 'text-red-600 font-bold';
    if (hoursLeft < 24) return 'text-orange-600';
    return 'text-gray-700';
  };

  return (
    <div className={`font-medium ${getColorClass()}`}>
      {isExpired ? (
        <span>Auction Ended</span>
      ) : (
        <span>Ends in: {timeLeft}</span>
      )}
    </div>
  );
};

export default CountdownTimer;
