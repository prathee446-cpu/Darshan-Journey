import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system', 'bot'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  navAction: {
    label: { type: String, default: null },
    path: { type: String, default: null }
  },
  quickActions: [{ type: String }]
}, { _id: false });

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema]
}, {
  timestamps: true,
  collection: 'chathistories'
});

// Create compound or single index for fast session lookups
chatHistorySchema.index({ sessionId: 1, userId: 1 });

const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
