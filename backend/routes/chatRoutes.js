import express from 'express';
import { createChat, getChats, deleteChat } from '../controllers/chatController.js'; // Added getChats
import { protect } from '../middlewares/auth.js'; // Added protect

const chatRouter = express.Router();

chatRouter.post('/create', protect, createChat); // Changed to POST
chatRouter.get('/get', protect, getChats);
chatRouter.delete('/delete/:chatId', protect, deleteChat); // Changed to DELETE, added :chatId

export default chatRouter;