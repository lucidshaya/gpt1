// routes/messageRoutes.js
import express from 'express';
import { protect } from '../middlewares/auth.js';
import { imageMessageController, textMessageController } from '../controllers/messageController.js';

const messageRouter = express.Router();

// Input validation middleware
const validateMessageInput = (req, res, next) => {
  try {
    const { chatId, prompt } = req.body;
    
    if (!chatId || !prompt) {
      return res.status(400).json({
        success: false,
        message: 'chatId and prompt are required fields',
        validationErrors: {
          chatId: !chatId ? 'Chat ID is required' : null,
          prompt: !prompt ? 'Message content is required' : null
        }
      });
    }

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prompt must be a non-empty string',
        validationErrors: { prompt: 'Message cannot be empty' }
      });
    }

    if (typeof chatId !== 'string' || chatId.length < 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chatId format',
        validationErrors: { chatId: 'Invalid chat ID format' }
      });
    }

    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Input validation error',
      error: error.message
    });
  }
};

// Rate limiting middleware (basic implementation)
const rateLimit = (req, res, next) => {
  const userId = req.user?._id;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // max 10 requests per minute
  
  // Simple in-memory store (use Redis in production)
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }
  
  const userKey = `rate:${userId}`;
  const userRecord = req.app.locals.rateLimit.get(userKey) || { count: 0, resetTime: now + windowMs };
  
  if (now > userRecord.resetTime) {
    userRecord.count = 0;
    userRecord.resetTime = now + windowMs;
  }
  
  if (userRecord.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a moment.',
      retryAfter: Math.ceil((userRecord.resetTime - now) / 1000)
    });
  }
  
  userRecord.count++;
  req.app.locals.rateLimit.set(userKey, userRecord);
  
  next();
};

// Text message route with comprehensive error handling
messageRouter.post('/text', 
  protect, 
  rateLimit,
  validateMessageInput,
  async (req, res) => {
    try {
      console.log(`Processing text message for user: ${req.user._id}`);
      
      // Call the controller
      const result = await textMessageController(req, res);
      
      // If controller already sent response, return
      if (res.headersSent) {
        return;
      }
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Message route error handler:', {
        userId: req.user?._id,
        chatId: req.body.chatId,
        error: error.message,
        stack: error.stack
      });
      
      // If response already sent by controller, don't send again
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to process message',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }
);

// Image message route
messageRouter.post('/image', 
  protect, 
  validateMessageInput, // Reuse validation
  async (req, res) => {
    try {
      console.log(`Processing image message for user: ${req.user._id}`);
      
      const result = await imageMessageController(req, res);
      
      if (res.headersSent) {
        return;
      }
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Image message route error:', {
        userId: req.user?._id,
        error: error.message,
        stack: error.stack
      });
      
      if (!res.headersSent) {
        res.status(501).json({
          success: false,
          message: 'Image messages not implemented yet',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }
);

// Health check route
messageRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Messages service is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
messageRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'POST /api/messages/text',
      'POST /api/messages/image',
      'GET /api/messages/health'
    ]
  });
});

export default messageRouter;
