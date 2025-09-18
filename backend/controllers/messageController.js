// controllers/messageController.js
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import imagekit from "../configs/imagekit.js";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 1) {
      return res.json({ success: false, message: "You don't have enough credits. Please upgrade your plan." });
    }
    const { chatId, prompt } = req.body;
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    // Add user message
    chat.messages.push({
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });
    // Prepare history for Gemini (convert to parts format)
    const history = chat.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    // Get the model and start chat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Correct: history up to before last user, send last prompt.
    const prevHistory = history.slice(0, -1); // Exclude the last user message
    const lastPrompt = history[history.length - 1].parts[0].text;
    const geminiChat = await model.startChat({ history: prevHistory });
    const result = await geminiChat.sendMessage(lastPrompt);
    const replyContent = result.response.text();
    // Add AI reply
    const reply = {
      role: 'assistant',
      content: replyContent,
      timestamp: Date.now(),
      isImage: false,
    };
    chat.messages.push(reply);
    // Save chat
    await chat.save();
    // Decrement credits
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
    res.status(200).json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 2) {
      return res.json({ success: false, message: "You don't have enough credits. Please upgrade your plan." });
    }
    const { prompt, chatId, isPublished } = req.body;
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false
    });
    const encodedPrompt = encodeURIComponent(prompt);
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;
    const imageResponse = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' });
    const base64Image = `data:image/png;base64,${Buffer.from(imageResponse.data).toString('base64')}`;
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished: isPublished || false
    };
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};