// middlewares/auth.js
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(`[AUTH] Processing auth for ${req.method} ${req.originalUrl}`);
    
    if (!authHeader) {
      console.log('[AUTH] No authorization header provided');
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required',
        requiredHeader: 'Authorization: Bearer <token>'
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] Invalid authorization format:', authHeader);
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
        expectedFormat: 'Authorization: Bearer <token>'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token.length < 10) {
      console.log('[AUTH] Invalid or empty token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token provided'
      });
    }
    
    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] JWT_SECRET environment variable is missing');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('[AUTH] Decoded token:', decoded); // Debug log
    
    if (!decoded || typeof decoded !== 'object') {
      console.log('[AUTH] Invalid token payload');
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }
    
    // Ensure user ID exists - Handle both 'id' and '_id' from token
    const userId = decoded._id || decoded.id;
    
    if (!userId) {
      console.log('[AUTH] Token missing user ID:', decoded);
      return res.status(401).json({
        success: false,
        message: 'Token missing user identifier',
        tokenKeys: Object.keys(decoded)
      });
    }
    
    // Create consistent user object with _id property
    req.user = {
      _id: userId, // Always use _id for consistency with MongoDB
      id: userId,  // Also keep id for backward compatibility
      ...decoded   // Include other decoded fields (email, name, etc.)
    };
    
    console.log(`[AUTH] Successfully authenticated user: ${req.user._id}`);
    next();
    
  } catch (error) {
    console.error('[AUTH] Token verification error:', {
      message: error.message,
      name: error.name,
      tokenPreview: req.headers.authorization?.substring(0, 20) + '...',
      url: req.originalUrl,
      method: req.method
    });
    
    let statusCode = 401;
    let message = 'Token verification failed';
    
    switch (error.name) {
      case 'JsonWebTokenError':
        message = 'Invalid token signature';
        break;
      case 'TokenExpiredError':
        message = 'Token has expired';
        statusCode = 403;
        break;
      case 'TypeError':
      case 'SyntaxError':
        message = 'Malformed token';
        break;
      default:
        statusCode = 500;
        message = 'Authentication server error';
    }
    
    return res.status(statusCode).json({
      success: false,
      message: message,
      expired: error.name === 'TokenExpiredError',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};