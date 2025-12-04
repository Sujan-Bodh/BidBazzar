import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ChatBox = ({ auctionId }) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await chatAPI.getMessages(auctionId);
        if (!mounted) return;
        setMessages(res.data || []);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load chat messages', err);
      }
    };

    // Ensure socket is connected
    if (!socketService.getSocket()) {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      socketService.connect(stored.token);
    }

    load();

    // Subscribe to incoming messages
    socketService.onNewChatMessage(handleIncomingMessage);
    socketService.onUserTyping(handleUserTyping);

    return () => {
      mounted = false;
      socketService.offNewChatMessage();
      socketService.offUserTyping();
    };
  }, [auctionId]);

  const handleIncomingMessage = (msg) => {
    // If message belongs to this auction, append
    if (msg.auctionId && String(msg.auctionId) !== String(auctionId)) return;
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  };

  const handleUserTyping = (data) => {
    if (data.auctionId && String(data.auctionId) !== String(auctionId)) return;
    setTypingUser(data.username);
    setTimeout(() => setTypingUser(null), 1500);
  };

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const handleSend = async (e) => {
    e && e.preventDefault();
    if (!isAuthenticated) {
      return;
    }
    if (!text.trim()) return;

    try {
      // Persist message to server via REST
      const res = await chatAPI.sendMessage(auctionId, text.trim());
      const saved = res.data;

      // Emit through socket so other clients receive
      socketService.emitChatMessage(auctionId, saved);

      setMessages((prev) => [...prev, saved]);
      setText('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleTyping = () => {
    socketService.emitTyping(auctionId);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Live Chat</h3>

      <div ref={messagesRef} className="border rounded p-3 max-h-64 overflow-y-auto bg-white mb-3">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((m) => (
            <div key={m._id || m.id || Math.random()} className="mb-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.sender?.username || m.username || 'Guest'}</span>
                <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(m.createdAt || m.timestamp || Date.now()), { addSuffix: true })}</span>
              </div>
              <div className="mt-1 text-sm text-gray-700">{m.content || m.message}</div>
            </div>
          ))
        )}
      </div>

      {typingUser && <div className="text-xs text-gray-500 mb-2">{typingUser} is typing...</div>}

      {isAuthenticated ? (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleTyping}
            className="input-field flex-1"
            placeholder="Write a message..."
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      ) : (
        <div className="text-sm text-gray-500">Please login to participate in chat.</div>
      )}
    </div>
  );
};

export default ChatBox;
