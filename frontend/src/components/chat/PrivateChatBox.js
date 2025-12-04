import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const PrivateChatBox = ({ otherUserId, otherUsername }) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await chatAPI.getPrivateMessages(otherUserId);
        if (!mounted) return;
        setMessages(res.data || []);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load private messages', err);
      }
    };

    if (!socketService.getSocket()) {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      socketService.connect(stored.token);
    }

    load();
    socketService.onNewPrivateMessage(handleIncoming);

    return () => {
      mounted = false;
      socketService.offNewPrivateMessage();
    };
  }, [otherUserId]);

  const handleIncoming = (msg) => {
    // Only append messages that are between the two participants
    const participants = msg.participants || [];
    const myId = user?._id;
    if (participants.length && !participants.includes(myId)) return;
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const handleSend = async (e) => {
    e && e.preventDefault();
    if (!isAuthenticated) return;
    if (!text.trim()) return;

    try {
      // Persist via REST
      const res = await chatAPI.sendPrivateMessage(otherUserId, text.trim());
      const saved = res.data;

      // Emit to server so recipient receives in real-time
      socketService.emitPrivateMessage(otherUserId, saved);

      setMessages((prev) => [...prev, saved]);
      setText('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send private message', err);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Chat with {otherUsername || 'User'}</h3>

      <div ref={messagesRef} className="border rounded p-3 max-h-64 overflow-y-auto bg-white mb-3">
        {messages.length === 0 ? (
          <p className="text-gray-500">No conversation yet. Say hello!</p>
        ) : (
          messages.map((m) => (
            <div key={m._id || m.id || Math.random()} className="mb-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.sender?.username || (m.username) || 'Guest'}</span>
                <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(m.createdAt || m.timestamp || Date.now()), { addSuffix: true })}</span>
              </div>
              <div className="mt-1 text-sm text-gray-700">{m.message || m.content || m.message}</div>
            </div>
          ))
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-field flex-1"
            placeholder="Write a message to the seller..."
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      ) : (
        <div className="text-sm text-gray-500">Please login to message this user.</div>
      )}
    </div>
  );
};

export default PrivateChatBox;
