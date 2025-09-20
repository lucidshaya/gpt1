import express from 'express';
import { createChat, getChats, deleteChat } from '../controllers/chatController.js'; // Added getChats
import { protect } from '../middlewares/auth.js'; // Added protect

const chatRouter = express.Router();

chatRouter.post('/create', protect, createChat); // Changed to POST
chatRouter.get('/get', protect, getChats);
chatRouter.delete('/delete/:chatId', protect, deleteChat); // Changed to DELETE, added :chatId

<<<<<<< HEAD
// Message routes - moved here to match your API client
chatRouter.post('/message', protect, (req, res) => {
  // Forward to message controller
  res.status(404).json({ success: false, message: 'Use /api/messages/text endpoint' });
});

=======
>>>>>>> e16deae5a9e6fde66884262f7aa2b56a5ace4741
export default chatRouter;
