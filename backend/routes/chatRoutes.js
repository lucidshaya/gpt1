// routes/chatRoutes.js
import express from 'express';
import { createChat, getChats, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const chatRouter = express.Router();

// Get all chats
chatRouter.get('/get', [
  protect,
  async (req, res) => {
    try {
      console.log(`Getting chats for user: ${req.user?._id || 'unknown'}`);
      
      const result = await getChats(req, res);
      
      if (res.headersSent) {
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Get chats route error:', {
        userId: req.user?._id,
        error: error.message,
        stack: error.stack
      });
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch chats',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }
]);

// Create new chat
chatRouter.post('/create', [
  protect,
  async (req, res) => {
    try {
      console.log(`Creating chat for user: ${req.user?._id || 'unknown'}`);
      
      const result = await createChat(req, res);
      
      if (res.headersSent) {
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Create chat route error:', {
        userId: req.user?._id,
        error: error.message,
        stack: error.stack
      });
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to create chat',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }
]);

// Delete chat
chatRouter.delete('/delete/:chatId', [
  protect,
  async (req, res) => {
    try {
      const { chatId } = req.params;
      console.log(`Deleting chat ${chatId} for user: ${req.user?._id || 'unknown'}`);
      
      const result = await deleteChat(req, res);
      
      if (res.headersSent) {
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Delete chat route error:', {
        userId: req.user?._id,
        chatId: req.params.chatId,
        error: error.message,
        stack: error.stack
      });
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete chat',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }
]);

// Legacy message route (redirect to correct endpoint)
chatRouter.post('/message', protect, (req, res) => {
  res.status(410).json({ 
    success: false, 
    message: 'This endpoint has moved. Use POST /api/messages/text instead.',
    newEndpoint: '/api/messages/text'
  });
});

// Health check
chatRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chats service is healthy',
    timestamp: new Date().toISOString(),
    routes: ['GET /get', 'POST /create', 'DELETE /delete/:chatId']
  });
});

// 404 handler
chatRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/chats/get',
      'POST /api/chats/create',
      'DELETE /api/chats/delete/:chatId',
      'GET /api/chats/health'
    ]
  });
});

export default chatRouter;
