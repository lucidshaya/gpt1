// routes/chatRoutes.js
import express from 'express';
import { createChat, getChats, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const chatRouter = express.Router();
chatRouter.post('/create', protect, createChat);
chatRouter.get('/get', protect, getChats);
chatRouter.delete('/delete/:chatId', protect, deleteChat);

export default chatRouter;