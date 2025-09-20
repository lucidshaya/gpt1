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
    
    // Ensure rate limiting works with serverless
    if (!req.app.locals.rateLimit) {
      req.app.locals.rateLimit = new Map();
    }
    
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Input validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Rate limiting middleware (Vercel-safe)
const rateLimit = (req, res, next) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10; // max 10 requests per minute
    
    // Use a simple in-memory store (note: resets on cold starts)
    const rateLimitKey = `rate:${userId}`;
    
    // Get or create rate limit record
    let userRecord = req.app.locals.rateLimit?.get(rateLimitKey);
    if (!userRecord) {
      userRecord = { count: 0, resetTime: now + windowMs };
      if (!req.app.locals.rateLimit) {
        req.app.locals.rateLimit = new Map();
      }
      req.app.locals.rateLimit.set(rateLimitKey, userRecord);
    }
    
    // Reset if window expired
    if (now > userRecord.resetTime) {
      userRecord.count = 0;
      userRecord.resetTime = now + windowMs;
    }
    
    // Check limit
    if (userRecord.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment.',
        retryAfter: Math.ceil((userRecord.resetTime - now) / 1000)
      });
    }
    
    // Increment counter
    userRecord.count++;
    req.app.locals.rateLimit.set(rateLimitKey, userRecord);
    
    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    next(); // Continue without rate limiting on error
  }
};

// Text message route with comprehensive error handling
messageRouter.post('/text', [
  protect,
  rateLimit,
  validateMessageInput
], async (req, res) => {
  try {
    console.log(`Processing text message for user: ${req.user?._id || 'unknown'}`);
    
    // Call the controller directly
    const result = await textMessageController(req, res);
    
    // If controller already sent response, return
    if (res.headersSent) {
      return;
    }
    
    // Ensure response is JSON
    if (typeof result === 'object' && result !== null) {
      res.status(200).json(result);
    } else {
      res.status(200).json({ success: true, data: result });
    }
    
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
});

// Image message route
messageRouter.post('/image', [
  protect,
  validateMessageInput
], async (req, res) => {
  try {
    console.log(`Processing image message for user: ${req.user?._id || 'unknown'}`);
    
    const result = await imageMessageController(req, res);
    
    if (res.headersSent) {
      return;
    }
    
    if (typeof result === 'object' && result !== null) {
      res.status(200).json(result);
    } else {
      res.status(200).json({ success: true, data: result });
    }
    
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
});

// Health check route
messageRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Messages service is healthy',
    timestamp: new Date().toISOString(),
    routes: ['POST /text', 'POST /image']
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
