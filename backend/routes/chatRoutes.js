// routes/chatRoutes.js
import express from 'express';
import { createChat, getChats, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const chatRouter = express.Router();

chatRouter.post('/create', protect, createChat);
chatRouter.get('/get', protect, getChats);
chatRouter.delete('/delete/:chatId', protect, deleteChat);

// Message routes - moved here to match your API client
chatRouter.post('/message', protect, (req, res) => {
  // Forward to message controller
  res.status(404).json({ success: false, message: 'Use /api/messages/text endpoint' });
});

export default chatRouter;
