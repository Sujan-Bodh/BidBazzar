import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationIcon = ({ onOpen }) => {
  const notifications = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen(!open);
    if (!open && onOpen) onOpen();
  };

  return (
    <div className="relative">
      <button onClick={toggle} className="p-2 rounded-full hover:bg-gray-100">
        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2">
            {notifications.length === 0 && <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>}
            {notifications.slice(0, 8).map(n => (
              <div key={n.id} className={`px-4 py-2 text-sm ${n.read ? 'text-gray-600' : 'font-medium'}`}>
                <div className="truncate">{n.title}</div>
                <div className="text-xs text-gray-500 truncate">{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
