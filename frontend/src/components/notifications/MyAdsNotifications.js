import React from 'react';
import { useNotifications, useNotificationDispatch, markRead } from '../../context/NotificationContext';

const MyAdsNotifications = () => {
  const notifications = useNotifications().filter(n => n.type === 'interest' || n.type === 'order');
  const dispatch = useNotificationDispatch();

  return (
    <div className="p-2">
      {notifications.length === 0 && <div className="text-sm text-gray-500">No activity on your ads</div>}
      {notifications.map(n => (
        <div key={n.id} className="mb-2">
          <div className="font-medium text-sm">{n.title}</div>
          <div className="text-xs text-gray-500">{n.message}</div>
          <div className="text-right">
            {!n.read && (
              <button
                className="text-xs text-primary-600 mt-1"
                onClick={() => markRead(dispatch, n.id)}
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyAdsNotifications;
