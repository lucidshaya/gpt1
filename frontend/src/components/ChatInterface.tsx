// src/components/ChatInterface.tsx
import { useState, useRef, useEffect } from "react";
import api from "@/lib/api"; // axios instance
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  activeChatId?: string;
}

export default function ChatInterface({ activeChatId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch messages when activeChatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatId) {
        setMessages([
          {
            id: "welcome",
            content: "👋 Hello! I’m your AI assistant. How can I help?",
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      try {
        const res = await api.get(`/chats/${activeChatId}/messages`);
        setMessages(
          res.data.messages.map((m: any) => ({
            id: m._id,
            content: m.content,
            role: m.role,
            timestamp: new Date(m.createdAt),
          }))
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  // ✅ Send a message
  const sendMessage = async () => {
    if (!input.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(`/chats/${activeChatId}/messages`, {
        content: newMessage.content,
      });

      const aiMessage: Message = {
        id: res.data.message._id,
        content: res.data.message.content,
        role: res.data.message.role,
        timestamp: new Date(res.data.message.createdAt),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full border rounded-lg">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
