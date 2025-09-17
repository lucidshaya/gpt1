import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    userName: { type: String, required: true },
    name: { type: String, required: true },
    messages: [
        {
            content: { type: String, required: true }, // Added content field
            isImage: { type: Boolean, default: false },
            isPublished: { type: Boolean, default: false },
            role: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }, // Changed to Date, default provided
        },
    ],
}, { timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;