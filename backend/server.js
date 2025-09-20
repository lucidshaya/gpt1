// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';

// Database connection function
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is required');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
    });
    
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid JSON' });
      throw e;
    }
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Chat API is Live!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/users',
      chats: '/api/chats',
      messages: '/api/messages',
      health: '/api/health'
    }
  });
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/messages', messageRouter);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    availableRoutes: [
      'POST /api/users/register',
      'POST /api/users/login',
      'GET /api/chats/get',
      'POST /api/chats/create',
      'DELETE /api/chats/delete/:chatId',
      'POST /api/messages/text',
      'GET /api/health'
    ]
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('[GLOBAL ERROR] Unhandled error:', {
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  if (res.headersSent) {
    return;
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Vercel serverless function export
export default async function handler(req, res) {
  // Create new express app for each request (Vercel requirement)
  const expressApp = express();
  
  // Apply middleware
  expressApp.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  }));
  expressApp.use(express.json({ limit: '10mb' }));
  
  // Apply routes
  expressApp.use('/api/users', userRouter);
  expressApp.use('/api/chats', chatRouter);
  expressApp.use('/api/messages', messageRouter);
  
  // Health check
  expressApp.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  });
  
  // Root
  expressApp.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'AI Chat API is Live!',
      version: '1.0.0'
    });
  });
  
  // 404
  expressApp.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.url} not found`
    });
  });
  
  // Handle the request
  return new Promise((resolve, reject) => {
    expressApp(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// For local development
if (typeof require !== 'undefined' && require.main === module) {
  connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
