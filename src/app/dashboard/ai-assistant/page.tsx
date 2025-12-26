"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  RefreshCw,
  Copy,
  Check,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { generateText } from "@/client-lib/built-in-integrations/ai";
import { useProjects } from "@/client-lib/api-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  {
    icon: AlertTriangle,
    title: "Analyze Waste",
    prompt: "Analyze current waste patterns across my projects and identify the top 3 areas for improvement with specific recommendations.",
    color: "text-red-500",
  },
  {
    icon: TrendingUp,
    title: "Forecast Delays",
    prompt: "Based on current project data, what are the most likely schedule risks and how can we mitigate them using Lean principles?",
    color: "text-orange-500",
  },
  {
    icon: Target,
    title: "5S Assessment",
    prompt: "Generate a 5S assessment checklist for my construction site and suggest improvements for each category.",
    color: "text-blue-500",
  },
  {
    icon: Building2,
    title: "Value Stream",
    prompt: "Create a value stream analysis for our material procurement process and identify non-value-adding activities.",
    color: "text-green-500",
  },
];

export default function AIAssistantPage() {
  const { data: projects } = useProjects();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (promptOverride?: string) => {
    const messageContent = promptOverride || input.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build context-aware prompt
      const projectContext = selectedProject !== "all" 
        ? `Context: Analyzing project "${projects?.find(p => p.id === selectedProject)?.name || 'Selected Project'}".`
        : "Context: Analyzing all projects.";
      
      const systemPrompt = `You are LeanBuild AI, an expert Lean construction consultant with deep knowledge of:
- The 8 wastes in construction (DOWNTIME: Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra processing)
- Lean tools: Value Stream Mapping, 5S, Kanban, Last Planner System, Pull Planning, Kaizen
- Construction project management best practices
- Cost optimization and schedule acceleration

${projectContext}

Provide actionable, specific recommendations. Use bullet points for clarity. Include estimated impact when relevant (cost savings, time savings, efficiency improvements).

User query: ${messageContent}`;

      const response = await generateText(systemPrompt, "medium", "google");
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            AI Construction Consultant
          </h1>
          <p className="text-muted-foreground">
            Your 24/7 Lean construction expert powered by advanced AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {messages.length > 0 && (
            <Button variant="outline" size="icon" onClick={clearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex gap-4 mt-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  I can analyze your projects, identify waste, suggest improvements, 
                  and help implement Lean construction principles.
                </p>
                
                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestedPrompts.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                      onClick={() => handleSend(suggestion.prompt)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${suggestion.color}`}>
                            <suggestion.icon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm">{suggestion.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {suggestion.prompt}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        message.role === "user" ? "text-blue-100" : "text-muted-foreground"
                      }`}>
                        <span>
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {message.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(message.content, message.id)}
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-muted-foreground">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t pt-4 mt-auto">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about waste reduction, schedule optimization, 5S implementation..."
                className="min-h-[60px] max-h-[200px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="hidden xl:block w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Analysis</CardTitle>
              <CardDescription className="text-xs">
                One-click insights for your projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSend("Generate a daily project health report with key metrics and alerts.")}
                disabled={isLoading}
              >
                <div>
                  <p className="font-medium text-sm">Daily Health Report</p>
                  <p className="text-xs text-muted-foreground">Get today&apos;s overview</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSend("Identify the top 5 waste incidents this week and provide root cause analysis.")}
                disabled={isLoading}
              >
                <div>
                  <p className="font-medium text-sm">Waste Analysis</p>
                  <p className="text-xs text-muted-foreground">Top issues this week</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSend("Suggest schedule optimizations based on Last Planner System principles.")}
                disabled={isLoading}
              >
                <div>
                  <p className="font-medium text-sm">Schedule Optimization</p>
                  <p className="text-xs text-muted-foreground">Last Planner insights</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSend("Create a Kaizen event plan for improving material handling efficiency.")}
                disabled={isLoading}
              >
                <div>
                  <p className="font-medium text-sm">Kaizen Planning</p>
                  <p className="text-xs text-muted-foreground">Improvement events</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Waste pattern analysis",
                  "Schedule risk prediction",
                  "Cost optimization",
                  "5S assessments",
                  "Value stream mapping",
                  "Root cause analysis",
                  "Kaizen recommendations",
                  "Resource optimization",
                ].map((capability, i) => (
                  <Badge key={i} variant="secondary" className="mr-1 mb-1">
                    {capability}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}