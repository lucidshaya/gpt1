import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Sparkles, Zap, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import heroImage from "@/assets/ai-hero-bg.jpg";

const Auth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: FormEvent<HTMLFormElement>, mode: "signin" | "signup") => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = mode === "signin" ? "login" : "register";
      const payload = mode === "signin" ? { email, password } : { fullName, email, password };
      const response = await api.post<{ token: string }>(`/auth/${endpoint}`, payload);
      localStorage.setItem("token", response.data.token);
      toast({
        title: mode === "signin" ? "Welcome back!" : "Account created!",
        description: `Successfully ${mode === "signin" ? "signed in" : "registered"}. Redirecting...`,
      });
      setTimeout(() => {
        navigate(mode === "signin" ? "/" : "/chat");
      }, 1000);
    } catch (error) {
      console.error(`${mode} failed:`, error);
      toast({
        title: "Error",
        description: `Failed to ${mode === "signin" ? "sign in" : "register"}. Please check your credentials.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-32 right-32 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-secondary/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="p-3 rounded-xl gradient-primary glow">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold text-gradient">NeuroChat</h1>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                The Future of <span className="text-gradient block">AI Conversations</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-lg">
                Experience the most advanced AI chat interface with stunning visuals,
                intelligent responses, and seamless interactions.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm">Advanced AI Models</span>
              </div>
              <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm">Lightning Fast</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Card className="w-full max-w-md glass-strong glow transition-smooth hover:glow-strong">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Join NeuroChat</CardTitle>
                <CardDescription>Start your AI conversation journey today</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={(e) => handleAuth(e, "signin")}>
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 glass"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10 glass"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full gradient-primary glow transition spring hover:glow-strong"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={(e) => handleAuth(e, "signup")}>
                      <div className="space-y-2">
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Full name"
                            className="pl-10 glass"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Email address"
                            className="pl-10 glass"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Create password"
                            className="pl-10 glass"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full gradient-primary glow transition spring hover:glow-strong"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;