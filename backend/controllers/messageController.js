// Text based AI chat message controller
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
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
        const geminiChat = await model.startChat({ history });

        // Send the new prompt (but since history includes it, wait no: startChat history is previous, sendMessage is new)
        // Actually, since we added the user message to history, but for startChat, history should be up to previous, and sendMessage the last user prompt.
        // Correct: history up to before last user, send last prompt.

        const prevHistory = history.slice(0, -1); // Exclude the last user message
        const lastPrompt = history[history.length - 1].parts[0].text;

        const geminiChat2 = await model.startChat({ history: prevHistory });
        const result = await geminiChat2.sendMessage(lastPrompt);
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