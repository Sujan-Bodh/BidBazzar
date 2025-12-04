const Message = require('../models/Message');

// @desc    Get chat messages for an auction
// @route   GET /api/chats/auction/:auctionId
// @access  Private
exports.getAuctionMessages = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const messages = await Message.find({ auction: auctionId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 })
      .limit(200);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new chat message for an auction
// @route   POST /api/chats/auction/:auctionId
// @access  Private
exports.createMessage = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // If recipientId is provided, create a private message between users
    const { recipientId } = req.body;

    let message;

    if (recipientId) {
      // create private message
      message = await Message.create({
        sender: req.user._id,
        recipient: recipientId,
        participants: [req.user._id, recipientId],
        message: content.trim(),
      });
    } else {
      // auction message
      message = await Message.create({
        auction: auctionId,
        sender: req.user._id,
        message: content.trim(),
      });
    }

    const populated = await message.populate('sender', 'username');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get private messages between current user and another user
// @route   GET /api/chats/private/:userId
// @access  Private
exports.getPrivateMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myId = req.user._id;

    const messages = await Message.find({
      participants: { $all: [myId, otherUserId] },
    })
      .populate('sender', 'username')
      .sort({ createdAt: 1 })
      .limit(500);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for the current user (distinct participants)
// @route   GET /api/chats/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    // Find all messages where user is a participant
    const messages = await Message.find({
      participants: myId,
    })
      .populate('sender', 'username _id')
      .populate('participants', 'username _id')
      .sort({ createdAt: -1 });

    // Group by participants to get unique conversations
    const conversationMap = new Map();

    messages.forEach((msg) => {
      // Get the other user in the conversation
      const otherUser = msg.participants.find((p) => p._id.toString() !== myId.toString());

      if (otherUser) {
        const key = otherUser._id.toString();
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            otherUserId: otherUser._id,
            otherUsername: otherUser.username,
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
          });
        }
      }
    });

    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

