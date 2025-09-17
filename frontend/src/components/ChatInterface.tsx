import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square,
  User,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import AttachmentModal from "./AttachmentModal";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
  attachments?: AttachmentFile[];
}

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ChatInterfaceProps {
  activeChatId?: string;
}

// Mock chat data for different conversations
const mockChatData: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date()
    }
  ],
  "2": [
    {
      id: "1",
      content: "Can you help me review this React component?",
      role: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: "2", 
      content: "Of course! I'd be happy to help you review your React component. Please share the code and I'll provide feedback on structure, performance, and best practices.",
      role: "assistant",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000)
    }
  ],
  "3": [
    {
      id: "1",
      content: "Write a short story about time travel...",
      role: "user", 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
    },
    {
      id: "2",
      content: "**The Temporal Café**\n\nSarah stepped through the shimmering portal and found herself in a quaint café that existed between moments. The walls hummed with temporal energy, and through the windows, she could see fragments of different eras flowing like water...",
      role: "assistant",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 60000)
    }
  ],
  "4": [
    {
      id: "1",
      content: "Help me solve this calculus problem...",
      role: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    },
    {
      id: "2",
      content: "I'd be glad to help with your calculus problem! Please share the specific problem you're working on, and I'll walk you through the solution step by step.",
      role: "assistant", 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 45000)
    }
  ],
  "5": [
    {
      id: "1",
      content: "What can I make with chicken and vegetables?",
      role: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
    },
    {
      id: "2",
      content: "Great question! Here are some delicious options with chicken and vegetables:\n\n🍲 **Stir-fry** - Quick and customizable\n🍝 **Chicken Primavera** - Pasta with seasonal veggies\n🥘 **Sheet Pan Dinner** - Easy one-pan meal\n🍜 **Chicken Vegetable Soup** - Comforting and healthy\n\nWhat vegetables do you have on hand?",
      role: "assistant",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 30000)
    }
  ]
};

const ChatInterface = ({ activeChatId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<AttachmentFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Load messages when activeChatId changes
  useEffect(() => {
    if (activeChatId && mockChatData[activeChatId]) {
      setMessages(mockChatData[activeChatId]);
    } else {
      // Default welcome message for new chats
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date()
        }
      ]);
    }
  }, [activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
      attachments: selectedFiles.length > 0 ? selectedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSelectedFiles([]);
    setIsLoading(true);

    // Simulate typing indicator
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me think about this carefully. Based on what you've asked, I can provide several insights...",
        "I understand what you're looking for. Here's a comprehensive response that should help clarify things for you...",
        "Excellent point! This is actually quite an interesting topic. Let me break this down into several key areas...",
        "Thanks for that question! I can definitely help you with this. Here's what I recommend...",
        "That's a fascinating topic to explore! Let me share some thoughts and provide you with detailed information..."
      ];

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => prev.slice(0, -1).concat([aiMessage]));
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice Input Active",
        description: "Speak your message now...",
      });
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
  };

  const handleReaction = (messageId: string, reaction: 'up' | 'down') => {
    toast({
      title: `Feedback ${reaction === 'up' ? 'Positive' : 'Negative'}`,
      description: "Thank you for your feedback!",
    });
  };

  const handleFilesSelected = (files: AttachmentFile[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    toast({
      title: "Files Attached",
      description: `${files.length} file(s) ready to send.`,
    });
  };

  const removeAttachment = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/50 glass-strong">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 glow">
              <AvatarFallback className="gradient-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Online • Responds instantly</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="transition-smooth hover:bg-muted/50">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 group",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className={cn("w-8 h-8 flex-shrink-0", message.role === "assistant" && "glow")}>
                <AvatarFallback className={cn(
                  message.role === "user" 
                    ? "bg-user text-user-foreground" 
                    : "gradient-primary text-primary-foreground"
                )}>
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className={cn(
                "flex-1 space-y-2 max-w-[80%]",
                message.role === "user" && "flex flex-col items-end"
              )}>
                <div className={cn(
                  "rounded-lg px-4 py-3 transition-smooth",
                  message.role === "user"
                    ? "message-user"
                    : "message-assistant"
                )}>
                  {message.isTyping ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>

                <div className={cn(
                  "flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-smooth",
                  message.role === "user" && "flex-row-reverse"
                )}>
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.role === "assistant" && !message.isTyping && (
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyMessage(message.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleReaction(message.id, 'up')}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleReaction(message.id, 'down')}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Attachments Display */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.attachments.map((file) => (
                      <div key={file.id} className="glass px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate max-w-20">{file.name}</span>
                      </div>
                    ))}
                  </div>  
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 glass-strong">
        <div className="max-w-4xl mx-auto">
          {/* Attached Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedFiles.map((file) => (
                <div key={file.id} className="glass px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                  <Paperclip className="w-4 h-4" />
                  <span className="truncate max-w-32">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeAttachment(file.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 transition-smooth hover:bg-muted/50"
              onClick={() => setAttachmentModalOpen(true)}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[50px] max-h-32 resize-none glass pr-12"
                disabled={isLoading}
              />
              <Button
                onClick={toggleVoiceInput}
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute right-2 top-2 transition-smooth",
                  isListening && "text-destructive animate-pulse-glow"
                )}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
              className="mb-2 gradient-primary glow transition-spring hover:glow-strong"
              size="sm"
            >
              {isLoading ? (
                <Square className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      <AttachmentModal
        open={attachmentModalOpen}
        onOpenChange={setAttachmentModalOpen}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
};

export default ChatInterface;