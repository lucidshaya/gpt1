import { useState } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { PanelLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const Chat = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | undefined>("1");
  const [messages, setMessages] = useState<any[]>([]);

  const handleNewChat = () => {
    setActiveChatId(undefined);
    setMessages([]);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 ease-in-out flex-shrink-0",
        sidebarCollapsed ? "w-16" : "w-80"
      )}>
        <ChatSidebar
          isCollapsed={sidebarCollapsed}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          activeChatId={activeChatId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle Button */}
        <div className="p-2 border-b border-border/50 glass-strong flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="transition-smooth hover:bg-muted/50"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="transition-smooth hover:bg-muted/50"
              title="Start New Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface activeChatId={activeChatId} />
        </div>
      </div>
    </div>
  );
};

export default Chat;