// controllers/messageController.js
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : '');

// Helper function to validate environment
const validateEnvironment = () => {
  const errors = [];
  
  if (!process.env.GEMINI_API_KEY) {
    errors.push('GEMINI_API_KEY environment variable is missing');
  }
  
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET environment variable is missing');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration error: ${errors.join(', ')}`);
  }
};

export const textMessageController = async (req, res) => {
  const sessionStart = Date.now();
  
  try {
    // Validate environment
    validateEnvironment();
    
    const { chatId, prompt } = req.body;
    const userId = req.user._id;
    
    console.log(`[MESSAGE] Processing: User=${userId}, Chat=${chatId}, Prompt="${prompt?.substring(0, 50)}..."`);
    
    // Validate user credits
    const user = await User.findById(userId).select('credits');
    if (!user) {
      console.log(`[MESSAGE] User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.credits <= 0) {
      console.log(`[MESSAGE] Insufficient credits: ${userId}`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient credits. Please purchase more credits.',
        credits: user.credits
      });
    }
    
    // Find chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      userId: userId 
    }).populate('userId', 'name');
    
    if (!chat) {
      console.log(`[MESSAGE] Chat not found: ${chatId} for user ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    };
    
    chat.messages.push(userMessage);
    
    // Prepare Gemini history
    const history = chat.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Get previous history and current prompt
    const prevHistory = history.slice(0, -1);
    const currentPrompt = history[history.length - 1].parts[0].text;
    
    console.log(`[GEMINI] Sending to AI: History=${prevHistory.length} messages, Prompt="${currentPrompt?.substring(0, 50)}..."`);
    
    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const geminiChat = await model.startChat({ 
      history: prevHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    const result = await geminiChat.sendMessage(currentPrompt);
    
    if (!result.response) {
      throw new Error('No response from AI model');
    }
    
    const replyContent = result.response.text();
    
    if (!replyContent || replyContent.trim().length === 0) {
      throw new Error('Empty response from AI model');
    }
    
    console.log(`[GEMINI] AI Response: "${replyContent?.substring(0, 100)}..."`);
    
    // Add AI reply
    const reply = {
      role: 'assistant',
      content: replyContent.trim(),
      timestamp: Date.now(),
      isImage: false,
    };
    
    chat.messages.push(reply);
    
    // Save chat with retry logic
    let saveAttempts = 0;
    const maxSaveAttempts = 3;
    
    while (saveAttempts < maxSaveAttempts) {
      try {
        await chat.save();
        break;
      } catch (saveError) {
        saveAttempts++;
        if (saveAttempts >= maxSaveAttempts) {
          console.error(`[MESSAGE] Failed to save chat after ${maxSaveAttempts} attempts:`, saveError);
          throw new Error('Failed to save chat conversation');
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * saveAttempts));
      }
    }
    
    // Update user credits with transaction-like safety
    const creditUpdate = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -1 } },
      { new: true }
    ).select('credits');
    
    if (!creditUpdate) {
      console.warn(`[MESSAGE] Credit update failed for user: ${userId}`);
      // Don't fail the request if credits update fails
    }
    
    const processingTime = Date.now() - sessionStart;
    console.log(`[MESSAGE] Success: User=${userId}, Time=${processingTime}ms, Credits=${creditUpdate?.credits}`);
    
    return {
      success: true,
      reply,
      chatId: chat._id,
      creditsRemaining: creditUpdate?.credits || user.credits - 1,
      processingTime: processingTime
    };
    
  } catch (error) {
    const processingTime = Date.now() - sessionStart;
    console.error(`[MESSAGE] Error: User=${req.user?._id}, Time=${processingTime}ms, Error:`, {
      message: error.message,
      stack: error.stack,
      chatId: req.body.chatId,
      promptLength: req.body.prompt?.length,
      userId: req.user?._id
    });
    
    // Handle specific errors
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable',
        retryAfter: 30
      });
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'AI service rate limit exceeded',
        retryAfter: 60
      });
    }
    
    // Generic error response
    return res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      processingTime: processingTime
    });
  }
};

export const imageMessageController = async (req, res) => {
  try {
    return res.status(501).json({
      success: false,
      message: 'Image message processing is not yet available',
      estimatedAvailability: 'Coming soon'
    });
  } catch (error) {
    console.error('Image message controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in image processing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};