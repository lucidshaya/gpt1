import Chat from '../models/Chat.js';

// API Controller for creating a new chat
export const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatData = {
            userId,
            messages: [],
            name: 'New chat',
            userName: req.user.name,
        };
        const chat = await Chat.create(chatData);
        res.status(201).json({ success: true, message: 'Chat created successfully', chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API Controller for fetching all chats of a user
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, chats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API Controller for deleting a chat
export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params; // Assuming chatId is passed as a URL parameter
        const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found or not authorized' });
        }
        res.status(200).json({ success: true, message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};