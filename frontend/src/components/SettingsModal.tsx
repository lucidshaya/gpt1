import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Bell,
  Palette,
  Download,
  Trash2,
  Shield,
  Mic,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Zap
} from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [settings, setSettings] = useState({
    username: "AI Enthusiast",
    email: "user@neurochat.ai",
    notifications: true,
    soundEffects: true,
    voiceInput: false,
    autoSave: true,
    theme: "dark",
    fontSize: [16],
    responseSpeed: [50],
    maxTokens: [2048],
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] glass-strong glow">
        <DialogHeader>
          <DialogTitle className="text-xl text-gradient">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <div className="max-h-96 overflow-y-auto mt-4">
            <TabsContent value="profile" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={settings.username}
                      onChange={(e) => updateSetting("username", e.target.value)}
                      className="glass"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting("email", e.target.value)}
                      className="glass"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSetting("notifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize your chat experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("theme", "light")}
                        className="flex items-center gap-2"
                      >
                        <Sun className="w-4 h-4" />
                        Light
                      </Button>
                      <Button
                        variant={settings.theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("theme", "dark")}
                        className="flex items-center gap-2"
                      >
                        <Moon className="w-4 h-4" />
                        Dark
                      </Button>
                      <Button
                        variant={settings.theme === "system" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("theme", "system")}
                        className="flex items-center gap-2"
                      >
                        <Monitor className="w-4 h-4" />
                        System
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Font Size: {settings.fontSize[0]}px</Label>
                    <Slider
                      value={settings.fontSize}
                      onValueChange={(value) => updateSetting("fontSize", value)}
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Sound Effects
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for message notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        Voice Input
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable voice-to-text input
                      </p>
                    </div>
                    <Switch
                      checked={settings.voiceInput}
                      onCheckedChange={(checked) => updateSetting("voiceInput", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Configuration
                  </CardTitle>
                  <CardDescription>Customize AI behavior and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Response Speed: {settings.responseSpeed[0]}%</Label>
                    <Slider
                      value={settings.responseSpeed}
                      onValueChange={(value) => updateSetting("responseSpeed", value)}
                      max={100}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values may consume more resources
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Max Response Length: {settings.maxTokens[0]} tokens</Label>
                    <Slider
                      value={settings.maxTokens}
                      onValueChange={(value) => updateSetting("maxTokens", value)}
                      max={4096}
                      min={512}
                      step={256}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Longer responses may take more time to generate
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-save Conversations</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save chat history
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Data
                  </CardTitle>
                  <CardDescription>Manage your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 glass hover:bg-muted/50"
                    >
                      <Download className="w-4 h-4" />
                      Export Chat History
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Chat History
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Data Usage</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="glass p-3 rounded-lg">
                        <p className="text-muted-foreground">Messages Sent</p>
                        <p className="text-2xl font-bold text-primary">127</p>
                      </div>
                      <div className="glass p-3 rounded-lg">
                        <p className="text-muted-foreground">Storage Used</p>
                        <p className="text-2xl font-bold text-accent">2.4 MB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="gradient-primary glow transition-spring hover:glow-strong"
            onClick={() => onOpenChange(false)}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;