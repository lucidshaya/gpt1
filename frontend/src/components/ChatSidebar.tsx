import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  History, 
  Trash2,
  Edit,
  Brain,
  LogOut,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import SettingsModal from "./SettingsModal";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  activeChatId?: string;
}

const ChatSidebar = ({ 
  isCollapsed = false, 
  onNewChat, 
  onSelectChat,
  activeChatId 
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
    {
      id: "1",
      title: "AI Ethics Discussion",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      preview: "Let's discuss the implications of AI on society..."
    },
    {
      id: "2", 
      title: "Code Review Help",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      preview: "Can you help me review this React component?"
    },
    {
      id: "3",
      title: "Creative Writing",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      preview: "Write a short story about time travel..."
    },
    {
      id: "4",
      title: "Math Problem Solving",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      preview: "Help me solve this calculus problem..."
    },
    {
      id: "5",
      title: "Recipe Suggestions",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      preview: "What can I make with chicken and vegetables?"
    }
  ]);

  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    onNewChat?.();
    toast({
      title: "New Chat Started",
      description: "Ready for a fresh conversation!",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Signed Out",
      description: "You've been successfully logged out.",
    });
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    toast({
      title: "Chat Deleted",
      description: "Chat history has been removed.",
    });
  };

  const handleEditChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would open an edit modal
    toast({
      title: "Edit Chat",
      description: "Chat editing feature coming soon!",
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn(
      "h-full glass-strong border-r border-border/50 flex flex-col transition-smooth",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg gradient-primary glow">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-gradient">NeuroChat</h2>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <>
            <Button 
              onClick={handleNewChat}
              className="w-full gradient-primary glow transition-spring hover:glow-strong"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>

            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass text-sm"
              />
            </div>
          </>
        )}
      </div>

      {/* Chat History */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Recent Chats</span>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat?.(chat.id)}
                  className={cn(
                    "group p-3 rounded-lg cursor-pointer transition-smooth hover:bg-muted/50",
                    activeChatId === chat.id && "bg-primary/10 border border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate mb-1">
                        {chat.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {chat.preview}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(chat.timestamp)}
                      </span>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-smooth">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleEditChat(chat.id, e)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className={cn("space-y-2", isCollapsed && "flex flex-col items-center")}>
          <Button 
            variant="ghost" 
            size={isCollapsed ? "sm" : "default"}
            className={cn("transition-smooth hover:bg-muted/50", isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start")}
            onClick={() => navigate('/pricing')}
          >
            <CreditCard className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Pricing</span>}
          </Button>
          <Button 
            variant="ghost" 
            size={isCollapsed ? "sm" : "default"}
            className={cn("transition-smooth hover:bg-muted/50", isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start")}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </Button>
          <Button 
            variant="ghost" 
            size={isCollapsed ? "sm" : "default"}
            className={cn("transition-smooth hover:bg-muted/50", isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start")}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default ChatSidebar;