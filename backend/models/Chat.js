// models/Chat.js
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  name: { type: String, required: true },
  messages: [
    {
      content: { type: String, required: true },
      isImage: { type: Boolean, default: false },
      isPublished: { type: Boolean, default: false },
      role: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;